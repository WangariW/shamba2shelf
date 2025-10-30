const express = require('express');
const {
  getDashboardData,
  getSalesMetrics,
  getInventoryMetrics,
  getPerformanceMetrics,
  getUserAnalytics,
  generateMetrics,
  createCustomReport,
  getAllReports,
  getReport,
  updateReport,
  deleteReport,
  getTopPerformers,
  getRegionalAnalytics,
  getCategoryAnalytics
} = require('../controllers/analyticsController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', restrictTo('admin', 'superadmin'), getDashboardData);

router.get('/sales', restrictTo('admin', 'superadmin'), getSalesMetrics);
router.get('/inventory', restrictTo('admin', 'superadmin', 'farmer'), getInventoryMetrics);
router.get('/performance', restrictTo('admin', 'superadmin'), getPerformanceMetrics);
router.get('/users', restrictTo('admin', 'superadmin'), getUserAnalytics);

router.post('/generate', restrictTo('admin', 'superadmin'), generateMetrics);

router.get('/reports', restrictTo('admin', 'superadmin'), getAllReports);
router.post('/reports', restrictTo('admin', 'superadmin'), createCustomReport);
router.get('/reports/:id', restrictTo('admin', 'superadmin'), getReport);
router.put('/reports/:id', restrictTo('admin', 'superadmin'), updateReport);
router.delete('/reports/:id', restrictTo('admin', 'superadmin'), deleteReport);

router.get('/top-performers', restrictTo('admin', 'superadmin'), getTopPerformers);
router.get('/regional', restrictTo('admin', 'superadmin'), getRegionalAnalytics);
router.get('/categories', restrictTo('admin', 'superadmin', 'farmer'), getCategoryAnalytics);

module.exports = router;
