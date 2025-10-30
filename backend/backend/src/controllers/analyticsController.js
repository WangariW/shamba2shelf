const { SalesMetrics, InventoryMetrics, PerformanceMetrics, UserAnalytics, Report } = require('../models/Analytics');
const analyticsService = require('../services/analyticsService');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

const getDashboardData = asyncHandler(async (req, res, next) => {
  const { dateRange } = req.query;
  
  const dashboardData = await analyticsService.getDashboardData(
    parseInt(dateRange) || 30
  );

  res.status(200).json({
    status: 'success',
    data: {
      dashboard: dashboardData
    }
  });
});

const getSalesMetrics = asyncHandler(async (req, res, next) => {
  const { period, startDate, endDate, limit } = req.query;
  
  const query = {};
  
  if (period) query.period = period;
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const salesMetrics = await SalesMetrics.find(query)
    .sort({ date: -1 })
    .limit(parseInt(limit) || 50)
    .populate('topProducts.productId', 'name category')
    .populate('topFarmers.farmerId', 'businessName location')
    .populate('topBuyers.buyerId', 'businessName location');

  res.status(200).json({
    status: 'success',
    results: salesMetrics.length,
    data: {
      salesMetrics
    }
  });
});

const getInventoryMetrics = asyncHandler(async (req, res, next) => {
  const { period, startDate, endDate, limit } = req.query;
  
  const query = {};
  
  if (period) query.period = period;
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const inventoryMetrics = await InventoryMetrics.find(query)
    .sort({ date: -1 })
    .limit(parseInt(limit) || 50)
    .populate('lowStockProducts.productId', 'name category pricePerKg')
    .populate('lowStockProducts.farmerId', 'businessName contactInfo')
    .populate('expiringProducts.productId', 'name category pricePerKg')
    .populate('expiringProducts.farmerId', 'businessName contactInfo');

  const metricsWithHealth = inventoryMetrics.map(metric => ({
    ...metric.toObject(),
    stockHealth: metric.getStockHealth()
  }));

  res.status(200).json({
    status: 'success',
    results: inventoryMetrics.length,
    data: {
      inventoryMetrics: metricsWithHealth
    }
  });
});

const getPerformanceMetrics = asyncHandler(async (req, res, next) => {
  const { period, startDate, endDate, limit } = req.query;
  
  const query = {};
  
  if (period) query.period = period;
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const performanceMetrics = await PerformanceMetrics.find(query)
    .sort({ date: -1 })
    .limit(parseInt(limit) || 50);

  const metricsWithKPIs = performanceMetrics.map(metric => ({
    ...metric.toObject(),
    kpis: metric.calculateKPIs()
  }));

  res.status(200).json({
    status: 'success',
    results: performanceMetrics.length,
    data: {
      performanceMetrics: metricsWithKPIs
    }
  });
});

const getUserAnalytics = asyncHandler(async (req, res, next) => {
  const { userId, userType, startDate, endDate, limit } = req.query;
  
  const query = {};
  
  if (userId) query.userId = userId;
  if (userType) query.userType = userType;
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const userAnalytics = await UserAnalytics.find(query)
    .sort({ date: -1 })
    .limit(parseInt(limit) || 50)
    .populate('userId', 'name email role');

  const analyticsWithEngagement = userAnalytics.map(analytics => ({
    ...analytics.toObject(),
    engagementScore: analytics.calculateEngagementScore()
  }));

  res.status(200).json({
    status: 'success',
    results: userAnalytics.length,
    data: {
      userAnalytics: analyticsWithEngagement
    }
  });
});

const generateMetrics = asyncHandler(async (req, res, next) => {
  const { type, date } = req.body;
  
  if (!type) {
    return next(new AppError('Metric type is required', 400));
  }

  const targetDate = date ? new Date(date) : new Date();
  
  let result;
  
  switch (type) {
    case 'daily':
      result = await analyticsService.generateDailyMetrics(targetDate);
      break;
    case 'weekly':
      result = await analyticsService.generateWeeklyMetrics(targetDate);
      break;
    case 'monthly':
      result = await analyticsService.generateMonthlyMetrics(targetDate);
      break;
    default:
      return next(new AppError('Invalid metric type. Use daily, weekly, or monthly', 400));
  }

  res.status(200).json({
    status: 'success',
    message: `${type} metrics generated successfully`,
    data: {
      generatedFor: targetDate
    }
  });
});

const createCustomReport = asyncHandler(async (req, res, next) => {
  const { title, type, dateRange, filters } = req.body;

  if (!title || !type || !dateRange) {
    return next(new AppError('Title, type, and date range are required', 400));
  }

  if (!dateRange.startDate || !dateRange.endDate) {
    return next(new AppError('Start date and end date are required in date range', 400));
  }

  const reportConfig = {
    title,
    type,
    dateRange: {
      startDate: new Date(dateRange.startDate),
      endDate: new Date(dateRange.endDate)
    },
    filters: filters || {}
  };

  if (req.user) {
    reportConfig.generatedBy = req.user.id;
  }

  const report = await analyticsService.generateCustomReport(reportConfig);

  res.status(201).json({
    status: 'success',
    data: {
      report
    }
  });
});

