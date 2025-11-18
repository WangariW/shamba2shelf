const { validationResult, body, query, param } = require('express-validator');
const AppError = require('../utils/AppError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return next(new AppError(`Validation Error: ${errorMessages.map(e => e.message).join(', ')}`, 400));
  }
  
  next();
};

const customValidators = {
  passwordConfirmation: (value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  },
  
  notFutureDate: (value) => {
    if (new Date(value) > new Date()) {
      throw new Error('Date cannot be in the future');
    }
    return true;
  },
  
  minimumAge: (value) => {
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      throw new Error('User must be at least 13 years old');
    }
    return true;
  },
  
  uniqueArray: (value) => {
    if (Array.isArray(value)) {
      const uniqueValues = [...new Set(value)];
      if (uniqueValues.length !== value.length) {
        throw new Error('Array must contain unique values');
      }
    }
    return true;
  },
  
  noSqlInjection: (value) => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\bOR\b|\bAND\b).*=.*=/i
    ];
    
    if (typeof value === 'string') {
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          throw new Error('Invalid characters detected');
        }
      }
    }
    return true;
  },
  
  noXSS: (value) => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ];
    
    if (typeof value === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          throw new Error('Invalid content detected');
        }
      }
    }
    return true;
  },

  // Farmer-specific validators
  validKenyanPhone: (value) => {
    const phoneRegex = /^\+254[0-9]{9}$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Phone number must be a valid Kenyan number (+254XXXXXXXXX)');
    }
    return true;
  },

  validCoordinates: (value) => {
    const { latitude, longitude } = value;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Coordinates must be numbers');
    }
    // Kenya boundaries
    if (latitude < -1.7 || latitude > 5.0) {
      throw new Error('Latitude must be within Kenya boundaries (-1.7 to 5.0)');
    }
    if (longitude < 33.9 || longitude > 41.9) {
      throw new Error('Longitude must be within Kenya boundaries (33.9 to 41.9)');
    }
    return true;
  },

  validCoffeeCounty: (value) => {
    const validCounties = ['Nyeri', 'Kiambu', 'Murang\'a', 'Kirinyaga', 'Embu', 'Meru', 'Machakos', 'Nakuru'];
    if (!validCounties.includes(value)) {
      throw new Error('County must be one of the major coffee growing regions');
    }
    return true;
  },

  validFarmSize: (value) => {
    const size = parseFloat(value);
    if (isNaN(size) || size < 0.1 || size > 500) {
      throw new Error('Farm size must be between 0.1 and 500 acres for smallholder classification');
    }
    return true;
  },

  validAltitude: (value) => {
    const altitude = parseInt(value);
    if (isNaN(altitude) || altitude < 1000 || altitude > 2500) {
      throw new Error('Altitude must be between 1000m and 2500m for quality coffee');
    }
    return true;
  },

  validBankAccount: (value) => {
    const accountRegex = /^[0-9]{10,16}$/;
    if (!accountRegex.test(value)) {
      throw new Error('Bank account number must be 10-16 digits');
    }
    return true;
  },

  validBranchCode: (value) => {
    const branchRegex = /^[0-9]{3,6}$/;
    if (!branchRegex.test(value)) {
      throw new Error('Branch code must be 3-6 digits');
    }
    return true;
  },

  validNationalId: (value) => {
    const idRegex = /^[0-9]{8}$/;
    if (!idRegex.test(value)) {
      throw new Error('National ID must be exactly 8 digits');
    }
    return true;
  }
};

