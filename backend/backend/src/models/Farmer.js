const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
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

  county: {
    type: String,
    required: false,
    enum: {
      values: ['Nyeri', 'Kiambu', 'Murang\'a', 'Kirinyaga', 'Embu', 'Meru', 'Machakos', 'Nakuru'],
      message: 'County must be one of the major coffee growing regions'
    }
  },
  nearestTown: {
  type: String,
  required: false
  },

  location: {
    county: {type: String, default: null},
    town: {type: String, default: null},
  },

  pickupPoint: {
    type: String,
    default: null
  },

  altitudeRange: {
    min: {
      type: Number,
      min: [1000, 'Minimum altitude should be at least 1000m for quality coffee'],
      max: [2500, 'Altitude cannot exceed 2500m']
    },
    max: {
      type: Number,
      min: [1000, 'Maximum altitude should be at least 1000m'],
      max: [2500, 'Altitude cannot exceed 2500m']
    }
  },

  varietiesGrown: [{
    type: String,
    enum: [
      'SL28',
      'SL34',
      'Ruiru 11',
      'Batian',
      'Blue Mountain',
      'K7',
      'Kent'
    ]
  }],
  processingMethods: [{
    type: String,
    enum: ['Washed', 'Natural', 'Honey', 'Semi-washed', 'Pulped Natural']
  }],

  bankDetails: {
    accountNumber: {
      type: String,
      match: [/^[0-9]{10,16}$/, 'Account number must be 10-16 digits']
    },
    bankName: {
      type: String,
      enum: [
        'Kenya Commercial Bank',
        'Equity Bank',
        'Cooperative Bank',
        'Standard Chartered',
        'Barclays Bank',
        'ABSA Bank',
        'NCBA Bank',
        'Stanbic Bank',
        'Diamond Trust Bank',
        'Family Bank',
        'Sidian Bank',
        'Other'
      ]
    },
    branchCode: {
      type: String,
      match: [/^[0-9]{3,6}$/, 'Branch code must be 3-6 digits']
    },
    mpesaNumber: {
      type: String,
      match: [/^\+254[0-9]{9}$/, 'M-Pesa number must be a valid Kenyan phone number']
    }
  },

  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: {
    nationalId: {
      type: String,
      match: [/^[0-9]{8}$/, 'National ID must be 8 digits']
    },

    bankStatement: {
      type: String,
      default: ''
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },

  profileImage: {
    type: String,
    default: ''
  },
  farmImages: [{
    type: String
  }],
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    website: String
  },

  totalSales: {
    type: Number,
    default: 0,
    min: [0, 'Total sales cannot be negative']
  },
 
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'Total reviews cannot be negative']
  },
  qualityScore: {
    type: Number,
    default: 0,
    min: [0, 'Quality score cannot be negative'],
    max: [100, 'Quality score cannot exceed 100']
  },

  sustainabilityPractices: [{
    type: String,
    enum: [
      'Water Conservation',
      'Soil Conservation',
      'Integrated Pest Management',
      'Composting',
      'Shade Growing',
      'Biodiversity Conservation',
      'Carbon Sequestration',
      'Renewable Energy Use',
      'Waste Reduction',
      'Community Development'
    ]
  }],

  communicationPreferences: {
    language: {
      type: String,
      enum: ['English', 'Swahili',],
      default: ['English', 'Swahili'] 
    },
    notificationMethods: [{
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'push'],
      default: ['email', 'sms']
    }],
    marketingConsent: {
      type: Boolean,
      default: false
    }
  },

  role: {
    type: String,
    default: 'farmer',
    enum: ['farmer']
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  passwordChangedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance (email index is automatically created due to unique: true)
farmerSchema.index({ phone: 1 });
farmerSchema.index({ county: 1 });
farmerSchema.index({ location: '2dsphere' });
farmerSchema.index({ isVerified: 1, isActive: 1 });
farmerSchema.index({ createdAt: -1 });
farmerSchema.index({ averageRating: -1 });
farmerSchema.index({ qualityScore: -1 });

farmerSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
farmerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

farmerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  
  next();
});

farmerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

farmerSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role,
      name: this.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

farmerSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

farmerSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

farmerSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

farmerSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

farmerSchema.methods.getPublicProfile = function() {
  const farmer = this.toObject();
  
  delete farmer.password;
  delete farmer.refreshTokens;
  delete farmer.loginAttempts;
  delete farmer.lockUntil;
  delete farmer.verificationDocuments;
  delete farmer.bankDetails;
  
  return farmer;
};

farmerSchema.methods.getDashboardData = function() {
  return {
    basicInfo: {
      name: this.name,
      email: this.email,
      phone: this.phone,
      county: this.county,
      isVerified: this.isVerified
    },
    farmInfo: {
      farmSize: this.farmSize,
      altitudeRange: this.altitudeRange,
      varietiesGrown: this.varietiesGrown,
      processingMethods: this.processingMethods,
      certifications: this.certifications
    },
    performance: {
      totalSales: this.totalSales,
      averageRating: this.averageRating,
      totalReviews: this.totalReviews,
      qualityScore: this.qualityScore
    },
    sustainability: {
      sustainabilityPractices: this.sustainabilityPractices
    }
  };
};

farmerSchema.statics.findByLocation = function(latitude, longitude, radius = 10) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radius * 1000
      }
    },
    isActive: true,
    isVerified: true
  });
};

farmerSchema.statics.findByCounty = function(county) {
  return this.find({
    county: county,
    isActive: true,
    isVerified: true
  }).select('-password -refreshTokens -verificationDocuments -bankDetails');
};

farmerSchema.statics.getTopRated = function(limit = 10) {
  return this.find({
    isActive: true,
    isVerified: true,
    averageRating: { $gte: 4.0 }
  })
  .sort({ averageRating: -1, totalReviews: -1 })
  .limit(limit)
  .select('-password -refreshTokens -verificationDocuments -bankDetails');
};

module.exports = mongoose.model('Farmer', farmerSchema);
