const Buyer = require('../models/Buyer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

const getAllBuyers = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Buyer.find(JSON.parse(queryStr));

  query = query.find({ isActive: true, isVerified: true });

  query = query.select('-password -refreshTokens -verificationToken -passwordResetToken -loginAttempts -lockUntil');

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-rating.average -createdAt');
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Buyer.countDocuments({ isActive: true, isVerified: true });

  query = query.skip(startIndex).limit(limit);

  const buyers = await query;

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
    count: buyers.length,
    pagination,
    data: buyers
  });
});

const getBuyer = asyncHandler(async (req, res, next) => {
  const buyer = await Buyer.findById(req.params.id)
    .select('-password -refreshTokens -verificationToken -passwordResetToken -loginAttempts -lockUntil');

  if (!buyer) {
    return next(new AppError('Buyer not found', 404));
  }

  if (!buyer.isActive || !buyer.isVerified) {
    return next(new AppError('Buyer profile not available', 404));
  }

  const orderStats = await Order.aggregate([
    { $match: { buyerId: buyer._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
        }
      }
    }
  ]);

  const recentOrders = await Order.find({ buyerId: buyer._id })
    .sort('-createdAt')
    .limit(5)
    .populate('farmerId', 'name email')
    .select('orderNumber status totalAmount items createdAt');

  res.status(200).json({
    success: true,
    data: {
      buyer,
      stats: orderStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        completedOrders: 0
      },
      recentOrders
    }
  });
});

const updateBuyerProfile = asyncHandler(async (req, res, next) => {
  const buyerId = req.params.id;

  if (req.user.id !== buyerId && !['admin', 'superadmin'].includes(req.user.role)) {
    return next(new AppError('You can only update your own profile', 403));
  }

  const filteredBody = {};
  const allowedFields = [
    'name', 'phone', 'businessType', 'businessName', 'businessLicense',
    'deliveryAddress', 'preferences', 'paymentMethods', 'notifications'
  ];

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  if (filteredBody.paymentMethods) {
    const defaultMethods = filteredBody.paymentMethods.filter(method => method.isDefault);
    if (defaultMethods.length > 1) {
      return next(new AppError('Only one payment method can be set as default', 400));
    }
  }

  const buyer = await Buyer.findByIdAndUpdate(buyerId, filteredBody, {
    new: true,
    runValidators: true
  }).select('-password -refreshTokens -verificationToken -passwordResetToken -loginAttempts -lockUntil');

  if (!buyer) {
    return next(new AppError('Buyer not found', 404));
  }

  res.status(200).json({
    success: true,
    data: buyer
  });
});

const deleteBuyer = asyncHandler(async (req, res, next) => {
  const buyerId = req.params.id;

  if (req.user.id !== buyerId && !['admin', 'superadmin'].includes(req.user.role)) {
    return next(new AppError('You can only delete your own profile', 403));
  }

  const buyer = await Buyer.findById(buyerId);
  if (!buyer) {
    return next(new AppError('Buyer not found', 404));
  }

  const activeOrders = await Order.countDocuments({
    buyerId: buyerId,
    status: { $in: ['Pending', 'Confirmed', 'Processing', 'Shipped'] }
  });

  if (activeOrders > 0) {
    return next(new AppError('Cannot delete buyer with active orders', 400));
  }

  await Buyer.findByIdAndUpdate(buyerId, { isActive: false });

  res.status(204).json({
    success: true,
    data: null
  });
});

const getBuyerOrders = asyncHandler(async (req, res, next) => {
  const buyerId = req.params.id;

  if (req.user.id !== buyerId && !['admin', 'superadmin'].includes(req.user.role)) {
    return next(new AppError('You can only view your own orders', 403));
  }

  const queryObj = { buyerId, ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Order.find(JSON.parse(queryStr));

  query = query.populate('farmerId', 'name email phone county');

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
  const endIndex = page * limit;
  const total = await Order.countDocuments({ buyerId });

  query = query.skip(startIndex).limit(limit);

  const orders = await query;

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
    count: orders.length,
    pagination,
    data: orders
  });
});

