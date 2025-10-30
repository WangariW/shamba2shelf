const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const app = require('../../server');
const { SalesMetrics, InventoryMetrics, PerformanceMetrics, UserAnalytics, Report } = require('../../src/models/Analytics');
const Order = require('../../src/models/Order');
const Product = require('../../src/models/Product');
const analyticsService = require('../../src/services/analyticsService');
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
  createTestUser,
  createTestAdmin,
  generateTestTokens
} = require('../helpers/testHelpers');

describe('Analytics Integration Tests', () => {
  let adminToken;
  let farmerToken;
  let testAdmin;
  let testFarmer;
  let testSalesMetrics;
  let testInventoryMetrics;
  let testPerformanceMetrics;
  let testReport;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
    
    testAdmin = await createTestAdmin({
      email: 'admin@test.com'
    });

    testFarmer = await createTestUser({
      firstName: 'Test',
      lastName: 'Farmer',
      email: 'farmer@test.com',
      password: 'TestPassword123!',
      role: 'farmer'
    });

    adminToken = generateTestTokens(testAdmin).token;
    farmerToken = generateTestTokens(testFarmer).token;

    const testDate = new Date();
    testDate.setHours(0, 0, 0, 0);

    testSalesMetrics = await SalesMetrics.create({
      date: testDate,
      period: 'daily',
      totalOrders: 50,
      totalRevenue: 25000,
      totalQuantitySold: 500,
      averageOrderValue: 500,
      ordersByStatus: {
        pending: 5,
        confirmed: 15,
        delivered: 25,
        cancelled: 5
      },
      topProducts: [{
        productId: new mongoose.Types.ObjectId(),
        name: 'Test Product',
        quantitySold: 100,
        revenue: 5000
      }],
      regionBreakdown: [{
        region: 'Nairobi',
        orderCount: 30,
        revenue: 15000,
        averageOrderValue: 500
      }]
    });

    testInventoryMetrics = await InventoryMetrics.create({
      date: testDate,
      period: 'daily',
      totalProducts: 200,
      totalValue: 100000,
      lowStockProducts: [{
        productId: new mongoose.Types.ObjectId(),
        name: 'Low Stock Product',
        currentStock: 5,
        minimumThreshold: 20,
        farmerId: new mongoose.Types.ObjectId()
      }],
      categoryBreakdown: [{
        category: 'Coffee',
        productCount: 50,
        totalQuantity: 1000,
        totalValue: 50000,
        averagePrice: 50
      }],
      turnoverRate: 15.5
    });

    testPerformanceMetrics = await PerformanceMetrics.create({
      date: testDate,
      period: 'daily',
      userMetrics: {
        totalUsers: 1000,
        activeUsers: 500,
        newRegistrations: 25,
        userRetentionRate: 85,
        farmersCount: 400,
        buyersCount: 600
      },
      systemMetrics: {
        apiResponseTime: 250,
        uptime: 99.9,
        errorRate: 0.01,
        successfulTransactions: 450,
        failedTransactions: 5
      },
      deliveryMetrics: {
        totalDeliveries: 45,
        onTimeDeliveries: 42,
        lateDeliveries: 2,
        failedDeliveries: 1,
        averageDeliveryTime: 2.5,
        onTimePercentage: 93.3
      }
    });

    testReport = await Report.create({
      title: 'Test Sales Report',
      type: 'sales',
      dateRange: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      },
      data: { totalRevenue: 100000 },
      status: 'completed',
      generatedBy: testAdmin._id
    });
  });

  after(async () => {
    await disconnectTestDB();
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should get dashboard data for admin', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.dashboard).to.have.property('summary');
      expect(response.body.data.dashboard).to.have.property('trends');
      expect(response.body.data.dashboard).to.have.property('inventory');
      expect(response.body.data.dashboard).to.have.property('performance');
    });

    it('should respect date range parameter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/dashboard?dateRange=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.dashboard).to.be.an('object');
    });

    it('should reject access for non-admin users', async () => {
      await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(403);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/analytics/dashboard')
        .expect(401);
    });
  });

  describe('GET /api/v1/analytics/sales', () => {
    it('should get sales metrics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.results).to.be.a('number');
      expect(response.body.data.salesMetrics).to.be.an('array');
    });

    it('should filter sales metrics by period', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/sales?period=daily')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.salesMetrics).to.be.an('array');
      
      if (response.body.data.salesMetrics.length > 0) {
        expect(response.body.data.salesMetrics[0].period).to.equal('daily');
      }
    });

    it('should filter sales metrics by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/v1/analytics/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.salesMetrics).to.be.an('array');
    });

    it('should limit results based on limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/sales?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.salesMetrics.length).to.be.at.most(5);
    });
  });

  describe('GET /api/v1/analytics/inventory', () => {
    it('should get inventory metrics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.inventoryMetrics).to.be.an('array');
    });

    it('should allow farmer access to inventory metrics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/inventory')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.inventoryMetrics).to.be.an('array');
    });

    it('should include stock health calculations', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      
      if (response.body.data.inventoryMetrics.length > 0) {
        expect(response.body.data.inventoryMetrics[0]).to.have.property('stockHealth');
        expect(response.body.data.inventoryMetrics[0].stockHealth).to.have.property('score');
        expect(response.body.data.inventoryMetrics[0].stockHealth).to.have.property('status');
      }
    });
  });

  describe('GET /api/v1/analytics/performance', () => {
    it('should get performance metrics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/performance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.performanceMetrics).to.be.an('array');
    });

    it('should include KPI calculations', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/performance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      
      if (response.body.data.performanceMetrics.length > 0) {
        expect(response.body.data.performanceMetrics[0]).to.have.property('kpis');
        expect(response.body.data.performanceMetrics[0].kpis).to.have.property('userGrowthRate');
        expect(response.body.data.performanceMetrics[0].kpis).to.have.property('systemHealthScore');
      }
    });
  });

  describe('GET /api/v1/analytics/users', () => {
    beforeEach(async () => {
      await UserAnalytics.create({
        userId: testFarmer._id,
        userType: 'farmer',
        date: new Date(),
        sessionData: {
          loginCount: 5,
          totalSessionTime: 3600,
          averageSessionTime: 720
        },
        activityMetrics: {
          ordersReceived: 10,
          productsListed: 5
        }
      });
    });

    it('should get user analytics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.userAnalytics).to.be.an('array');
    });

    it('should filter by user type', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/users?userType=farmer')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      
      if (response.body.data.userAnalytics.length > 0) {
        expect(response.body.data.userAnalytics[0].userType).to.equal('farmer');
      }
    });

    it('should include engagement score calculations', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      
      if (response.body.data.userAnalytics.length > 0) {
        expect(response.body.data.userAnalytics[0]).to.have.property('engagementScore');
        expect(response.body.data.userAnalytics[0].engagementScore).to.be.a('number');
      }
    });
  });

  describe('POST /api/v1/analytics/generate', () => {
    it('should generate daily metrics', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'daily',
          date: new Date().toISOString()
        })
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('generated successfully');
    });

    it('should generate weekly metrics', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'weekly'
        })
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('weekly');
    });

    it('should generate monthly metrics', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'monthly'
        })
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('monthly');
    });

    it('should reject invalid metric type', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'invalid'
        })
        .expect(400);

      expect(response.body.status).to.equal('error');
    });

    it('should require metric type', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.status).to.equal('error');
    });
  });

  describe('Report Management', () => {
    describe('POST /api/v1/analytics/reports', () => {
      it('should create a custom report', async () => {
        const reportData = {
          title: 'Custom Sales Report',
          type: 'sales',
          dateRange: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-01-31T23:59:59.999Z'
          },
          filters: {
            regions: ['Nairobi'],
            categories: ['Coffee']
          }
        };

        const response = await request(app)
          .post('/api/v1/analytics/reports')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(reportData)
          .expect(201);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.report.title).to.equal(reportData.title);
        expect(response.body.data.report.type).to.equal(reportData.type);
        expect(response.body.data.report).to.have.property('data');
        expect(response.body.data.report).to.have.property('insights');
      });

      it('should reject report creation with missing required fields', async () => {
        const invalidData = {
          title: 'Incomplete Report'
        };

        const response = await request(app)
          .post('/api/v1/analytics/reports')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.status).to.equal('error');
      });
    });

    describe('GET /api/v1/analytics/reports', () => {
      it('should get all reports with pagination', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/reports')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.results).to.be.a('number');
        expect(response.body.pagination).to.have.property('currentPage');
        expect(response.body.data.reports).to.be.an('array');
      });

      it('should filter reports by type', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/reports?type=sales')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        
        response.body.data.reports.forEach(report => {
          expect(report.type).to.equal('sales');
        });
      });
    });

    describe('GET /api/v1/analytics/reports/:id', () => {
      it('should get report details', async () => {
        const response = await request(app)
          .get(`/api/v1/analytics/reports/${testReport._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.report._id).to.equal(testReport._id.toString());
        expect(response.body.data.report.title).to.equal(testReport.title);
      });

      it('should return 404 for non-existent report', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        
        const response = await request(app)
          .get(`/api/v1/analytics/reports/${nonExistentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.status).to.equal('error');
      });
    });

    describe('PUT /api/v1/analytics/reports/:id', () => {
      it('should update report', async () => {
        const updateData = {
          title: 'Updated Report Title',
          filters: {
            regions: ['Mombasa']
          }
        };

        const response = await request(app)
          .put(`/api/v1/analytics/reports/${testReport._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.report.title).to.equal(updateData.title);
      });
    });

    describe('DELETE /api/v1/analytics/reports/:id', () => {
      it('should delete report', async () => {
        await request(app)
          .delete(`/api/v1/analytics/reports/${testReport._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);

        const deletedReport = await Report.findById(testReport._id);
        expect(deletedReport).to.be.null;
      });
    });
  });

  describe('Analytics Insights', () => {
    describe('GET /api/v1/analytics/top-performers', () => {
      it('should get top performing products', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/top-performers?type=products')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.topPerformers).to.be.an('array');
      });

      it('should get top performing farmers', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/top-performers?type=farmers')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.topPerformers).to.be.an('array');
      });

      it('should require type parameter', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/top-performers')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.status).to.equal('error');
      });

      it('should reject invalid type', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/top-performers?type=invalid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.status).to.equal('error');
      });
    });

    describe('GET /api/v1/analytics/regional', () => {
      it('should get regional analytics', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/regional')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.regionalAnalytics).to.be.an('array');
      });

      it('should filter by period', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/regional?period=daily')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.regionalAnalytics).to.be.an('array');
      });
    });

    describe('GET /api/v1/analytics/categories', () => {
      it('should get category analytics', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.categoryAnalytics).to.be.an('array');
      });

      it('should allow farmer access', async () => {
        const response = await request(app)
          .get('/api/v1/analytics/categories')
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.data.categoryAnalytics).to.be.an('array');
      });
    });
  });

  describe('Service Integration', () => {
    it('should handle analytics service errors gracefully', async () => {
      const stub = sinon.stub(analyticsService, 'getDashboardData').rejects(new Error('Service error'));

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.status).to.equal('error');
      stub.restore();
    });

    it('should handle report generation errors', async () => {
      const stub = sinon.stub(analyticsService, 'generateCustomReport').rejects(new Error('Report generation failed'));

      const reportData = {
        title: 'Test Report',
        type: 'sales',
        dateRange: {
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-31T23:59:59.999Z'
        }
      };

      const response = await request(app)
        .post('/api/v1/analytics/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reportData)
        .expect(500);

      expect(response.body.status).to.equal('error');
      stub.restore();
    });
  });
});