// Farmer validation rules
const validateFarmerUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .custom(customValidators.noXSS),

  body('phone')
    .optional()
    .custom(customValidators.validKenyanPhone),

  body('county')
    .optional()
    .custom(customValidators.validCoffeeCounty),

  body('location')
    .optional()
    .custom(customValidators.validCoordinates),

  body('brandStory')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Brand story cannot exceed 1000 characters')
    .custom(customValidators.noXSS),

  body('farmSize')
    .optional()
    .custom(customValidators.validFarmSize),

  body('altitudeRange.min')
    .optional()
    .custom(customValidators.validAltitude),

  body('altitudeRange.max')
    .optional()
    .custom(customValidators.validAltitude),

  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array')
    .custom(customValidators.uniqueArray),

  body('certifications.*')
    .optional()
    .isIn([
      'Fair Trade', 'Organic', 'Rainforest Alliance', 'UTZ Certified',
      'Bird Friendly', 'Smithsonian Migratory Bird Center',
      'Kenya Coffee Quality Certification', 'Direct Trade'
    ])
    .withMessage('Invalid certification type'),

  body('varietiesGrown')
    .optional()
    .isArray()
    .withMessage('Varieties grown must be an array')
    .custom(customValidators.uniqueArray),

  body('varietiesGrown.*')
    .optional()
    .isIn(['SL28', 'SL34', 'Ruiru 11', 'Batian', 'Blue Mountain', 'K7', 'Kent'])
    .withMessage('Invalid coffee variety'),

  body('processingMethods')
    .optional()
    .isArray()
    .withMessage('Processing methods must be an array')
    .custom(customValidators.uniqueArray),

  body('processingMethods.*')
    .optional()
    .isIn(['Washed', 'Natural', 'Honey', 'Semi-washed', 'Pulped Natural'])
    .withMessage('Invalid processing method'),

  body('bankDetails.accountNumber')
    .optional()
    .custom(customValidators.validBankAccount),

  body('bankDetails.bankName')
    .optional()
    .isIn([
      'Kenya Commercial Bank', 'Equity Bank', 'Cooperative Bank',
      'Standard Chartered', 'Barclays Bank', 'ABSA Bank', 'NCBA Bank',
      'Stanbic Bank', 'Diamond Trust Bank', 'Family Bank', 'Sidian Bank', 'Other'
    ])
    .withMessage('Invalid bank name'),

  body('bankDetails.branchCode')
    .optional()
    .custom(customValidators.validBranchCode),

  body('bankDetails.mpesaNumber')
    .optional()
    .custom(customValidators.validKenyanPhone),

  body('verificationDocuments.nationalId')
    .optional()
    .custom(customValidators.validNationalId),

  body('sustainabilityPractices')
    .optional()
    .isArray()
    .withMessage('Sustainability practices must be an array')
    .custom(customValidators.uniqueArray),

  body('sustainabilityPractices.*')
    .optional()
    .isIn([
      'Water Conservation', 'Soil Conservation', 'Integrated Pest Management',
      'Composting', 'Shade Growing', 'Biodiversity Conservation',
      'Carbon Sequestration', 'Renewable Energy Use', 'Waste Reduction',
      'Community Development'
    ])
    .withMessage('Invalid sustainability practice'),

  body('communicationPreferences.language')
    .optional()
    .isIn(['English', 'Swahili', 'Kikuyu', 'Embu', 'Meru'])
    .withMessage('Invalid language preference'),

  body('communicationPreferences.notificationMethods')
    .optional()
    .isArray()
    .withMessage('Notification methods must be an array'),

  body('communicationPreferences.notificationMethods.*')
    .optional()
    .isIn(['email', 'sms', 'whatsapp', 'push'])
    .withMessage('Invalid notification method'),

  validateRequest
];

