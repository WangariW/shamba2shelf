const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const app = require('../../server');
const Product = require('../../src/models/Product');
const Farmer = require('../../src/models/Farmer');
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

describe('Product Integration Tests', () => {
  let farmerToken;
  let adminToken;
  let buyerToken;
  let testFarmer;
  let testAdmin;
  let testBuyer;
  let farmerId;
  let productId;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
    
    testFarmer = await createTestUser({
      firstName: 'Test',
      lastName: 'Farmer',
      email: 'farmer@test.com',
      password: 'TestPassword123!',
      role: 'farmer'
    });

    testAdmin = await createTestAdmin({
      email: 'admin@test.com'
    });

    testBuyer = await createTestUser({
      firstName: 'Test',
      lastName: 'Buyer',
      email: 'buyer@test.com',
      password: 'TestPassword123!',
      role: 'buyer'
    });

    const farmerTokens = generateTestTokens(testFarmer);
    const adminTokens = generateTestTokens(testAdmin);
    const buyerTokens = generateTestTokens(testBuyer);
    
    farmerToken = farmerTokens.accessToken;
    adminToken = adminTokens.accessToken;
    buyerToken = buyerTokens.accessToken;

    const farmerData = {
      farmerId: testFarmer._id,
      firstName: 'Test',
      lastName: 'Farmer',
      email: 'farmer@test.com',
      location: {
        county: 'Nyeri',
        subCounty: 'Mathira',
        ward: 'Ruguru',
        coordinates: { latitude: -0.4, longitude: 36.95 }
      },
      farmSize: 5.5,
      primaryCrop: 'Coffee',
      secondaryCrops: ['Maize', 'Beans'],
      farmingExperience: 15,
      certifications: ['Organic', 'Fair Trade'],
      isVerified: true,
      isActive: true
    };

    const farmer = await Farmer.create(farmerData);
    farmerId = farmer._id;
  });

  after(async () => {
    await cleanupTestDB();
    await disconnectTestDB();
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'Premium AA Coffee',
          farmerId: farmerId,
          variety: 'SL28',
          roastLevel: 'Medium',
          processingMethod: 'Washed',
          altitudeGrown: 1800,
          price: 750,
          quantityAvailable: 100,
          description: 'High quality coffee from Nyeri',
          isActive: true
        },
        {
          name: 'Specialty Light Roast',
          farmerId: farmerId,
          variety: 'SL34',
          roastLevel: 'Light',
          processingMethod: 'Natural',
          altitudeGrown: 1900,
          price: 850,
          quantityAvailable: 50,
          description: 'Light roast with fruity notes',
          isActive: true
        }
      ];

      await Product.insertMany(products);
    });

    it('should get all products without authentication', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(2);
      expect(res.body.count).to.equal(2);
      expect(res.body.total).to.equal(2);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=1')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.count).to.equal(1);
      expect(res.body.total).to.equal(2);
      expect(res.body.pagination.next).to.exist;
    });

    it('should support filtering by variety', async () => {
      const res = await request(app)
        .get('/api/products?variety=SL28')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.data[0].variety).to.equal('SL28');
    });

    it('should support sorting', async () => {
      const res = await request(app)
        .get('/api/products?sort=price')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data[0].price).to.be.lessThan(res.body.data[1].price);
    });
  });

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      const product = await Product.create({
        name: 'Premium AA Coffee',
        farmerId: farmerId,
        variety: 'SL28',
        roastLevel: 'Medium',
        processingMethod: 'Washed',
        altitudeGrown: 1800,
        price: 750,
        quantityAvailable: 100,
        isActive: true
      });
      productId = product._id;
    });

    it('should get product by id', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.name).to.equal('Premium AA Coffee');
      expect(res.body.data.farmerId).to.exist;
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Product not found');
    });

    it('should return 404 for inactive product', async () => {
      await Product.findByIdAndUpdate(productId, { isActive: false });
      
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('no longer available');
    });
  });

  describe('POST /api/products', () => {
    const validProductData = {
      farmerId: null,
      name: 'Premium AA Coffee',
      variety: 'SL28',
      roastLevel: 'Medium',
      processingMethod: 'Washed',
      altitudeGrown: 1800,
      price: 750,
      quantityAvailable: 100,
      description: 'High quality coffee from Nyeri'
    };

    beforeEach(() => {
      validProductData.farmerId = farmerId;
    });

    it('should create product as farmer', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(validProductData)
        .expect(201);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.name).to.equal(validProductData.name);
      expect(res.body.data.farmerId).to.exist;
    });

    it('should create product as admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData)
        .expect(201);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.name).to.equal(validProductData.name);
    });

    it('should not allow buyer to create product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validProductData)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('authorized');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(validProductData)
        .expect(401);

      expect(res.body.success).to.be.false;
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validProductData };
      delete invalidData.name;

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Validation Error');
    });

    it('should validate farmer existence', async () => {
      const invalidData = { ...validProductData };
      invalidData.farmerId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(404);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Farmer not found');
    });

    it('should not allow farmers to create products for others', async () => {
      const otherFarmer = await createTestUser({
        firstName: 'Other',
        lastName: 'Farmer',
        email: 'other@test.com',
        password: 'TestPassword123!',
        role: 'farmer'
      });

      const invalidData = { ...validProductData };
      invalidData.farmerId = otherFarmer._id;

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(invalidData)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('create products for themselves');
    });
  });

  describe('PUT /api/products/:id', () => {
    beforeEach(async () => {
      const product = await Product.create({
        name: 'Premium AA Coffee',
        farmerId: farmerId,
        variety: 'SL28',
        roastLevel: 'Medium',
        processingMethod: 'Washed',
        altitudeGrown: 1800,
        price: 750,
        quantityAvailable: 100,
        isActive: true
      });
      productId = product._id;
    });

    it('should update product as farmer owner', async () => {
      const updateData = {
        name: 'Updated Premium Coffee',
        price: 800
      };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.name).to.equal('Updated Premium Coffee');
      expect(res.body.data.price).to.equal(800);
    });

    it('should update product as admin', async () => {
      const updateData = {
        name: 'Admin Updated Coffee',
        price: 900
      };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.name).to.equal('Admin Updated Coffee');
    });

    it('should not allow non-owner farmer to update', async () => {
      const otherFarmer = await createTestUser({
        firstName: 'Other',
        lastName: 'Farmer',
        email: 'other@test.com',
        password: 'TestPassword123!',
        role: 'farmer'
      });

      const otherTokens = generateTestTokens(otherFarmer);
      const updateData = { name: 'Unauthorized Update' };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .send(updateData)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Not authorized');
    });

    it('should not allow buyer to update product', async () => {
      const updateData = { name: 'Buyer Update' };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(updateData)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('authorized');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = { name: 'Update' };

      const res = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(404);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Product not found');
    });
  });

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      const product = await Product.create({
        name: 'Premium AA Coffee',
        farmerId: farmerId,
        variety: 'SL28',
        roastLevel: 'Medium',
        processingMethod: 'Washed',
        altitudeGrown: 1800,
        price: 750,
        quantityAvailable: 100,
        isActive: true
      });
      productId = product._id;
    });

    it('should soft delete product as farmer owner', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;

      const product = await Product.findById(productId);
      expect(product.isActive).to.be.false;
    });

    it('should soft delete product as admin', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;

      const product = await Product.findById(productId);
      expect(product.isActive).to.be.false;
    });

    it('should not delete product with active orders', async () => {
      await Order.create({
        buyerId: testBuyer._id,
        farmerId: farmerId,
        productId: productId,
        quantity: 10,
        unitPrice: 750,
        totalAmount: 7500,
        status: 'Pending',
        deliveryAddress: {
          street: '123 Test St',
          city: 'Nairobi',
          county: 'Nairobi'
        }
      });

      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('active orders');
    });

    it('should not allow non-owner farmer to delete', async () => {
      const otherFarmer = await createTestUser({
        firstName: 'Other',
        lastName: 'Farmer',
        email: 'other@test.com',
        password: 'TestPassword123!',
        role: 'farmer'
      });

      const otherTokens = generateTestTokens(otherFarmer);

      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Not authorized');
    });
  });

  describe('GET /api/products/search', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'Premium AA Coffee',
          farmerId: farmerId,
          variety: 'SL28',
          roastLevel: 'Medium',
          processingMethod: 'Washed',
          altitudeGrown: 1800,
          price: 750,
          quantityAvailable: 100,
          description: 'High quality fruity coffee',
          flavorNotes: ['chocolate', 'citrus'],
          isActive: true
        },
        {
          name: 'Specialty Dark Roast',
          farmerId: farmerId,
          variety: 'SL34',
          roastLevel: 'Dark',
          processingMethod: 'Natural',
          altitudeGrown: 1900,
          price: 850,
          quantityAvailable: 50,
          description: 'Bold dark roast with nutty notes',
          flavorNotes: ['chocolate', 'nuts'],
          isActive: true
        }
      ];

      await Product.insertMany(products);
    });

    it('should search products by name', async () => {
      const res = await request(app)
        .get('/api/products/search?q=Premium')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.data[0].name).to.contain('Premium');
    });

    it('should search products by description', async () => {
      const res = await request(app)
        .get('/api/products/search?q=fruity')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.data[0].description).to.contain('fruity');
    });

    it('should filter by variety', async () => {
      const res = await request(app)
        .get('/api/products/search?variety=SL28')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.data[0].variety).to.equal('SL28');
    });

    it('should filter by roast level', async () => {
      const res = await request(app)
        .get('/api/products/search?roastLevel=Dark')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.data[0].roastLevel).to.equal('Dark');
    });

    it('should filter by price range', async () => {
      const res = await request(app)
        .get('/api/products/search?minPrice=800&maxPrice=1000')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.data[0].price).to.be.at.least(800);
      expect(res.body.data[0].price).to.be.at.most(1000);
    });
  });

  describe('GET /api/products/stats', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'Premium AA Coffee',
          farmerId: farmerId,
          variety: 'SL28',
          roastLevel: 'Medium',
          processingMethod: 'Washed',
          altitudeGrown: 1800,
          price: 750,
          quantityAvailable: 100,
          averageRating: 4.5,
          isActive: true
        },
        {
          name: 'Specialty Light Roast',
          farmerId: farmerId,
          variety: 'SL34',
          roastLevel: 'Light',
          processingMethod: 'Natural',
          altitudeGrown: 1900,
          price: 850,
          quantityAvailable: 50,
          averageRating: 4.8,
          isActive: true
        }
      ];

      await Product.insertMany(products);
    });

    it('should get product statistics', async () => {
      const res = await request(app)
        .get('/api/products/stats')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.overview).to.exist;
      expect(res.body.data.byVariety).to.be.an('array');
      expect(res.body.data.byRoastLevel).to.be.an('array');
      expect(res.body.data.monthlyTrends).to.be.an('array');
      
      expect(res.body.data.overview.totalProducts).to.equal(2);
      expect(res.body.data.overview.averagePrice).to.equal(800);
      expect(res.body.data.overview.totalQuantity).to.equal(150);
    });
  });

  describe('PUT /api/products/:id/stock', () => {
    beforeEach(async () => {
      const product = await Product.create({
        name: 'Premium AA Coffee',
        farmerId: farmerId,
        variety: 'SL28',
        roastLevel: 'Medium',
        processingMethod: 'Washed',
        altitudeGrown: 1800,
        price: 750,
        quantityAvailable: 100,
        stockStatus: 'In Stock',
        isActive: true
      });
      productId = product._id;
    });

    it('should update stock as farmer owner', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 50 })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.quantityAvailable).to.equal(50);
      expect(res.body.data.stockStatus).to.equal('In Stock');
    });

    it('should update stock status to low stock', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.quantityAvailable).to.equal(5);
      expect(res.body.data.stockStatus).to.equal('Low Stock');
    });

    it('should update stock status to out of stock', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: 0 })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.quantityAvailable).to.equal(0);
      expect(res.body.data.stockStatus).to.equal('Out of Stock');
    });

    it('should validate quantity', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ quantity: -5 })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Valid quantity is required');
    });

    it('should not allow non-owner to update stock', async () => {
      const otherFarmer = await createTestUser({
        firstName: 'Other',
        lastName: 'Farmer',
        email: 'other@test.com',
        password: 'TestPassword123!',
        role: 'farmer'
      });

      const otherTokens = generateTestTokens(otherFarmer);

      const res = await request(app)
        .put(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .send({ quantity: 50 })
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Not authorized');
    });
  });
});