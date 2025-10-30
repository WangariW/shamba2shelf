const { Tracking, Warehouse, Fleet } = require('../models/Logistics');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const axios = require('axios');

class LogisticsService {
  constructor() {
    this.mapboxApiKey = process.env.MAPBOX_API_KEY;
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  async createTrackingOrder(orderId, pickupLocation, deliveryLocation, options = {}) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const existingTracking = await Tracking.findOne({ orderId });
      if (existingTracking) {
        throw new AppError('Tracking already exists for this order', 400);
      }

      const route = await this.calculateOptimalRoute(pickupLocation, deliveryLocation);
      
      const tracking = new Tracking({
        orderId,
        currentLocation: pickupLocation,
        route: {
          orderId,
          waypoints: [
            { ...pickupLocation, type: 'pickup' },
            { ...deliveryLocation, type: 'delivery' }
          ],
          estimatedDistance: route.distance,
          estimatedDuration: route.duration,
          optimizedRoute: route.waypoints
        },
        estimatedDelivery: new Date(Date.now() + route.duration * 60000),
        priority: options.priority || 'normal',
        deliveryInstructions: options.instructions || ''
      });

      await tracking.save();
      await this.assignVehicle(tracking._id, options.vehicleType);
      
      return tracking;
    } catch (error) {
      throw new AppError(`Failed to create tracking: ${error.message}`, 500);
    }
  }

  async calculateOptimalRoute(pickup, delivery, waypoints = []) {
    try {
      const coordinates = [
        [pickup.lng, pickup.lat],
        ...waypoints.map(wp => [wp.lng, wp.lat]),
        [delivery.lng, delivery.lat]
      ];

      if (this.mapboxApiKey) {
        const response = await axios.get(
          `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates.join(';')}`,
          {
            params: {
              access_token: this.mapboxApiKey,
              overview: 'full',
              steps: true,
              geometries: 'geojson'
            },
            timeout: 10000
          }
        );

        if (response.data.trips && response.data.trips[0]) {
          const trip = response.data.trips[0];
          return {
            distance: trip.distance / 1000,
            duration: trip.duration / 60,
            waypoints: trip.geometry.coordinates.map((coord, index) => ({
              lat: coord[1],
              lng: coord[0],
              sequence: index
            }))
          };
        }
      }

      const straightLineDistance = this.calculateHaversineDistance(
        pickup.lat, pickup.lng, delivery.lat, delivery.lng
      );
      
      return {
        distance: straightLineDistance * 1.3,
        duration: (straightLineDistance * 1.3) * 2,
        waypoints: [
          { lat: pickup.lat, lng: pickup.lng, sequence: 0 },
          { lat: delivery.lat, lng: delivery.lng, sequence: 1 }
        ]
      };
    } catch (error) {
      console.warn('Route calculation failed, using fallback:', error.message);
      
      const fallbackDistance = this.calculateHaversineDistance(
        pickup.lat, pickup.lng, delivery.lat, delivery.lng
      );
      
      return {
        distance: fallbackDistance * 1.3,
        duration: (fallbackDistance * 1.3) * 2,
        waypoints: [
          { lat: pickup.lat, lng: pickup.lng, sequence: 0 },
          { lat: delivery.lat, lng: delivery.lng, sequence: 1 }
        ]
      };
    }
  }

  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  async updateTrackingLocation(trackingNumber, lat, lng, address, status, notes) {
    try {
      const tracking = await Tracking.findOne({ trackingNumber });
      if (!tracking) {
        throw new AppError('Tracking not found', 404);
      }

      await tracking.updateLocation(lat, lng, address, status, notes);
      
      if (status === 'delivered') {
        tracking.actualDelivery = new Date();
        await Order.findByIdAndUpdate(tracking.orderId, { status: 'Delivered' });
      }

      return tracking;
    } catch (error) {
      throw new AppError(`Failed to update tracking: ${error.message}`, 500);
    }
  }

  async assignVehicle(trackingId, preferredType = null) {
    try {
      const tracking = await Tracking.findById(trackingId);
      if (!tracking) {
        throw new AppError('Tracking not found', 404);
      }

      const order = await Order.findById(tracking.orderId).populate('productId');
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const requiredCapacity = order.quantity;
      const query = {
        status: 'available',
        'capacity.weight': { $gte: requiredCapacity }
      };

      if (preferredType) {
        query.type = preferredType;
      }

      const availableVehicles = await Fleet.find(query).sort({ 'capacity.weight': 1 });
      
      if (availableVehicles.length === 0) {
        throw new AppError('No suitable vehicles available', 404);
      }

      const selectedVehicle = availableVehicles[0];
      
      tracking.vehicleInfo = {
        plateNumber: selectedVehicle.plateNumber,
        type: selectedVehicle.type,
        capacity: selectedVehicle.capacity.weight
      };

      selectedVehicle.status = 'in_use';
      await selectedVehicle.save();
      await tracking.save();

      return { tracking, vehicle: selectedVehicle };
    } catch (error) {
      throw new AppError(`Failed to assign vehicle: ${error.message}`, 500);
    }
  }

  async getDeliveryEstimate(pickup, delivery, weight, priority = 'normal', vehicleType = null) {
    try {
      const route = await this.calculateOptimalRoute(pickup, delivery);
      const baseTime = route.duration;
      
      const priorityMultiplier = {
        'urgent': 0.5,
        'high': 0.7,
        'normal': 1.0,
        'low': 1.3
      };

      const estimatedTime = baseTime * (priorityMultiplier[priority] || 1.0);
      const cost = this.calculateDeliveryCost(route.distance, weight, priority);

      return {
        distance: route.distance,
        estimatedDuration: estimatedTime,
        estimatedDelivery: new Date(Date.now() + estimatedTime * 60000),
        cost,
        availableVehicles: await this.getAvailableVehicles(weight, vehicleType)
      };
    } catch (error) {
      throw new AppError(`Failed to get delivery estimate: ${error.message}`, 500);
    }
  }

  calculateDeliveryCost(distance, weight, priority) {
    const baseFee = 200;
    const distanceFee = distance * 15;
    const weightFee = weight > 10 ? (weight - 10) * 5 : 0;
    const priorityMultiplier = {
      'urgent': 2.0,
      'high': 1.5,
      'normal': 1.0,
      'low': 0.8
    };

    const totalCost = (baseFee + distanceFee + weightFee) * (priorityMultiplier[priority] || 1.0);
    
    return {
      baseFee,
      distanceFee,
      weightFee,
      priorityFee: (baseFee + distanceFee) * ((priorityMultiplier[priority] || 1.0) - 1),
      totalCost: Math.round(totalCost)
    };
  }

  async getAvailableVehicles(minCapacity, vehicleType = null) {
    try {
      const query = {
        status: 'available',
        'capacity.weight': { $gte: minCapacity }
      };

      if (vehicleType) {
        query.type = vehicleType;
      }

      return await Fleet.find(query)
        .populate('driverId', 'name phone email')
        .sort({ 'capacity.weight': 1 });
    } catch (error) {
      throw new AppError(`Failed to get available vehicles: ${error.message}`, 500);
    }
  }

  async optimizeDeliveryRoutes(deliveries) {
    try {
      if (deliveries.length <= 1) return deliveries;

      const depot = { lat: -1.2921, lng: 36.8219 };
      const coordinates = [
        [depot.lng, depot.lat],
        ...deliveries.map(d => [d.deliveryLocation.lng, d.deliveryLocation.lat])
      ];

      if (this.mapboxApiKey && coordinates.length > 2) {
        try {
          const response = await axios.get(
            `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates.join(';')}`,
            {
              params: {
                access_token: this.mapboxApiKey,
                overview: 'full',
                roundtrip: true
              },
              timeout: 15000
            }
          );

          if (response.data.trips && response.data.trips[0]) {
            const trip = response.data.trips[0];
            const optimizedOrder = trip.waypoints
              .filter(wp => wp.waypoint_index > 0)
              .sort((a, b) => a.trips_index - b.trips_index)
              .map(wp => deliveries[wp.waypoint_index - 1]);

            return optimizedOrder;
          }
        } catch (error) {
          console.warn('Route optimization failed, using nearest neighbor:', error.message);
        }
      }

      return this.nearestNeighborOptimization(deliveries, depot);
    } catch (error) {
      throw new AppError(`Failed to optimize routes: ${error.message}`, 500);
    }
  }

  nearestNeighborOptimization(deliveries, start) {
    const optimized = [];
    const remaining = [...deliveries];
    let current = start;

    while (remaining.length > 0) {
      let nearest = null;
      let minDistance = Infinity;
      let nearestIndex = -1;

      remaining.forEach((delivery, index) => {
        const distance = this.calculateHaversineDistance(
          current.lat, current.lng,
          delivery.deliveryLocation.lat, delivery.deliveryLocation.lng
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearest = delivery;
          nearestIndex = index;
        }
      });

      if (nearest) {
        optimized.push(nearest);
        current = nearest.deliveryLocation;
        remaining.splice(nearestIndex, 1);
      }
    }

    return optimized;
  }

  async manageWarehouseInventory(warehouseId, productId, quantity, operation) {
    try {
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        throw new AppError('Warehouse not found', 404);
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (operation === 'add' && warehouse.capacity.available < quantity) {
        throw new AppError('Insufficient warehouse capacity', 400);
      }

      await warehouse.updateInventory(productId, quantity, operation);
      
      return {
        warehouse,
        updatedInventory: warehouse.inventory.find(item => 
          item.productId.toString() === productId.toString()
        )
      };
    } catch (error) {
      throw new AppError(`Failed to manage inventory: ${error.message}`, 500);
    }
  }

  async getTrackingHistory(trackingNumber) {
    try {
      const tracking = await Tracking.findOne({ trackingNumber })
        .populate('orderId')
        .populate('driverId', 'name phone email');

      if (!tracking) {
        throw new AppError('Tracking not found', 404);
      }

      return {
        trackingNumber: tracking.trackingNumber,
        currentStatus: tracking.status,
        currentLocation: tracking.currentLocation,
        estimatedDelivery: tracking.estimatedDelivery,
        actualDelivery: tracking.actualDelivery,
        history: tracking.trackingHistory.sort((a, b) => b.timestamp - a.timestamp),
        order: tracking.orderId,
        driver: tracking.driverId,
        vehicleInfo: tracking.vehicleInfo,
        cost: tracking.cost
      };
    } catch (error) {
      throw new AppError(`Failed to get tracking history: ${error.message}`, 500);
    }
  }

  async generateDeliveryReport(startDate, endDate, options = {}) {
    try {
      const matchStage = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      if (options.status) matchStage.status = options.status;
      if (options.driverId) matchStage.driverId = options.driverId;

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: '$order' },
        {
          $group: {
            _id: null,
            totalDeliveries: { $sum: 1 },
            completedDeliveries: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            averageDeliveryTime: {
              $avg: {
                $cond: [
                  { $and: ['$actualDelivery', '$createdAt'] },
                  { $subtract: ['$actualDelivery', '$createdAt'] },
                  null
                ]
              }
            },
            totalRevenue: { $sum: '$cost.totalCost' },
            averageCost: { $avg: '$cost.totalCost' }
          }
        }
      ];

      const results = await Tracking.aggregate(pipeline);
      
      return results[0] || {
        totalDeliveries: 0,
        completedDeliveries: 0,
        averageDeliveryTime: 0,
        totalRevenue: 0,
        averageCost: 0
      };
    } catch (error) {
      throw new AppError(`Failed to generate delivery report: ${error.message}`, 500);
    }
  }
}

module.exports = new LogisticsService();