const getBuyerAnalytics = asyncHandler(async (req, res, next) => {
  const buyerId = req.params.id;

  if (req.user.id !== buyerId && !['admin', 'superadmin'].includes(req.user.role)) {
    return next(new AppError('You can only view your own analytics', 403));
  }

  const buyer = await Buyer.findById(buyerId);
  if (!buyer) {
    return next(new AppError('Buyer not found', 404));
  }

  const orderAnalytics = await Order.aggregate([
    { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
        }
      }
    }
  ]);

  const monthlySpending = await Order.aggregate([
    { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalSpent: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  const varietyPreferences = await Order.aggregate([
    { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.variety',
        totalQuantity: { $sum: '$items.quantity' },
        totalSpent: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ]);

  const farmerInteractions = await Order.aggregate([
    { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
    {
      $group: {
        _id: '$farmerId',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        lastOrderDate: { $max: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'farmers',
        localField: '_id',
        foreignField: '_id',
        as: 'farmer'
      }
    },
    { $unwind: '$farmer' },
    {
      $project: {
        farmerName: '$farmer.name',
        farmerEmail: '$farmer.email',
        totalOrders: 1,
        totalSpent: 1,
        averageOrderValue: 1,
        lastOrderDate: 1
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: orderAnalytics[0] || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      },
      monthlySpending,
      varietyPreferences,
      farmerInteractions,
      purchaseHistory: buyer.purchaseHistory
    }
  });
});

const searchBuyersByLocation = asyncHandler(async (req, res, next) => {
  const { latitude, longitude, maxDistance = 50 } = req.query;

  const buyers = await Buyer.find({
    isActive: true,
    isVerified: true,
    'deliveryAddress.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: maxDistance * 1000
      }
    }
  })
  .select('-password -refreshTokens -verificationToken -passwordResetToken -loginAttempts -lockUntil')
  .limit(20);

  res.status(200).json({
    success: true,
    count: buyers.length,
    data: buyers
  });
});

const getBuyersByCounty = asyncHandler(async (req, res, next) => {
  const { county } = req.params;

  const buyers = await Buyer.find({
    'deliveryAddress.county': county,
    isActive: true,
    isVerified: true
  })
  .select('-password -refreshTokens -verificationToken -passwordResetToken -loginAttempts -lockUntil')
  .sort('-rating.average -createdAt');

  res.status(200).json({
    success: true,
    count: buyers.length,
    data: buyers
  });
});

const getBuyersByBusinessType = asyncHandler(async (req, res, next) => {
  const { businessType } = req.params;

  const buyers = await Buyer.find({
    businessType,
    isActive: true,
    isVerified: true
  })
  .select('-password -refreshTokens -verificationToken -passwordResetToken -loginAttempts -lockUntil')
  .sort('-rating.average -createdAt');

  res.status(200).json({
    success: true,
    count: buyers.length,
    data: buyers
  });
});

const getTopRatedBuyers = asyncHandler(async (req, res, next) => {
  const buyers = await Buyer.find({
    isActive: true,
    isVerified: true,
    'rating.totalReviews': { $gte: 1 }
  })
  .select('-password -refreshTokens -verificationToken -passwordResetToken -loginAttempts -lockUntil')
  .sort('-rating.average -rating.totalReviews')
  .limit(10);

  res.status(200).json({
    success: true,
    count: buyers.length,
    data: buyers
  });
});

const getBuyerRecommendations = asyncHandler(async (req, res, next) => {
  const buyerId = req.params.id;

  if (req.user.id !== buyerId && !['admin', 'superadmin'].includes(req.user.role)) {
    return next(new AppError('You can only view your own recommendations', 403));
  }

  const buyer = await Buyer.findById(buyerId);
  if (!buyer) {
    return next(new AppError('Buyer not found', 404));
  }

  const recommendations = {};

  if (buyer.preferences.coffeeVarieties.length > 0) {
    recommendations.products = await Product.find({
      variety: { $in: buyer.preferences.coffeeVarieties },
      qualityGrade: { $in: buyer.preferences.qualityGrades },
      processingMethod: { $in: buyer.preferences.processingMethods },
      price: {
        $gte: buyer.preferences.priceRange.min,
        $lte: buyer.preferences.priceRange.max
      },
      quantity: { $gte: buyer.preferences.minQuantity },
      status: 'Available'
    })
    .populate('farmerId', 'name rating.average county')
    .sort('-createdAt')
    .limit(10);
  }

  if (buyer.purchaseHistory.preferredFarmers.length > 0) {
    const preferredFarmerIds = buyer.purchaseHistory.preferredFarmers.map(pf => pf.farmerId);
    recommendations.newProductsFromPreferredFarmers = await Product.find({
      farmerId: { $in: preferredFarmerIds },
      status: 'Available',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
    .populate('farmerId', 'name rating.average county')
    .sort('-createdAt')
    .limit(5);
  }

  const similarBuyers = await Buyer.find({
    _id: { $ne: buyerId },
    businessType: buyer.businessType,
    'preferences.coffeeVarieties': { $in: buyer.preferences.coffeeVarieties },
    isActive: true,
    isVerified: true
  }).limit(5);

  if (similarBuyers.length > 0) {
    const similarBuyerIds = similarBuyers.map(b => b._id);
    const popularProducts = await Order.aggregate([
      { $match: { buyerId: { $in: similarBuyerIds } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          orderCount: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.status': 'Available' } },
      {
        $lookup: {
          from: 'farmers',
          localField: 'product.farmerId',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      { $unwind: '$farmer' }
    ]);

    recommendations.popularWithSimilarBuyers = popularProducts;
  }

  res.status(200).json({
    success: true,
    data: recommendations
  });
});

const updateVerificationStatus = asyncHandler(async (req, res, next) => {
  const { isVerified } = req.body;
  const buyer = await Buyer.findByIdAndUpdate(
    req.params.id,
    { isVerified },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens -verificationToken -passwordResetToken');

  if (!buyer) {
    return next(new AppError('Buyer not found', 404));
  }

  res.status(200).json({
    success: true,
    data: buyer
  });
});

const getBuyerDashboard = asyncHandler(async (req, res, next) => {
  const buyerId = req.params.id;

  if (req.user.id !== buyerId && !['admin', 'superadmin'].includes(req.user.role)) {
    return next(new AppError('You can only view your own dashboard', 403));
  }

  const buyer = await Buyer.findById(buyerId)
    .select('-password -refreshTokens -verificationToken -passwordResetToken -loginAttempts -lockUntil');

  if (!buyer) {
    return next(new AppError('Buyer not found', 404));
  }

  const [orderStats, recentOrders, monthlySpending, favoriteVarieties] = await Promise.all([
    Order.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $in: ['$status', ['Pending', 'Confirmed', 'Processing']] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          }
        }
      }
    ]),
    Order.find({ buyerId })
      .populate('farmerId', 'name email')
      .sort('-createdAt')
      .limit(5),
    Order.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]),
    Order.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.variety',
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      buyer,
      stats: orderStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        completedOrders: 0
      },
      recentOrders,
      monthlySpending,
      favoriteVarieties
    }
  });
});

module.exports = {
  getAllBuyers,
  getBuyer,
  updateBuyerProfile,
  deleteBuyer,
  getBuyerOrders,
  getBuyerAnalytics,
  searchBuyersByLocation,
  getBuyersByCounty,
  getBuyersByBusinessType,
  getTopRatedBuyers,
  getBuyerRecommendations,
  updateVerificationStatus,
  getBuyerDashboard
};
