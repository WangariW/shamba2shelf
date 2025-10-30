const mongoose = require('mongoose');

const salesMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalQuantitySold: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  ordersByStatus: {
    pending: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    inTransit: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },
  topProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    quantitySold: Number,
    revenue: Number
  }],
  topFarmers: [{
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer'
    },
    name: String,
    orderCount: Number,
    revenue: Number
  }],
  topBuyers: [{
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer'
    },
    name: String,
    orderCount: Number,
    totalSpent: Number
  }],
  regionBreakdown: [{
    region: String,
    orderCount: Number,
    revenue: Number,
    averageOrderValue: Number
  }]
}, {
  timestamps: true
});

const inventoryMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  lowStockProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    currentStock: Number,
    minimumThreshold: Number,
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer'
    }
  }],
  expiringProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    quantity: Number,
    expiryDate: Date,
    daysUntilExpiry: Number,
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer'
    }
  }],
  categoryBreakdown: [{
    category: String,
    productCount: Number,
    totalQuantity: Number,
    totalValue: Number,
    averagePrice: Number
  }],
  turnoverRate: {
    type: Number,
    default: 0
  },
  wasteMetrics: {
    expiredProducts: Number,
    wastedQuantity: Number,
    wastedValue: Number,
    wastePercentage: Number
  }
}, {
  timestamps: true
});

const performanceMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  userMetrics: {
    totalUsers: Number,
    activeUsers: Number,
    newRegistrations: Number,
    userRetentionRate: Number,
    farmersCount: Number,
    buyersCount: Number
  },
  systemMetrics: {
    apiResponseTime: Number,
    uptime: Number,
    errorRate: Number,
    successfulTransactions: Number,
    failedTransactions: Number
  },
  deliveryMetrics: {
    totalDeliveries: Number,
    onTimeDeliveries: Number,
    lateDeliveries: Number,
    failedDeliveries: Number,
    averageDeliveryTime: Number,
    onTimePercentage: Number
  },
  qualityMetrics: {
    averageRating: Number,
    totalReviews: Number,
    qualityComplaints: Number,
    resolvedComplaints: Number,
    customerSatisfactionScore: Number
  },
  financialMetrics: {
    totalTransactionValue: Number,
    platformCommission: Number,
    averageTransactionValue: Number,
    refundsIssued: Number,
    refundAmount: Number
  }
}, {
  timestamps: true
});

const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  sessionData: {
    loginCount: { type: Number, default: 0 },
    totalSessionTime: { type: Number, default: 0 },
    averageSessionTime: { type: Number, default: 0 },
    lastLoginDate: Date,
    deviceInfo: {
      browser: String,
      os: String,
      deviceType: String
    },
    locationData: {
      country: String,
      region: String,
      city: String
    }
  },
  activityMetrics: {
    ordersPlaced: { type: Number, default: 0 },
    ordersReceived: { type: Number, default: 0 },
    productsListed: { type: Number, default: 0 },
    productsViewed: { type: Number, default: 0 },
    searchesPerformed: { type: Number, default: 0 },
    messagesExchanged: { type: Number, default: 0 }
  },
  performanceMetrics: {
    averageResponseTime: Number,
    completionRate: Number,
    cancellationRate: Number,
    rating: Number,
    totalEarnings: Number,
    totalSpent: Number
  },
  behaviorPatterns: {
    preferredCategories: [String],
    peakActivityHours: [Number],
    averageOrderSize: Number,
    loyaltyScore: Number
  }
}, {
  timestamps: true
});

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sales', 'inventory', 'performance', 'user', 'financial', 'custom'],
    required: true
  },
  dateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  filters: {
    regions: [String],
    categories: [String],
    userTypes: [String],
    status: [String]
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  insights: [{
    metric: String,
    value: mongoose.Schema.Types.Mixed,
    trend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable']
    },
    percentage: Number,
    description: String
  }],
  charts: [{
    type: {
      type: String,
      enum: ['line', 'bar', 'pie', 'area', 'scatter']
    },
    title: String,
    data: mongoose.Schema.Types.Mixed,
    config: mongoose.Schema.Types.Mixed
  }],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly']
    },
    nextRun: Date,
    recipients: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

salesMetricsSchema.index({ date: 1, period: 1 });
inventoryMetricsSchema.index({ date: 1, period: 1 });
performanceMetricsSchema.index({ date: 1, period: 1 });
userAnalyticsSchema.index({ userId: 1, date: 1 });
reportSchema.index({ type: 1, 'dateRange.startDate': 1 });

salesMetricsSchema.methods.calculateGrowthRate = function(previousPeriodData) {
  if (!previousPeriodData || previousPeriodData.totalRevenue === 0) return 0;
  return ((this.totalRevenue - previousPeriodData.totalRevenue) / previousPeriodData.totalRevenue) * 100;
};

inventoryMetricsSchema.methods.getStockHealth = function() {
  const lowStockCount = this.lowStockProducts.length;
  const expiringCount = this.expiringProducts.length;
  const totalProducts = this.totalProducts;
  
  const healthScore = Math.max(0, 100 - ((lowStockCount + expiringCount) / totalProducts) * 100);
  
  return {
    score: healthScore,
    status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : healthScore > 40 ? 'fair' : 'poor',
    lowStockPercentage: (lowStockCount / totalProducts) * 100,
    expiringPercentage: (expiringCount / totalProducts) * 100
  };
};

performanceMetricsSchema.methods.calculateKPIs = function() {
  return {
    userGrowthRate: this.userMetrics.newRegistrations / Math.max(1, this.userMetrics.totalUsers - this.userMetrics.newRegistrations) * 100,
    systemHealthScore: Math.max(0, 100 - (this.systemMetrics.errorRate * 100)),
    deliverySuccessRate: (this.deliveryMetrics.onTimeDeliveries / Math.max(1, this.deliveryMetrics.totalDeliveries)) * 100,
    customerSatisfactionIndex: this.qualityMetrics.customerSatisfactionScore || 0,
    revenuePerUser: this.financialMetrics.totalTransactionValue / Math.max(1, this.userMetrics.activeUsers)
  };
};

userAnalyticsSchema.methods.calculateEngagementScore = function() {
  const weights = {
    loginCount: 0.2,
    sessionTime: 0.15,
    orders: 0.25,
    products: 0.2,
    searches: 0.1,
    messages: 0.1
  };
  
  const normalizedMetrics = {
    loginCount: Math.min(this.sessionData.loginCount / 30, 1),
    sessionTime: Math.min(this.sessionData.totalSessionTime / (8 * 3600), 1),
    orders: Math.min((this.activityMetrics.ordersPlaced + this.activityMetrics.ordersReceived) / 10, 1),
    products: Math.min(this.activityMetrics.productsListed / 5, 1),
    searches: Math.min(this.activityMetrics.searchesPerformed / 50, 1),
    messages: Math.min(this.activityMetrics.messagesExchanged / 20, 1)
  };
  
  let score = 0;
  for (const [metric, weight] of Object.entries(weights)) {
    score += normalizedMetrics[metric] * weight;
  }
  
  return Math.round(score * 100);
};

const SalesMetrics = mongoose.model('SalesMetrics', salesMetricsSchema);
const InventoryMetrics = mongoose.model('InventoryMetrics', inventoryMetricsSchema);
const PerformanceMetrics = mongoose.model('PerformanceMetrics', performanceMetricsSchema);
const UserAnalytics = mongoose.model('UserAnalytics', userAnalyticsSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = {
  SalesMetrics,
  InventoryMetrics,
  PerformanceMetrics,
  UserAnalytics,
  Report
};
