const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const {
  protect,
  authorize,
  hasPermission,
  verifyRefreshToken,
  checkOwnership
} = require('../../src/middleware/authMiddleware');
const User = require('../../src/models/User');
const AppError = require('../../src/utils/AppError');
const config = require('../../src/config/config');
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
  createTestUser,
  createTestAdmin
} = require('../helpers/testHelpers');

describe('Authentication Middleware Unit Tests', () => {
  let req, res, next, jwtVerifyStub;

  // Setup and teardown
  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
    
    req = {
      headers: {},
      cookies: {},
      user: null
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
    
    jwtVerifyStub = sinon.stub(jwt, 'verify');
  });

  afterEach(() => {
    if (jwtVerifyStub) jwtVerifyStub.restore();
  });

  after(async () => {
    await disconnectTestDB();
  });

  describe('protect middleware', () => {
    let testUser, userFindByIdStub;

    beforeEach(async () => {
      testUser = await createTestUser();
      userFindByIdStub = sinon.stub(User, 'findById').returns({
        select: sinon.stub().resolves(testUser)
      });
    });

    afterEach(() => {
      if (userFindByIdStub) userFindByIdStub.restore();
    });

    it('should authenticate user with valid token in Authorization header', async () => {
      const token = 'valid-token';
      const decoded = { id: testUser._id, iat: Math.floor(Date.now() / 1000) };

      req.headers.authorization = `Bearer ${token}`;
      jwtVerifyStub.returns(decoded);

      await protect(req, res, next);

      expect(jwtVerifyStub.calledWith(token, config.JWT_SECRET)).to.be.true;
      expect(userFindByIdStub.called).to.be.true;
      expect(req.user).to.equal(testUser);
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true; // Called without error
    });

    it('should authenticate user with valid token in cookies', async () => {
      const token = 'valid-token';
      const decoded = { id: testUser._id, iat: Math.floor(Date.now() / 1000) };

      req.cookies.token = token;
      jwtVerifyStub.returns(decoded);

      await protect(req, res, next);

      expect(jwtVerifyStub.calledWith(token, config.JWT_SECRET)).to.be.true;
      expect(req.user).to.equal(testUser);
      expect(next.calledOnce).to.be.true;
    });

    it('should reject request without token', async () => {
      await protect(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('Not authorized to access this route');
      expect(next.firstCall.args[0].statusCode).to.equal(401);
    });

    it('should reject request with invalid token', async () => {
      const token = 'invalid-token';
      
      req.headers.authorization = `Bearer ${token}`;
      jwtVerifyStub.throws(new Error('JsonWebTokenError'));

      await protect(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].statusCode).to.equal(401);
    });

    it('should reject request with expired token', async () => {
      const token = 'expired-token';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      
      req.headers.authorization = `Bearer ${token}`;
      jwtVerifyStub.throws(error);

      await protect(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('Token expired');
    });

    it('should reject request when user not found', async () => {
      const token = 'valid-token';
      const decoded = { id: 'nonexistent-id', iat: Math.floor(Date.now() / 1000) };

      req.headers.authorization = `Bearer ${token}`;
      jwtVerifyStub.returns(decoded);
      userFindByIdStub.returns({
        select: sinon.stub().resolves(null)
      });

      await protect(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('No user found with this token');
    });

    it('should reject request when user is inactive', async () => {
      const token = 'valid-token';
      const decoded = { id: testUser._id, iat: Math.floor(Date.now() / 1000) };
      const inactiveUser = { ...testUser.toObject(), isActive: false };

      req.headers.authorization = `Bearer ${token}`;
      jwtVerifyStub.returns(decoded);
      userFindByIdStub.returns({
        select: sinon.stub().resolves(inactiveUser)
      });

      await protect(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('Your account has been deactivated');
    });

    it('should reject request when password changed after token issued', async () => {
      const token = 'valid-token';
      const decoded = { id: testUser._id, iat: Math.floor(Date.now() / 1000) - 3600 }; // Token from 1 hour ago
      const userWithPasswordChange = {
        ...testUser.toObject(),
        changedPasswordAfter: sinon.stub().returns(true)
      };

      req.headers.authorization = `Bearer ${token}`;
      jwtVerifyStub.returns(decoded);
      userFindByIdStub.returns({
        select: sinon.stub().resolves(userWithPasswordChange)
      });

      await protect(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('User recently changed password. Please log in again.');
    });
  });

  describe('authorize middleware', () => {
    it('should allow access for authorized role', () => {
      req.user = { role: 'admin' };
      
      const middleware = authorize('admin', 'superadmin');
      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true; // Called without error
    });

    it('should deny access for unauthorized role', () => {
      req.user = { role: 'user' };
      
      const middleware = authorize('admin', 'superadmin');
      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.include('not authorized');
      expect(next.firstCall.args[0].statusCode).to.equal(403);
    });

    it('should deny access when no user', () => {
      req.user = null;
      
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].statusCode).to.equal(401);
    });
  });

  describe('hasPermission middleware', () => {
    it('should allow access with required permission', () => {
      req.user = { 
        role: 'admin',
        permissions: ['read:users', 'write:users'] 
      };
      
      const middleware = hasPermission('read:users');
      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true;
    });

    it('should allow access for superadmin', () => {
      req.user = { 
        role: 'superadmin',
        permissions: ['admin:all'] 
      };
      
      const middleware = hasPermission('any:permission');
      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true;
    });

    it('should deny access without required permission', () => {
      req.user = { 
        role: 'user',
        permissions: ['read:products'] 
      };
      
      const middleware = hasPermission('write:users');
      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.include('Insufficient permissions');
      expect(next.firstCall.args[0].statusCode).to.equal(403);
    });

    it('should allow access with any of multiple required permissions', () => {
      req.user = { 
        role: 'admin',
        permissions: ['read:users', 'write:products'] 
      };
      
      const middleware = hasPermission('write:users', 'read:users');
      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true;
    });
  });

  describe('verifyRefreshToken middleware', () => {
    let testUser, userFindByIdStub;

    beforeEach(async () => {
      testUser = await createTestUser();
      testUser.refreshTokens = [{ token: 'valid-refresh-token' }];
      userFindByIdStub = sinon.stub(User, 'findById').resolves(testUser);
    });

    afterEach(() => {
      if (userFindByIdStub) userFindByIdStub.restore();
    });

    it('should verify valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const decoded = { id: testUser._id };

      req.body = { refreshToken };
      jwtVerifyStub.returns(decoded);

      await verifyRefreshToken(req, res, next);

      expect(jwtVerifyStub.calledWith(refreshToken, config.JWT_REFRESH_SECRET)).to.be.true;
      expect(req.user).to.equal(testUser);
      expect(req.refreshToken).to.equal(refreshToken);
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true;
    });

    it('should reject request without refresh token', async () => {
      req.body = {};

      await verifyRefreshToken(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('Refresh token is required');
    });

    it('should reject invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      
      req.body = { refreshToken };
      jwtVerifyStub.throws(new Error('JsonWebTokenError'));

      await verifyRefreshToken(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('Invalid refresh token');
    });

    it('should reject refresh token not in user tokens', async () => {
      const refreshToken = 'unknown-refresh-token';
      const decoded = { id: testUser._id };

      req.body = { refreshToken };
      jwtVerifyStub.returns(decoded);

      await verifyRefreshToken(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('Invalid refresh token');
    });
  });

  describe('checkOwnership middleware', () => {
    it('should allow access for resource owner', async () => {
      const userId = 'user-123';
      req.user = { id: userId, role: 'user' };
      req.params = { id: userId };
      
      const middleware = checkOwnership();
      await middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true;
    });

    it('should allow access for admin', async () => {
      req.user = { id: 'admin-123', role: 'admin' };
      req.params = { id: 'user-456' };
      
      const middleware = checkOwnership();
      await middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true;
    });

    it('should allow access for superadmin', async () => {
      req.user = { id: 'superadmin-123', role: 'superadmin' };
      req.params = { id: 'user-456' };
      
      const middleware = checkOwnership();
      await middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true;
    });

    it('should deny access for non-owner non-admin', async () => {
      req.user = { id: 'user-123', role: 'user' };
      req.params = { id: 'user-456' };
      
      const middleware = checkOwnership();
      await middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal('Not authorized to access this resource');
      expect(next.firstCall.args[0].statusCode).to.equal(403);
    });

    it('should use custom resource ID field', async () => {
      const userId = 'user-123';
      req.user = { id: userId, role: 'user' };
      req.params = { userId: userId };
      
      const middleware = checkOwnership('userId');
      await middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith()).to.be.true;
    });
  });
});