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

// Temporarily disable auth to allow open testing
// router.use(protect);

// Open routes for testing only
router.post('/', validateProductCreate, createProduct);
router.put('/:id', validateProductUpdate, updateProduct);
router.put('/:id/stock', validateStockUpdate, updateProductStock);
router.delete('/:id', deleteProduct);

module.exports = router;
