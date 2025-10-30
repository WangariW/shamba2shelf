const { expect } = require('chai');
const request = require('supertest');
const app = require('../../server');
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
  createTestUser,
  createTestAdmin,
  generateTestTokens,
  testData,
  assertions
} = require('../helpers/testHelpers');

describe('Authentication Integration Tests', () => {
  // Setup and teardown
  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
  });

  after(async () => {
    await disconnectTestDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testData.validUser);

      expect(response.status).to.equal(201);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('User registered successfully');
      expect(response.body.data).to.have.property('user');
      expect(response.body.data).to.have.property('accessToken');
      expect(response.body.data).to.have.property('refreshToken');
      expect(response.body.data.user.email).to.equal(testData.validUser.email.toLowerCase());
      expect(response.body.data.user).to.not.have.property('password');
    });

    it('should not register a user with invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testData.invalidUser);

      expect(response.status).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('Validation Error');
    });

    it('should not register a user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testData.validUser);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testData.validUser);

      expect(response.status).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('email already exists');
    });

    it('should enforce password strength requirements', async () => {
      const weakPasswordUser = {
        ...testData.validUser,
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser);

      expect(response.status).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('Password must');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Login successful');
      expect(response.body.data).to.have.property('accessToken');
      expect(response.body.data).to.have.property('refreshToken');
      expect(response.body.data.user.email).to.equal(testUser.email);
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        });

      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.equal('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.equal('Invalid credentials');
    });

    it('should not login with inactive account', async () => {
      testUser.isActive = false;
      await testUser.save();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.equal('Invalid credentials');
    });

    it('should track login attempts and lock account', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          });
      }

      // Account should be locked now
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      expect(response.status).to.equal(401);
      expect(response.body.error.message).to.include('temporarily locked');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser, accessToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      const tokens = generateTestTokens(testUser);
      accessToken = tokens.accessToken;
    });

    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data.user.email).to.equal(testUser.email);
      expect(response.body.data.user).to.not.have.property('password');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('Not authorized');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('Invalid token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let testUser, accessToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      const tokens = generateTestTokens(testUser);
      accessToken = tokens.accessToken;
    });

    it('should update user profile with valid data', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testData.updateData);

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Profile updated successfully');
      expect(response.body.data.user.firstName).to.equal(testData.updateData.firstName);
      expect(response.body.data.user.lastName).to.equal(testData.updateData.lastName);
    });

    it('should not update profile with invalid data', async () => {
      const invalidData = {
        firstName: '', // Empty first name
        phoneNumber: 'invalid-phone'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData);

      expect(response.status).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('Validation Error');
    });
  });

  describe('PUT /api/auth/password', () => {
    let testUser, accessToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      const tokens = generateTestTokens(testUser);
      accessToken = tokens.accessToken;
    });

    it('should change password with valid data', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testData.passwordData);

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Password changed successfully');
      expect(response.body.data).to.have.property('accessToken');
    });

    it('should not change password with incorrect current password', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.equal('Current password is incorrect');
    });

    it('should not change password with weak new password', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'weak'
        });

      expect(response.status).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('New password must');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser, refreshToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      const tokens = generateTestTokens(testUser);
      refreshToken = tokens.refreshToken;
      await testUser.addRefreshToken(refreshToken, 'test-agent', '127.0.0.1');
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Token refreshed successfully');
      expect(response.body.data).to.have.property('accessToken');
      expect(response.body.data).to.have.property('refreshToken');
    });

    it('should not refresh token with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('Invalid refresh token');
    });

    it('should not refresh token without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.include('Refresh token is required');
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser, accessToken, refreshToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      const tokens = generateTestTokens(testUser);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      await testUser.addRefreshToken(refreshToken, 'test-agent', '127.0.0.1');
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Logout successful');
    });

    it('should logout without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
    });
  });

  describe('Admin Routes', () => {
    let testAdmin, adminToken, testUser;

    beforeEach(async () => {
      testAdmin = await createTestAdmin();
      testUser = await createTestUser();
      const tokens = generateTestTokens(testAdmin);
      adminToken = tokens.accessToken;
    });

    describe('GET /api/auth/users', () => {
      it('should get all users as admin', async () => {
        const response = await request(app)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).to.equal(200);
        expect(response.body.success).to.be.true;
        expect(response.body.data.users).to.be.an('array');
        expect(response.body.data.users.length).to.be.at.least(2);
      });

      it('should not get users as regular user', async () => {
        const userTokens = generateTestTokens(testUser);
        
        const response = await request(app)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${userTokens.accessToken}`);

        expect(response.status).to.equal(403);
        expect(response.body.success).to.be.false;
      });

      it('should filter users by role', async () => {
        const response = await request(app)
          .get('/api/auth/users?role=admin')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).to.equal(200);
        expect(response.body.data.users).to.be.an('array');
        expect(response.body.data.users[0].role).to.equal('admin');
      });
    });

    describe('PUT /api/auth/users/:id/role', () => {
      it('should update user role as admin', async () => {
        const response = await request(app)
          .put(`/api/auth/users/${testUser._id}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'farmer' });

        expect(response.status).to.equal(200);
        expect(response.body.success).to.be.true;
        expect(response.body.data.user.role).to.equal('farmer');
      });

      it('should not update role with invalid role', async () => {
        const response = await request(app)
          .put(`/api/auth/users/${testUser._id}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'invalid-role' });

        expect(response.status).to.equal(400);
        expect(response.body.success).to.be.false;
      });
    });

    describe('PUT /api/auth/users/:id/status', () => {
      it('should toggle user status as admin', async () => {
        const response = await request(app)
          .put(`/api/auth/users/${testUser._id}/status`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).to.equal(200);
        expect(response.body.success).to.be.true;
        expect(response.body.data.user.isActive).to.be.false;
      });
    });
  });

  describe('Password Reset Flow', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should initiate password reset', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('Password reset token sent');
    });

    it('should not initiate reset for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).to.equal(404);
      expect(response.body.success).to.be.false;
      expect(response.body.error.message).to.equal('No user found with that email address');
    });
  });
});