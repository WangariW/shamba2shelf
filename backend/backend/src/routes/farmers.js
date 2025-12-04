const express = require('express');
const upload = require("../middleware/uploadMiddleware");
const { uploadFarmerPhoto } = require("../controllers/farmerUploadController");
const { protect, restrictTo } = require('../middleware/authMiddleware');

const {
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
} = require('../controllers/farmerController');

const {
  validateFarmerUpdate,
  validateLocation,
  validateLocationUpdate,
  validateCounty
} = require('../middleware/validation');

const router = express.Router();

router.get('/', getAllFarmers);
router.get('/top-rated', getTopRatedFarmers);
router.get('/search/location', validateLocation, searchFarmersByLocation);
router.get('/county/:county', validateCounty, getFarmersByCounty);

router.get('/:id', protect, getFarmer);
router.get('/:id/products', protect, getFarmerProducts);
router.get('/:id/dashboard', protect,  getFarmerDashboard);
router.get('/:id/orders', protect, getFarmerOrders);
router.get('/:id/analytics', protect, getFarmerAnalytics);

router.put('/:id', protect, restrictTo('farmer'), validateFarmerUpdate, updateFarmerProfile);
router.put('/:id/location', protect, restrictTo('farmer'), validateLocationUpdate, updateLocation);

router.delete('/:id', protect, restrictTo('farmer', 'admin'), deleteFarmer);

router.put('/:id/verify', protect, restrictTo('admin'),updateVerificationStatus);
router.post('/:id/photo', protect, restrictTo('farmer'),upload.single('photo'), uploadFarmerPhoto);

module.exports = router;
