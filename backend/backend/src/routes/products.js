const express = require('express');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStats,
  getFarmerProducts,
  updateProductStock
} = require('../controllers/productController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  validateProductCreate,
  validateProductUpdate,
  validateStockUpdate
} = require('../middleware/validation');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/stats', getProductStats);
router.get('/farmer/:farmerId', getFarmerProducts);
router.get('/:id', getProduct);

router.use(protect);

router.post('/', restrictTo('farmer', 'admin', 'superadmin'), validateProductCreate, createProduct);
router.put('/:id', restrictTo('farmer', 'admin', 'superadmin'), validateProductUpdate, updateProduct);
router.put('/:id/stock', restrictTo('farmer', 'admin', 'superadmin'), validateStockUpdate, updateProductStock);
router.delete('/:id', restrictTo('farmer', 'admin', 'superadmin'), deleteProduct);

module.exports = router;
