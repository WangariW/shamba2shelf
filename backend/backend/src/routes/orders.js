const express = require('express');
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
  getFarmerOrders,
  getBuyerOrders
} = require('../controllers/orderController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  validateOrderCreate,
  validateOrderStatusUpdate,
  validatePaymentStatusUpdate,
  validateOrderCancel
} = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.get('/', getAllOrders);
router.get('/stats', getOrderStats);
router.get('/farmer/:farmerId', restrictTo('farmer', 'admin', 'superadmin'), getFarmerOrders);
router.get('/buyer/:buyerId', restrictTo('buyer', 'admin', 'superadmin'), getBuyerOrders);
router.get('/:id', getOrder);

router.post('/', restrictTo('buyer', 'admin', 'superadmin'), validateOrderCreate, createOrder);
router.put('/:id/status', validateOrderStatusUpdate, updateOrderStatus);
router.put('/:id/payment', validatePaymentStatusUpdate, updatePaymentStatus);
router.put('/:id/cancel', restrictTo('buyer', 'admin', 'superadmin'), validateOrderCancel, cancelOrder);

module.exports = router;
