const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Farmer = require('../../src/models/Farmer');
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB
} = require('../helpers/testHelpers');

describe('Farmer Model Unit Tests', () => {
  let farmerData;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
    farmerData = {
      name: 'John Kamau',
      email: 'john.kamau@example.com',
      password: 'SecurePassword123!',
      phone: '+254712345678',
      county: 'Nyeri',
      location: {
        latitude: -0.4167,
        longitude: 36.9500
      },
      farmSize: 5.5,
      brandStory: 'Third generation coffee farmer with sustainable practices'
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  after(async () => {
    await disconnectTestDB();
  });

  describe('Farmer Creation', () => {
    it('should create a farmer with valid data', async () => {
      const farmer = new Farmer(farmerData);
      expect(farmer.name).to.equal('John Kamau');
      expect(farmer.email).to.equal('john.kamau@example.com');
      expect(farmer.county).to.equal('Nyeri');
      expect(farmer.farmSize).to.equal(5.5);
      expect(farmer.isVerified).to.equal(false);
      expect(farmer.isActive).to.equal(true);
      expect(farmer.role).to.equal('farmer');
    });

    it('should require name', () => {
      delete farmerData.name;
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.name).to.exist;
      expect(error.errors.name.message).to.contain('required');
    });

    it('should require email', () => {
      delete farmerData.email;
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.email).to.exist;
      expect(error.errors.email.message).to.contain('required');
    });

    it('should validate email format', () => {
      farmerData.email = 'invalid-email';
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.email).to.exist;
      expect(error.errors.email.message).to.contain('valid email');
    });

    it('should require password', () => {
      delete farmerData.password;
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.password).to.exist;
      expect(error.errors.password.message).to.contain('required');
    });

    it('should validate password minimum length', () => {
      farmerData.password = '123';
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.password).to.exist;
      expect(error.errors.password.message).to.contain('8 characters');
    });

    it('should validate phone number format', () => {
      farmerData.phone = '0712345678';
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.phone).to.exist;
      expect(error.errors.phone.message).to.contain('valid Kenyan phone number');
    });

    it('should validate valid phone number', () => {
      farmerData.phone = '+254712345678';
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error).to.not.exist;
    });

    it('should validate county enum', () => {
      farmerData.county = 'InvalidCounty';
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.county).to.exist;
      expect(error.errors.county.message).to.contain('major coffee growing regions');
    });

    it('should validate valid county', () => {
      farmerData.county = 'Kiambu';
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error).to.not.exist;
    });

    it('should validate location coordinates', () => {
      farmerData.location = {
        latitude: 90, // Invalid latitude for Kenya
        longitude: 36.9500
      };
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors['location.latitude']).to.exist;
    });

    it('should validate farm size range', () => {
      farmerData.farmSize = 600; // Too large for smallholder
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.farmSize).to.exist;
      expect(error.errors.farmSize.message).to.contain('smallholder classification');
    });

    it('should validate minimum farm size', () => {
      farmerData.farmSize = 0.05; // Too small
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.farmSize).to.exist;
      expect(error.errors.farmSize.message).to.contain('0.1 acres');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const farmer = new Farmer(farmerData);
      
      // Mock bcrypt
      const hashStub = sinon.stub(bcrypt, 'genSalt').resolves('salt');
      const bcryptHashStub = sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
      
      await farmer.save();
      
      expect(hashStub.calledWith(12)).to.be.true;
      expect(bcryptHashStub.calledWith('SecurePassword123!', 'salt')).to.be.true;
      expect(farmer.password).to.equal('hashedPassword');
    });

    it('should not hash password if not modified', async () => {
      const farmer = new Farmer(farmerData);
      farmer.password = 'alreadyHashed';
      farmer.isModified = sinon.stub().returns(false);
      
      const hashStub = sinon.stub(bcrypt, 'hash');
      
      await farmer.save();
      
      expect(hashStub.called).to.be.false;
      expect(farmer.password).to.equal('alreadyHashed');
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const farmer = new Farmer(farmerData);
      farmer.password = 'hashedPassword';
      
      const compareStub = sinon.stub(bcrypt, 'compare').resolves(true);
      
      const result = await farmer.comparePassword('testPassword');
      
      expect(compareStub.calledWith('testPassword', 'hashedPassword')).to.be.true;
      expect(result).to.be.true;
    });

    it('should return false for incorrect password', async () => {
      const farmer = new Farmer(farmerData);
      farmer.password = 'hashedPassword';
      
      const compareStub = sinon.stub(bcrypt, 'compare').resolves(false);
      
      const result = await farmer.comparePassword('wrongPassword');
      
      expect(result).to.be.false;
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate access token', () => {
      const farmer = new Farmer(farmerData);
      farmer._id = new mongoose.Types.ObjectId();
      
      const signStub = sinon.stub(jwt, 'sign').returns('access_token');
      process.env.JWT_SECRET = 'test_secret';
      process.env.JWT_EXPIRE = '15m';
      
      const token = farmer.generateAccessToken();
      
      expect(signStub.calledOnce).to.be.true;
      expect(token).to.equal('access_token');
      
      const signArgs = signStub.getCall(0).args;
      expect(signArgs[0]).to.have.property('id');
      expect(signArgs[0]).to.have.property('email', farmerData.email);
      expect(signArgs[0]).to.have.property('role', 'farmer');
      expect(signArgs[0]).to.have.property('name', farmerData.name);
    });

    it('should generate refresh token', () => {
      const farmer = new Farmer(farmerData);
      farmer._id = new mongoose.Types.ObjectId();
      
      const signStub = sinon.stub(jwt, 'sign').returns('refresh_token');
      process.env.JWT_REFRESH_SECRET = 'refresh_secret';
      process.env.JWT_REFRESH_EXPIRE = '7d';
      
      const token = farmer.generateRefreshToken();
      
      expect(signStub.calledOnce).to.be.true;
      expect(token).to.equal('refresh_token');
      
      const signArgs = signStub.getCall(0).args;
      expect(signArgs[0]).to.have.property('id');
      expect(signArgs[1]).to.equal('refresh_secret');
      expect(signArgs[2]).to.have.property('expiresIn', '7d');
    });
  });

  describe('Login Attempts', () => {
    it('should increment login attempts', async () => {
      const farmer = new Farmer(farmerData);
      farmer.loginAttempts = 2;
      
      const updateStub = sinon.stub(farmer, 'updateOne').resolves();
      
      await farmer.incLoginAttempts();
      
      expect(updateStub.calledOnce).to.be.true;
      const updateArgs = updateStub.getCall(0).args[0];
      expect(updateArgs).to.have.property('$inc');
      expect(updateArgs.$inc.loginAttempts).to.equal(1);
    });

    it('should lock account after 5 attempts', async () => {
      const farmer = new Farmer(farmerData);
      farmer.loginAttempts = 4; // Will be 5 after increment
      
      const updateStub = sinon.stub(farmer, 'updateOne').resolves();
      
      await farmer.incLoginAttempts();
      
      const updateArgs = updateStub.getCall(0).args[0];
      expect(updateArgs).to.have.property('$set');
      expect(updateArgs.$set.lockUntil).to.be.a('number');
    });

    it('should reset login attempts', async () => {
      const farmer = new Farmer(farmerData);
      
      const updateStub = sinon.stub(farmer, 'updateOne').resolves();
      
      await farmer.resetLoginAttempts();
      
      expect(updateStub.calledOnce).to.be.true;
      const updateArgs = updateStub.getCall(0).args[0];
      expect(updateArgs).to.have.property('$unset');
      expect(updateArgs.$unset).to.have.property('loginAttempts', 1);
      expect(updateArgs.$unset).to.have.property('lockUntil', 1);
    });
  });

  describe('Account Lock Status', () => {
    it('should return true if account is locked', () => {
      const farmer = new Farmer(farmerData);
      farmer.lockUntil = Date.now() + 60000; // 1 minute from now
      
      expect(farmer.isLocked).to.be.true;
    });

    it('should return false if lock has expired', () => {
      const farmer = new Farmer(farmerData);
      farmer.lockUntil = Date.now() - 60000; // 1 minute ago
      
      expect(farmer.isLocked).to.be.false;
    });

    it('should return false if account is not locked', () => {
      const farmer = new Farmer(farmerData);
      
      expect(farmer.isLocked).to.be.false;
    });
  });

  describe('Password Change Detection', () => {
    it('should detect password change after JWT timestamp', () => {
      const farmer = new Farmer(farmerData);
      farmer.passwordChangedAt = new Date();
      
      const jwtTimestamp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
      
      expect(farmer.changedPasswordAfter(jwtTimestamp)).to.be.true;
    });

    it('should return false if password not changed', () => {
      const farmer = new Farmer(farmerData);
      
      const jwtTimestamp = Math.floor(Date.now() / 1000);
      
      expect(farmer.changedPasswordAfter(jwtTimestamp)).to.be.false;
    });
  });

  describe('Public Profile', () => {
    it('should return public profile without sensitive data', () => {
      const farmer = new Farmer(farmerData);
      farmer.password = 'hashedPassword';
      farmer.refreshTokens = [{ token: 'token', createdAt: new Date() }];
      farmer.loginAttempts = 2;
      farmer.verificationDocuments = { nationalId: '12345678' };
      farmer.bankDetails = { accountNumber: '1234567890' };
      
      const publicProfile = farmer.getPublicProfile();
      
      expect(publicProfile).to.not.have.property('password');
      expect(publicProfile).to.not.have.property('refreshTokens');
      expect(publicProfile).to.not.have.property('loginAttempts');
      expect(publicProfile).to.not.have.property('verificationDocuments');
      expect(publicProfile).to.not.have.property('bankDetails');
      expect(publicProfile).to.have.property('name');
      expect(publicProfile).to.have.property('email');
    });
  });

  describe('Dashboard Data', () => {
    it('should return structured dashboard data', () => {
      const farmer = new Farmer(farmerData);
      farmer.varietiesGrown = ['SL28', 'SL34'];
      farmer.certifications = ['Fair Trade', 'Organic'];
      farmer.totalSales = 1500;
      farmer.averageRating = 4.5;
      
      const dashboardData = farmer.getDashboardData();
      
      expect(dashboardData).to.have.property('basicInfo');
      expect(dashboardData).to.have.property('farmInfo');
      expect(dashboardData).to.have.property('performance');
      expect(dashboardData).to.have.property('sustainability');
      
      expect(dashboardData.basicInfo).to.have.property('name', farmerData.name);
      expect(dashboardData.performance).to.have.property('totalSales', 1500);
      expect(dashboardData.performance).to.have.property('averageRating', 4.5);
    });
  });

  describe('Static Methods', () => {
    describe('findByLocation', () => {
      it('should create correct query for location search', () => {
        const findStub = sinon.stub(Farmer, 'find').returns({
          find: sinon.stub().returnsThis()
        });
        
        Farmer.findByLocation(-0.4167, 36.9500, 10);
        
        expect(findStub.calledOnce).to.be.true;
        const query = findStub.getCall(0).args[0];
        expect(query).to.have.property('location');
        expect(query.location).to.have.property('$near');
      });
    });

    describe('findByCounty', () => {
      it('should create correct query for county search', () => {
        const findStub = sinon.stub(Farmer, 'find').returns({
          select: sinon.stub().returnsThis()
        });
        
        Farmer.findByCounty('Nyeri');
        
        expect(findStub.calledOnce).to.be.true;
        const query = findStub.getCall(0).args[0];
        expect(query).to.have.property('county', 'Nyeri');
        expect(query).to.have.property('isActive', true);
        expect(query).to.have.property('isVerified', true);
      });
    });

    describe('getTopRated', () => {
      it('should create correct query for top-rated farmers', () => {
        const findStub = sinon.stub(Farmer, 'find').returns({
          sort: sinon.stub().returnsThis(),
          limit: sinon.stub().returnsThis(),
          select: sinon.stub().returnsThis()
        });
        
        Farmer.getTopRated(5);
        
        expect(findStub.calledOnce).to.be.true;
        const query = findStub.getCall(0).args[0];
        expect(query).to.have.property('isActive', true);
        expect(query).to.have.property('isVerified', true);
        expect(query).to.have.property('averageRating');
        expect(query.averageRating).to.have.property('$gte', 4.0);
      });
    });
  });

  describe('Validation Rules', () => {
    it('should validate certifications enum', () => {
      farmerData.certifications = ['Invalid Certification'];
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors['certifications.0']).to.exist;
    });

    it('should validate varieties grown enum', () => {
      farmerData.varietiesGrown = ['Invalid Variety'];
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors['varietiesGrown.0']).to.exist;
    });

    it('should validate processing methods enum', () => {
      farmerData.processingMethods = ['Invalid Method'];
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors['processingMethods.0']).to.exist;
    });

    it('should validate bank account number format', () => {
      farmerData.bankDetails = {
        accountNumber: '123' // Too short
      };
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors['bankDetails.accountNumber']).to.exist;
    });

    it('should validate national ID format', () => {
      farmerData.verificationDocuments = {
        nationalId: '123' // Too short
      };
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors['verificationDocuments.nationalId']).to.exist;
    });

    it('should validate brand story length', () => {
      farmerData.brandStory = 'x'.repeat(1001); // Too long
      const farmer = new Farmer(farmerData);
      const error = farmer.validateSync();
      expect(error.errors.brandStory).to.exist;
      expect(error.errors.brandStory.message).to.contain('1000 characters');
    });
  });
});