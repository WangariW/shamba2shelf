const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: [true, 'Buyer ID is required']
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Farmer ID is required']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },

  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1 kg']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },

  status: {
    type: String,
    enum: {
      values: ['Pending', 'Confirmed', 'InTransit', 'Delivered', 'Cancelled', 'Completed'],
      message: 'Invalid order status'
    },
    default: 'Pending'
  },

  paymentStatus: {
    type: String,
    enum: {
      values: ['Pending', 'Paid', 'Failed', 'Refunded'],
      message: 'Invalid payment status'
    },
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['M-Pesa', 'Bank Transfer', 'Cash', 'Card'],
      message: 'Invalid payment method'
    }
  },
  paymentReference: {
    type: String,
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
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-1.7, 'Latitude must be within Kenya boundaries'],
        max: [5.0, 'Latitude must be within Kenya boundaries']
      },
      longitude: {
        type: Number,
        min: [33.9, 'Longitude must be within Kenya boundaries'],
        max: [41.9, 'Longitude must be within Kenya boundaries']
      }
    }
  },

  deliveryDate: {
    type: Date
  },
  estimatedDeliveryDate: {
    type: Date
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  logisticsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Logistics'
  },

  buyerNotes: {
    type: String,
    maxlength: [500, 'Buyer notes cannot exceed 500 characters']
  },
  farmerNotes: {
    type: String,
    maxlength: [500, 'Farmer notes cannot exceed 500 characters']
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },

  specialRequirements: {
    packaging: {
      type: String,
      enum: ['Standard', 'Gift Box', 'Bulk', 'Custom']
    },
    urgency: {
      type: String,
      enum: ['Standard', 'Express', 'Same Day']
    },
    certificationRequired: {
      type: Boolean,
      default: false
    }
  },

  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [200, 'Status notes cannot exceed 200 characters']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.updatedByModel'
    },
    updatedByModel: {
      type: String,
      enum: ['Farmer', 'Buyer', 'Admin', 'System']
    }
  }],

  review: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    reviewDate: {
      type: Date
    }
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

orderSchema.index({ farmerId: 1, createdAt: -1 });
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ productId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('unitPrice')) {
    this.totalAmount = this.quantity * this.unitPrice;
  }
  this.updatedAt = Date.now();
  next();
});

orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedByModel: 'System'
    });
  }
  next();
});

orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

orderSchema.virtual('isOverdue').get(function() {
  return this.estimatedDeliveryDate && 
         this.estimatedDeliveryDate < new Date() && 
         !['Delivered', 'Completed', 'Cancelled'].includes(this.status);
});

orderSchema.methods.updateStatus = function(newStatus, notes = '', updatedBy = null, updatedByModel = 'System') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    notes: notes,
    updatedBy: updatedBy,
    updatedByModel: updatedByModel
  });
  return this.save();
};

orderSchema.methods.getDeliveryTime = function() {
  if (this.status === 'Delivered' && this.deliveryDate) {
    return Math.floor((this.deliveryDate - this.createdAt) / (1000 * 60 * 60 * 24)); // days
  }
  return null;
};

orderSchema.statics.findByDateRange = function(startDate, endDate, additionalFilters = {}) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    },
    ...additionalFilters
  }).populate('farmerId', 'name county')
    .populate('buyerId', 'name email')
    .populate('productId', 'name variety price');
};

orderSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('farmerId', 'name county')
    .populate('buyerId', 'name email')
    .populate('productId', 'name variety');
};

module.exports = mongoose.model('Order', orderSchema);
