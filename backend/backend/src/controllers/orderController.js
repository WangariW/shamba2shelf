const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

const getAllOrders = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Order.find(JSON.parse(queryStr));

  if (req.user.role === 'farmer') {
    query = query.find({ farmerId: req.user.id });
  } else if (req.user.role === 'buyer') {
    query = query.find({ buyerId: req.user.id });
  }

  query = query.populate([
    {
      path: 'productId',
      select: 'name variety roastLevel price images'
    },
    {
      path: 'farmerId',
      select: 'firstName lastName location contactInfo'
    },
    {
      path: 'buyerId',
      select: 'firstName lastName contactInfo'
    }
  ]);

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

  let countQuery = Order.find(JSON.parse(queryStr));
  if (req.user.role === 'farmer') {
    countQuery = countQuery.find({ farmerId: req.user.id });
  } else if (req.user.role === 'buyer') {
    countQuery = countQuery.find({ buyerId: req.user.id });
  }
  const total = await countQuery.countDocuments();

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
    total,
    pagination,
    data: orders
  });
});

const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate([
    {
      path: 'productId',
      select: 'name variety roastLevel processingMethod price images description'
    },
    {
      path: 'farmerId',
      select: 'firstName lastName location contactInfo averageRating'
    },
    {
      path: 'buyerId',
      select: 'firstName lastName contactInfo'
    }
  ]);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (req.user.role === 'farmer' && req.user.id !== order.farmerId._id.toString()) {
    return next(new AppError('Not authorized to view this order', 403));
  }

  if (req.user.role === 'buyer' && req.user.id !== order.buyerId._id.toString()) {
    return next(new AppError('Not authorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

const createOrder = asyncHandler(async (req, res, next) => {
  const { productId, quantity, deliveryAddress } = req.body;

  const product = await Product.findById(productId).populate('farmerId');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!product.isActive) {
    return next(new AppError('Product is no longer available', 400));
  }

  if (product.quantityAvailable < quantity) {
    return next(new AppError(`Only ${product.quantityAvailable} kg available`, 400));
  }

  if (!product.farmerId.isActive || !product.farmerId.isVerified) {
    return next(new AppError('Farmer is not available for orders', 400));
  }

  const unitPrice = product.price;
  const totalAmount = unitPrice * quantity;

  const orderData = {
    buyerId: req.user.id,
    farmerId: product.farmerId._id,
    productId: productId,
    quantity: quantity,
    unitPrice: unitPrice,
    totalAmount: totalAmount,
    deliveryAddress: deliveryAddress,
    status: 'Pending',
    paymentStatus: 'Pending'
  };

  const order = await Order.create(orderData);

  product.quantityAvailable -= quantity;
  if (product.quantityAvailable === 0) {
    product.stockStatus = 'Out of Stock';
  } else if (product.quantityAvailable <= 10) {
    product.stockStatus = 'Low Stock';
  }
  await product.save();

  await order.populate([
    {
      path: 'productId',
      select: 'name variety roastLevel price images'
    },
    {
      path: 'farmerId',
      select: 'firstName lastName location contactInfo'
    }
  ]);

  res.status(201).json({
    success: true,
    data: order
  });
});

const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'InTransit', 'Delivered', 'Cancelled', 'Completed'];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (req.user.role === 'farmer' && req.user.id !== order.farmerId.toString()) {
    return next(new AppError('Not authorized to update this order', 403));
  }

  if (req.user.role === 'buyer' && req.user.id !== order.buyerId.toString()) {
    return next(new AppError('Not authorized to update this order', 403));
  }

  const currentStatus = order.status;

  if (currentStatus === 'Completed' || currentStatus === 'Cancelled') {
    return next(new AppError('Cannot update completed or cancelled orders', 400));
  }

  if (status === 'Cancelled') {
    const product = await Product.findById(order.productId);
    if (product) {
      product.quantityAvailable += order.quantity;
      if (product.quantityAvailable > 0) {
        product.stockStatus = product.quantityAvailable <= 10 ? 'Low Stock' : 'In Stock';
      }
      await product.save();
    }
  }

  if (status === 'Delivered' && currentStatus !== 'InTransit') {
    return next(new AppError('Order must be in transit before marking as delivered', 400));
  }

  if (status === 'Completed' && currentStatus !== 'Delivered') {
    return next(new AppError('Order must be delivered before marking as completed', 400));
  }

  order.status = status;

  if (status === 'Delivered') {
    order.deliveryDate = new Date();
  }

  if (status === 'Completed') {
    order.completedAt = new Date();
  }

  await order.save();

  await order.populate([
    {
      path: 'productId',
      select: 'name variety roastLevel price images'
    },
    {
      path: 'farmerId',
      select: 'firstName lastName location contactInfo'
    },
    {
      path: 'buyerId',
      select: 'firstName lastName contactInfo'
    }
  ]);

  res.status(200).json({
    success: true,
    data: order
  });
});

