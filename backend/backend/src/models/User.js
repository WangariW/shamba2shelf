const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
  },
  profilePicture: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  county: { type: String, default: null },
  town: { type: String, default: null },
  
  role: {
    type: String,
    enum: ['user', 'farmer', 'buyer', 'admin', 'superadmin'],
    default: 'user'
  },
  permissions: [{
    type: String,
    enum: [
      'read:users', 'write:users', 'delete:users',
      'read:products', 'write:products', 'delete:products',
      'read:orders', 'write:orders', 'delete:orders',
      'read:analytics', 'admin:all'
    ]
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  passwordChangedAt: Date,
  
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ipAddress: String
  }],
  
  lastLogin: Date,
  lastActivity: Date,
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    success: Boolean
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes (email index is automatically created due to unique: true constraint)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    
    this.passwordChangedAt = Date.now() - 1000;
    
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      permissions: this.permissions
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRE,
      issuer: 'shamba2shelf',
      audience: 'shamba2shelf-users'
    }
  );
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: config.JWT_REFRESH_EXPIRE,
      issuer: 'shamba2shelf',
      audience: 'shamba2shelf-users'
    }
  );
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= config.MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + config.LOCK_TIME };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

userSchema.methods.addRefreshToken = function(token, userAgent, ipAddress) {
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift();
  }
  
  this.refreshTokens.push({
    token,
    userAgent,
    ipAddress
  });
  
  return this.save();
};

userSchema.methods.removeRefreshToken = function(token) {
  return this.updateOne({
    $pull: { refreshTokens: { token: token } }
  });
};

userSchema.methods.removeAllRefreshTokens = function() {
  return this.updateOne({
    $set: { refreshTokens: [] }
  });
};

userSchema.methods.updateLastActivity = function() {
  return this.updateOne({
    $set: { lastActivity: Date.now() }
  });
};

userSchema.methods.addLoginHistory = function(ipAddress, userAgent, success = true) {
  if (this.loginHistory.length >= 10) {
    this.loginHistory.shift();
  }
  
  this.loginHistory.push({
    ipAddress,
    userAgent,
    success
  });
  
  if (success) {
    this.lastLogin = Date.now();
  }
  
  return this.save();
};

userSchema.statics.getRolePermissions = function() {
  return {
    user: ['read:products'],
    farmer: ['read:products', 'write:products', 'read:orders'],
    buyer: ['read:products', 'write:orders', 'read:orders'],
    admin: [
      'read:users', 'write:users',
      'read:products', 'write:products', 'delete:products',
      'read:orders', 'write:orders', 'delete:orders',
      'read:analytics'
    ],
    superadmin: ['admin:all']
  };
};

userSchema.statics.authenticate = async function(email, password, ipAddress, userAgent) {
  const user = await this.findOne({ 
    email: email.toLowerCase(),
    isActive: true 
  }).select('+password');
  
  if (!user) {
    return { success: false, message: 'Invalid credentials' };
  }
  
  if (user.isLocked) {
    return { 
      success: false, 
      message: 'Account temporarily locked due to too many failed login attempts. Please try again later.' 
    };
  }
  
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    await user.addLoginHistory(ipAddress, userAgent, false);
    await user.incLoginAttempts();
    
    return { success: false, message: 'Invalid credentials' };
  }
  
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  await user.addLoginHistory(ipAddress, userAgent, true);
  
  return { success: true, user };
};

module.exports = mongoose.model('User', userSchema);
