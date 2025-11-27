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


const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/stats', getProductStats);
router.get('/farmer/:farmerId', getFarmerProducts);
router.get('/:id', getProduct);

// router.use(protect); // disabled for testing

router.post(
  '/',
  upload.single("image"),      
  validateProductCreate,
  createProduct
);

router.put(
  '/:id',
  upload.single("image"),      
  validateProductUpdate,
  updateProduct
);

router.put('/:id/stock', validateStockUpdate, updateProductStock);


router.delete('/:id', deleteProduct);

module.exports = router;