const getAllReports = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let query = Report.find(queryObj)
    .populate('generatedBy', 'name email');

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const total = await Report.countDocuments(queryObj);
  
  query = query.skip(startIndex).limit(limit);
  const reports = await query;

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  };

  res.status(200).json({
    status: 'success',
    results: reports.length,
    pagination,
    data: {
      reports
    }
  });
});

const getReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate('generatedBy', 'name email');

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});

const updateReport = asyncHandler(async (req, res, next) => {
  const allowedFields = ['title', 'filters', 'schedule', 'isScheduled'];
  const updateObj = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateObj[key] = req.body[key];
    }
  });

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    updateObj,
    {
      new: true,
      runValidators: true
    }
  ).populate('generatedBy', 'name email');

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});

const deleteReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findByIdAndDelete(req.params.id);

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const getTopPerformers = asyncHandler(async (req, res, next) => {
  const { type, period, limit } = req.query;
  
  if (!type) {
    return next(new AppError('Type is required (farmers, buyers, products)', 400));
  }

  const metricsQuery = { period: period || 'monthly' };
  const latestMetrics = await SalesMetrics.findOne(metricsQuery)
    .sort({ date: -1 });

  if (!latestMetrics) {
    return res.status(200).json({
      status: 'success',
      data: {
        topPerformers: []
      }
    });
  }

  let topPerformers = [];
  const limitNum = parseInt(limit) || 10;

  switch (type) {
    case 'farmers':
      topPerformers = latestMetrics.topFarmers.slice(0, limitNum);
      break;
    case 'buyers':
      topPerformers = latestMetrics.topBuyers.slice(0, limitNum);
      break;
    case 'products':
      topPerformers = latestMetrics.topProducts.slice(0, limitNum);
      break;
    default:
      return next(new AppError('Invalid type. Use farmers, buyers, or products', 400));
  }

  res.status(200).json({
    status: 'success',
    results: topPerformers.length,
    data: {
      topPerformers,
      period: latestMetrics.period,
      date: latestMetrics.date
    }
  });
});

const getRegionalAnalytics = asyncHandler(async (req, res, next) => {
  const { period, startDate, endDate } = req.query;
  
  const query = { period: period || 'monthly' };
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const regionalData = await SalesMetrics.find(query)
    .sort({ date: -1 });

  const consolidatedRegions = {};
  
  regionalData.forEach(metric => {
    metric.regionBreakdown.forEach(region => {
      if (!consolidatedRegions[region.region]) {
        consolidatedRegions[region.region] = {
          region: region.region,
          totalOrders: 0,
          totalRevenue: 0,
          periods: []
        };
      }
      
      consolidatedRegions[region.region].totalOrders += region.orderCount;
      consolidatedRegions[region.region].totalRevenue += region.revenue;
      consolidatedRegions[region.region].periods.push({
        date: metric.date,
        orderCount: region.orderCount,
        revenue: region.revenue,
        averageOrderValue: region.averageOrderValue
      });
    });
  });

  const regionalAnalytics = Object.values(consolidatedRegions)
    .map(region => ({
      ...region,
      averageOrderValue: region.totalOrders > 0 ? region.totalRevenue / region.totalOrders : 0,
      periods: region.periods.sort((a, b) => new Date(b.date) - new Date(a.date))
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  res.status(200).json({
    status: 'success',
    results: regionalAnalytics.length,
    data: {
      regionalAnalytics
    }
  });
});

const getCategoryAnalytics = asyncHandler(async (req, res, next) => {
  const { period, startDate, endDate } = req.query;
  
  const query = { period: period || 'monthly' };
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const inventoryData = await InventoryMetrics.find(query)
    .sort({ date: -1 });

  const consolidatedCategories = {};
  
  inventoryData.forEach(metric => {
    metric.categoryBreakdown.forEach(category => {
      if (!consolidatedCategories[category.category]) {
        consolidatedCategories[category.category] = {
          category: category.category,
          totalProducts: 0,
          totalQuantity: 0,
          totalValue: 0,
          periods: []
        };
      }
      
      consolidatedCategories[category.category].totalProducts += category.productCount;
      consolidatedCategories[category.category].totalQuantity += category.totalQuantity;
      consolidatedCategories[category.category].totalValue += category.totalValue;
      consolidatedCategories[category.category].periods.push({
        date: metric.date,
        productCount: category.productCount,
        totalQuantity: category.totalQuantity,
        totalValue: category.totalValue,
        averagePrice: category.averagePrice
      });
    });
  });

  const categoryAnalytics = Object.values(consolidatedCategories)
    .map(category => ({
      ...category,
      averagePrice: category.totalQuantity > 0 ? category.totalValue / category.totalQuantity : 0,
      periods: category.periods.sort((a, b) => new Date(b.date) - new Date(a.date))
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  res.status(200).json({
    status: 'success',
    results: categoryAnalytics.length,
    data: {
      categoryAnalytics
    }
  });
});

module.exports = {
  getDashboardData,
  getSalesMetrics,
  getInventoryMetrics,
  getPerformanceMetrics,
  getUserAnalytics,
  generateMetrics,
  createCustomReport,
  getAllReports,
  getReport,
  updateReport,
  deleteReport,
  getTopPerformers,
  getRegionalAnalytics,
  getCategoryAnalytics
};
