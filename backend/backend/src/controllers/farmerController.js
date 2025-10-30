const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

const getAllFarmers = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Farmer.find(JSON.parse(queryStr));

  query = query.find({ isActive: true, isVerified: true });

  query = query.select('-password -refreshTokens -verificationDocuments -bankDetails -loginAttempts -lockUntil');

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-averageRating -createdAt');
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Farmer.countDocuments({ isActive: true, isVerified: true });

  query = query.skip(startIndex).limit(limit);

  const farmers = await query;

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: farmers.length,
    pagination,
    data: farmers
  });
});

const getFarmer = asyncHandler(async (req, res, next) => {
  const farmer = await Farmer.findById(req.params.id)
    .select('-password -refreshTokens -verificationDocuments -bankDetails -loginAttempts -lockUntil');

  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  if (!farmer.isActive || !farmer.isVerified) {
    return next(new AppError('Farmer profile not available', 404));
  }

  const productStats = await Product.aggregate([
    { $match: { farmerId: farmer._id, status: 'Available' } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        averagePrice: { $avg: '$price' }
      }
    }
  ]);

  const latestProducts = await Product.find({ farmerId: farmer._id, status: 'Available' })
    .sort('-createdAt')
    .limit(3)
    .select('name variety price quantity images');

  res.status(200).json({
    success: true,
    data: {
      farmer,
      productStats: productStats[0] || { totalProducts: 0, totalQuantity: 0, averagePrice: 0 },
      latestProducts
    }
  });
});

const updateFarmerProfile = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this profile', 403));
  }

  const allowedFields = [
    'name', 'phone', 'county', 'location', 'brandStory', 'farmSize', 
    'altitudeRange', 'certifications', 'varietiesGrown', 'processingMethods',
    'profileImage', 'farmImages', 'socialMedia', 'sustainabilityPractices',
    'communicationPreferences', 'bankDetails'
  ];

  const updateObj = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateObj[key] = req.body[key];
    }
  });

  const farmer = await Farmer.findByIdAndUpdate(
    req.params.id,
    updateObj,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -refreshTokens -verificationDocuments -loginAttempts -lockUntil');

  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: farmer
  });
});

const deleteFarmer = asyncHandler(async (req, res, next) => {
 if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this account', 403));
  }

  const farmer = await Farmer.findById(req.params.id);

  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  farmer.isActive = false;
  await farmer.save();

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

const getFarmerProducts = asyncHandler(async (req, res, next) => {
  const farmer = await Farmer.findById(req.params.id);

  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  if (!farmer.isActive || !farmer.isVerified) {
    return next(new AppError('Farmer profile not available', 404));
  }

  const queryObj = { farmerId: req.params.id, ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let query = Product.find(queryObj);

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  query = query.skip(startIndex).limit(limit);

  const products = await query.populate('farmerId', 'name county averageRating');
  const total = await Product.countDocuments({ farmerId: req.params.id });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products
  });
});

const getFarmerOrders = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access these orders', 403));
  }

  const farmer = await Farmer.findById(req.params.id);

  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  const queryObj = { farmerId: req.params.id };
  
  if (req.query.status) {
    queryObj.status = req.query.status;
  }

  if (req.query.startDate || req.query.endDate) {
    queryObj.createdAt = {};
    if (req.query.startDate) {
      queryObj.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      queryObj.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const orders = await Order.find(queryObj)
    .populate('buyerId', 'name email phone')
    .populate('productId', 'name variety price')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  const total = await Order.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: orders
  });
});

