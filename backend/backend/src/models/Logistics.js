const mongoose = require('mongoose');

const deliveryRouteSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  waypoints: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'waypoint'],
      required: true
    }
  }],
  estimatedDistance: {
    type: Number,
    min: 0
  },
  estimatedDuration: {
    type: Number,
    min: 0
  },
  optimizedRoute: [{
    lat: Number,
    lng: Number,
    sequence: Number
  }]
});

const trackingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  trackingNumber: {
    type: String,
    unique: true,
    required: true
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
    timestamp: { type: Date, default: Date.now }
  },
  status: {
    type: String,
    enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
    default: 'pending'
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicleInfo: {
    plateNumber: String,
    type: {
      type: String,
      enum: ['truck', 'van', 'motorcycle', 'bicycle']
    },
    capacity: Number
  },
  route: deliveryRouteSchema,
  trackingHistory: [{
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    status: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  deliveryInstructions: String,
  signatureRequired: {
    type: Boolean,
    default: false
  },
  signature: {
    data: String,
    timestamp: Date,
    recipientName: String
  },
  photos: [{
    url: String,
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'damage', 'verification']
    },
    timestamp: { type: Date, default: Date.now }
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  deliveryAttempts: [{
    timestamp: Date,
    status: String,
    reason: String,
    nextAttemptScheduled: Date
  }],
  cost: {
    baseFee: { type: Number, default: 0 },
    distanceFee: { type: Number, default: 0 },
    weightFee: { type: Number, default: 0 },
    urgencyFee: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  capacity: {
    total: { type: Number, required: true },
    available: { type: Number, required: true },
    unit: {
      type: String,
      enum: ['kg', 'tons', 'm3', 'pallets'],
      default: 'kg'
    }
  },
  inventory: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    location: String,
    expiryDate: Date,
    batchNumber: String
  }],
  operatingHours: {
    open: String,
    close: String,
    timezone: { type: String, default: 'Africa/Nairobi' }
  },
  contactInfo: {
    phone: String,
    email: String,
    manager: String
  },
  facilities: [{
    type: {
      type: String,
      enum: ['cold_storage', 'dry_storage', 'loading_dock', 'office']
    },
    capacity: Number,
    temperature: {
      min: Number,
      max: Number
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

const fleetSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    unique: true,
    required: true
  },
  plateNumber: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['truck', 'van', 'motorcycle', 'bicycle'],
    required: true
  },
  capacity: {
    weight: { type: Number, required: true },
    volume: Number,
    unit: {
      type: String,
      enum: ['kg', 'tons'],
      default: 'kg'
    }
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String,
    timestamp: { type: Date, default: Date.now }
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'out_of_service'],
    default: 'available'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  maintenanceSchedule: [{
    type: {
      type: String,
      enum: ['routine', 'repair', 'inspection']
    },
    scheduledDate: Date,
    completedDate: Date,
    cost: Number,
    notes: String
  }],
  fuelInfo: {
    type: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid']
    },
    consumption: Number,
    lastRefill: Date,
    currentLevel: Number
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: String
  }
}, {
  timestamps: true
});

trackingSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'TRK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

trackingSchema.methods.updateLocation = function(lat, lng, address, status, notes) {
  this.currentLocation = { lat, lng, address, timestamp: new Date() };
  if (status) this.status = status;
  
  this.trackingHistory.push({
    location: { lat, lng, address },
    status: status || this.status,
    timestamp: new Date(),
    notes
  });
  
  return this.save();
};

trackingSchema.methods.addDeliveryAttempt = function(status, reason, nextAttempt) {
  this.deliveryAttempts.push({
    timestamp: new Date(),
    status,
    reason,
    nextAttemptScheduled: nextAttempt
  });
  
  return this.save();
};

trackingSchema.methods.calculateDeliveryCost = function(distance, weight, priority) {
  const baseFee = 200;
  const distanceFee = distance * 15;
  const weightFee = weight > 10 ? (weight - 10) * 5 : 0;
  const urgencyMultiplier = priority === 'urgent' ? 2 : priority === 'high' ? 1.5 : 1;
  
  this.cost.baseFee = baseFee;
  this.cost.distanceFee = distanceFee;
  this.cost.weightFee = weightFee;
  this.cost.urgencyFee = (baseFee + distanceFee) * (urgencyMultiplier - 1);
  this.cost.totalCost = (baseFee + distanceFee + weightFee) * urgencyMultiplier;
  
  return this.cost.totalCost;
};

warehouseSchema.methods.updateInventory = function(productId, quantity, operation = 'add') {
  const existingItem = this.inventory.find(item => 
    item.productId && item.productId.toString() === productId.toString()
  );
  
  if (existingItem) {
    if (operation === 'add') {
      existingItem.quantity += quantity;
      this.capacity.available -= quantity;
    } else if (operation === 'remove') {
      existingItem.quantity -= quantity;
      this.capacity.available += quantity;
      if (existingItem.quantity <= 0) {
        this.inventory = this.inventory.filter(item => 
          item.productId.toString() !== productId.toString()
        );
      }
    }
  } else if (operation === 'add') {
    this.inventory.push({ productId, quantity });
    this.capacity.available -= quantity;
  }
  
  return this.save();
};

fleetSchema.methods.assignDriver = function(driverId) {
  this.driverId = driverId;
  this.status = 'in_use';
  return this.save();
};

fleetSchema.methods.scheduleMainenance = function(type, date, notes) {
  this.maintenanceSchedule.push({
    type,
    scheduledDate: date,
    notes
  });
  return this.save();
};

const Tracking = mongoose.model('Tracking', trackingSchema);
const Warehouse = mongoose.model('Warehouse', warehouseSchema);
const Fleet = mongoose.model('Fleet', fleetSchema);

module.exports = {
  Tracking,
  Warehouse,
  Fleet
};
