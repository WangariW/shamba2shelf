# Logistics API Documentation

The Logistics API provides comprehensive logistics and delivery management functionality for the Shamba2Shelf platform, including order tracking, warehouse management, fleet management, and route optimization.

## Authentication

All logistics endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
/api/v1/logistics
```

## Tracking Management

### Create Tracking Order

Create a new tracking order for delivery.

**Endpoint:** `POST /tracking`  
**Access:** Admin, Superadmin, Logistics

**Request Body:**
```json
{
  "orderId": "64a7b8c9d1e2f3g4h5i6j7k8",
  "pickupLocation": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Kigali Street, Nairobi"
  },
  "deliveryLocation": {
    "lat": -1.3032,
    "lng": 36.8441,
    "address": "Mombasa Road, Nairobi"
  },
  "options": {
    "priority": "normal",
    "instructions": "Handle with care",
    "vehicleType": "van"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "tracking": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
      "orderId": "64a7b8c9d1e2f3g4h5i6j7k8",
      "trackingNumber": "TRK1639234567ABCDE",
      "currentLocation": {
        "lat": -1.2921,
        "lng": 36.8219,
        "address": "Kigali Street, Nairobi"
      },
      "status": "pending",
      "estimatedDelivery": "2024-01-15T14:30:00.000Z",
      "priority": "normal",
      "cost": {
        "totalCost": 450
      }
    }
  }
}
```

### Get All Tracking Orders

Retrieve all tracking orders with filtering and pagination.

**Endpoint:** `GET /tracking`  
**Access:** All authenticated users

**Query Parameters:**
- `status` - Filter by tracking status
- `priority` - Filter by priority level
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (default: -createdAt)

**Response:**
```json
{
  "status": "success",
  "results": 25,
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": {
    "trackingOrders": [...]
  }
}
```

### Get Tracking Information

Get detailed tracking information by tracking number.

**Endpoint:** `GET /tracking/:trackingNumber`  
**Access:** All authenticated users

**Response:**
```json
{
  "status": "success",
  "data": {
    "tracking": {
      "trackingNumber": "TRK1639234567ABCDE",
      "currentStatus": "in_transit",
      "currentLocation": {
        "lat": -1.2956,
        "lng": 36.8330,
        "address": "Uhuru Highway, Nairobi",
        "timestamp": "2024-01-15T12:30:00.000Z"
      },
      "estimatedDelivery": "2024-01-15T14:30:00.000Z",
      "history": [
        {
          "location": {
            "lat": -1.2921,
            "lng": 36.8219,
            "address": "Kigali Street, Nairobi"
          },
          "status": "picked_up",
          "timestamp": "2024-01-15T10:00:00.000Z",
          "notes": "Package picked up successfully"
        }
      ],
      "order": {...},
      "driver": {...},
      "vehicleInfo": {...},
      "cost": {...}
    }
  }
}
```

### Update Tracking Location

Update the current location and status of a tracking order.

**Endpoint:** `PUT /tracking/:trackingNumber/location`  
**Access:** Admin, Superadmin, Logistics, Driver

**Request Body:**
```json
{
  "lat": -1.2956,
  "lng": 36.8330,
  "address": "Uhuru Highway, Nairobi",
  "status": "in_transit",
  "notes": "Package in transit, on schedule"
}
```

### Assign Vehicle to Order

Assign a vehicle to a tracking order.

**Endpoint:** `POST /tracking/:trackingId/assign-vehicle`  
**Access:** Admin, Superadmin, Logistics

**Request Body:**
```json
{
  "vehicleType": "van"
}
```

## Delivery Management

### Get Delivery Estimate

Calculate delivery time and cost estimate.

**Endpoint:** `POST /estimate`  
**Access:** All authenticated users

**Request Body:**
```json
{
  "pickup": {
    "lat": -1.2921,
    "lng": 36.8219
  },
  "delivery": {
    "lat": -1.3032,
    "lng": 36.8441
  },
  "weight": 15.5,
  "priority": "normal",
  "vehicleType": "van"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "estimate": {
      "distance": 12.5,
      "estimatedDuration": 45,
      "estimatedDelivery": "2024-01-15T14:30:00.000Z",
      "cost": {
        "baseFee": 200,
        "distanceFee": 187.5,
        "weightFee": 27.5,
        "priorityFee": 0,
        "totalCost": 415
      },
      "availableVehicles": [...]
    }
  }
}
```

### Optimize Delivery Routes

Optimize multiple delivery routes for efficiency.

**Endpoint:** `POST /optimize-routes`  
**Access:** Admin, Superadmin, Logistics

**Request Body:**
```json
{
  "deliveries": [
    {
      "orderId": "64a7b8c9d1e2f3g4h5i6j7k8",
      "deliveryLocation": {
        "lat": -1.3032,
        "lng": 36.8441
      }
    },
    {
      "orderId": "64a7b8c9d1e2f3g4h5i6j7k9",
      "deliveryLocation": {
        "lat": -1.2884,
        "lng": 36.8233
      }
    }
  ]
}
```

## Warehouse Management

### Create Warehouse

Create a new warehouse.

**Endpoint:** `POST /warehouses`  
**Access:** Admin, Superadmin

**Request Body:**
```json
{
  "name": "Nairobi Central Warehouse",
  "location": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Industrial Area, Nairobi"
  },
  "capacity": {
    "total": 10000,
    "available": 10000,
    "unit": "kg"
  },
  "operatingHours": {
    "open": "06:00",
    "close": "18:00"
  },
  "contactInfo": {
    "phone": "+254700123456",
    "email": "warehouse@shamba2shelf.com",
    "manager": "John Doe"
  },
  "facilities": [
    {
      "type": "cold_storage",
      "capacity": 2000,
      "temperature": {
        "min": 2,
        "max": 8
      }
    }
  ]
}
```

### Get All Warehouses

Retrieve all warehouses with filtering and pagination.

**Endpoint:** `GET /warehouses`  
**Access:** All authenticated users

### Get Warehouse Details

Get detailed information about a specific warehouse.

**Endpoint:** `GET /warehouses/:id`  
**Access:** All authenticated users

### Update Warehouse

Update warehouse information.

**Endpoint:** `PUT /warehouses/:id`  
**Access:** Admin, Superadmin

### Delete Warehouse

Delete a warehouse.

**Endpoint:** `DELETE /warehouses/:id`  
**Access:** Admin, Superadmin

### Manage Warehouse Inventory

Add or remove inventory from a warehouse.

**Endpoint:** `POST /warehouses/:warehouseId/inventory`  
**Access:** Admin, Superadmin, Warehouse

**Request Body:**
```json
{
  "productId": "64a7b8c9d1e2f3g4h5i6j7k8",
  "quantity": 100,
  "operation": "add"
}
```

## Fleet Management

### Create Fleet Vehicle

Add a new vehicle to the fleet.

**Endpoint:** `POST /fleet`  
**Access:** Admin, Superadmin

**Request Body:**
```json
{
  "vehicleId": "VEH001",
  "plateNumber": "KCA 123A",
  "type": "van",
  "capacity": {
    "weight": 1000,
    "volume": 15,
    "unit": "kg"
  },
  "fuelInfo": {
    "type": "diesel",
    "consumption": 8.5
  },
  "insurance": {
    "provider": "Insurance Company",
    "policyNumber": "POL123456",
    "expiryDate": "2024-12-31T00:00:00.000Z"
  }
}
```

### Get All Fleet Vehicles

Retrieve all fleet vehicles.

**Endpoint:** `GET /fleet`  
**Access:** All authenticated users

### Get Available Vehicles

Get vehicles available for assignment.

**Endpoint:** `GET /fleet/available`  
**Access:** All authenticated users

**Query Parameters:**
- `minCapacity` - Minimum weight capacity required
- `vehicleType` - Type of vehicle needed

### Get Fleet Vehicle Details

Get detailed information about a specific vehicle.

**Endpoint:** `GET /fleet/:id`  
**Access:** All authenticated users

### Update Fleet Vehicle

Update vehicle information.

**Endpoint:** `PUT /fleet/:id`  
**Access:** Admin, Superadmin

### Delete Fleet Vehicle

Remove a vehicle from the fleet.

**Endpoint:** `DELETE /fleet/:id`  
**Access:** Admin, Superadmin

## Reporting

### Generate Delivery Report

Generate a comprehensive delivery report.

**Endpoint:** `GET /reports/delivery`  
**Access:** Admin, Superadmin, Logistics

**Query Parameters:**
- `startDate` - Report start date (required)
- `endDate` - Report end date (required)
- `status` - Filter by delivery status
- `driverId` - Filter by driver

**Response:**
```json
{
  "status": "success",
  "data": {
    "report": {
      "totalDeliveries": 150,
      "completedDeliveries": 142,
      "averageDeliveryTime": 2.5,
      "totalRevenue": 67500,
      "averageCost": 450
    }
  }
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "status": "error",
  "message": "Detailed error message",
  "statusCode": 400
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Status Enums

### Tracking Status
- `pending` - Order pending pickup
- `picked_up` - Package picked up
- `in_transit` - Package in transit
- `out_for_delivery` - Out for delivery
- `delivered` - Successfully delivered
- `failed` - Delivery failed

### Priority Levels
- `low` - Low priority
- `normal` - Normal priority
- `high` - High priority  
- `urgent` - Urgent priority

### Vehicle Types
- `truck` - Truck
- `van` - Van
- `motorcycle` - Motorcycle
- `bicycle` - Bicycle

### Vehicle Status
- `available` - Available for assignment
- `in_use` - Currently in use
- `maintenance` - Under maintenance
- `out_of_service` - Out of service

## Usage Examples

### Complete Delivery Workflow

1. **Create tracking order:**
```bash
curl -X POST http://localhost:5000/api/v1/logistics/tracking \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "64a7b8c9d1e2f3g4h5i6j7k8",
    "pickupLocation": {"lat": -1.2921, "lng": 36.8219},
    "deliveryLocation": {"lat": -1.3032, "lng": 36.8441}
  }'
```

2. **Update location during transit:**
```bash
curl -X PUT http://localhost:5000/api/v1/logistics/tracking/TRK1639234567ABCDE/location \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -1.2956,
    "lng": 36.8330,
    "status": "in_transit"
  }'
```

3. **Track delivery:**
```bash
curl -X GET http://localhost:5000/api/v1/logistics/tracking/TRK1639234567ABCDE \
  -H "Authorization: Bearer <token>"
```