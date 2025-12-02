const express = require('express');
const { body, param, query } = require('express-validator');
const {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const {
  protect,
  verifyRefreshToken,
  createRateLimit,
} = require('../middleware/authMiddleware');

const { validateRequest } = require('../middleware/validation');

const router = express.Router();


const authRateLimit =
  process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : createRateLimit(15 * 60 * 1000, 20);

const loginRateLimit =
  process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : createRateLimit(15 * 60 * 1000, 5);


    // VALIDATIONS
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
    .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character'),
    
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
    .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// PUBLIC ROUTES

router.post('/register', authRateLimit, registerValidation, validateRequest, register);
router.post('/login', loginRateLimit, loginValidation, validateRequest, login);
router.post('/forgot-password', authRateLimit, forgotPasswordValidation, validateRequest, forgotPassword);
router.put('/reset-password/:resettoken', authRateLimit, resetPasswordValidation, validateRequest, resetPassword);
router.post('/refresh', refreshTokenValidation, validateRequest, verifyRefreshToken, refreshToken);


router.use(protect);


router.post('/logout', logout);
router.post('/logout-all', logoutAll);

module.exports = router;