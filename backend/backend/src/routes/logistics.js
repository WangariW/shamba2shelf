const express = require('express');
const {
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
} = require('../controllers/logisticsController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/tracking', getAllTrackingOrders);
router.post('/tracking', restrictTo('admin', 'superadmin', 'logistics'), createTrackingOrder);
router.get('/tracking/:trackingNumber', getTrackingInfo);
router.put('/tracking/:trackingNumber/location', restrictTo('admin', 'superadmin', 'logistics', 'driver'), updateTrackingLocation);
router.post('/tracking/:trackingId/assign-vehicle', restrictTo('admin', 'superadmin', 'logistics'), assignVehicleToOrder);

router.post('/estimate', getDeliveryEstimate);
router.post('/optimize-routes', restrictTo('admin', 'superadmin', 'logistics'), optimizeDeliveryRoutes);

router.get('/warehouses', getAllWarehouses);
router.post('/warehouses', restrictTo('admin', 'superadmin'), createWarehouse);
router.get('/warehouses/:id', getWarehouse);
router.put('/warehouses/:id', restrictTo('admin', 'superadmin'), updateWarehouse);
router.delete('/warehouses/:id', restrictTo('admin', 'superadmin'), deleteWarehouse);
router.post('/warehouses/:warehouseId/inventory', restrictTo('admin', 'superadmin', 'warehouse'), manageWarehouseInventory);

router.get('/fleet', getAllFleetVehicles);
router.post('/fleet', restrictTo('admin', 'superadmin'), createFleetVehicle);
router.get('/fleet/available', getAvailableVehicles);
router.get('/fleet/:id', getFleetVehicle);
router.put('/fleet/:id', restrictTo('admin', 'superadmin'), updateFleetVehicle);
router.delete('/fleet/:id', restrictTo('admin', 'superadmin'), deleteFleetVehicle);

router.get('/reports/delivery', restrictTo('admin', 'superadmin', 'logistics'), generateDeliveryReport);

module.exports = router;
