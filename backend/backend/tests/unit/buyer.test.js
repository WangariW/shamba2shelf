const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Buyer = require('../../src/models/Buyer');

describe('Buyer Model', () => {
  beforeEach(async () => {
    await Buyer.deleteMany({});
  });

  afterAll(async () => {
    await Buyer.deleteMany({});
  });

  describe('Buyer Creation', () => {
    it('should create a buyer with valid data', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Retail',
        businessName: 'Test Coffee Shop',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      const buyer = await Buyer.create(buyerData);

      expect(buyer._id).toBeDefined();
      expect(buyer.name).toBe(buyerData.name);
      expect(buyer.email).toBe(buyerData.email);
      expect(buyer.businessType).toBe(buyerData.businessType);
      expect(buyer.isActive).toBe(true);
      expect(buyer.isVerified).toBe(false);
    });

    it('should hash password before saving', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Individual',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      const buyer = await Buyer.create(buyerData);
      const savedBuyer = await Buyer.findById(buyer._id).select('+password');

      expect(savedBuyer.password).not.toBe(buyerData.password);
      expect(savedBuyer.password.length).toBeGreaterThan(50);
    });

    it('should set default values correctly', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Individual',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      const buyer = await Buyer.create(buyerData);

      expect(buyer.isActive).toBe(true);
      expect(buyer.isVerified).toBe(false);
      expect(buyer.purchaseHistory.totalOrders).toBe(0);
      expect(buyer.purchaseHistory.totalSpent).toBe(0);
      expect(buyer.rating.average).toBe(0);
      expect(buyer.rating.totalReviews).toBe(0);
      expect(buyer.loginAttempts).toBe(0);
    });
  });

  describe('Validation', () => {
    it('should require name', async () => {
      const buyerData = {
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Retail'
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });

    it('should require email', async () => {
      const buyerData = {
        name: 'Test Buyer',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Retail'
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'invalid-email',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Retail'
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });

    it('should require password', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        phone: '+254712345678',
        businessType: 'Retail'
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });

    it('should validate password length', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: '123',
        phone: '+254712345678',
        businessType: 'Retail'
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });

    it('should validate phone format', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '123456789',
        businessType: 'Retail'
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });

    it('should validate business type', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'InvalidType'
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });

    it('should require business name for non-individual buyers', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Retail',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });

    it('should require business license for wholesale/export/processing', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Wholesale',
        businessName: 'Test Wholesale',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      await expect(Buyer.create(buyerData)).rejects.toThrow();
    });
  });

  describe('Indexes', () => {
    it('should enforce unique email', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Individual',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      await Buyer.create(buyerData);

      const duplicateBuyer = {
        ...buyerData,
        name: 'Another Buyer',
        phone: '+254712345679'
      };

      await expect(Buyer.create(duplicateBuyer)).rejects.toThrow();
    });
  });

  describe('Methods', () => {
    let buyer;

    beforeEach(async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Individual',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      buyer = await Buyer.create(buyerData);
    });

    describe('correctPassword', () => {
      it('should return true for correct password', async () => {
        const savedBuyer = await Buyer.findById(buyer._id).select('+password');
        const isCorrect = await savedBuyer.correctPassword('password123', savedBuyer.password);
        expect(isCorrect).toBe(true);
      });

      it('should return false for incorrect password', async () => {
        const savedBuyer = await Buyer.findById(buyer._id).select('+password');
        const isCorrect = await savedBuyer.correctPassword('wrongpassword', savedBuyer.password);
        expect(isCorrect).toBe(false);
      });
    });

    describe('signToken', () => {
      it('should generate a valid JWT token', () => {
        const token = buyer.signToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(buyer._id.toString());
      });
    });

    describe('createPasswordResetToken', () => {
      it('should generate password reset token', () => {
        const resetToken = buyer.createPasswordResetToken();
        expect(resetToken).toBeDefined();
        expect(buyer.passwordResetToken).toBeDefined();
        expect(buyer.passwordResetExpires).toBeDefined();
      });
    });

    describe('createVerificationToken', () => {
      it('should generate verification token', () => {
        const verificationToken = buyer.createVerificationToken();
        expect(verificationToken).toBeDefined();
        expect(buyer.verificationToken).toBeDefined();
        expect(buyer.verificationTokenExpires).toBeDefined();
      });
    });

    describe('updatePurchaseStats', () => {
      it('should update purchase statistics', async () => {
        await buyer.updatePurchaseStats(1000);

        expect(buyer.purchaseHistory.totalOrders).toBe(1);
        expect(buyer.purchaseHistory.totalSpent).toBe(1000);
        expect(buyer.purchaseHistory.averageOrderValue).toBe(1000);
        expect(buyer.purchaseHistory.lastOrderDate).toBeDefined();
      });
    });

    describe('addFavoriteVariety', () => {
      it('should add new favorite variety', () => {
        buyer.addFavoriteVariety('Arabica');

        expect(buyer.purchaseHistory.favoriteVarieties.length).toBe(1);
        expect(buyer.purchaseHistory.favoriteVarieties[0].variety).toBe('Arabica');
        expect(buyer.purchaseHistory.favoriteVarieties[0].orderCount).toBe(1);
      });

      it('should increment existing favorite variety', () => {
        buyer.addFavoriteVariety('Arabica');
        buyer.addFavoriteVariety('Arabica');

        expect(buyer.purchaseHistory.favoriteVarieties.length).toBe(1);
        expect(buyer.purchaseHistory.favoriteVarieties[0].orderCount).toBe(2);
      });
    });

    describe('addPreferredFarmer', () => {
      it('should add new preferred farmer', () => {
        const farmerId = new mongoose.Types.ObjectId();
        buyer.addPreferredFarmer(farmerId, 500);

        expect(buyer.purchaseHistory.preferredFarmers.length).toBe(1);
        expect(buyer.purchaseHistory.preferredFarmers[0].farmerId).toEqual(farmerId);
        expect(buyer.purchaseHistory.preferredFarmers[0].orderCount).toBe(1);
        expect(buyer.purchaseHistory.preferredFarmers[0].totalSpent).toBe(500);
      });

      it('should update existing preferred farmer', () => {
        const farmerId = new mongoose.Types.ObjectId();
        buyer.addPreferredFarmer(farmerId, 500);
        buyer.addPreferredFarmer(farmerId, 300);

        expect(buyer.purchaseHistory.preferredFarmers.length).toBe(1);
        expect(buyer.purchaseHistory.preferredFarmers[0].orderCount).toBe(2);
        expect(buyer.purchaseHistory.preferredFarmers[0].totalSpent).toBe(800);
      });
    });
  });

  describe('Virtual fields', () => {
    it('should have isLocked virtual field', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Individual',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      const buyer = await Buyer.create(buyerData);
      expect(buyer.isLocked).toBe(false);

      buyer.lockUntil = Date.now() + 60000;
      expect(buyer.isLocked).toBe(true);
    });
  });

  describe('Pre-save middleware', () => {
    it('should ensure only one default payment method', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Individual',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        },
        paymentMethods: [
          {
            type: 'M-Pesa',
            details: { phone: '+254712345678' },
            isDefault: true
          },
          {
            type: 'Bank Transfer',
            details: { accountNumber: '123456789' },
            isDefault: true
          }
        ]
      };

      const buyer = await Buyer.create(buyerData);
      const defaultMethods = buyer.paymentMethods.filter(method => method.isDefault);
      expect(defaultMethods.length).toBe(1);
    });

    it('should update lastActiveAt on save', async () => {
      const buyerData = {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        phone: '+254712345678',
        businessType: 'Individual',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100',
          coordinates: {
            latitude: -1.286389,
            longitude: 36.817223
          }
        }
      };

      const buyer = await Buyer.create(buyerData);
      const originalDate = buyer.lastActiveAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      buyer.name = 'Updated Name';
      await buyer.save();

      expect(buyer.lastActiveAt.getTime()).toBeGreaterThan(originalDate.getTime());
    });
  });
});