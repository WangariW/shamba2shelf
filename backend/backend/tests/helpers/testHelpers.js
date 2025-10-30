const mongoose = require('mongoose');
const User = require('../../src/models/User');

// Test database configuration
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shamba2shelf_test';

/**
 * Connect to test database
 */
const connectTestDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      // If connected to a different database, disconnect first
      if (mongoose.connection.name !== 'shamba2shelf_test') {
        await mongoose.disconnect();
        await mongoose.connect(MONGODB_TEST_URI);
        console.log('✅ Switched to test database');
      } else {
        console.log('✅ Already connected to test database');
      }
    } else {
      // Not connected, establish new connection
      await mongoose.connect(MONGODB_TEST_URI);
      console.log('✅ Connected to test database');
    }
  } catch (error) {
    console.error('❌ Test database connection failed:', error.message);
    process.exit(1);  
  }
};

/**
 * Clean up test database
 */
const cleanupTestDB = async () => {
  try {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    console.log('🧹 Test database cleaned');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error.message);
  }
};

/**
 * Disconnect from test database
 */
const disconnectTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('👋 Disconnected from test database');
    } else {
      console.log('✅ Already disconnected from database');
    }
  } catch (error) {
    console.error('❌ Test database disconnection failed:', error.message);
  }
};

/**
 * Create test user
 */
const createTestUser = async (userData = {}) => {
  const defaultUserData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    role: 'user',
    permissions: ['read:products'],
    isActive: true,
    isEmailVerified: true
  };

  const user = await User.create({ ...defaultUserData, ...userData });
  return user;
};

/**
 * Create test admin user
 */
const createTestAdmin = async (userData = {}) => {
  const defaultAdminData = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: 'admin',
    permissions: [
      'read:users', 'write:users',
      'read:products', 'write:products', 'delete:products',
      'read:orders', 'write:orders', 'delete:orders',
      'read:analytics'
    ],
    isActive: true,
    isEmailVerified: true
  };

  const admin = await User.create({ ...defaultAdminData, ...userData });
  return admin;
};

/**
 * Generate test tokens for user
 */
const generateTestTokens = (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  
  return { accessToken, refreshToken };
};

/**
 * Test data factories
 */
const testData = {
  validUser: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    phoneNumber: '+1234567890',
    role: 'farmer'
  },
  
  invalidUser: {
    firstName: '', // Invalid: empty
    lastName: 'Doe',
    email: 'invalid-email', // Invalid: not an email
    password: '123', // Invalid: too short
    phoneNumber: 'invalid-phone', // Invalid: wrong format
    role: 'invalid-role' // Invalid: not in enum
  },
  
  updateData: {
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+1987654321',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      zipCode: '12345'
    }
  },
  
  passwordData: {
    currentPassword: 'TestPassword123!',
    newPassword: 'NewPassword123!'
  }
};

/**
 * Common test assertions
 */
const assertions = {
  userResponse: (user) => {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified
    };
  },
  
  tokenResponse: (response) => {
    return response.body.data.accessToken && 
           response.body.data.refreshToken &&
           response.body.data.user;
  },
  
  errorResponse: (response, statusCode, message) => {
    return response.status === statusCode &&
           response.body.success === false &&
           response.body.error.message.includes(message);
  }
};

/**
 * Mock request helpers
 */
const mockRequest = {
  withAuth: (token) => ({
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }),
  
  withUserAgent: (userAgent = 'test-agent') => ({
    headers: {
      'User-Agent': userAgent
    }
  }),
  
  withIP: (ip = '127.0.0.1') => ({
    ip
  })
};

const createTestBuyer = async (overrides = {}) => {
  const Buyer = require('../../src/models/Buyer');
  
  const defaultBuyerData = {
    name: 'Test Buyer',
    email: 'testbuyer@example.com',
    password: 'password123',
    phone: '+254712345678',
    businessType: 'Retail',
    businessName: 'Test Coffee Shop',
    deliveryAddress: {
      street: '123 Test Street',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100',
      coordinates: {
        latitude: -1.286389,
        longitude: 36.817223
      }
    },
    preferences: {
      coffeeVarieties: ['Arabica', 'SL28'],
      qualityGrades: ['AA', 'AB'],
      processingMethods: ['Washed', 'Natural'],
      minQuantity: 10,
      maxQuantity: 500,
      priceRange: {
        min: 100,
        max: 1000
      }
    },
    isActive: true,
    isVerified: true,
    ...overrides
  };

  return await Buyer.create(defaultBuyerData);
};

const cleanupTestData = async () => {
  const User = require('../../src/models/User');
  const Buyer = require('../../src/models/Buyer');
  const Farmer = require('../../src/models/Farmer');
  const Product = require('../../src/models/Product');
  const Order = require('../../src/models/Order');

  await Promise.all([
    User.deleteMany({}),
    Buyer.deleteMany({}),
    Farmer.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({})
  ]);
};

module.exports = {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
  createTestUser,
  createTestAdmin,
  createTestBuyer,
  cleanupTestData,
  generateTestTokens,
  testData,
  assertions,
  mockRequest
};