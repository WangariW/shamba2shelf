const express = require('express');
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
  getFarmerDashboard
} = require('../controllers/farmerController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  validateFarmerUpdate,
  validateLocation,
  validateCounty
} = require('../middleware/validation');

const router = express.Router();

router.get('/', getAllFarmers);
router.get('/top-rated', getTopRatedFarmers);
router.get('/search/location', validateLocation, searchFarmersByLocation);
router.get('/county/:county', validateCounty, getFarmersByCounty);
router.get('/:id', getFarmer);
router.get('/:id/products', getFarmerProducts);

router.use(protect);

router.get('/:id/dashboard', getFarmerDashboard);
router.get('/:id/orders', getFarmerOrders);
router.get('/:id/analytics', getFarmerAnalytics);
router.put('/:id', validateFarmerUpdate, updateFarmerProfile);
router.delete('/:id', deleteFarmer);

router.put('/:id/verify', restrictTo('admin', 'superadmin'), updateVerificationStatus);

module.exports = router;
