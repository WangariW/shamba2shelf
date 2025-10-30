const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const app = require('../../server');
const Farmer = require('../../src/models/Farmer');
const Product = require('../../src/models/Product');
const Order = require('../../src/models/Order');
const jwt = require('jsonwebtoken');
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
  createTestUser,
  createTestAdmin,
  generateTestTokens
} = require('../helpers/testHelpers');

describe('Farmer Integration Tests', () => {
  let authToken;
  let farmerUser;
  let adminToken;
  let farmerId;
  let testUser;
  let testAdmin;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
    
    // Recreate test users for each test since cleanupTestDB removes them
    testUser = await createTestUser({
      firstName: 'Test',
      lastName: 'Farmer',
      email: 'farmer@test.com',
      password: 'TestPassword123!',
      role: 'farmer'
    });

    testAdmin = await createTestAdmin({
      email: 'admin@test.com'
    });

    // Generate proper JWT tokens
    const farmerTokens = generateTestTokens(testUser);
    const adminTokens = generateTestTokens(testAdmin);
    
    authToken = farmerTokens.accessToken;
    adminToken = adminTokens.accessToken;
    farmerId = testUser._id;

    // Create test farmer profile
    farmerUser = {
      name: 'Test Farmer',
      email: 'farmer@test.com',
      password: 'TestPassword123!',
      phone: '+254712345678',
      county: 'Nyeri',
      location: {
        latitude: -0.4167,
        longitude: 36.9500
      },
      farmSize: 5.5,
      isVerified: true,
      isActive: true
    };
  });

  after(async () => {
    await disconnectTestDB();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /api/farmers', () => {
    it('should get all verified farmers', async () => {
      // Create actual farmer records in database
      await Farmer.create({
        _id: farmerId,
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'TestPassword123!',
        phone: '+254712345678',
        county: 'Nyeri',
        location: {
          latitude: -0.4167,
          longitude: 36.9500
        },
        farmSize: 5.5,
        averageRating: 4.5,
        isVerified: true,
        isActive: true
      });

      const response = await request(app)
        .get('/api/farmers')
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.be.greaterThan(0);
    });

    it('should filter farmers by query parameters', async () => {
      const findStub = sinon.stub(Farmer, 'find').returns({
        find: sinon.stub().returnsThis(),
        select: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        then: sinon.stub().resolves([])
      });

      sinon.stub(Farmer, 'countDocuments').resolves(0);

      await request(app)
        .get('/api/farmers?county=Nyeri&farmSize[gte]=5')
        .expect(200);

      expect(findStub.calledOnce).to.be.true;
    });

    it('should support pagination', async () => {
      const findStub = sinon.stub(Farmer, 'find').returns({
        find: sinon.stub().returnsThis(),
        select: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        then: sinon.stub().resolves([])
      });

      sinon.stub(Farmer, 'countDocuments').resolves(50);

      const response = await request(app)
        .get('/api/farmers?page=2&limit=10')
        .expect(200);

      expect(response.body.pagination).to.exist;
      expect(response.body.pagination.next).to.exist;
      expect(response.body.pagination.prev).to.exist;
    });
  });

  describe('GET /api/farmers/:id', () => {
    it('should get specific farmer profile', async () => {
      const mockFarmer = {
        _id: farmerId,
        name: 'Test Farmer',
        email: 'farmer@test.com',
        county: 'Nyeri',
        isVerified: true,
        isActive: true
      };

      const findByIdStub = sinon.stub(Farmer, 'findById').returns({
        select: sinon.stub().resolves(mockFarmer)
      });

      const aggregateStub = sinon.stub(Product, 'aggregate').resolves([{
        totalProducts: 5,
        totalQuantity: 100,
        averagePrice: 800
      }]);

      const findProductsStub = sinon.stub(Product, 'find').returns({
        sort: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        select: sinon.stub().resolves([])
      });

      const response = await request(app)
        .get(`/api/farmers/${farmerId}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.farmer.name).to.equal('Test Farmer');
      expect(response.body.data.productStats).to.exist;
      expect(findByIdStub.calledOnce).to.be.true;
    });

    it('should return 404 for non-existent farmer', async () => {
      sinon.stub(Farmer, 'findById').returns({
        select: sinon.stub().resolves(null)
      });

      const response = await request(app)
        .get(`/api/farmers/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.contain('not found');
    });

    it('should return 404 for inactive farmer', async () => {
      const inactiveFarmer = {
        _id: farmerId,
        name: 'Test Farmer',
        isActive: false,
        isVerified: true
      };

      sinon.stub(Farmer, 'findById').returns({
        select: sinon.stub().resolves(inactiveFarmer)
      });

      const response = await request(app)
        .get(`/api/farmers/${farmerId}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.contain('not available');
    });
  });

  describe('PUT /api/farmers/:id', () => {
    it('should update farmer profile with valid data', async () => {
      const updateData = {
        name: 'Updated Farmer Name',
        farmSize: 7.5,
        brandStory: 'Updated brand story'
      };

      const updatedFarmer = {
        _id: farmerId,
        ...farmerUser,
        ...updateData
      };

      sinon.stub(Farmer, 'findByIdAndUpdate').returns({
        select: sinon.stub().resolves(updatedFarmer)
      });

      const response = await request(app)
        .put(`/api/farmers/${farmerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.name).to.equal('Updated Farmer Name');
      expect(response.body.data.farmSize).to.equal(7.5);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/farmers/${farmerId}`)
        .send({ name: 'Updated Name' })
        .expect(401);

      expect(response.body.success).to.be.false;
    });

    it('should prevent updating other farmer\'s profile', async () => {
      const otherFarmerId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/farmers/${otherFarmerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacker Update' })
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.contain('Not authorized');
    });

    it('should validate update data', async () => {
      const invalidData = {
        county: 'InvalidCounty',
        farmSize: -5,
        phone: 'invalid-phone'
      };

      const response = await request(app)
        .put(`/api/farmers/${farmerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.contain('Validation Error');
    });

    it('should allow admin to update any farmer', async () => {
      const updateData = { isVerified: true };

      sinon.stub(Farmer, 'findByIdAndUpdate').returns({
        select: sinon.stub().resolves({ ...farmerUser, ...updateData })
      });

      const response = await request(app)
        .put(`/api/farmers/${farmerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).to.be.true;
    });
  });

  describe('DELETE /api/farmers/:id', () => {
    it('should deactivate farmer account', async () => {
      const mockFarmer = {
        _id: farmerId,
        isActive: true,
        save: sinon.stub().resolves()
      };

      sinon.stub(Farmer, 'findById').resolves(mockFarmer);

      const response = await request(app)
        .delete(`/api/farmers/${farmerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.contain('deactivated');
      expect(mockFarmer.save.calledOnce).to.be.true;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/farmers/${farmerId}`)
        .expect(401);

      expect(response.body.success).to.be.false;
    });

    it('should prevent deleting other farmer\'s account', async () => {
      const otherFarmerId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/farmers/${otherFarmerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
    });
  });

  describe('GET /api/farmers/:id/products', () => {
    it('should get farmer\'s products', async () => {
      const mockProducts = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Premium Coffee',
          variety: 'SL28',
          price: 1000,
          farmerId: farmerId
        }
      ];

      sinon.stub(Farmer, 'findById').resolves({
        _id: farmerId,
        isActive: true,
        isVerified: true
      });

      const findStub = sinon.stub(Product, 'find').returns({
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        populate: sinon.stub().resolves(mockProducts)
      });

      sinon.stub(Product, 'countDocuments').resolves(1);

      const response = await request(app)
        .get(`/api/farmers/${farmerId}/products`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data[0].name).to.equal('Premium Coffee');
    });

    it('should return 404 for inactive farmer', async () => {
      sinon.stub(Farmer, 'findById').resolves({
        _id: farmerId,
        isActive: false,
        isVerified: true
      });

      const response = await request(app)
        .get(`/api/farmers/${farmerId}/products`)
        .expect(404);

      expect(response.body.success).to.be.false;
    });
  });

  describe('GET /api/farmers/:id/orders', () => {
    it('should get farmer\'s orders (own orders)', async () => {
      const mockOrders = [
        {
          _id: new mongoose.Types.ObjectId(),
          farmerId: farmerId,
          status: 'Pending',
          totalAmount: 5000
        }
      ];

      sinon.stub(Farmer, 'findById').resolves({
        _id: farmerId,
        isActive: true
      });

      const findStub = sinon.stub(Order, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(mockOrders)
      });

      sinon.stub(Order, 'countDocuments').resolves(1);

      const response = await request(app)
        .get(`/api/farmers/${farmerId}/orders`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data[0].status).to.equal('Pending');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/farmers/${farmerId}/orders`)
        .expect(401);

      expect(response.body.success).to.be.false;
    });

    it('should prevent accessing other farmer\'s orders', async () => {
      const otherFarmerId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/farmers/${otherFarmerId}/orders`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
    });

    it('should filter orders by status', async () => {
      sinon.stub(Farmer, 'findById').resolves({ _id: farmerId });

      const findStub = sinon.stub(Order, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves([])
      });

      sinon.stub(Order, 'countDocuments').resolves(0);

      await request(app)
        .get(`/api/farmers/${farmerId}/orders?status=Delivered`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(findStub.calledOnce).to.be.true;
      const query = findStub.getCall(0).args[0];
      expect(query.status).to.equal('Delivered');
    });
  });

  describe('GET /api/farmers/:id/analytics', () => {
    it('should get farmer\'s analytics (own analytics)', async () => {
      sinon.stub(Farmer, 'findById').resolves({
        _id: farmerId,
        name: 'Test Farmer',
        county: 'Nyeri'
      });

      const mockAnalytics = [
        {
          _id: { year: 2024, month: 10 },
          totalSales: 50000,
          totalOrders: 10,
          averageOrderValue: 5000
        }
      ];

      sinon.stub(Order, 'aggregate').resolves(mockAnalytics);

      const response = await request(app)
        .get(`/api/farmers/${farmerId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.salesAnalytics).to.be.an('array');
      expect(response.body.data.farmerProfile).to.exist;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/farmers/${farmerId}/analytics`)
        .expect(401);

      expect(response.body.success).to.be.false;
    });

    it('should prevent accessing other farmer\'s analytics', async () => {
      const otherFarmerId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/farmers/${otherFarmerId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
    });
  });

  describe('GET /api/farmers/:id/dashboard', () => {
    it('should get farmer\'s dashboard data', async () => {
      const mockFarmer = {
        _id: farmerId,
        name: 'Test Farmer',
        getDashboardData: sinon.stub().returns({
          basicInfo: { name: 'Test Farmer' },
          farmInfo: { farmSize: 5.5 },
          performance: { totalSales: 1000 }
        })
      };

      sinon.stub(Farmer, 'findById').resolves(mockFarmer);
      sinon.stub(Order, 'countDocuments').resolves(5);
      sinon.stub(Product, 'countDocuments').resolves(3);
      sinon.stub(Order, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves([])
      });
      sinon.stub(Order, 'aggregate').resolves([{ currentMonthRevenue: 10000 }]);

      const response = await request(app)
        .get(`/api/farmers/${farmerId}/dashboard`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.farmer).to.exist;
      expect(response.body.data.stats).to.exist;
      expect(response.body.data.recentOrders).to.exist;
    });
  });

  describe('GET /api/farmers/search/location', () => {
    it('should search farmers by location', async () => {
      const mockFarmers = [
        { name: 'Nearby Farmer', county: 'Nyeri' }
      ];

      sinon.stub(Farmer, 'findByLocation').resolves(mockFarmers);

      const response = await request(app)
        .get('/api/farmers/search/location?latitude=-0.4167&longitude=36.9500&radius=10')
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.count).to.equal(1);
    });

    it('should validate required location parameters', async () => {
      const response = await request(app)
        .get('/api/farmers/search/location?latitude=-0.4167')
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.contain('Validation Error');
    });

    it('should validate coordinate ranges', async () => {
      const response = await request(app)
        .get('/api/farmers/search/location?latitude=90&longitude=36.9500')
        .expect(400);

      expect(response.body.success).to.be.false;
    });
  });

  describe('GET /api/farmers/county/:county', () => {
    it('should get farmers by county', async () => {
      const mockFarmers = [
        { name: 'Nyeri Farmer', county: 'Nyeri' }
      ];

      sinon.stub(Farmer, 'findByCounty').resolves(mockFarmers);

      const response = await request(app)
        .get('/api/farmers/county/Nyeri')
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
    });

    it('should validate county parameter', async () => {
      const response = await request(app)
        .get('/api/farmers/county/InvalidCounty')
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.contain('Validation Error');
    });
  });

  describe('GET /api/farmers/top-rated', () => {
    it('should get top-rated farmers', async () => {
      const mockFarmers = [
        { name: 'Top Farmer', averageRating: 4.8 }
      ];

      sinon.stub(Farmer, 'getTopRated').resolves(mockFarmers);

      const response = await request(app)
        .get('/api/farmers/top-rated?limit=5')
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
    });
  });

  describe('PUT /api/farmers/:id/verify', () => {
    it('should allow admin to verify farmer', async () => {
      const updatedFarmer = {
        _id: farmerId,
        isVerified: true
      };

      sinon.stub(Farmer, 'findByIdAndUpdate').returns({
        select: sinon.stub().resolves(updatedFarmer)
      });

      const response = await request(app)
        .put(`/api/farmers/${farmerId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isVerified: true })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.contain('verified');
    });

    it('should prevent non-admin from verifying farmer', async () => {
      const response = await request(app)
        .put(`/api/farmers/${farmerId}/verify`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isVerified: true })
        .expect(403);

      expect(response.body.success).to.be.false;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/farmers/${farmerId}/verify`)
        .send({ isVerified: true })
        .expect(401);

      expect(response.body.success).to.be.false;
    });
  });
});