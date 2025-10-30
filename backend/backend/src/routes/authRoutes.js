const express = require('express');
const { body, param, query } = require('express-validator');
const {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus
} = require('../controllers/authController');
const {
  protect,
  authorize,
  hasPermission,
  verifyRefreshToken,
  checkOwnership,
  createRateLimit
} = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Skip rate limiting in test environment
const authRateLimit = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : createRateLimit(15 * 60 * 1000, 20);
const loginRateLimit = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : createRateLimit(15 * 60 * 1000, 5);

const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
    
  body('role')
    .optional()
    .isIn(['user', 'farmer', 'buyer'])
    .withMessage('Role must be user, farmer, or buyer')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('phoneNumber')
    .optional({ checkFalsy: true })
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
    
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
    
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
    
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
    
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),
    
  body('address.zipCode')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9\s-]{3,10}$/)
    .withMessage('Please provide a valid zip code')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
  param('resettoken')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
];

const updateRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
    
  body('role')
    .isIn(['user', 'farmer', 'buyer', 'admin'])
    .withMessage('Role must be user, farmer, buyer, or admin')
];

const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid user ID')
];

const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('role')
    .optional()
    .isIn(['user', 'farmer', 'buyer', 'admin', 'superadmin'])
    .withMessage('Invalid role filter'),
    
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
    
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search term must be between 1 and 50 characters')
];

router.post('/register', authRateLimit, registerValidation, validateRequest, register);
router.post('/login', loginRateLimit, loginValidation, validateRequest, login);
router.post('/forgot-password', authRateLimit, forgotPasswordValidation, validateRequest, forgotPassword);
router.put('/reset-password/:resettoken', authRateLimit, resetPasswordValidation, validateRequest, resetPassword);
router.post('/refresh', refreshTokenValidation, validateRequest, verifyRefreshToken, refreshToken);

router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfileValidation, validateRequest, updateProfile);
router.put('/password', changePasswordValidation, validateRequest, changePassword);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.delete('/account', deleteAccountValidation, validateRequest, deleteAccount);

router.get('/users', 
  authorize('admin', 'superadmin'), 
  hasPermission('read:users'), 
  getUsersValidation, 
  validateRequest, 
  getAllUsers
);

router.get('/users/:id', 
  authorize('admin', 'superadmin'), 
  hasPermission('read:users'), 
  userIdValidation, 
  validateRequest, 
  getUserById
);

router.put('/users/:id/role', 
  authorize('admin', 'superadmin'), 
  hasPermission('write:users'), 
  updateRoleValidation, 
  validateRequest, 
  updateUserRole
);

router.put('/users/:id/status', 
  authorize('admin', 'superadmin'), 
  hasPermission('write:users'), 
  userIdValidation, 
  validateRequest, 
  toggleUserStatus
);

module.exports = router;
