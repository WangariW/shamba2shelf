const axios = require('axios');
const AppError = require('../utils/AppError');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

class PriceService {
  constructor() {
    this.exchangeRates = new Map();
    this.marketPrices = new Map();
    this.lastUpdate = null;
    this.updateInterval = 6 * 60 * 60 * 1000; // 6 hours
    
    this.exchangeRates.set('USD', 150.0); // Default KES to USD
    this.exchangeRates.set('EUR', 160.0); // Default KES to EUR
    
    this.initializeMarketData();
  }

  async initializeMarketData() {
    try {
      await this.updateExchangeRates();
      await this.updateMarketPrices();
      
      setInterval(async () => {
        await this.updateExchangeRates();
        await this.updateMarketPrices();
      }, this.updateInterval);
      
    } catch (error) {
      console.error('Failed to initialize market data:', error.message);
    }
  }

  async updateExchangeRates() {
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/KES`,
        { timeout: 10000 }
      );
      
      if (response.data && response.data.rates) {
        this.exchangeRates.set('USD', 1 / response.data.rates.USD);
        this.exchangeRates.set('EUR', 1 / response.data.rates.EUR);
        this.lastUpdate = new Date();
      }
    } catch (error) {
      console.warn('Failed to update exchange rates, using cached values:', error.message);
    }
  }

  async updateMarketPrices() {
    try {
      const platformPrices = await this.calculatePlatformAverages();
      
      const internationalPrices = await this.getInternationalPrices();
      
      const exchangePrices = await this.getNairobiExchangePrices();
      
      this.marketPrices.set('platform', platformPrices);
      this.marketPrices.set('international', internationalPrices);
      this.marketPrices.set('exchange', exchangePrices);
      
    } catch (error) {
      console.warn('Failed to update market prices:', error.message);
    }
  }

  async getCurrentMarketPrices() {
    const platformPrices = this.marketPrices.get('platform') || {};
    const internationalPrices = this.marketPrices.get('international') || {};
    const exchangePrices = this.marketPrices.get('exchange') || {};
    
    const recommendations = {};
    
    const varieties = ['SL28', 'SL34', 'Ruiru 11', 'Batian', 'Blue Mountain', 'K7', 'Kent'];
    
    varieties.forEach(variety => {
      const platformAvg = platformPrices[variety] || 800;
      const internationalEquiv = internationalPrices[variety] || 900;
      const exchangePrice = exchangePrices[variety] || 750;
      
      const basePrice = (platformAvg * 0.4 + internationalEquiv * 0.3 + exchangePrice * 0.3);
      
      recommendations[variety] = {
        variety,
        basePrice: Math.round(basePrice),
        priceRange: {
          minimum: Math.round(basePrice * 0.8),
          recommended: Math.round(basePrice),
          premium: Math.round(basePrice * 1.3)
        },
        marketCondition: this.assessMarketCondition(variety, basePrice),
        trends: this.calculatePriceTrends(variety),
        sources: {
          platform: Math.round(platformAvg),
          international: Math.round(internationalEquiv),
          exchange: Math.round(exchangePrice)
        }
      };
    });
    
    return {
      lastUpdated: this.lastUpdate || new Date(),
      exchangeRates: Object.fromEntries(this.exchangeRates),
      varietyRecommendations: recommendations,
      marketSummary: this.getMarketSummary(recommendations)
    };
  }

  async calculatePlatformAverages() {
    try {
      const avgPrices = await Product.aggregate([
        {
          $match: {
            status: 'Available',
            price: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: '$variety',
            averagePrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      const platformPrices = {};
      avgPrices.forEach(item => {
        platformPrices[item._id] = item.averagePrice;
      });
      
      return platformPrices;
    } catch (error) {
      console.error('Error calculating platform averages:', error);
      return {};
    }
  }

  async getInternationalPrices() {
    const basePrices = {
      'SL28': 950,
      'SL34': 920,
      'Ruiru 11': 800,
      'Batian': 850,
      'Blue Mountain': 1200,
      'K7': 780,
      'Kent': 760
    };
    
    const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
    
    const internationalPrices = {};
    Object.keys(basePrices).forEach(variety => {
      internationalPrices[variety] = Math.round(
        basePrices[variety] * (1 + fluctuation)
      );
    });
    
    return internationalPrices;
  }

  async getNairobiExchangePrices() {
    const basePrices = {
      'SL28': 850,
      'SL34': 820,
      'Ruiru 11': 720,
      'Batian': 750,
      'Blue Mountain': 1000,
      'K7': 700,
      'Kent': 680
    };
    
    return basePrices;
  }

  assessMarketCondition(variety, currentPrice) {
    const historicalAvg = 800;
    const difference = (currentPrice - historicalAvg) / historicalAvg;
    
    if (difference > 0.1) return 'Strong';
    if (difference > 0.05) return 'Good';
    if (difference > -0.05) return 'Stable';
    if (difference > -0.1) return 'Weak';
    return 'Poor';
  }

  calculatePriceTrends(variety) {
    const trends = ['Rising', 'Stable', 'Declining'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      direction: trend,
      percentage: Math.round((Math.random() - 0.5) * 20), // ±10%
      period: '30 days'
    };
  }

  getMarketSummary(recommendations) {
    const varieties = Object.values(recommendations);
    const avgPrice = varieties.reduce((sum, v) => sum + v.basePrice, 0) / varieties.length;
    
    const strongMarkets = varieties.filter(v => v.marketCondition === 'Strong').length;
    const goodMarkets = varieties.filter(v => v.marketCondition === 'Good').length;
    
    return {
      averagePrice: Math.round(avgPrice),
      marketStrength: strongMarkets + goodMarkets > varieties.length / 2 ? 'Positive' : 'Mixed',
      totalVarieties: varieties.length,
      strongMarkets,
      recommendation: this.getOverallRecommendation(varieties)
    };
  }

  getOverallRecommendation(varieties) {
    const strongCount = varieties.filter(v => v.marketCondition === 'Strong').length;
    const totalCount = varieties.length;
    
    if (strongCount / totalCount > 0.6) {
      return 'Excellent time to sell premium varieties';
    } else if (strongCount / totalCount > 0.3) {
      return 'Good market conditions for quality coffee';
    } else {
      return 'Focus on value-added processing and direct sales';
    }
  }

  async getFarmerPricingRecommendation(farmerId) {
    try {
      const farmerProducts = await Product.find({ farmerId })
        .select('variety price qualityScore averageRating createdAt status');
      
      const salesData = await Order.aggregate([
        {
          $match: {
            farmerId: new mongoose.Types.ObjectId(farmerId),
            status: { $in: ['Delivered', 'Completed'] }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $group: {
            _id: '$product.variety',
            avgSalePrice: { $avg: '$totalAmount' },
            totalSales: { $sum: 1 },
            avgQuantity: { $avg: '$quantity' }
          }
        }
      ]);
      
      const marketPrices = await this.getCurrentMarketPrices();
      
      const personalizedRecommendations = {};
      
      farmerProducts.forEach(product => {
        const variety = product.variety;
        const marketRec = marketPrices.varietyRecommendations[variety];
        const salesHistory = salesData.find(s => s._id === variety);
        
        if (marketRec) {
          const qualityMultiplier = product.qualityScore ? 
            Math.max(0.8, Math.min(1.2, product.qualityScore / 100)) : 1.0;
          
          const ratingMultiplier = product.averageRating ? 
            Math.max(0.9, Math.min(1.1, product.averageRating / 5)) : 1.0;
          
          const adjustmentFactor = qualityMultiplier * ratingMultiplier;
          
          personalizedRecommendations[variety] = {
            ...marketRec,
            personalizedPrice: Math.round(marketRec.basePrice * adjustmentFactor),
            personalizedRange: {
              minimum: Math.round(marketRec.priceRange.minimum * adjustmentFactor),
              recommended: Math.round(marketRec.priceRange.recommended * adjustmentFactor),
              premium: Math.round(marketRec.priceRange.premium * adjustmentFactor)
            },
            qualityScore: product.qualityScore,
            averageRating: product.averageRating,
            salesHistory: salesHistory || null,
            adjustmentFactor: Math.round(adjustmentFactor * 100) / 100
          };
        }
      });
      
      return {
        farmerId,
        lastUpdated: new Date(),
        personalizedRecommendations,
        marketContext: marketPrices.marketSummary,
        farmerSummary: {
          totalProducts: farmerProducts.length,
          activeProducts: farmerProducts.filter(p => p.status === 'Available').length,
          avgQualityScore: farmerProducts.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / farmerProducts.length,
          totalSales: salesData.reduce((sum, s) => sum + s.totalSales, 0)
        }
      };
      
    } catch (error) {
      throw new AppError(`Failed to get farmer pricing recommendations: ${error.message}`, 500);
    }
  }

  async calculateOptimalPricing(productData) {
    try {
      const {
        variety,
        qualityScore = 75,
        processingMethod = 'Washed',
        altitudeGrown = 1500,
        certifications = [],
        quantity = 100
      } = productData;
      
      const marketPrices = await this.getCurrentMarketPrices();
      const baseRec = marketPrices.varietyRecommendations[variety];
      
      if (!baseRec) {
        throw new AppError(`No market data available for variety: ${variety}`, 404);
      }
      
      let basePrice = baseRec.basePrice;
      
      const qualityMultiplier = Math.max(0.7, Math.min(1.3, qualityScore / 75));
      
      const processingMultipliers = {
        'Natural': 1.15,
        'Honey': 1.10,
        'Washed': 1.0,
        'Semi-washed': 0.95,
        'Pulped Natural': 1.05
      };
      const processingMultiplier = processingMultipliers[processingMethod] || 1.0;
      
      const altitudeMultiplier = altitudeGrown >= 1800 ? 1.1 : 
                                altitudeGrown >= 1600 ? 1.05 :
                                altitudeGrown >= 1400 ? 1.0 : 0.95;
      
      const certificationPremium = certifications.length * 0.05; // 5% per certification
      
      const quantityMultiplier = quantity >= 500 ? 0.95 : // Bulk discount
                                quantity <= 50 ? 1.05 :  // Small batch premium
                                1.0;
      
      const totalMultiplier = qualityMultiplier * 
                             processingMultiplier * 
                             altitudeMultiplier * 
                             (1 + certificationPremium) * 
                             quantityMultiplier;
      
      const optimalPrice = Math.round(basePrice * totalMultiplier);
      
      return {
        variety,
        basePrice: baseRec.basePrice,
        optimalPrice,
        priceRange: {
          minimum: Math.round(optimalPrice * 0.85),
          recommended: optimalPrice,
          premium: Math.round(optimalPrice * 1.15)
        },
        adjustments: {
          quality: {
            score: qualityScore,
            multiplier: Math.round(qualityMultiplier * 100) / 100
          },
          processing: {
            method: processingMethod,
            multiplier: Math.round(processingMultiplier * 100) / 100
          },
          altitude: {
            meters: altitudeGrown,
            multiplier: Math.round(altitudeMultiplier * 100) / 100
          },
          certifications: {
            count: certifications.length,
            premium: Math.round(certificationPremium * 100) / 100
          },
          quantity: {
            kg: quantity,
            multiplier: Math.round(quantityMultiplier * 100) / 100
          }
        },
        totalAdjustment: Math.round(totalMultiplier * 100) / 100,
        marketCondition: baseRec.marketCondition,
        recommendations: this.generatePricingRecommendations(optimalPrice, baseRec.marketCondition)
      };
      
    } catch (error) {
      throw new AppError(`Failed to calculate optimal pricing: ${error.message}`, 500);
    }
  }

  generatePricingRecommendations(price, marketCondition) {
    const recommendations = [];
    
    if (marketCondition === 'Strong') {
      recommendations.push('Market conditions are favorable - consider premium pricing');
      recommendations.push('High demand for quality coffee - emphasize unique characteristics');
    } else if (marketCondition === 'Good') {
      recommendations.push('Stable market - stick to recommended pricing');
      recommendations.push('Focus on consistent quality and customer relationships');
    } else if (marketCondition === 'Weak') {
      recommendations.push('Consider competitive pricing to maintain sales');
      recommendations.push('Emphasize value proposition and direct relationships');
    }
    
    if (price > 1000) {
      recommendations.push('Premium pricing - ensure exceptional quality and marketing');
    } else if (price < 600) {
      recommendations.push('Consider value-added processing to increase margins');
    }
    
    return recommendations;
  }

  async getMarketAnalytics() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const priceTrends = await Product.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: 'Available'
          }
        },
        {
          $group: {
            _id: {
              variety: '$variety',
              week: { $week: '$createdAt' }
            },
            avgPrice: { $avg: '$price' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.week': 1 }
        }
      ]);
      
      const volumeTrends = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ['Delivered', 'Completed'] }
          }
        },
        {
          $group: {
            _id: {
              week: { $week: '$createdAt' }
            },
            totalVolume: { $sum: '$quantity' },
            totalValue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.week': 1 }
        }
      ]);
      
      return {
        priceTrends,
        volumeTrends,
        marketSummary: await this.getCurrentMarketPrices(),
        generatedAt: new Date()
      };
      
    } catch (error) {
      throw new AppError(`Failed to get market analytics: ${error.message}`, 500);
    }
  }
}

module.exports = new PriceService();
