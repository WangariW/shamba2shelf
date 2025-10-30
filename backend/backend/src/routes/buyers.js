const express = require('express');
const {
  getAllBuyers,
  getBuyer,
  updateBuyerProfile,
  deleteBuyer,
  getBuyerOrders,
  getBuyerAnalytics,
  searchBuyersByLocation,
  getBuyersByCounty,
  getBuyersByBusinessType,
  getTopRatedBuyers,
  getBuyerRecommendations,
  updateVerificationStatus,
  getBuyerDashboard
} = require('../controllers/buyerController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  validateBuyerUpdate,
  validateLocation,
  validateCounty,
  validateBusinessType
} = require('../middleware/validation');

const router = express.Router();

router.get('/', getAllBuyers);
router.get('/top-rated', getTopRatedBuyers);
router.get('/search/location', validateLocation, searchBuyersByLocation);
router.get('/county/:county', validateCounty, getBuyersByCounty);
router.get('/business-type/:businessType', validateBusinessType, getBuyersByBusinessType);
router.get('/:id', getBuyer);

router.use(protect);

router.get('/:id/dashboard', getBuyerDashboard);
router.get('/:id/orders', getBuyerOrders);
router.get('/:id/analytics', getBuyerAnalytics);
router.get('/:id/recommendations', getBuyerRecommendations);
router.put('/:id', validateBuyerUpdate, updateBuyerProfile);
router.delete('/:id', deleteBuyer);

router.put('/:id/verify', restrictTo('admin', 'superadmin'), updateVerificationStatus);

module.exports = router;