const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { paymentStatus, paymentMethod, paymentReference } = req.body;

  const validPaymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
  
  if (!validPaymentStatuses.includes(paymentStatus)) {
    return next(new AppError('Invalid payment status', 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (req.user.role === 'farmer' && req.user.id !== order.farmerId.toString()) {
    return next(new AppError('Not authorized to update this order', 403));
  }

  if (req.user.role === 'buyer' && req.user.id !== order.buyerId.toString()) {
    return next(new AppError('Not authorized to update this order', 403));
  }

  order.paymentStatus = paymentStatus;
  
  if (paymentMethod) {
    order.paymentMethod = paymentMethod;
  }
  
  if (paymentReference) {
    order.paymentReference = paymentReference;
  }

  if (paymentStatus === 'Paid') {
    order.paidAt = new Date();
    
    if (order.status === 'Pending') {
      order.status = 'Confirmed';
    }
  }

  await order.save();

  await order.populate([
    {
      path: 'productId',
      select: 'name variety roastLevel price images'
    },
    {
      path: 'farmerId',
      select: 'firstName lastName location contactInfo'
    },
    {
      path: 'buyerId',
      select: 'firstName lastName contactInfo'
    }
  ]);

  res.status(200).json({
    success: true,
    data: order
  });
});

const cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (req.user.role === 'buyer' && req.user.id !== order.buyerId.toString()) {
    return next(new AppError('Not authorized to cancel this order', 403));
  }

  if (order.status === 'Completed' || order.status === 'Cancelled') {
    return next(new AppError('Cannot cancel completed or already cancelled orders', 400));
  }

  if (order.status === 'InTransit' || order.status === 'Delivered') {
    return next(new AppError('Cannot cancel orders that are in transit or delivered', 400));
  }

  const product = await Product.findById(order.productId);
  if (product) {
    product.quantityAvailable += order.quantity;
    if (product.quantityAvailable > 0) {
      product.stockStatus = product.quantityAvailable <= 10 ? 'Low Stock' : 'In Stock';
    }
    await product.save();
  }

  order.status = 'Cancelled';
  order.cancellationReason = reason || 'Cancelled by buyer';
  order.cancelledAt = new Date();

  await order.save();

  await order.populate([
    {
      path: 'productId',
      select: 'name variety roastLevel price images'
    },
    {
      path: 'farmerId',
      select: 'firstName lastName location contactInfo'
    },
    {
      path: 'buyerId',
      select: 'firstName lastName contactInfo'
    }
  ]);

  res.status(200).json({
    success: true,
    data: order
  });
});

const getOrderStats = asyncHandler(async (req, res, next) => {
  let matchStage = {};
  
  if (req.user.role === 'farmer') {
    matchStage.farmerId = new mongoose.Types.ObjectId(req.user.id);
  } else if (req.user.role === 'buyer') {
    matchStage.buyerId = new mongoose.Types.ObjectId(req.user.id);
  }

  const stats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);

  const statusStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const paymentStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const monthlyStats = await Order.aggregate([
    { 
      $match: { 
        ...matchStage,
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
        totalValue: { $sum: '$totalAmount' },
        averageValue: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalOrders: 0,
        totalValue: 0,
        averageOrderValue: 0,
        totalQuantity: 0
      },
      byStatus: statusStats,
      byPaymentStatus: paymentStats,
      monthlyTrends: monthlyStats
    }
  });
});

const getFarmerOrders = asyncHandler(async (req, res, next) => {
  const farmerId = req.params.farmerId;

  if (!mongoose.Types.ObjectId.isValid(farmerId)) {
    return next(new AppError('Invalid farmer ID', 400));
  }

  if (req.user.role === 'farmer' && req.user.id !== farmerId) {
    return next(new AppError('Not authorized to view these orders', 403));
  }

  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let query = Order.find({ 
    farmerId: farmerId,
    ...queryObj
  }).populate([
    {
      path: 'productId',
      select: 'name variety roastLevel price images'
    },
    {
      path: 'buyerId',
      select: 'firstName lastName contactInfo'
    }
  ]);

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
  const total = await Order.countDocuments({ farmerId: farmerId });

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
    total,
    pagination,
    data: orders
  });
});

const getBuyerOrders = asyncHandler(async (req, res, next) => {
  const buyerId = req.params.buyerId;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    return next(new AppError('Invalid buyer ID', 400));
  }

  if (req.user.role === 'buyer' && req.user.id !== buyerId) {
    return next(new AppError('Not authorized to view these orders', 403));
  }

  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let query = Order.find({ 
    buyerId: buyerId,
    ...queryObj
  }).populate([
    {
      path: 'productId',
      select: 'name variety roastLevel price images'
    },
    {
      path: 'farmerId',
      select: 'firstName lastName location contactInfo averageRating'
    }
  ]);

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
  const total = await Order.countDocuments({ buyerId: buyerId });

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
    total,
    pagination,
    data: orders
  });
});

module.exports = {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
  getFarmerOrders,
  getBuyerOrders
};
