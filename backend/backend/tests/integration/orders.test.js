const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const app = require('../../server');
const Order = require('../../src/models/Order');
const Product = require('../../src/models/Product');
const Farmer = require('../../src/models/Farmer');
const jwt = require('jsonwebtoken');
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
  createTestUser,
  createTestAdmin,
  generateTestTokens
} = require('../helpers/testHelpers');

describe('Order Integration Tests', () => {
  let farmerToken;
  let adminToken;
  let buyerToken;
  let testFarmer;
  let testAdmin;
  let testBuyer;
  let farmerId;
  let productId;
  let orderId;

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
      isVerified: true,
      isActive: true
    };

    const farmer = await Farmer.create(farmerData);
    farmerId = farmer._id;

    const productData = {
      name: 'Premium AA Coffee',
      farmerId: farmerId,
      variety: 'SL28',
      roastLevel: 'Medium',
      processingMethod: 'Washed',
      altitudeGrown: 1800,
      price: 750,
      quantityAvailable: 100,
      isActive: true
    };

    const product = await Product.create(productData);
    productId = product._id;
  });

  after(async () => {
    await cleanupTestDB();
    await disconnectTestDB();
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      const orders = [
        {
          buyerId: testBuyer._id,
          farmerId: farmerId,
          productId: productId,
          quantity: 10,
          unitPrice: 750,
          totalAmount: 7500,
          status: 'Pending',
          paymentStatus: 'Pending',
          deliveryAddress: {
            street: '123 Test Street',
            city: 'Nairobi',
            county: 'Nairobi'
          }
        },
        {
          buyerId: testBuyer._id,
          farmerId: farmerId,
          productId: productId,
          quantity: 5,
          unitPrice: 750,
          totalAmount: 3750,
          status: 'Confirmed',
          paymentStatus: 'Paid',
          deliveryAddress: {
            street: '456 Another Street',
            city: 'Nairobi',
            county: 'Nairobi'
          }
        }
      ];

      await Order.insertMany(orders);
    });

    it('should get all orders for buyer', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(2);
      expect(res.body.count).to.equal(2);
      expect(res.body.total).to.equal(2);
    });

    it('should get all orders for farmer', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(2);
    });

    it('should get all orders for admin', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(2);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/orders')
        .expect(401);

      expect(res.body.success).to.be.false;
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/orders?page=1&limit=1')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.count).to.equal(1);
      expect(res.body.total).to.equal(2);
      expect(res.body.pagination.next).to.exist;
    });

    it('should support filtering by status', async () => {
      const res = await request(app)
        .get('/api/orders?status=Confirmed')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
      expect(res.body.data[0].status).to.equal('Confirmed');
    });
  });

  describe('GET /api/orders/:id', () => {
    beforeEach(async () => {
      const order = await Order.create({
        buyerId: testBuyer._id,
        farmerId: farmerId,
        productId: productId,
        quantity: 10,
        unitPrice: 750,
        totalAmount: 7500,
        status: 'Pending',
        paymentStatus: 'Pending',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi'
        }
      });
      orderId = order._id;
    });

    it('should get order by id as buyer', async () => {
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.quantity).to.equal(10);
      expect(res.body.data.totalAmount).to.equal(7500);
      expect(res.body.data.productId).to.exist;
      expect(res.body.data.farmerId).to.exist;
      expect(res.body.data.buyerId).to.exist;
    });

    it('should get order by id as farmer', async () => {
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.quantity).to.equal(10);
    });

    it('should get order by id as admin', async () => {
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Order not found');
    });

    it('should not allow unauthorized access to order', async () => {
      const otherBuyer = await createTestUser({
        firstName: 'Other',
        lastName: 'Buyer',
        email: 'other@test.com',
        password: 'TestPassword123!',
        role: 'buyer'
      });

      const otherTokens = generateTestTokens(otherBuyer);

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Not authorized');
    });
  });

  describe('POST /api/orders', () => {
    const validOrderData = {
      productId: null,
      quantity: 10,
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Nairobi',
        county: 'Nairobi',
        postalCode: '00100'
      }
    };

    beforeEach(() => {
      validOrderData.productId = productId;
    });

    it('should create order as buyer', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validOrderData)
        .expect(201);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.quantity).to.equal(10);
      expect(res.body.data.unitPrice).to.equal(750);
      expect(res.body.data.totalAmount).to.equal(7500);
      expect(res.body.data.status).to.equal('Pending');
      expect(res.body.data.paymentStatus).to.equal('Pending');

      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.quantityAvailable).to.equal(90);
    });

    it('should create order as admin', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validOrderData)
        .expect(201);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.quantity).to.equal(10);
    });

    it('should not allow farmer to create order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(validOrderData)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('authorized');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(401);

      expect(res.body.success).to.be.false;
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validOrderData };
      delete invalidData.quantity;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Validation Error');
    });

    it('should validate product existence', async () => {
      const invalidData = { ...validOrderData };
      invalidData.productId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(invalidData)
        .expect(404);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Product not found');
    });

    it('should validate product availability', async () => {
      await Product.findByIdAndUpdate(productId, { isActive: false });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validOrderData)
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('no longer available');
    });

    it('should validate sufficient quantity', async () => {
      const invalidData = { ...validOrderData };
      invalidData.quantity = 150;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Only 100 kg available');
    });

    it('should update product stock status to low stock', async () => {
      await Product.findByIdAndUpdate(productId, { quantityAvailable: 15 });
      
      const orderData = { ...validOrderData };
      orderData.quantity = 10;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      expect(res.body.success).to.be.true;

      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.quantityAvailable).to.equal(5);
      expect(updatedProduct.stockStatus).to.equal('Low Stock');
    });

    it('should update product stock status to out of stock', async () => {
      await Product.findByIdAndUpdate(productId, { quantityAvailable: 10 });
      
      const orderData = { ...validOrderData };
      orderData.quantity = 10;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      expect(res.body.success).to.be.true;

      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.quantityAvailable).to.equal(0);
      expect(updatedProduct.stockStatus).to.equal('Out of Stock');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    beforeEach(async () => {
      const order = await Order.create({
        buyerId: testBuyer._id,
        farmerId: farmerId,
        productId: productId,
        quantity: 10,
        unitPrice: 750,
        totalAmount: 7500,
        status: 'Pending',
        paymentStatus: 'Pending',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi'
        }
      });
      orderId = order._id;
    });

    it('should update order status as farmer', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ status: 'Confirmed' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal('Confirmed');
    });

    it('should update order status as buyer', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'Confirmed' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal('Confirmed');
    });

    it('should update order status as admin', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Confirmed' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal('Confirmed');
    });

    it('should validate status values', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ status: 'InvalidStatus' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Validation Error');
    });

    it('should not allow status update on completed orders', async () => {
      await Order.findByIdAndUpdate(orderId, { status: 'Completed' });

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ status: 'Cancelled' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Cannot update completed');
    });

    it('should restore product stock when cancelled', async () => {
      const originalProduct = await Product.findById(productId);
      const originalStock = originalProduct.quantityAvailable;

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ status: 'Cancelled' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal('Cancelled');

      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.quantityAvailable).to.equal(originalStock + 10);
    });

    it('should set delivery date when delivered', async () => {
      await Order.findByIdAndUpdate(orderId, { status: 'InTransit' });

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ status: 'Delivered' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal('Delivered');
      expect(res.body.data.deliveryDate).to.exist;
    });

    it('should not allow delivered without in-transit', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ status: 'Delivered' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('must be in transit');
    });

    it('should not allow unauthorized access', async () => {
      const otherBuyer = await createTestUser({
        firstName: 'Other',
        lastName: 'Buyer',
        email: 'other@test.com',
        password: 'TestPassword123!',
        role: 'buyer'
      });

      const otherTokens = generateTestTokens(otherBuyer);

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .send({ status: 'Confirmed' })
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Not authorized');
    });
  });

  describe('PUT /api/orders/:id/payment', () => {
    beforeEach(async () => {
      const order = await Order.create({
        buyerId: testBuyer._id,
        farmerId: farmerId,
        productId: productId,
        quantity: 10,
        unitPrice: 750,
        totalAmount: 7500,
        status: 'Pending',
        paymentStatus: 'Pending',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi'
        }
      });
      orderId = order._id;
    });

    it('should update payment status', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/payment`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ 
          paymentStatus: 'Paid',
          paymentMethod: 'M-Pesa',
          paymentReference: 'MP123456789'
        })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.paymentStatus).to.equal('Paid');
      expect(res.body.data.paymentMethod).to.equal('M-Pesa');
      expect(res.body.data.paymentReference).to.equal('MP123456789');
      expect(res.body.data.status).to.equal('Confirmed');
      expect(res.body.data.paidAt).to.exist;
    });

    it('should validate payment status values', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/payment`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ paymentStatus: 'InvalidStatus' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Validation Error');
    });

    it('should validate payment method values', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/payment`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ 
          paymentStatus: 'Paid',
          paymentMethod: 'InvalidMethod'
        })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Validation Error');
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    beforeEach(async () => {
      const order = await Order.create({
        buyerId: testBuyer._id,
        farmerId: farmerId,
        productId: productId,
        quantity: 10,
        unitPrice: 750,
        totalAmount: 7500,
        status: 'Pending',
        paymentStatus: 'Pending',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi'
        }
      });
      orderId = order._id;
    });

    it('should cancel order as buyer', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ reason: 'Changed my mind' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal('Cancelled');
      expect(res.body.data.cancellationReason).to.equal('Changed my mind');
      expect(res.body.data.cancelledAt).to.exist;
    });

    it('should cancel order as admin', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Admin cancellation' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal('Cancelled');
    });

    it('should not allow farmer to cancel order', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ reason: 'Farmer cancellation' })
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('authorized');
    });

    it('should restore product stock when cancelled', async () => {
      const originalProduct = await Product.findById(productId);
      const originalStock = originalProduct.quantityAvailable;

      const res = await request(app)
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ reason: 'Cancellation' })
        .expect(200);

      expect(res.body.success).to.be.true;

      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.quantityAvailable).to.equal(originalStock + 10);
    });

    it('should not cancel completed orders', async () => {
      await Order.findByIdAndUpdate(orderId, { status: 'Completed' });

      const res = await request(app)
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ reason: 'Cancellation' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Cannot cancel completed');
    });

    it('should not cancel in-transit orders', async () => {
      await Order.findByIdAndUpdate(orderId, { status: 'InTransit' });

      const res = await request(app)
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ reason: 'Cancellation' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Cannot cancel orders that are in transit');
    });
  });

  describe('GET /api/orders/stats', () => {
    beforeEach(async () => {
      const orders = [
        {
          buyerId: testBuyer._id,
          farmerId: farmerId,
          productId: productId,
          quantity: 10,
          unitPrice: 750,
          totalAmount: 7500,
          status: 'Completed',
          paymentStatus: 'Paid'
        },
        {
          buyerId: testBuyer._id,
          farmerId: farmerId,
          productId: productId,
          quantity: 5,
          unitPrice: 750,
          totalAmount: 3750,
          status: 'Pending',
          paymentStatus: 'Pending'
        }
      ];

      await Order.insertMany(orders);
    });

    it('should get order statistics for buyer', async () => {
      const res = await request(app)
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.overview).to.exist;
      expect(res.body.data.byStatus).to.be.an('array');
      expect(res.body.data.byPaymentStatus).to.be.an('array');
      expect(res.body.data.monthlyTrends).to.be.an('array');
      
      expect(res.body.data.overview.totalOrders).to.equal(2);
      expect(res.body.data.overview.totalValue).to.equal(11250);
      expect(res.body.data.overview.totalQuantity).to.equal(15);
    });

    it('should get order statistics for farmer', async () => {
      const res = await request(app)
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.overview.totalOrders).to.equal(2);
    });

    it('should get order statistics for admin', async () => {
      const res = await request(app)
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.overview.totalOrders).to.equal(2);
    });
  });

  describe('GET /api/orders/farmer/:farmerId', () => {
    beforeEach(async () => {
      const order = await Order.create({
        buyerId: testBuyer._id,
        farmerId: farmerId,
        productId: productId,
        quantity: 10,
        unitPrice: 750,
        totalAmount: 7500,
        status: 'Pending',
        paymentStatus: 'Pending',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi'
        }
      });
      orderId = order._id;
    });

    it('should get farmer orders as farmer owner', async () => {
      const res = await request(app)
        .get(`/api/orders/farmer/${farmerId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
    });

    it('should get farmer orders as admin', async () => {
      const res = await request(app)
        .get(`/api/orders/farmer/${farmerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
    });

    it('should not allow other farmers to access', async () => {
      const otherFarmer = await createTestUser({
        firstName: 'Other',
        lastName: 'Farmer',
        email: 'other@test.com',
        password: 'TestPassword123!',
        role: 'farmer'
      });

      const otherTokens = generateTestTokens(otherFarmer);

      const res = await request(app)
        .get(`/api/orders/farmer/${farmerId}`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Not authorized');
    });

    it('should not allow buyer to access farmer orders', async () => {
      const res = await request(app)
        .get(`/api/orders/farmer/${farmerId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('authorized');
    });
  });

  describe('GET /api/orders/buyer/:buyerId', () => {
    beforeEach(async () => {
      const order = await Order.create({
        buyerId: testBuyer._id,
        farmerId: farmerId,
        productId: productId,
        quantity: 10,
        unitPrice: 750,
        totalAmount: 7500,
        status: 'Pending',
        paymentStatus: 'Pending',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi'
        }
      });
      orderId = order._id;
    });

    it('should get buyer orders as buyer owner', async () => {
      const res = await request(app)
        .get(`/api/orders/buyer/${testBuyer._id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
    });

    it('should get buyer orders as admin', async () => {
      const res = await request(app)
        .get(`/api/orders/buyer/${testBuyer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.equal(1);
    });

    it('should not allow other buyers to access', async () => {
      const otherBuyer = await createTestUser({
        firstName: 'Other',
        lastName: 'Buyer',
        email: 'other@test.com',
        password: 'TestPassword123!',
        role: 'buyer'
      });

      const otherTokens = generateTestTokens(otherBuyer);

      const res = await request(app)
        .get(`/api/orders/buyer/${testBuyer._id}`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Not authorized');
    });

    it('should not allow farmer to access buyer orders', async () => {
      const res = await request(app)
        .get(`/api/orders/buyer/${testBuyer._id}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('authorized');
    });
  });
});