const getFarmerAnalytics = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access these analytics', 403));
  }

  const farmerId = new mongoose.Types.ObjectId(req.params.id);
  const farmer = await Farmer.findById(farmerId);

  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  const salesAnalytics = await Order.aggregate([
    {
      $match: {
        farmerId: farmerId,
        status: { $in: ['Delivered', 'Completed'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalSales: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  const productPerformance = await Order.aggregate([
    {
      $match: {
        farmerId: farmerId,
        status: { $in: ['Delivered', 'Completed'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $group: {
        _id: '$productId',
        productName: { $first: '$product.name' },
        variety: { $first: '$product.variety' },
        totalSales: { $sum: '$totalAmount' },
        totalQuantity: { $sum: '$quantity' },
        orderCount: { $sum: 1 },
        averagePrice: { $avg: '$product.price' }
      }
    },
    {
      $sort: { totalSales: -1 }
    },
    {
      $limit: 10
    }
  ]);

  const customerAnalytics = await Order.aggregate([
    {
      $match: {
        farmerId: farmerId,
        status: { $in: ['Delivered', 'Completed'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$buyerId',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        lastOrderDate: { $max: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'buyers',
        localField: '_id',
        foreignField: '_id',
        as: 'buyer'
      }
    },
    {
      $unwind: '$buyer'
    },
    {
      $project: {
        buyerName: '$buyer.name',
        buyerEmail: '$buyer.email',
        totalOrders: 1,
        totalSpent: 1,
        averageOrderValue: 1,
        lastOrderDate: 1
      }
    },
    {
      $sort: { totalSpent: -1 }
    },
    {
      $limit: 10
    }
  ]);

  const overallStats = await Order.aggregate([
    {
      $match: {
        farmerId: farmerId,
        status: { $in: ['Delivered', 'Completed'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        totalQuantitySold: { $sum: '$quantity' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const currentMonthStats = await Order.aggregate([
    {
      $match: {
        farmerId: farmerId,
        status: { $in: ['Delivered', 'Completed'] },
        createdAt: { $gte: currentMonth }
      }
    },
    {
      $group: {
        _id: null,
        monthlyRevenue: { $sum: '$totalAmount' },
        monthlyOrders: { $sum: 1 },
        monthlyQuantity: { $sum: '$quantity' }
      }
    }
  ]);

  const inventoryStats = await Product.aggregate([
    {
      $match: { farmerId: farmerId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      salesAnalytics,
      productPerformance,
      customerAnalytics,
      overallStats: overallStats[0] || { totalRevenue: 0, totalOrders: 0, totalQuantitySold: 0, averageOrderValue: 0 },
      currentMonthStats: currentMonthStats[0] || { monthlyRevenue: 0, monthlyOrders: 0, monthlyQuantity: 0 },
      inventoryStats,
      farmerProfile: {
        name: farmer.name,
        county: farmer.county,
        farmSize: farmer.farmSize,
        averageRating: farmer.averageRating,
        totalReviews: farmer.totalReviews,
        qualityScore: farmer.qualityScore,
        certifications: farmer.certifications,
        sustainabilityPractices: farmer.sustainabilityPractices
      }
    }
  });
});

const searchFarmersByLocation = asyncHandler(async (req, res, next) => {
  const { latitude, longitude, radius = 10 } = req.query;

  if (!latitude || !longitude) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const farmers = await Farmer.findByLocation(
    parseFloat(latitude),
    parseFloat(longitude),
    parseFloat(radius)
  );

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const getFarmersByCounty = asyncHandler(async (req, res, next) => {
  const { county } = req.params;
  
  const farmers = await Farmer.findByCounty(county);

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const getTopRatedFarmers = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const farmers = await Farmer.getTopRated(limit);

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const updateVerificationStatus = asyncHandler(async (req, res, next) => {
  const { isVerified } = req.body;

  const farmer = await Farmer.findByIdAndUpdate(
    req.params.id,
    { isVerified },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens -verificationDocuments -bankDetails');

  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  res.status(200).json({
    success: true,
    message: `Farmer ${isVerified ? 'verified' : 'unverified'} successfully`,
    data: farmer
  });
});

const getFarmerDashboard = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this dashboard', 403));
  }

  const farmer = await Farmer.findById(req.params.id);

  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const currentMonthOrders = await Order.countDocuments({
    farmerId: req.params.id,
    createdAt: { $gte: thisMonth }
  });

  const lastMonthOrders = await Order.countDocuments({
    farmerId: req.params.id,
    createdAt: { $gte: lastMonth, $lt: thisMonth }
  });

  const activeProducts = await Product.countDocuments({
    farmerId: req.params.id,
    status: 'Available'
  });

  const pendingOrders = await Order.countDocuments({
    farmerId: req.params.id,
    status: 'Pending'
  });

  const recentOrders = await Order.find({
    farmerId: req.params.id
  })
    .populate('buyerId', 'name email')
    .populate('productId', 'name variety')
    .sort('-createdAt')
    .limit(5);

  const revenueData = await Order.aggregate([
    {
      $match: {
        farmerId: new mongoose.Types.ObjectId(req.params.id),
        status: { $in: ['Delivered', 'Completed'] },
        createdAt: { $gte: thisMonth }
      }
    },
    {
      $group: {
        _id: null,
        currentMonthRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);

  const dashboardData = {
    farmer: farmer.getDashboardData(),
    stats: {
      currentMonthOrders,
      lastMonthOrders,
      orderGrowth: lastMonthOrders > 0 ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : 0,
      activeProducts,
      pendingOrders,
      currentMonthRevenue: revenueData[0]?.currentMonthRevenue || 0
    },
    recentOrders
  };

  res.status(200).json({
    success: true,
    data: dashboardData
  });
});

module.exports = {
  getAllFarmers,
  getFarmer,
  updateFarmerProfile,
  deleteFarmer,
  getFarmerProducts,
  getFarmerOrders,
  getFarmerAnalytics,
  searchFarmersByLocation,
  getFarmersByCounty,
  getTopRatedFarmers,
  updateVerificationStatus,
  getFarmerDashboard
};
