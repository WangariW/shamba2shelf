const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { findUserByEmail, findUserById, findUserByResetToken, getModelByRole } = require('../utils/authHelper');
const { validatePassword, generateToken, hashToken, formatResponse, createPagination, maskEmail } = require('../utils/helpers');

// --- Helpers ---
const getClientInfo = (req) => ({
  ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
  userAgent: req.get('User-Agent') || 'unknown'
});

const setTokenCookie = (res, token) => {
  const options = {
    expires: new Date(Date.now() + config.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  res.cookie('token', token, options);
};

const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  const { ipAddress, userAgent } = getClientInfo(res.req);

  if (typeof user.addRefreshToken === 'function') {
    await user.addRefreshToken(refreshToken, userAgent, ipAddress);
  } else {
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push({ token: refreshToken, createdAt: Date.now() });
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();
  }

  setTokenCookie(res, accessToken);
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    user,
    accessToken,
    refreshToken,
    expiresIn: config.JWT_EXPIRE
  });
};


// --- Register ---
const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, name, email, password, phoneNumber, phone, role } = req.body;

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) return next(new AppError(passwordValidation.errors.join(', '), 400));

  const existingUser = await findUserByEmail(email);
  if (existingUser) return next(new AppError('Email already registered', 400));

  const Model = getModelByRole(role);
  let userData = { email: email.toLowerCase(), password };

  if (Model === User) {
    const rolePermissions = User.getRolePermissions();
    const permissions = rolePermissions[role] || rolePermissions.user;
    userData = { ...userData, firstName, lastName, phoneNumber, role: role || 'user', permissions };
  } else if (Model === Farmer || Model === Buyer) {
    userData = { ...userData, name: name || `${firstName} ${lastName}`, phone: phone || phoneNumber };
  }

  const user = await Model.create(userData);

  // Email verification
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24h
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
  console.log(`Email verification URL: ${verificationUrl}`); // replace with actual email send

  const { ipAddress, userAgent } = getClientInfo(req);
  if (typeof user.addLoginHistory === 'function') await user.addLoginHistory(ipAddress, userAgent, true);

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

// --- Email verification ---
const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token;

  let user = await User.findOne({ emailVerificationToken: token, emailVerificationExpire: { $gt: Date.now() } });
  if (!user) user = await Farmer.findOne({ emailVerificationToken: token, emailVerificationExpire: { $gt: Date.now() } });
  if (!user) user = await Buyer.findOne({ emailVerificationToken: token, emailVerificationExpire: { $gt: Date.now() } });

  if (!user) return next(new AppError('Invalid or expired verification token', 400));

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(formatResponse(true, { user }, 'Email verified successfully'));
});

// --- Login ---
const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const { ipAddress, userAgent } = getClientInfo(req);
  const result = await findUserByEmail(email);
  if (!result) return next(new AppError('Invalid credentials', 401));

  const { user, role: userRole } = result;
  if (role && role !== userRole) return next(new AppError('Invalid credentials', 401));
  if (user.isLocked) return next(new AppError('Account temporarily locked. Try later.', 401));

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    if (typeof user.incLoginAttempts === 'function') await user.incLoginAttempts();
    if (typeof user.addLoginHistory === 'function') await user.addLoginHistory(ipAddress, userAgent, false);
    return next(new AppError('Invalid credentials', 401));
  }

  if (user.loginAttempts > 0 && typeof user.resetLoginAttempts === 'function') await user.resetLoginAttempts();
  if (typeof user.addLoginHistory === 'function') await user.addLoginHistory(ipAddress, userAgent, true);

  sendTokenResponse(user, 200, res, 'Login successful');
});

// --- Logout ---
const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.body?.refreshToken;
  if (refreshToken && typeof req.user.removeRefreshToken === 'function') await req.user.removeRefreshToken(refreshToken);

  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json(formatResponse(true, null, 'Logout successful'));
});

const logoutAll = asyncHandler(async (req, res, next) => {
  if (typeof req.user.removeAllRefreshTokens === 'function') await req.user.removeAllRefreshTokens();
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json(formatResponse(true, null, 'Logged out from all devices'));
});

// --- Refresh token ---
const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];
  if (!token) return next(new AppError("No refresh token provided", 401));

  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); } 
  catch { return next(new AppError("Invalid or expired refresh token", 403)); }

  const result = await findUserById(decoded.id);
  if (!result) return next(new AppError("User not found", 404));

  const { user } = result;
  if (typeof user.removeRefreshToken === 'function') await user.removeRefreshToken(token);

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  const { ipAddress, userAgent } = getClientInfo(req);
  if (typeof user.addRefreshToken === 'function') await user.addRefreshToken(newRefreshToken, userAgent, ipAddress);

  setTokenCookie(res, newAccessToken);
  res.status(200).json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: config.JWT_EXPIRE, message: "Token refreshed successfully" });
});

// --- Forgot password ---
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const result = await findUserByEmail(email);
  if (!result) return next(new AppError('No user found with that email address', 404));

  const { user } = result;

  const resetToken = generateToken(32);
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
  console.log(`Password reset URL: ${resetUrl}`); // replace with actual email send

  res.status(200).json(formatResponse(true, { resetUrl }, `Password reset token sent to ${maskEmail(user.email)}`));
});

// --- Reset password ---
const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = hashToken(req.params.resettoken);
  const result = await findUserByResetToken(resetPasswordToken);
  if (!result) return next(new AppError('Invalid or expired reset token', 400));

  const { user } = result;

  const passwordValidation = validatePassword(req.body.password);
  if (!passwordValidation.isValid) return next(new AppError(passwordValidation.errors.join(', '), 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  if (typeof user.removeAllRefreshTokens === 'function') await user.removeAllRefreshTokens();
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  logoutAll,
  refreshToken,
  forgotPassword,
  resetPassword,
  sendTokenResponse
};
