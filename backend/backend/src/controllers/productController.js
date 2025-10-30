const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

const getAllProducts = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Product.find(JSON.parse(queryStr));
  
  query = query.find({ isActive: true });
  
  query = query.populate({
    path: 'farmerId',
    select: 'firstName lastName location averageRating totalSales'
  });

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
  const total = await Product.countDocuments({ isActive: true });

  query = query.skip(startIndex).limit(limit);

  const products = await query;

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
    count: products.length,
    total,
    pagination,
    data: products
  });
});

const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: 'farmerId',
      select: 'firstName lastName location averageRating totalSales contactInfo'
    });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!product.isActive) {
    return next(new AppError('Product is no longer available', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

const createProduct = asyncHandler(async (req, res, next) => {
  const farmer = await Farmer.findById(req.body.farmerId);
  
  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  if (!farmer.isVerified) {
    return next(new AppError('Only verified farmers can create products', 403));
  }

  if (req.user.role === 'farmer' && req.user.id !== req.body.farmerId) {
    return next(new AppError('Farmers can only create products for themselves', 403));
  }

  const product = await Product.create(req.body);

  await product.populate({
    path: 'farmerId',
    select: 'firstName lastName location averageRating'
  });

  res.status(201).json({
    success: true,
    data: product
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (req.user.role === 'farmer' && req.user.id !== product.farmerId.toString()) {
    return next(new AppError('Not authorized to update this product', 403));
  }

  const restrictedFields = ['farmerId', 'createdAt', 'qrCode'];
  restrictedFields.forEach(field => delete req.body[field]);

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate({
    path: 'farmerId',
    select: 'firstName lastName location averageRating'
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (req.user.role === 'farmer' && req.user.id !== product.farmerId.toString()) {
    return next(new AppError('Not authorized to delete this product', 403));
  }

  const activeOrders = await Order.countDocuments({
    productId: req.params.id,
    status: { $in: ['Pending', 'Confirmed', 'InTransit'] }
  });

  if (activeOrders > 0) {
    return next(new AppError('Cannot delete product with active orders', 400));
  }

  await Product.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json({
    success: true,
    data: {}
  });
});

const searchProducts = asyncHandler(async (req, res, next) => {
  const { q, variety, roastLevel, processingMethod, minPrice, maxPrice, location } = req.query;

  let searchQuery = { isActive: true };

  if (q) {
    searchQuery.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { flavorNotes: { $regex: q, $options: 'i' } }
    ];
  }

  if (variety) {
    searchQuery.variety = variety;
  }

  if (roastLevel) {
    searchQuery.roastLevel = roastLevel;
  }

  if (processingMethod) {
    searchQuery.processingMethod = processingMethod;
  }

  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
    if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
  }

  let aggregationPipeline = [
    { $match: searchQuery },
    {
      $lookup: {
        from: 'farmers',
        localField: 'farmerId',
        foreignField: '_id',
        as: 'farmer'
      }
    },
    { $unwind: '$farmer' },
    {
      $match: {
        'farmer.isActive': true,
        'farmer.isVerified': true
      }
    }
  ];

  if (location) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { 'farmer.location.county': { $regex: location, $options: 'i' } },
          { 'farmer.location.subCounty': { $regex: location, $options: 'i' } },
          { 'farmer.location.ward': { $regex: location, $options: 'i' } }
        ]
      }
    });
  }

  aggregationPipeline.push(
    {
      $project: {
        name: 1,
        variety: 1,
        roastLevel: 1,
        processingMethod: 1,
        price: 1,
        quantityAvailable: 1,
        description: 1,
        flavorNotes: 1,
        averageRating: 1,
        totalReviews: 1,
        images: 1,
        createdAt: 1,
        'farmer.firstName': 1,
        'farmer.lastName': 1,
        'farmer.location': 1,
        'farmer.averageRating': 1
      }
    },
    { $sort: { averageRating: -1, createdAt: -1 } }
  );

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  aggregationPipeline.push(
    { $skip: startIndex },
    { $limit: limit }
  );

  const products = await Product.aggregate(aggregationPipeline);
  const total = await Product.countDocuments(searchQuery);

  const pagination = {};
  const endIndex = page * limit;

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
    count: products.length,
    total,
    pagination,
    data: products
  });
});

const getProductStats = asyncHandler(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        totalQuantity: { $sum: '$quantityAvailable' },
        averageRating: { $avg: '$averageRating' }
      }
    }
  ]);

  const varietyStats = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$variety',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        totalQuantity: { $sum: '$quantityAvailable' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const roastLevelStats = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$roastLevel',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const monthlyStats = await Product.aggregate([
    {
      $match: { 
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$quantityAvailable'] } }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalProducts: 0,
        averagePrice: 0,
        totalQuantity: 0,
        averageRating: 0
      },
      byVariety: varietyStats,
      byRoastLevel: roastLevelStats,
      monthlyTrends: monthlyStats
    }
  });
});

const getFarmerProducts = asyncHandler(async (req, res, next) => {
  const farmerId = req.params.farmerId;

  if (!mongoose.Types.ObjectId.isValid(farmerId)) {
    return next(new AppError('Invalid farmer ID', 400));
  }

  const farmer = await Farmer.findById(farmerId);
  if (!farmer) {
    return next(new AppError('Farmer not found', 404));
  }

  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let query = Product.find({ 
    farmerId: farmerId,
    isActive: true,
    ...queryObj
  });

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
  const total = await Product.countDocuments({ farmerId: farmerId, isActive: true });

  query = query.skip(startIndex).limit(limit);

  const products = await query;

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
    count: products.length,
    total,
    pagination,
    farmer: {
      id: farmer._id,
      name: `${farmer.firstName} ${farmer.lastName}`,
      location: farmer.location,
      averageRating: farmer.averageRating
    },
    data: products
  });
});

const updateProductStock = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 0) {
    return next(new AppError('Valid quantity is required', 400));
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (req.user.role === 'farmer' && req.user.id !== product.farmerId.toString()) {
    return next(new AppError('Not authorized to update this product stock', 403));
  }

  product.quantityAvailable = quantity;
  if (quantity === 0) {
    product.stockStatus = 'Out of Stock';
  } else if (quantity <= 10) {
    product.stockStatus = 'Low Stock';
  } else {
    product.stockStatus = 'In Stock';
  }

  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStats,
  getFarmerProducts,
  updateProductStock
};
