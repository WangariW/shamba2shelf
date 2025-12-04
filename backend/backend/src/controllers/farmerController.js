const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const townCoordinates = require("../config/townCoordinates");
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllFarmers = asyncHandler(async (req, res, next) => {
  const farmers = await mongoose.connection.db.collection('farmers').find({}).toArray();

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const getFarmer = asyncHandler(async (req, res, next) => {
  const farmer = await mongoose.connection.db.collection('farmers')
    .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

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
    "name", "email", "county", "nearestTown", "pickupPoint"
  ];

  const updateObj = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) updateObj[key] = req.body[key];
  });

  const result = await mongoose.connection.db.collection('farmers')
    .findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: updateObj },
      { returnDocument: 'after' }
    );

  if (!result.value) return next(new AppError("Farmer not found", 404));

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: result.value
  });
});

const deleteFarmer = asyncHandler(async (req, res, next) => {
  const result = await mongoose.connection.db.collection('farmers')
    .deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

  if (result.deletedCount === 0) {
    return next(new AppError("Farmer not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Account deleted successfully"
  });
});

const getFarmerProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ farmerId: req.params.id });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

const getFarmerOrders = asyncHandler(async (req, res, next) => {
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
  const farmers = await mongoose.connection.db.collection('farmers')
    .find({ county: req.query.county }).toArray();

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const getFarmersByCounty = asyncHandler(async (req, res, next) => {
  const farmers = await mongoose.connection.db.collection('farmers')
    .find({ county: req.params.county }).toArray();

  res.status(200).json({
    success: true,
    count: farmers.length,
    data: farmers
  });
});

const getTopRatedFarmers = asyncHandler(async (req, res, next) => {
  const farmers = await mongoose.connection.db.collection('farmers')
    .find({ isActive: true, isVerified: true })
    .sort({ averageRating: -1 })
    .limit(10)
    .toArray();

  res.status(200).json({
    success: true,
    data: farmers
  });
});

const updateVerificationStatus = asyncHandler(async (req, res, next) => {
  const result = await mongoose.connection.db.collection('farmers')
    .findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { isVerified: req.body.isVerified } },
      { returnDocument: 'after' }
    );

  if (!result.value) return next(new AppError("Farmer not found", 404));

  res.status(200).json({
    success: true,
    message: "Verification updated",
    data: result.value
  });
});

const getFarmerDashboard = asyncHandler(async (req, res, next) => {
  const farmer = await mongoose.connection.db.collection('farmers')
    .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

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

  console.log('Update location request:', {
    farmerId: req.params.id,
    county,
    town,
    pickupPoint
  });

  if (!county || !town) {
    return next(new AppError("County and town are required", 400));
  }

  if (!townCoordinates[county]) {
    return next(new AppError(`Invalid county selected: ${county}`, 400));
  }

  const townData = townCoordinates[county][town];
  if (!townData) {
    return next(
      new AppError(
        `Town "${town}" is not mapped under county "${county}".`,
        400
      )
    );
  }

  const { lat, lng } = townData;
   console.log('📍 Coordinates:', { lat, lng });

  const result = await mongoose.connection.db.collection('farmers')
    .findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      {
        $set: {
          county,
          nearestTown: town,
          pickupPoint,
          latitude: lat,
          longitude: lng,
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      },
      { returnDocument: 'after' }
    );
    console.log('✅ Update result:', result);

  if (!result){
    console.log('❌ Farmer not found with ID:', req.params.id);
    return next(new AppError("Farmer not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Location updated successfully",
    data: result
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