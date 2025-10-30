const QRCode = require('qrcode');
const crypto = require('crypto');
const AppError = require('../utils/AppError');

class QRCodeService {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'https://shamba2shelf.co.ke';
    this.encryptionKey = process.env.QR_ENCRYPTION_KEY || 'shamba2shelf-qr-secret-key-2024';
  }

  async generateProductQR(product, farmer) {
    try {
      const traceabilityData = {
        productId: product._id.toString(),
        productName: product.name,
        variety: product.variety,
        roastLevel: product.roastLevel,
        processingMethod: product.processingMethod,
        altitudeGrown: product.altitudeGrown,
        harvestDate: product.harvestDate,
        qualityScore: product.qualityScore,
        flavorNotes: product.flavorNotes,
        isOrganic: product.isOrganic,
        isFairTrade: product.isFairTrade,

        farmerName: farmer.name,
        farmLocation: {
          county: farmer.county,
          coordinates: farmer.location
        },
        farmSize: farmer.farmSize,
        altitudeRange: farmer.altitudeRange,

        farmerCertifications: farmer.certifications,
        sustainabilityPractices: farmer.sustainabilityPractices,
        farmerRating: farmer.averageRating,
        farmerQualityScore: farmer.qualityScore,

        brandStory: farmer.brandStory,
        farmImages: farmer.farmImages,
        socialMedia: farmer.socialMedia,

        qrGeneratedAt: new Date().toISOString(),
        traceabilityId: this.generateTraceabilityId(product._id, farmer._id),
        verificationLevel: farmer.isVerified ? 'Verified' : 'Pending',
        
        verificationUrl: `${this.baseUrl}/trace/${product._id}`
      };

      const consumerSummary = this.createConsumerSummary(traceabilityData);

      const qrOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#2D5016', // Coffee green
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      };

      const qrCodeImage = await QRCode.toDataURL(
        traceabilityData.verificationUrl,
        qrOptions
      );

      const detailedQrData = await QRCode.toDataURL(
        JSON.stringify(consumerSummary),
        { ...qrOptions, width: 512 }
      );

      return {
        qrCodeImage,
        detailedQrData,
        traceabilityData,
        consumerSummary,
        traceabilityId: traceabilityData.traceabilityId,
        verificationUrl: traceabilityData.verificationUrl
      };

    } catch (error) {
      throw new AppError(`Failed to generate QR code: ${error.message}`, 500);
    }
  }

  createConsumerSummary(traceabilityData) {
    return {
      product: {
        name: traceabilityData.productName,
        variety: traceabilityData.variety,
        roast: traceabilityData.roastLevel,
        processing: traceabilityData.processingMethod,
        flavors: traceabilityData.flavorNotes?.slice(0, 3) || [],
        organic: traceabilityData.isOrganic,
        fairTrade: traceabilityData.isFairTrade
      },
      farm: {
        farmer: traceabilityData.farmerName,
        location: traceabilityData.farmLocation.county,
        altitude: `${traceabilityData.altitudeGrown}m`,
        size: `${traceabilityData.farmSize} acres`,
        rating: traceabilityData.farmerRating
      },
      quality: {
        score: traceabilityData.qualityScore,
        harvest: traceabilityData.harvestDate ? 
          new Date(traceabilityData.harvestDate).getFullYear() : 'Current',
        certifications: traceabilityData.farmerCertifications?.slice(0, 3) || []
      },
      sustainability: {
        practices: traceabilityData.sustainabilityPractices?.slice(0, 4) || [],
        verified: traceabilityData.verificationLevel === 'Verified'
      },
      story: traceabilityData.brandStory?.substring(0, 200) + 
        (traceabilityData.brandStory?.length > 200 ? '...' : ''),
      
      id: traceabilityData.traceabilityId,
      url: traceabilityData.verificationUrl,
      generated: traceabilityData.qrGeneratedAt
    };
  }

  generateTraceabilityId(productId, farmerId) {
    const timestamp = Date.now().toString(36);
    const productHash = crypto.createHash('md5')
      .update(productId.toString())
      .digest('hex')
      .substring(0, 6);
    const farmerHash = crypto.createHash('md5')
      .update(farmerId.toString())
      .digest('hex')
      .substring(0, 6);
    
    return `S2S-${timestamp}-${productHash}-${farmerHash}`.toUpperCase();
  }

  async generateBatchQRCodes(products) {
    try {
      const qrCodes = await Promise.all(
        products.map(async (item) => {
          const { product, farmer } = item;
          return await this.generateProductQR(product, farmer);
        })
      );

      return {
        success: true,
        count: qrCodes.length,
        qrCodes,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      throw new AppError(`Failed to generate batch QR codes: ${error.message}`, 500);
    }
  }

  async verifyQRData(traceabilityId, productData) {
    try {
      const parts = traceabilityId.split('-');
      if (parts.length !== 4 || parts[0] !== 'S2S') {
        return {
          valid: false,
          reason: 'Invalid traceability ID format'
        };
      }

      const [prefix, timestamp, productHash, farmerHash] = parts;
      
      const expectedProductHash = crypto.createHash('md5')
        .update(productData.productId.toString())
        .digest('hex')
        .substring(0, 6);

      const expectedFarmerHash = crypto.createHash('md5')
        .update(productData.farmerId.toString())
        .digest('hex')
        .substring(0, 6);

      const isValid = productHash === expectedProductHash && 
                     farmerHash === expectedFarmerHash;

      const generatedTime = parseInt(timestamp, 36);
      const generatedDate = new Date(generatedTime);

      return {
        valid: isValid,
        generatedAt: generatedDate,
        traceabilityId,
        reason: isValid ? 'Valid traceability code' : 'Hash verification failed'
      };

    } catch (error) {
      return {
        valid: false,
        reason: `Verification error: ${error.message}`
      };
    }
  }

  async generateFarmerProfileQR(farmer) {
    try {
      const farmerProfileData = {
        farmerId: farmer._id.toString(),
        farmerName: farmer.name,
        county: farmer.county,
        farmSize: farmer.farmSize,
        certifications: farmer.certifications,
        averageRating: farmer.averageRating,
        totalReviews: farmer.totalReviews,
        brandStory: farmer.brandStory?.substring(0, 300),
        sustainabilityPractices: farmer.sustainabilityPractices,
        profileUrl: `${this.baseUrl}/farmers/${farmer._id}`,
        qrType: 'farmer-profile',
        generatedAt: new Date().toISOString()
      };

      const qrOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#8B4513',
          light: '#FFFFFF'
        }
      };

      const qrCodeImage = await QRCode.toDataURL(
        farmerProfileData.profileUrl,
        qrOptions
      );

      return {
        qrCodeImage,
        farmerProfileData,
        profileUrl: farmerProfileData.profileUrl
      };

    } catch (error) {
      throw new AppError(`Failed to generate farmer profile QR: ${error.message}`, 500);
    }
  }

  async generateLogisticsQR(order) {
    try {
      const logisticsData = {
        orderId: order._id.toString(),
        trackingNumber: order.trackingNumber || this.generateTrackingNumber(),
        status: order.status,
        estimatedDelivery: order.deliveryDate,
        trackingUrl: `${this.baseUrl}/track/${order._id}`,
        qrType: 'logistics',
        generatedAt: new Date().toISOString()
      };

      const qrOptions = {
        width: 200,
        margin: 1,
        color: {
          dark: '#1E40AF',
          light: '#FFFFFF'
        }
      };

      const qrCodeImage = await QRCode.toDataURL(
        logisticsData.trackingUrl,
        qrOptions
      );

      return {
        qrCodeImage,
        logisticsData,
        trackingUrl: logisticsData.trackingUrl,
        trackingNumber: logisticsData.trackingNumber
      };

    } catch (error) {
      throw new AppError(`Failed to generate logistics QR: ${error.message}`, 500);
    }
  }

  generateTrackingNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `S2S${timestamp}${random}`;
  }

  createQRAnalytics(qrCodes) {
    const analytics = {
      totalGenerated: qrCodes.length,
      productTypes: {},
      counties: {},
      varieties: {},
      certifications: {},
      processingMethods: {},
      qualityDistribution: {
        high: 0,      // 80-100
        medium: 0,    // 60-79
        standard: 0   // Below 60
      }
    };

    qrCodes.forEach(qr => {
      const data = qr.traceabilityData;
      
      analytics.varieties[data.variety] = (analytics.varieties[data.variety] || 0) + 1;
      
      analytics.counties[data.farmLocation.county] = 
        (analytics.counties[data.farmLocation.county] || 0) + 1;
      
      analytics.processingMethods[data.processingMethod] = 
        (analytics.processingMethods[data.processingMethod] || 0) + 1;
      
      const score = data.qualityScore || 0;
      if (score >= 80) analytics.qualityDistribution.high++;
      else if (score >= 60) analytics.qualityDistribution.medium++;
      else analytics.qualityDistribution.standard++;
      
      if (data.farmerCertifications) {
        data.farmerCertifications.forEach(cert => {
          analytics.certifications[cert] = (analytics.certifications[cert] || 0) + 1;
        });
      }
    });

    return analytics;
  }
}

module.exports = new QRCodeService();