const validateLocation = [
  query('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -1.7, max: 5.0 })
    .withMessage('Latitude must be within Kenya boundaries'),

  query('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: 33.9, max: 41.9 })
    .withMessage('Longitude must be within Kenya boundaries'),

  query('radius')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km'),

  validateRequest
];

const validateLocationUpdate = [
  body('county')
    .notEmpty()
    .withMessage('County is required')
    .isString()
    .withMessage('County must be a string'),

  body('town')
    .notEmpty()
    .withMessage('Town is required')
    .isString()
    .withMessage('Town must be a string'),

  validateRequest
];

const validateCounty = [
  param('county')
    .notEmpty()
    .withMessage('County is required')
    .custom(customValidators.validCoffeeCounty),

  validateRequest
];

const validateProductData = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .custom(customValidators.noXSS),

  body('variety')
    .notEmpty()
    .withMessage('Coffee variety is required')
    .isIn(['SL28', 'SL34', 'Ruiru 11', 'Batian', 'Blue Mountain', 'K7', 'Kent'])
    .withMessage('Invalid coffee variety'),

  body('roastLevel')
    .notEmpty()
    .withMessage('Roast level is required')
    .isIn(['Light', 'Medium', 'Dark'])
    .withMessage('Roast level must be Light, Medium, or Dark'),

  body('processingMethod')
    .notEmpty()
    .withMessage('Processing method is required')
    .isIn(['Washed', 'Natural', 'Honey', 'Semi-washed', 'Pulped Natural'])
    .withMessage('Invalid processing method'),

  body('altitudeGrown')
    .notEmpty()
    .withMessage('Altitude grown is required')
    .custom(customValidators.validAltitude),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 100, max: 10000 })
    .withMessage('Price must be between KES 100 and KES 10,000 per kg'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Quantity must be between 1 and 10,000 kg'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .custom(customValidators.noXSS),

  body('flavorNotes')
    .optional()
    .isArray()
    .withMessage('Flavor notes must be an array')
    .custom(customValidators.uniqueArray),

  body('flavorNotes.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each flavor note must be between 2 and 50 characters'),

  body('harvestDate')
    .optional()
    .isISO8601()
    .withMessage('Harvest date must be a valid date')
    .custom(customValidators.notFutureDate),

  validateRequest
];

const validateProductCreate = [
  body('farmerId')
    .notEmpty()
    .withMessage('Farmer ID is required')
    .isMongoId()
    .withMessage('Invalid farmer ID'),

  ...validateProductData
];

const validateProductUpdate = [
  ...validateProductData.filter(validator => 
    !validator.builder || (validator.builder.fields && !validator.builder.fields.includes('farmerId'))
  )
];

const validateStockUpdate = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Quantity must be between 0 and 10,000 kg'),

  validateRequest
];

const validateOrderCreate = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1,000 kg'),

  body('deliveryAddress.street')
    .notEmpty()
    .withMessage('Street address is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters')
    .custom(customValidators.noXSS),

  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .custom(customValidators.noXSS),

  body('deliveryAddress.county')
    .notEmpty()
    .withMessage('County is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('County must be between 2 and 50 characters'),

  body('deliveryAddress.postalCode')
    .optional()
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Postal code must be between 4 and 10 characters'),

  body('deliveryAddress.coordinates.latitude')
    .optional()
    .isFloat({ min: -1.7, max: 5.0 })
    .withMessage('Latitude must be within Kenya boundaries'),

  body('deliveryAddress.coordinates.longitude')
    .optional()
    .isFloat({ min: 33.9, max: 41.9 })
    .withMessage('Longitude must be within Kenya boundaries'),

  validateRequest
];

const validateOrderStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Confirmed', 'InTransit', 'Delivered', 'Cancelled', 'Completed'])
    .withMessage('Invalid order status'),

  validateRequest
];

const validatePaymentStatusUpdate = [
  body('paymentStatus')
    .notEmpty()
    .withMessage('Payment status is required')
    .isIn(['Pending', 'Paid', 'Failed', 'Refunded'])
    .withMessage('Invalid payment status'),

  body('paymentMethod')
    .optional()
    .isIn(['M-Pesa', 'Bank Transfer', 'Cash', 'Card'])
    .withMessage('Invalid payment method'),

  body('paymentReference')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Payment reference must be between 3 and 100 characters')
    .custom(customValidators.noXSS),

  validateRequest
];

const validateOrderCancel = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
    .custom(customValidators.noXSS),

  validateRequest
];

const validateBuyerUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .custom(customValidators.noXSS),

  body('phone')
    .optional()
    .matches(/^\+254[0-9]{9}$/)
    .withMessage('Phone number must be in format +254XXXXXXXXX'),

  body('businessType')
    .optional()
    .isIn(['Retail', 'Wholesale', 'Restaurant', 'Cafe', 'Export', 'Processing', 'Individual'])
    .withMessage('Invalid business type'),

  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Business name must be between 2 and 150 characters')
    .custom(customValidators.noXSS),

  body('businessLicense')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Business license must be between 5 and 50 characters')
    .custom(customValidators.noXSS),

  body('deliveryAddress.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters')
    .custom(customValidators.noXSS),

  body('deliveryAddress.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .custom(customValidators.noXSS),

  body('deliveryAddress.county')
    .optional()
    .isIn(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Nyeri', 'Kiambu', 'Murang\'a', 'Kirinyaga', 'Embu', 'Meru', 'Machakos'])
    .withMessage('Invalid county'),

  body('deliveryAddress.postalCode')
    .optional()
    .matches(/^[0-9]{5}$/)
    .withMessage('Postal code must be 5 digits'),

  body('deliveryAddress.coordinates.latitude')
    .optional()
    .isFloat({ min: -4.7, max: 5.0 })
    .withMessage('Latitude must be within Kenya boundaries'),

  body('deliveryAddress.coordinates.longitude')
    .optional()
    .isFloat({ min: 33.9, max: 41.9 })
    .withMessage('Longitude must be within Kenya boundaries'),

  body('preferences.coffeeVarieties')
    .optional()
    .isArray()
    .withMessage('Coffee varieties must be an array'),

  body('preferences.coffeeVarieties.*')
    .optional()
    .isIn(['Arabica', 'Robusta', 'SL28', 'SL34', 'K7', 'Ruiru 11', 'Batian'])
    .withMessage('Invalid coffee variety'),

  body('preferences.qualityGrades')
    .optional()
    .isArray()
    .withMessage('Quality grades must be an array'),

  body('preferences.qualityGrades.*')
    .optional()
    .isIn(['AA', 'AB', 'C', 'PB', 'E', 'TT', 'T'])
    .withMessage('Invalid quality grade'),

  body('preferences.processingMethods')
    .optional()
    .isArray()
    .withMessage('Processing methods must be an array'),

  body('preferences.processingMethods.*')
    .optional()
    .isIn(['Washed', 'Natural', 'Honey', 'Semi-washed'])
    .withMessage('Invalid processing method'),

  body('preferences.certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),

  body('preferences.certifications.*')
    .optional()
    .isIn(['Organic', 'Fair Trade', 'Rainforest Alliance', 'UTZ', 'C.A.F.E. Practices'])
    .withMessage('Invalid certification'),

  body('preferences.minQuantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum quantity must be at least 1 kg'),

  body('preferences.maxQuantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum quantity must be at least 1 kg'),

  body('preferences.priceRange.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price cannot be negative'),

  body('preferences.priceRange.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price cannot be negative'),

  body('paymentMethods')
    .optional()
    .isArray()
    .withMessage('Payment methods must be an array'),

  body('paymentMethods.*.type')
    .optional()
    .isIn(['M-Pesa', 'Bank Transfer', 'Credit Card', 'Cash on Delivery'])
    .withMessage('Invalid payment method type'),

  body('paymentMethods.*.isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),

  body('paymentMethods.*.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  validateRequest
];

const validateBusinessType = [
  param('businessType')
    .isIn(['Retail', 'Wholesale', 'Restaurant', 'Cafe', 'Export', 'Processing', 'Individual'])
    .withMessage('Invalid business type'),

  validateRequest
];

module.exports = {
  validateRequest,
  customValidators,
  validateFarmerUpdate,
  validateLocation,
  validateLocationUpdate,
  validateCounty,
  validateProductData,
  validateProductCreate,
  validateProductUpdate,
  validateStockUpdate,
  validateOrderCreate,
  validateOrderStatusUpdate,
  validatePaymentStatusUpdate,
  validateOrderCancel,
  validateBuyerUpdate,
  validateBusinessType
};
