const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const app = require('../../server');
const { Tracking, Warehouse, Fleet } = require('../../src/models/Logistics');
const Order = require('../../src/models/Order');
const logisticsService = require('../../src/services/logisticsService');
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
  createTestUser,
  createTestAdmin,
  generateTestTokens
} = require('../helpers/testHelpers');

describe('Logistics Integration Tests', () => {
  let adminToken;
  let logisticsToken;
  let driverToken;
  let testAdmin;
  let testLogistics;
  let testDriver;
  let testOrder;
  let testWarehouse;
  let testVehicle;
  let trackingId;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
    
    testAdmin = await createTestAdmin({
      email: 'admin@test.com'
    });

    testLogistics = await createTestUser({
      firstName: 'Test',
      lastName: 'Logistics',
      email: 'logistics@test.com',
      password: 'TestPassword123!',
      role: 'logistics'
    });

    testDriver = await createTestUser({
      firstName: 'Test',
      lastName: 'Driver',
      email: 'driver@test.com',
      password: 'TestPassword123!',
      role: 'driver'
    });

    adminToken = generateTestTokens(testAdmin).token;
    logisticsToken = generateTestTokens(testLogistics).token;
    driverToken = generateTestTokens(testDriver).token;

    testOrder = await Order.create({
      buyerId: new mongoose.Types.ObjectId(),
      farmerId: new mongoose.Types.ObjectId(),
      productId: new mongoose.Types.ObjectId(),
      quantity: 10,
      unitPrice: 50,
      totalAmount: 500,
      status: 'Confirmed'
    });

    testWarehouse = await Warehouse.create({
      name: 'Test Warehouse',
      location: {
        lat: -1.2921,
        lng: 36.8219,
        address: 'Test Address, Nairobi'
      },
      capacity: {
        total: 1000,
        available: 800
      }
    });

    testVehicle = await Fleet.create({
      vehicleId: 'VEH001',
      plateNumber: 'KCA 123A',
      type: 'van',
      capacity: {
        weight: 500
      }
    });
  });

  after(async () => {
    await disconnectTestDB();
  });

  describe('POST /api/v1/logistics/tracking', () => {
    it('should create a new tracking order', async () => {
      const trackingData = {
        orderId: testOrder._id,
        pickupLocation: {
          lat: -1.2921,
          lng: 36.8219,
          address: 'Pickup Address'
        },
        deliveryLocation: {
          lat: -1.3032,
          lng: 36.8441,
          address: 'Delivery Address'
        },
        options: {
          priority: 'normal'
        }
      };

      const response = await request(app)
        .post('/api/v1/logistics/tracking')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(trackingData)
        .expect(201);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.tracking).to.have.property('trackingNumber');
      expect(response.body.data.tracking.orderId.toString()).to.equal(testOrder._id.toString());
      expect(response.body.data.tracking.status).to.equal('pending');
      
      trackingId = response.body.data.tracking._id;
    });

    it('should reject tracking creation with missing required fields', async () => {
      const invalidData = {
        orderId: testOrder._id
      };

      const response = await request(app)
        .post('/api/v1/logistics/tracking')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.status).to.equal('error');
      expect(response.body.message).to.include('required');
    });

    it('should reject unauthorized access', async () => {
      const trackingData = {
        orderId: testOrder._id,
        pickupLocation: { lat: -1.2921, lng: 36.8219 },
        deliveryLocation: { lat: -1.3032, lng: 36.8441 }
      };

      await request(app)
        .post('/api/v1/logistics/tracking')
        .send(trackingData)
        .expect(401);
    });
  });

  describe('GET /api/v1/logistics/tracking', () => {
    beforeEach(async () => {
      await Tracking.create({
        orderId: testOrder._id,
        trackingNumber: 'TRK123456789',
        currentLocation: {
          lat: -1.2921,
          lng: 36.8219,
          address: 'Test Location'
        }
      });
    });

    it('should get all tracking orders with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/logistics/tracking')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.results).to.be.a('number');
      expect(response.body.pagination).to.have.property('currentPage');
      expect(response.body.data.trackingOrders).to.be.an('array');
    });

    it('should filter tracking orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/logistics/tracking?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.trackingOrders).to.be.an('array');
    });
  });

  describe('GET /api/v1/logistics/tracking/:trackingNumber', () => {
    let testTracking;

    beforeEach(async () => {
      testTracking = await Tracking.create({
        orderId: testOrder._id,
        trackingNumber: 'TRK123456789',
        currentLocation: {
          lat: -1.2921,
          lng: 36.8219,
          address: 'Test Location'
        },
        trackingHistory: [{
          location: {
            lat: -1.2921,
            lng: 36.8219,
            address: 'Pickup Location'
          },
          status: 'picked_up',
          timestamp: new Date(),
          notes: 'Package picked up'
        }]
      });
    });

    it('should get tracking information by tracking number', async () => {
      const response = await request(app)
        .get(`/api/v1/logistics/tracking/${testTracking.trackingNumber}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.tracking).to.have.property('trackingNumber');
      expect(response.body.data.tracking.trackingNumber).to.equal(testTracking.trackingNumber);
      expect(response.body.data.tracking.history).to.be.an('array');
    });

    it('should return 404 for non-existent tracking number', async () => {
      const response = await request(app)
        .get('/api/v1/logistics/tracking/INVALID123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).to.equal('error');
    });
  });

  describe('PUT /api/v1/logistics/tracking/:trackingNumber/location', () => {
    let testTracking;

    beforeEach(async () => {
      testTracking = await Tracking.create({
        orderId: testOrder._id,
        trackingNumber: 'TRK123456789',
        currentLocation: {
          lat: -1.2921,
          lng: 36.8219,
          address: 'Initial Location'
        }
      });
    });

    it('should update tracking location', async () => {
      const locationUpdate = {
        lat: -1.2956,
        lng: 36.8330,
        address: 'Updated Location',
        status: 'in_transit',
        notes: 'Package in transit'
      };

      const response = await request(app)
        .put(`/api/v1/logistics/tracking/${testTracking.trackingNumber}/location`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send(locationUpdate)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.tracking.currentLocation.lat).to.equal(locationUpdate.lat);
      expect(response.body.data.tracking.status).to.equal('in_transit');
    });

    it('should reject location update with missing coordinates', async () => {
      const invalidUpdate = {
        address: 'Updated Location'
      };

      const response = await request(app)
        .put(`/api/v1/logistics/tracking/${testTracking.trackingNumber}/location`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.status).to.equal('error');
    });
  });

  describe('POST /api/v1/logistics/estimate', () => {
    it('should calculate delivery estimate', async () => {
      const estimateRequest = {
        pickup: {
          lat: -1.2921,
          lng: 36.8219
        },
        delivery: {
          lat: -1.3032,
          lng: 36.8441
        },
        weight: 15,
        priority: 'normal'
      };

      const response = await request(app)
        .post('/api/v1/logistics/estimate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(estimateRequest)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.estimate).to.have.property('distance');
      expect(response.body.data.estimate).to.have.property('estimatedDuration');
      expect(response.body.data.estimate).to.have.property('cost');
      expect(response.body.data.estimate.cost).to.have.property('totalCost');
    });

    it('should reject estimate request with missing fields', async () => {
      const invalidRequest = {
        pickup: {
          lat: -1.2921,
          lng: 36.8219
        }
      };

      const response = await request(app)
        .post('/api/v1/logistics/estimate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.status).to.equal('error');
    });
  });

  describe('Warehouse Management', () => {
    describe('POST /api/v1/logistics/warehouses', () => {
      it('should create a new warehouse', async () => {
        const warehouseData = {
          name: 'New Test Warehouse',
          location: {
            lat: -1.2921,
            lng: 36.8219,
            address: 'New Warehouse Address'
          },
          capacity: {
            total: 2000,
            available: 2000
          },
          operatingHours: {
            open: '06:00',
            close: '18:00'
          }
        };

        const response = await request(app)
          .post('/api/v1/logistics/warehouses')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(warehouseData)
          .expect(201);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.warehouse.name).to.equal(warehouseData.name);
        expect(response.body.data.warehouse.capacity.total).to.equal(warehouseData.capacity.total);
      });
    });

    describe('GET /api/v1/logistics/warehouses', () => {
      it('should get all warehouses', async () => {
        const response = await request(app)
          .get('/api/v1/logistics/warehouses')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.warehouses).to.be.an('array');
        expect(response.body.data.warehouses.length).to.be.at.least(1);
      });
    });

    describe('GET /api/v1/logistics/warehouses/:id', () => {
      it('should get warehouse details', async () => {
        const response = await request(app)
          .get(`/api/v1/logistics/warehouses/${testWarehouse._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.warehouse._id).to.equal(testWarehouse._id.toString());
        expect(response.body.data.warehouse.name).to.equal(testWarehouse.name);
      });
    });

    describe('POST /api/v1/logistics/warehouses/:warehouseId/inventory', () => {
      it('should manage warehouse inventory', async () => {
        const inventoryData = {
          productId: new mongoose.Types.ObjectId(),
          quantity: 100,
          operation: 'add'
        };

        const response = await request(app)
          .post(`/api/v1/logistics/warehouses/${testWarehouse._id}/inventory`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(inventoryData)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.warehouse).to.have.property('inventory');
      });
    });
  });

  describe('Fleet Management', () => {
    describe('POST /api/v1/logistics/fleet', () => {
      it('should create a new fleet vehicle', async () => {
        const vehicleData = {
          vehicleId: 'VEH002',
          plateNumber: 'KCB 456B',
          type: 'truck',
          capacity: {
            weight: 1000
          }
        };

        const response = await request(app)
          .post('/api/v1/logistics/fleet')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(vehicleData)
          .expect(201);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.vehicle.plateNumber).to.equal(vehicleData.plateNumber);
        expect(response.body.data.vehicle.type).to.equal(vehicleData.type);
      });
    });

    describe('GET /api/v1/logistics/fleet', () => {
      it('should get all fleet vehicles', async () => {
        const response = await request(app)
          .get('/api/v1/logistics/fleet')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.vehicles).to.be.an('array');
        expect(response.body.data.vehicles.length).to.be.at.least(1);
      });
    });

    describe('GET /api/v1/logistics/fleet/available', () => {
      it('should get available vehicles', async () => {
        const response = await request(app)
          .get('/api/v1/logistics/fleet/available?minCapacity=100')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.vehicles).to.be.an('array');
      });
    });

    describe('GET /api/v1/logistics/fleet/:id', () => {
      it('should get vehicle details', async () => {
        const response = await request(app)
          .get(`/api/v1/logistics/fleet/${testVehicle._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.vehicle._id).to.equal(testVehicle._id.toString());
        expect(response.body.data.vehicle.plateNumber).to.equal(testVehicle.plateNumber);
      });
    });
  });

  describe('Route Optimization', () => {
    describe('POST /api/v1/logistics/optimize-routes', () => {
      it('should optimize delivery routes', async () => {
        const deliveries = [{
          orderId: testOrder._id,
          deliveryLocation: {
            lat: -1.3032,
            lng: 36.8441
          }
        }, {
          orderId: new mongoose.Types.ObjectId(),
          deliveryLocation: {
            lat: -1.2884,
            lng: 36.8233
          }
        }];

        const response = await request(app)
          .post('/api/v1/logistics/optimize-routes')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ deliveries })
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.optimizedRoutes).to.be.an('array');
        expect(response.body.data.optimizedRoutes.length).to.equal(deliveries.length);
      });

      it('should reject route optimization with invalid data', async () => {
        const response = await request(app)
          .post('/api/v1/logistics/optimize-routes')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ deliveries: 'invalid' })
          .expect(400);

        expect(response.body.status).to.equal('error');
      });
    });
  });

  describe('Reports', () => {
    describe('GET /api/v1/logistics/reports/delivery', () => {
      beforeEach(async () => {
        await Tracking.create({
          orderId: testOrder._id,
          trackingNumber: 'TRK987654321',
          status: 'delivered',
          actualDelivery: new Date(),
          cost: { totalCost: 500 }
        });
      });

      it('should generate delivery report', async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const endDate = new Date();

        const response = await request(app)
          .get(`/api/v1/logistics/reports/delivery?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.report).to.have.property('totalDeliveries');
        expect(response.body.data.report).to.have.property('completedDeliveries');
        expect(response.body.data.report).to.have.property('averageDeliveryTime');
        expect(response.body.data.report).to.have.property('totalRevenue');
      });

      it('should require start and end dates for report', async () => {
        const response = await request(app)
          .get('/api/v1/logistics/reports/delivery')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.status).to.equal('error');
      });
    });
  });

  describe('Service Integration', () => {
    it('should handle logistics service errors gracefully', async () => {
      const stub = sinon.stub(logisticsService, 'createTrackingOrder').rejects(new Error('Service error'));

      const trackingData = {
        orderId: testOrder._id,
        pickupLocation: { lat: -1.2921, lng: 36.8219 },
        deliveryLocation: { lat: -1.3032, lng: 36.8441 }
      };

      const response = await request(app)
        .post('/api/v1/logistics/tracking')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(trackingData)
        .expect(500);

      expect(response.body.status).to.equal('error');
      stub.restore();
    });
  });
});