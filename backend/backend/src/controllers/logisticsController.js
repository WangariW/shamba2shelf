const { Tracking, Warehouse, Fleet } = require('../models/Logistics');
const logisticsService = require('../services/logisticsService');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

const createTrackingOrder = asyncHandler(async (req, res, next) => {
  const { orderId, pickupLocation, deliveryLocation, options } = req.body;

  if (!orderId || !pickupLocation || !deliveryLocation) {
    return next(new AppError('Order ID, pickup location, and delivery location are required', 400));
  }

  const tracking = await logisticsService.createTrackingOrder(
    orderId, 
    pickupLocation, 
    deliveryLocation, 
    options
  );

  res.status(201).json({
    status: 'success',
    data: {
      tracking
    }
  });
});

const getTrackingInfo = asyncHandler(async (req, res, next) => {
  const { trackingNumber } = req.params;

  const trackingInfo = await logisticsService.getTrackingHistory(trackingNumber);

  res.status(200).json({
    status: 'success',
    data: {
      tracking: trackingInfo
    }
  });
});

const updateTrackingLocation = asyncHandler(async (req, res, next) => {
  const { trackingNumber } = req.params;
  const { lat, lng, address, status, notes } = req.body;

  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const tracking = await logisticsService.updateTrackingLocation(
    trackingNumber, 
    lat, 
    lng, 
    address, 
    status, 
    notes
  );

  res.status(200).json({
    status: 'success',
    data: {
      tracking
    }
  });
});

const getDeliveryEstimate = asyncHandler(async (req, res, next) => {
  const { pickup, delivery, weight, priority, vehicleType } = req.body;

  if (!pickup || !delivery || !weight) {
    return next(new AppError('Pickup location, delivery location, and weight are required', 400));
  }

  const estimate = await logisticsService.getDeliveryEstimate(
    pickup, 
    delivery, 
    weight, 
    priority, 
    vehicleType
  );

  res.status(200).json({
    status: 'success',
    data: {
      estimate
    }
  });
});

const optimizeDeliveryRoutes = asyncHandler(async (req, res, next) => {
  const { deliveries } = req.body;

  if (!deliveries || !Array.isArray(deliveries)) {
    return next(new AppError('Deliveries array is required', 400));
  }

  const optimizedRoutes = await logisticsService.optimizeDeliveryRoutes(deliveries);

  res.status(200).json({
    status: 'success',
    data: {
      optimizedRoutes
    }
  });
});

const getAllTrackingOrders = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Tracking.find(JSON.parse(queryStr))
    .populate('orderId', 'totalAmount quantity status')
    .populate('driverId', 'name phone email');

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
  
  const total = await Tracking.countDocuments(JSON.parse(queryStr));
  
  query = query.skip(startIndex).limit(limit);
  const trackingOrders = await query;

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  };

  res.status(200).json({
    status: 'success',
    results: trackingOrders.length,
    pagination,
    data: {
      trackingOrders
    }
  });
});

const createWarehouse = asyncHandler(async (req, res, next) => {
  const warehouse = await Warehouse.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      warehouse
    }
  });
});

const getAllWarehouses = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let query = Warehouse.find(queryObj);

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
  
  const total = await Warehouse.countDocuments(queryObj);
  
  query = query.skip(startIndex).limit(limit);
  const warehouses = await query;

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total
  };

  res.status(200).json({
    status: 'success',
    results: warehouses.length,
    pagination,
    data: {
      warehouses
    }
  });
});

const getWarehouse = asyncHandler(async (req, res, next) => {
  const warehouse = await Warehouse.findById(req.params.id)
    .populate('inventory.productId', 'name category pricePerKg');

  if (!warehouse) {
    return next(new AppError('Warehouse not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      warehouse
    }
  });
});

const updateWarehouse = asyncHandler(async (req, res, next) => {
  const warehouse = await Warehouse.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!warehouse) {
    return next(new AppError('Warehouse not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      warehouse
    }
  });
});

const deleteWarehouse = asyncHandler(async (req, res, next) => {
  const warehouse = await Warehouse.findByIdAndDelete(req.params.id);

  if (!warehouse) {
    return next(new AppError('Warehouse not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const manageWarehouseInventory = asyncHandler(async (req, res, next) => {
  const { warehouseId } = req.params;
  const { productId, quantity, operation } = req.body;

  if (!productId || !quantity || !operation) {
    return next(new AppError('Product ID, quantity, and operation are required', 400));
  }

  if (!['add', 'remove'].includes(operation)) {
    return next(new AppError('Operation must be either "add" or "remove"', 400));
  }

  const result = await logisticsService.manageWarehouseInventory(
    warehouseId, 
    productId, 
    quantity, 
    operation
  );

  res.status(200).json({
    status: 'success',
    data: result
  });
});

const createFleetVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Fleet.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      vehicle
    }
  });
});

const getAllFleetVehicles = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let query = Fleet.find(queryObj)
    .populate('driverId', 'name phone email');

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
  
  const total = await Fleet.countDocuments(queryObj);
  
  query = query.skip(startIndex).limit(limit);
  const vehicles = await query;

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total
  };

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    pagination,
    data: {
      vehicles
    }
  });
});

const getFleetVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Fleet.findById(req.params.id)
    .populate('driverId', 'name phone email');

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      vehicle
    }
  });
});

const updateFleetVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Fleet.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('driverId', 'name phone email');

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      vehicle
    }
  });
});

const deleteFleetVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Fleet.findByIdAndDelete(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const getAvailableVehicles = asyncHandler(async (req, res, next) => {
  const { minCapacity, vehicleType } = req.query;

  const vehicles = await logisticsService.getAvailableVehicles(
    parseFloat(minCapacity) || 0, 
    vehicleType
  );

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: {
      vehicles
    }
  });
});

const assignVehicleToOrder = asyncHandler(async (req, res, next) => {
  const { trackingId } = req.params;
  const { vehicleType } = req.body;

  const result = await logisticsService.assignVehicle(trackingId, vehicleType);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

const generateDeliveryReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, ...options } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('Start date and end date are required', 400));
  }

  const report = await logisticsService.generateDeliveryReport(
    new Date(startDate),
    new Date(endDate),
    options
  );

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});

module.exports = {
  createTrackingOrder,
  getTrackingInfo,
  updateTrackingLocation,
  getDeliveryEstimate,
  optimizeDeliveryRoutes,
  getAllTrackingOrders,
  createWarehouse,
  getAllWarehouses,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
  manageWarehouseInventory,
  createFleetVehicle,
  getAllFleetVehicles,
  getFleetVehicle,
  updateFleetVehicle,
  deleteFleetVehicle,
  getAvailableVehicles,
  assignVehicleToOrder,
  generateDeliveryReport
};
