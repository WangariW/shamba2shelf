const express = require('express');
const upload = require("../middleware/uploadMiddleware");
const { uploadFarmerPhoto } = require("../controllers/farmerUploadController");

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

router.get('/:id', getFarmer);
router.get('/:id/products', getFarmerProducts);
router.get('/:id/dashboard', getFarmerDashboard);
router.get('/:id/orders', getFarmerOrders);
router.get('/:id/analytics', getFarmerAnalytics);

router.put('/:id', validateFarmerUpdate, updateFarmerProfile);
router.put('/:id/location', validateLocationUpdate, updateLocation);

router.delete('/:id', deleteFarmer);

router.put('/:id/verify', updateVerificationStatus);
router.post('/:id/photo', upload.single('photo'), uploadFarmerPhoto);

module.exports = router;
