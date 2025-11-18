const User = require('../models/User');
const jwt =  require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { 
  validatePassword, 
  generateToken, 
  hashToken, 
  formatResponse,
  createPagination,
  maskEmail
} = require('../utils/helpers');

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

const generateTokens = (user) => { 
  const accessToken = jwt.sign( { id: user._id, email: user.email }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRE || "15m" } ); 
    
const refreshToken = jwt.sign( { id: user._id }, process.env.JWT_REFRESH_SECRET, { 
  expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" } ); 
  return { accessToken, refreshToken }; 
};

const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  
  const { ipAddress, userAgent } = getClientInfo(res.req);
  await user.addRefreshToken(refreshToken, userAgent, ipAddress);
  
  setTokenCookie(res, accessToken);
  
  user.password = undefined;
  
  res.status(statusCode).json(formatResponse(true, {
    user,
    accessToken,
    refreshToken,
    expiresIn: config.JWT_EXPIRE
  }, message));
};

const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber, role } = req.body;
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.errors.join(', '), 400));
  }
  
  const rolePermissions = User.getRolePermissions();
  const permissions = rolePermissions[role] || rolePermissions.user;
  
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phoneNumber,
    role: role || 'user',
    permissions
  });
  
  const { ipAddress, userAgent } = getClientInfo(req);
  await user.addLoginHistory(ipAddress, userAgent, true);
  
  sendTokenResponse(user, 201, res, 'User registered successfully');
});

  const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  
  const { ipAddress, userAgent } = getClientInfo(req);
  
  const authResult = await User.authenticate(email, password, ipAddress, userAgent);
  
  if (!authResult.success) {
    return next(new AppError(authResult.message, 401));
  }
  
  sendTokenResponse(authResult.user, 200, res, 'Login successful');
});

const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.body?.refreshToken;
  
  if (refreshToken) {
    try {
      await req.user.removeRefreshToken(refreshToken);
    } catch (error) {
      // Continue even if refresh token removal fails
      console.log('Error removing refresh token:', error.message);
    }
  }
  
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json(formatResponse(true, null, 'Logout successful'));
});

const logoutAll = asyncHandler(async (req, res, next) => {
  await req.user.removeAllRefreshTokens();
  
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json(formatResponse(true, null, 'Logged out from all devices'));
});

const refreshToken = asyncHandler(async (req, res, next) => {
  try {
    // 1️⃣ Extract refresh token from cookie or request body
    const refreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];

    if (!refreshToken) {
      return next(new AppError("No refresh token provided", 401));
    }

    // 2️⃣ Verify the refresh token validity
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return next(new AppError("Invalid or expired refresh token", 403));
    }

    // 3️⃣ Find user associated with the refresh token
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // 4️⃣ (Optional) Check if this refresh token exists in user's record (for security)
    const isTokenValid = await user.hasRefreshToken(refreshToken);
    if (!isTokenValid) {
      return next(new AppError("Refresh token not recognized", 403));
    }

    // 5️⃣ Generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // 6️⃣ Replace the old refresh token with the new one in DB
    await user.removeRefreshToken(refreshToken);
    const { ipAddress, userAgent } = getClientInfo(req);
    await user.addRefreshToken(newRefreshToken, userAgent, ipAddress);

    // 7️⃣ Set the new access token cookie
    setTokenCookie(res, newAccessToken);

    // 8️⃣ Respond exactly as Axios expects
    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: config.JWT_EXPIRE,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    return next(new AppError("Failed to refresh token", 500));
  }
});

const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'loginHistory',
    options: { limit: 5, sort: { timestamp: -1 } }
  });
  
  res.status(200).json(formatResponse(true, { user }, 'User profile retrieved'));
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    dateOfBirth: req.body.dateOfBirth,
    address: req.body.address
  };
  
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json(formatResponse(true, { user }, 'Profile updated successfully'));
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user.id).select('+password');
  
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }
  
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.errors.join(', '), 400));
  }
  
  user.password = newPassword;
  await user.save();
  
  await user.removeAllRefreshTokens();
  
  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }
  
  const resetToken = generateToken();
  
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  await user.save({ validateBeforeSave: false });
  
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
  
  try {
    // In a real application, you would send an email here
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password Reset Token',
    //   message: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`
    // });
    
    console.log(`Password reset URL: ${resetUrl}`); // For development
    
    res.status(200).json(formatResponse(
      true, 
      { resetUrl },
      `Password reset token sent to ${maskEmail(user.email)}`
    ));
  } catch (err) {
    console.log(err);
    
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    
    await user.save({ validateBeforeSave: false });
    
    return next(new AppError('Email could not be sent', 500));
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = hashToken(req.params.resettoken);
  
  const user = await User.findOne({
    passwordResetToken: resetPasswordToken,
    passwordResetExpire: { $gt: Date.now() }
  });
  
  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }
  
  const passwordValidation = validatePassword(req.body.password);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.errors.join(', '), 400));
  }
  
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  
  await user.removeAllRefreshTokens();
  
  await user.save();
  
  sendTokenResponse(user, 200, res, 'Password reset successful');
});

const deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  
  const user = await User.findById(req.user.id).select('+password');
  
  if (!(await user.comparePassword(password))) {
    return next(new AppError('Password is incorrect', 400));
  }
  
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save();
  
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json(formatResponse(true, null, 'Account deleted successfully'));
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skipIndex = (page - 1) * limit;
  
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    filter.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  const total = await User.countDocuments(filter);
  
  const users = await User.find(filter)
    .select('-refreshTokens -loginHistory')
    .limit(limit)
    .skip(skipIndex)
    .sort({ createdAt: -1 });
  
  const pagination = createPagination(page, limit, total);
  
  res.status(200).json(formatResponse(
    true, 
    { users }, 
    'Users retrieved successfully',
    pagination
  ));
});

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-refreshTokens')
    .populate({
      path: 'loginHistory',
      options: { limit: 10, sort: { timestamp: -1 } }
    });
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json(formatResponse(true, { user }, 'User retrieved successfully'));
});

const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  
  const rolePermissions = User.getRolePermissions();
  const permissions = rolePermissions[role];
  
  if (!permissions) {
    return next(new AppError('Invalid role', 400));
  }
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, permissions },
    { new: true, runValidators: true }
  );
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  await user.removeAllRefreshTokens();
  
  res.status(200).json(formatResponse(true, { user }, 'User role updated successfully'));
});

const toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  user.isActive = !user.isActive;
  await user.save();
  
  if (!user.isActive) {
    await user.removeAllRefreshTokens();
  }
  
  const status = user.isActive ? 'activated' : 'deactivated';
  res.status(200).json(formatResponse(true, { user }, `User ${status} successfully`));
});

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus
};
