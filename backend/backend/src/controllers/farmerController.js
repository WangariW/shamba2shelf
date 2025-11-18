const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

const getAllFarmers = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  const farmers = await User.find({ role: "farmer", ...JSON.parse(queryStr) })
    .select("name email county town pickupPoint role");

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const getFarmer = asyncHandler(async (req, res, next) => {
  const farmer = await User.findById(req.params.id).select(
    "name email county town pickupPoint role"
  );

  if (!farmer) {
    return next(new AppError("Farmer not found", 404));
  }

  res.status(200).json({
    success: true,
    data: { farmer }
  });
});

const updateFarmerProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = [
    "name", "email", "county", "town", "pickupPoint"
  ];

  const updateObj = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) updateObj[key] = req.body[key];
  });

  const farmer = await User.findByIdAndUpdate(
    req.params.id,
    updateObj,
    { new: true, runValidators: true }
  ).select("name email county town pickupPoint role");

  if (!farmer) return next(new AppError("Farmer not found", 404));

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: farmer
  });
});

const deleteFarmer = asyncHandler(async (req, res, next) => {
  const farmer = await User.findById(req.params.id);

  if (!farmer) return next(new AppError("Farmer not found", 404));

  await farmer.deleteOne();

  res.status(200).json({
    success: true,
    message: "Account deleted successfully"
  });
});

const getFarmerProducts = asyncHandler(async (req, res, next) => {
  const farmer = await User.findById(req.params.id);
  if (!farmer) return next(new AppError("Farmer not found", 404));

  const products = await Product.find({ farmerId: req.params.id });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

const getFarmerOrders = asyncHandler(async (req, res, next) => {
  const farmer = await User.findById(req.params.id);
  if (!farmer) return next(new AppError("Farmer not found", 404));

  const orders = await Order.find({ farmerId: req.params.id })
    .populate("buyerId", "name email")
    .populate("productId", "name price");

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

const getFarmerAnalytics = asyncHandler(async (req, res, next) => {
  const farmer = await User.findById(req.params.id);
  if (!farmer) return next(new AppError("Farmer not found", 404));

  const farmerId = new mongoose.Types.ObjectId(req.params.id);

  const stats = await Order.aggregate([
    {
      $match: {
        farmerId: farmerId,
        status: { $in: ["Delivered", "Completed"] }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        totalQuantitySold: { $sum: "$quantity" }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalQuantitySold: 0
    }
  });
});

const searchFarmersByLocation = asyncHandler(async (req, res, next) => {
  const farmers = await User.find({
    role: "farmer",
    county: req.query.county
  }).select("name email county town pickupPoint role");

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const getFarmersByCounty = asyncHandler(async (req, res, next) => {
  const farmers = await User.find({
    role: "farmer",
    county: req.params.county
  }).select("name email county town pickupPoint role");

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const getTopRatedFarmers = asyncHandler(async (req, res, next) => {
  const farmers = await User.find({ role: "farmer" })
    .sort("-averageRating")
    .limit(10)
    .select("name email county town pickupPoint role averageRating");

  res.status(200).json({
    success: true,
    data: farmers
  });
});

const updateVerificationStatus = asyncHandler(async (req, res, next) => {
  const farmer = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: req.body.isVerified },
    { new: true }
  );

  if (!farmer) return next(new AppError("Farmer not found", 404));

  res.status(200).json({
    success: true,
    message: "Verification updated",
    data: farmer
  });
});

const getFarmerDashboard = asyncHandler(async (req, res, next) => {
  const farmer = await User.findById(req.params.id).select(
    "name email county town pickupPoint role"
  );

  if (!farmer) return next(new AppError("Farmer not found", 404));

  res.status(200).json({
    success: true,
    data: {
      farmer,
      stats: {},
      recentOrders: []
    }
  });
});

const updateLocation = asyncHandler(async (req, res, next) => {
  const { county, town, pickupPoint } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { county, town, pickupPoint },
    { new: true, runValidators: true }
  ).select("name email county town pickupPoint role");

  if (!user) return next(new AppError("Farmer not found", 404));

  res.status(200).json({
    success: true,
    message: "Location updated successfully",
    data: user
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
  getFarmerDashboard,
  updateLocation
};
