const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Buyer = require('../../src/models/Buyer');
const User = require('../../src/models/User');
const Order = require('../../src/models/Order');
const { createTestUser, createTestBuyer, cleanupTestData } = require('../helpers/testHelpers');

describe('Buyer Routes', () => {
  let authToken;
  let testUser;
  let testBuyer;
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    await cleanupTestData();
    
    const userData = await createTestUser();
    testUser = userData.user;
    authToken = userData.token;

    const adminData = await createTestUser({ role: 'admin' });
    adminUser = adminData.user;
    adminToken = adminData.token;

    testBuyer = await createTestBuyer();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/buyers', () => {
    it('should get all verified buyers', async () => {
      const res = await request(app)
        .get('/api/buyers')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBeGreaterThanOrEqual(0);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/buyers?page=1&limit=5')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should support filtering by business type', async () => {
      const res = await request(app)
        .get('/api/buyers?businessType=Retail')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should support sorting', async () => {
      const res = await request(app)
        .get('/api/buyers?sort=name')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/buyers/:id', () => {
    it('should get a single buyer', async () => {
      const res = await request(app)
        .get(`/api/buyers/${testBuyer._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.buyer._id).toBe(testBuyer._id.toString());
      expect(res.body.data.buyer.email).toBe(testBuyer.email);
    });

    it('should return 404 for non-existent buyer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/buyers/${nonExistentId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Buyer not found');
    });

    it('should return 404 for inactive buyer', async () => {
      await Buyer.findByIdAndUpdate(testBuyer._id, { isActive: false });

      const res = await request(app)
        .get(`/api/buyers/${testBuyer._id}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/buyers/top-rated', () => {
    it('should get top rated buyers', async () => {
      const res = await request(app)
        .get('/api/buyers/top-rated')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/buyers/search/location', () => {
    it('should search buyers by location', async () => {
      const res = await request(app)
        .get('/api/buyers/search/location?latitude=-1.286389&longitude=36.817223&maxDistance=50')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should return 400 for invalid coordinates', async () => {
      const res = await request(app)
        .get('/api/buyers/search/location?latitude=invalid&longitude=36.817223')
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/buyers/county/:county', () => {
    it('should get buyers by county', async () => {
      const res = await request(app)
        .get('/api/buyers/county/Nairobi')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should return 400 for invalid county', async () => {
      const res = await request(app)
        .get('/api/buyers/county/InvalidCounty')
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/buyers/business-type/:businessType', () => {
    it('should get buyers by business type', async () => {
      const res = await request(app)
        .get('/api/buyers/business-type/Retail')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should return 400 for invalid business type', async () => {
      const res = await request(app)
        .get('/api/buyers/business-type/InvalidType')
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    describe('GET /api/buyers/:id/dashboard', () => {
      it('should get buyer dashboard for own profile', async () => {
        const buyerUser = await User.create({
          email: testBuyer.email,
          password: 'password123',
          role: 'buyer'
        });

        const buyerToken = buyerUser.signToken();

        const res = await request(app)
          .get(`/api/buyers/${testBuyer._id}/dashboard`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.buyer).toBeDefined();
        expect(res.body.data.stats).toBeDefined();
      });

      it('should return 403 for accessing other buyer dashboard', async () => {
        const res = await request(app)
          .get(`/api/buyers/${testBuyer._id}/dashboard`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403);

        expect(res.body.success).toBe(false);
      });

      it('should allow admin to access any buyer dashboard', async () => {
        const res = await request(app)
          .get(`/api/buyers/${testBuyer._id}/dashboard`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(res.body.success).toBe(true);
      });
    });

    describe('PUT /api/buyers/:id', () => {
      it('should update buyer profile', async () => {
        const buyerUser = await User.create({
          email: testBuyer.email,
          password: 'password123',
          role: 'buyer'
        });

        const buyerToken = buyerUser.signToken();

        const updateData = {
          name: 'Updated Buyer Name',
          businessType: 'Wholesale'
        };

        const res = await request(app)
          .put(`/api/buyers/${testBuyer._id}`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send(updateData)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(updateData.name);
        expect(res.body.data.businessType).toBe(updateData.businessType);
      });

      it('should validate update data', async () => {
        const buyerUser = await User.create({
          email: testBuyer.email,
          password: 'password123',
          role: 'buyer'
        });

        const buyerToken = buyerUser.signToken();

        const invalidData = {
          name: 'X',
          businessType: 'InvalidType'
        };

        const res = await request(app)
          .put(`/api/buyers/${testBuyer._id}`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send(invalidData)
          .expect(400);

        expect(res.body.success).toBe(false);
      });

      it('should return 403 for updating other buyer profile', async () => {
        const updateData = {
          name: 'Updated Name'
        };

        const res = await request(app)
          .put(`/api/buyers/${testBuyer._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(403);

        expect(res.body.success).toBe(false);
      });
    });

    describe('DELETE /api/buyers/:id', () => {
      it('should delete buyer profile', async () => {
        const buyerUser = await User.create({
          email: testBuyer.email,
          password: 'password123',
          role: 'buyer'
        });

        const buyerToken = buyerUser.signToken();

        const res = await request(app)
          .delete(`/api/buyers/${testBuyer._id}`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .expect(204);

        const deletedBuyer = await Buyer.findById(testBuyer._id);
        expect(deletedBuyer.isActive).toBe(false);
      });

      it('should return 403 for deleting other buyer profile', async () => {
        const res = await request(app)
          .delete(`/api/buyers/${testBuyer._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403);

        expect(res.body.success).toBe(false);
      });
    });

    describe('GET /api/buyers/:id/orders', () => {
      it('should get buyer orders', async () => {
        const buyerUser = await User.create({
          email: testBuyer.email,
          password: 'password123',
          role: 'buyer'
        });

        const buyerToken = buyerUser.signToken();

        const res = await request(app)
          .get(`/api/buyers/${testBuyer._id}/orders`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
      });

      it('should return 403 for accessing other buyer orders', async () => {
        const res = await request(app)
          .get(`/api/buyers/${testBuyer._id}/orders`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403);

        expect(res.body.success).toBe(false);
      });
    });

    describe('GET /api/buyers/:id/analytics', () => {
      it('should get buyer analytics', async () => {
        const buyerUser = await User.create({
          email: testBuyer.email,
          password: 'password123',
          role: 'buyer'
        });

        const buyerToken = buyerUser.signToken();

        const res = await request(app)
          .get(`/api/buyers/${testBuyer._id}/analytics`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.overview).toBeDefined();
      });
    });

    describe('GET /api/buyers/:id/recommendations', () => {
      it('should get buyer recommendations', async () => {
        const buyerUser = await User.create({
          email: testBuyer.email,
          password: 'password123',
          role: 'buyer'
        });

        const buyerToken = buyerUser.signToken();

        const res = await request(app)
          .get(`/api/buyers/${testBuyer._id}/recommendations`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
      });
    });

    describe('PUT /api/buyers/:id/verify', () => {
      it('should allow admin to verify buyer', async () => {
        const res = await request(app)
          .put(`/api/buyers/${testBuyer._id}/verify`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ isVerified: true })
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.isVerified).toBe(true);
      });

      it('should return 403 for non-admin users', async () => {
        const res = await request(app)
          .put(`/api/buyers/${testBuyer._id}/verify`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ isVerified: true })
          .expect(403);

        expect(res.body.success).toBe(false);
      });
    });
  });

  describe('Unauthenticated requests', () => {
    it('should return 401 for protected routes without token', async () => {
      const res = await request(app)
        .get(`/api/buyers/${testBuyer._id}/dashboard`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get(`/api/buyers/${testBuyer._id}/dashboard`)
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});