const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const buyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+254[0-9]{9}$/, 'Please provide a valid Kenyan phone number (+254XXXXXXXXX)']
  },
  
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: {
      values: ['Retail', 'Wholesale', 'Restaurant', 'Cafe', 'Export', 'Processing', 'Individual'],
      message: 'Business type must be one of: Retail, Wholesale, Restaurant, Cafe, Export, Processing, Individual'
    }
  },
  businessName: {
    type: String,
    required: function() {
      return this.businessType !== 'Individual';
    },
    trim: true,
    maxlength: [150, 'Business name cannot exceed 150 characters']
  },
  businessLicense: {
    type: String,
    required: function() {
      return ['Wholesale', 'Export', 'Processing'].includes(this.businessType);
    },
    trim: true
  },
  
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    county: {
      type: String,
      required: [true, 'County is required'],
      enum: {
        values: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Nyeri', 'Kiambu', 'Murang\'a', 'Kirinyaga', 'Embu', 'Meru', 'Machakos'],
        message: 'County must be one of the major delivery locations'
      }
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      match: [/^[0-9]{5}$/, 'Postal code must be 5 digits']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Delivery latitude is required'],
        min: [-4.7, 'Latitude must be within Kenya boundaries'],
        max: [5.0, 'Latitude must be within Kenya boundaries']
      },
      longitude: {
        type: Number,
        required: [true, 'Delivery longitude is required'],
        min: [33.9, 'Longitude must be within Kenya boundaries'],
        max: [41.9, 'Longitude must be within Kenya boundaries']
      }
    }
  },

  preferences: {
    coffeeVarieties: [{
      type: String,
      enum: ['Arabica', 'Robusta', 'SL28', 'SL34', 'K7', 'Ruiru 11', 'Batian']
    }],
    qualityGrades: [{
      type: String,
      enum: ['AA', 'AB', 'C', 'PB', 'E', 'TT', 'T']
    }],
    processingMethods: [{
      type: String,
      enum: ['Washed', 'Natural', 'Honey', 'Semi-washed']
    }],
    certifications: [{
      type: String,
      enum: ['Organic', 'Fair Trade', 'Rainforest Alliance', 'UTZ', 'C.A.F.E. Practices']
    }],
    minQuantity: {
      type: Number,
      min: [1, 'Minimum quantity must be at least 1 kg'],
      default: 1
    },
    maxQuantity: {
      type: Number,
      min: [1, 'Maximum quantity must be at least 1 kg'],
      default: 1000
    },
    priceRange: {
      min: {
        type: Number,
        min: [0, 'Minimum price cannot be negative'],
        default: 0
      },
      max: {
        type: Number,
        min: [0, 'Maximum price cannot be negative'],
        default: 10000
      }
    }
  },

  purchaseHistory: {
    totalOrders: {
      type: Number,
      default: 0,
      min: [0, 'Total orders cannot be negative']
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, 'Total spent cannot be negative']
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Average order value cannot be negative']
    },
    lastOrderDate: {
      type: Date
    },
    favoriteVarieties: [{
      variety: String,
      orderCount: { type: Number, default: 0 }
    }],
    preferredFarmers: [{
      farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer'
      },
      orderCount: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 }
    }]
  },

  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative']
    }
  },

  paymentMethods: [{
    type: {
      type: String,
      enum: ['M-Pesa', 'Bank Transfer', 'Credit Card', 'Cash on Delivery'],
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  notifications: {
    email: {
      newProducts: { type: Boolean, default: true },
      priceDrops: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    sms: {
      orderUpdates: { type: Boolean, default: true },
      deliveryAlerts: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    }
  },

  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,

  refreshTokens: [String],

  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  lastLoginAt: Date,
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

buyerSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

buyerSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'buyerId'
});

buyerSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'buyerId'
});

buyerSchema.index({ email: 1 });
buyerSchema.index({ phone: 1 });
buyerSchema.index({ businessType: 1 });
buyerSchema.index({ 'deliveryAddress.county': 1 });
buyerSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });
buyerSchema.index({ isActive: 1, isVerified: 1 });
buyerSchema.index({ createdAt: -1 });
buyerSchema.index({ 'rating.average': -1 });

buyerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

buyerSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

buyerSchema.pre('save', function(next) {
  if (this.paymentMethods && this.paymentMethods.length > 0) {
    const defaultMethods = this.paymentMethods.filter(method => method.isDefault);
    if (defaultMethods.length > 1) {
      this.paymentMethods.forEach((method, index) => {
        if (index > 0) method.isDefault = false;
      });
    }
  }
  next();
});

buyerSchema.pre('save', function(next) {
  this.lastActiveAt = Date.now();
  next();
});

buyerSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

buyerSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

buyerSchema.methods.createPasswordResetToken = function() {
  const resetToken = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '10m'
  });
  
  this.passwordResetToken = jwt.sign({ token: resetToken }, process.env.JWT_SECRET);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

buyerSchema.methods.createVerificationToken = function() {
  const verificationToken = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
  
  this.verificationToken = jwt.sign({ token: verificationToken }, process.env.JWT_SECRET);
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

buyerSchema.methods.signToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

buyerSchema.methods.signRefreshToken = function() {
  const refreshToken = jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });
  
  if (!this.refreshTokens) this.refreshTokens = [];
  this.refreshTokens.push(refreshToken);
  
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  return refreshToken;
};

buyerSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

buyerSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

buyerSchema.methods.updatePurchaseStats = async function(orderValue) {
  this.purchaseHistory.totalOrders += 1;
  this.purchaseHistory.totalSpent += orderValue;
  this.purchaseHistory.averageOrderValue = this.purchaseHistory.totalSpent / this.purchaseHistory.totalOrders;
  this.purchaseHistory.lastOrderDate = Date.now();
  
  return this.save();
};

buyerSchema.methods.addFavoriteVariety = function(variety) {
  const existingVariety = this.purchaseHistory.favoriteVarieties.find(
    fav => fav.variety === variety
  );
  
  if (existingVariety) {
    existingVariety.orderCount += 1;
  } else {
    this.purchaseHistory.favoriteVarieties.push({
      variety,
      orderCount: 1
    });
  }
  
  this.purchaseHistory.favoriteVarieties.sort((a, b) => b.orderCount - a.orderCount);
  
  if (this.purchaseHistory.favoriteVarieties.length > 10) {
    this.purchaseHistory.favoriteVarieties = this.purchaseHistory.favoriteVarieties.slice(0, 10);
  }
};

buyerSchema.methods.addPreferredFarmer = function(farmerId, orderValue) {
  const existingFarmer = this.purchaseHistory.preferredFarmers.find(
    pref => pref.farmerId.toString() === farmerId.toString()
  );
  
  if (existingFarmer) {
    existingFarmer.orderCount += 1;
    existingFarmer.totalSpent += orderValue;
  } else {
    this.purchaseHistory.preferredFarmers.push({
      farmerId,
      orderCount: 1,
      totalSpent: orderValue
    });
  }
  
  this.purchaseHistory.preferredFarmers.sort((a, b) => b.totalSpent - a.totalSpent);
  
  if (this.purchaseHistory.preferredFarmers.length > 10) {
    this.purchaseHistory.preferredFarmers = this.purchaseHistory.preferredFarmers.slice(0, 10);
  }
};

module.exports = mongoose.model('Buyer', buyerSchema);
