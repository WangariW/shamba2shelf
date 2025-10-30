const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Farmer ID is required']
  },

  variety: {
    type: String,
    required: [true, 'Coffee variety is required'],
    enum: {
      values: ['SL28', 'SL34', 'Ruiru 11', 'Batian', 'Blue Mountain', 'K7', 'Kent'],
      message: 'Invalid coffee variety'
    }
  },
  roastLevel: {
    type: String,
    required: [true, 'Roast level is required'],
    enum: {
      values: ['Light', 'Medium', 'Dark'],
      message: 'Roast level must be Light, Medium, or Dark'
    }
  },
  processingMethod: {
    type: String,
    required: [true, 'Processing method is required'],
    enum: {
      values: ['Washed', 'Natural', 'Honey', 'Semi-washed', 'Pulped Natural'],
      message: 'Invalid processing method'
    }
  },
  altitudeGrown: {
    type: Number,
    required: [true, 'Altitude grown is required'],
    min: [1000, 'Altitude should be at least 1000m for quality coffee'],
    max: [2500, 'Altitude cannot exceed 2500m']
  },
  harvestDate: {
    type: Date
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [100, 'Price must be at least KES 100 per kg'],
    max: [10000, 'Price cannot exceed KES 10,000 per kg']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1 kg'],
    max: [10000, 'Quantity cannot exceed 10,000 kg']
  },
  status: {
    type: String,
    enum: ['Available', 'OutOfStock', 'Pending'],
    default: 'Available'
  },

  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  flavorNotes: [{
    type: String,
    trim: true,
    maxlength: [50, 'Flavor note cannot exceed 50 characters']
  }],
  
  images: [{
    type: String // URLs to product images
  }],
  
  qualityScore: {
    type: Number,
    min: [0, 'Quality score cannot be negative'],
    max: [100, 'Quality score cannot exceed 100'],
    default: 0
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  isFairTrade: {
    type: Boolean,
    default: false
  },

  qrCode: {
    type: String
  },

  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'Total reviews cannot be negative']
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ farmerId: 1 });
productSchema.index({ variety: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ qualityScore: -1 });

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
