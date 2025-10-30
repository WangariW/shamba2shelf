const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const config = require('../../src/config/config');
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
  testData
} = require('../helpers/testHelpers');

describe('User Model Unit Tests', () => {
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

  describe('User Schema Validation', () => {
    it('should create user with valid data', async () => {
      const user = new User(testData.validUser);
      const savedUser = await user.save();

      expect(savedUser.firstName).to.equal(testData.validUser.firstName);
      expect(savedUser.lastName).to.equal(testData.validUser.lastName);
      expect(savedUser.email).to.equal(testData.validUser.email.toLowerCase());
      expect(savedUser.role).to.equal(testData.validUser.role);
      expect(savedUser.isActive).to.be.true;
      expect(savedUser.password).to.not.equal(testData.validUser.password); // Should be hashed
    });

    it('should reject user with invalid email', async () => {
      const user = new User({
        ...testData.validUser,
        email: 'invalid-email'
      });

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors.email).to.exist;
      }
    });

    it('should reject user with short password', async () => {
      const user = new User({
        ...testData.validUser,
        password: '123'
      });

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors.password).to.exist;
      }
    });

    it('should reject user with invalid role', async () => {
      const user = new User({
        ...testData.validUser,
        role: 'invalid-role'
      });

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors.role).to.exist;
      }
    });

    it('should reject duplicate email', async () => {
      await User.create(testData.validUser);

      try {
        await User.create(testData.validUser);
        expect.fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).to.equal(11000);
      }
    });
  });

  describe('Password Hashing', () => {
    let bcryptGenSaltStub, bcryptHashStub;

    beforeEach(() => {
      bcryptGenSaltStub = sinon.stub(bcrypt, 'genSalt');
      bcryptHashStub = sinon.stub(bcrypt, 'hash');
    });

    afterEach(() => {
      bcryptGenSaltStub.restore();
      bcryptHashStub.restore();
    });

    it('should hash password before saving', async () => {
      const saltValue = 'test-salt';
      const hashedPassword = 'hashed-password';

      bcryptGenSaltStub.resolves(saltValue);
      bcryptHashStub.resolves(hashedPassword);

      const user = new User(testData.validUser);
      await user.save();

      expect(bcryptGenSaltStub.calledOnce).to.be.true;
      expect(bcryptGenSaltStub.calledWith(config.BCRYPT_SALT_ROUNDS)).to.be.true;
      expect(bcryptHashStub.calledOnce).to.be.true;
      expect(bcryptHashStub.calledWith(testData.validUser.password, saltValue)).to.be.true;
      expect(user.password).to.equal(hashedPassword);
    });

    it('should not hash password if not modified', async () => {
      const user = await User.create(testData.validUser);
      
      // Reset stubs after initial creation
      bcryptGenSaltStub.resetHistory();
      bcryptHashStub.resetHistory();

      // Update non-password field using updateOne to avoid validation
      await User.findByIdAndUpdate(user._id, { firstName: 'Updated' });

      expect(bcryptGenSaltStub.called).to.be.false;
      expect(bcryptHashStub.called).to.be.false;
    });
  });

  describe('Password Comparison', () => {
    let user;

    beforeEach(async () => {
      user = await User.create(testData.validUser);
    });

    it('should return true for correct password', async () => {
      const isMatch = await user.comparePassword(testData.validUser.password);
      expect(isMatch).to.be.true;
    });

    it('should return false for incorrect password', async () => {
      const isMatch = await user.comparePassword('wrong-password');
      expect(isMatch).to.be.false;
    });
  });

  describe('JWT Token Generation', () => {
    let user, jwtSignStub;

    beforeEach(async () => {
      user = await User.create(testData.validUser);
      jwtSignStub = sinon.stub(jwt, 'sign');
    });

    afterEach(() => {
      jwtSignStub.restore();
    });

    it('should generate access token', () => {
      const mockToken = 'mock-access-token';
      jwtSignStub.returns(mockToken);

      const token = user.generateAccessToken();

      expect(jwtSignStub.calledOnce).to.be.true;
      expect(jwtSignStub.firstCall.args[0]).to.deep.include({
        id: user._id,
        email: user.email,
        role: user.role
      });
      expect(jwtSignStub.firstCall.args[1]).to.equal(config.JWT_SECRET);
      expect(token).to.equal(mockToken);
    });

    it('should generate refresh token', () => {
      const mockToken = 'mock-refresh-token';
      jwtSignStub.returns(mockToken);

      const token = user.generateRefreshToken();

      expect(jwtSignStub.calledOnce).to.be.true;
      expect(jwtSignStub.firstCall.args[0]).to.deep.equal({ id: user._id });
      expect(jwtSignStub.firstCall.args[1]).to.equal(config.JWT_REFRESH_SECRET);
      expect(token).to.equal(mockToken);
    });
  });

  describe('Virtual Properties', () => {
    let user;

    beforeEach(async () => {
      user = await User.create(testData.validUser);
    });

    it('should return full name', () => {
      expect(user.fullName).to.equal(`${user.firstName} ${user.lastName}`);
    });

    it('should return false for isLocked when not locked', () => {
      expect(user.isLocked).to.be.false;
    });

    it('should return true for isLocked when locked', () => {
      user.lockUntil = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      expect(user.isLocked).to.be.true;
    });

    it('should return false for isLocked when lock expired', () => {
      user.lockUntil = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      expect(user.isLocked).to.be.false;
    });
  });

  describe('Login Attempts and Account Locking', () => {
    let user;

    beforeEach(async () => {
      user = await User.create(testData.validUser);
    });

    it('should increment login attempts', async () => {
      await user.incLoginAttempts();
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.loginAttempts).to.equal(1);
    });

    it('should lock account after max attempts', async () => {
      // Set login attempts to max - 1
      user.loginAttempts = config.MAX_LOGIN_ATTEMPTS - 1;
      await user.save();

      await user.incLoginAttempts();
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.loginAttempts).to.equal(config.MAX_LOGIN_ATTEMPTS);
      expect(updatedUser.lockUntil).to.exist;
      expect(updatedUser.isLocked).to.be.true;
    });

    it('should reset login attempts', async () => {
      user.loginAttempts = 3;
      user.lockUntil = new Date(Date.now() + 1000 * 60 * 60);
      await user.save();

      await user.resetLoginAttempts();
      
      const updatedUser = await User.findById(user._id);
      // After $unset, the field should either not exist or be falsy
      expect(updatedUser.loginAttempts).to.satisfy(val => val === undefined || val === 0);
      expect(updatedUser.lockUntil).to.not.exist;
    });
  });

  describe('Refresh Token Management', () => {
    let user;

    beforeEach(async () => {
      user = await User.create(testData.validUser);
    });

    it('should add refresh token', async () => {
      const token = 'test-refresh-token';
      const userAgent = 'test-agent';
      const ipAddress = '127.0.0.1';

      await user.addRefreshToken(token, userAgent, ipAddress);
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.refreshTokens).to.have.length(1);
      expect(updatedUser.refreshTokens[0].token).to.equal(token);
      expect(updatedUser.refreshTokens[0].userAgent).to.equal(userAgent);
      expect(updatedUser.refreshTokens[0].ipAddress).to.equal(ipAddress);
    });

    it('should limit refresh tokens to 5', async () => {
      // Add 6 tokens
      for (let i = 0; i < 6; i++) {
        await user.addRefreshToken(`token-${i}`, 'test-agent', '127.0.0.1');
      }
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.refreshTokens).to.have.length(5);
      expect(updatedUser.refreshTokens[0].token).to.equal('token-1'); // First token removed
    });

    it('should remove specific refresh token', async () => {
      const token1 = 'token-1';
      const token2 = 'token-2';

      await user.addRefreshToken(token1, 'test-agent', '127.0.0.1');
      await user.addRefreshToken(token2, 'test-agent', '127.0.0.1');

      await user.removeRefreshToken(token1);
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.refreshTokens).to.have.length(1);
      expect(updatedUser.refreshTokens[0].token).to.equal(token2);
    });

    it('should remove all refresh tokens', async () => {
      await user.addRefreshToken('token-1', 'test-agent', '127.0.0.1');
      await user.addRefreshToken('token-2', 'test-agent', '127.0.0.1');

      await user.removeAllRefreshTokens();
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.refreshTokens).to.have.length(0);
    });
  });

  describe('User Authentication Static Method', () => {
    let user;

    beforeEach(async () => {
      user = await User.create(testData.validUser);
    });

    it('should authenticate with valid credentials', async () => {
      const result = await User.authenticate(
        user.email,
        testData.validUser.password,
        '127.0.0.1',
        'test-agent'
      );

      expect(result.success).to.be.true;
      expect(result.user.email).to.equal(user.email);
    });

    it('should not authenticate with invalid email', async () => {
      const result = await User.authenticate(
        'nonexistent@example.com',
        testData.validUser.password,
        '127.0.0.1',
        'test-agent'
      );

      expect(result.success).to.be.false;
      expect(result.message).to.equal('Invalid credentials');
    });

    it('should not authenticate with invalid password', async () => {
      const result = await User.authenticate(
        user.email,
        'wrong-password',
        '127.0.0.1',
        'test-agent'
      );

      expect(result.success).to.be.false;
      expect(result.message).to.equal('Invalid credentials');
    });

    it('should not authenticate locked account', async () => {
      user.lockUntil = new Date(Date.now() + 1000 * 60 * 60);
      await user.save();

      const result = await User.authenticate(
        user.email,
        testData.validUser.password,
        '127.0.0.1',
        'test-agent'
      );

      expect(result.success).to.be.false;
      expect(result.message).to.include('temporarily locked');
    });

    it('should not authenticate inactive account', async () => {
      user.isActive = false;
      await user.save();

      const result = await User.authenticate(
        user.email,
        testData.validUser.password,
        '127.0.0.1',
        'test-agent'
      );

      expect(result.success).to.be.false;
      expect(result.message).to.equal('Invalid credentials');
    });
  });

  describe('Password Change Detection', () => {
    let user;

    beforeEach(async () => {
      user = await User.create(testData.validUser);
    });

    it('should return false when password was not changed after JWT', () => {
      const jwtTimestamp = Math.floor(Date.now() / 1000);
      const result = user.changedPasswordAfter(jwtTimestamp);
      expect(result).to.be.false;
    });

    it('should return true when password was changed after JWT', async () => {
      const jwtTimestamp = Math.floor(Date.now() / 1000);
      
      // Change password (this sets passwordChangedAt)
      user.password = 'NewPassword123!';
      await user.save();
      
      const result = user.changedPasswordAfter(jwtTimestamp - 10);
      expect(result).to.be.true;
    });
  });

  describe('Role Permissions', () => {
    it('should return correct role permissions', () => {
      const permissions = User.getRolePermissions();
      
      expect(permissions).to.have.property('user');
      expect(permissions).to.have.property('farmer');
      expect(permissions).to.have.property('buyer');
      expect(permissions).to.have.property('admin');
      expect(permissions).to.have.property('superadmin');
      
      expect(permissions.user).to.be.an('array');
      expect(permissions.admin).to.include('read:users');
      expect(permissions.superadmin).to.include('admin:all');
    });
  });
});