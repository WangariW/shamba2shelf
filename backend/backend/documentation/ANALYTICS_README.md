# Analytics API Documentation

The Analytics API provides comprehensive business intelligence and reporting functionality for the Shamba2Shelf platform, including sales metrics, inventory analytics, performance monitoring, and custom report generation.

## Authentication

All analytics endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
/api/v1/analytics
```

## Dashboard

### Get Dashboard Data

Retrieve comprehensive dashboard data including key metrics and trends.

**Endpoint:** `GET /dashboard`  
**Access:** Admin, Superadmin

**Query Parameters:**
- `dateRange` - Number of days to include (default: 30)

**Response:**
```json
{
  "status": "success",
  "data": {
    "dashboard": {
      "summary": {
        "totalRevenue": 1250000,
        "totalOrders": 2845,
        "averageOrderValue": 439.37,
        "inventoryValue": 850000,
        "activeUsers": 1234
      },
      "trends": {
        "sales": [...],
        "revenueGrowth": 15.5,
        "orderGrowth": 12.3
      },
      "inventory": {
        "score": 85,
        "status": "good",
        "lowStockPercentage": 8.5,
        "expiringPercentage": 3.2
      },
      "performance": {
        "userGrowthRate": 18.7,
        "systemHealthScore": 96.5,
        "deliverySuccessRate": 94.2,
        "customerSatisfactionIndex": 4.3,
        "revenuePerUser": 1013.45
      }
    }
  }
}
```

## Metrics Endpoints

### Sales Metrics

Get sales performance metrics over time.

**Endpoint:** `GET /sales`  
**Access:** Admin, Superadmin

**Query Parameters:**
- `period` - Time period (daily, weekly, monthly, yearly)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `limit` - Number of records (default: 50)

**Response:**
```json
{
  "status": "success",
  "results": 30,
  "data": {
    "salesMetrics": [
      {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
        "date": "2024-01-15T00:00:00.000Z",
        "period": "daily",
        "totalOrders": 45,
        "totalRevenue": 18750,
        "totalQuantitySold": 1250,
        "averageOrderValue": 416.67,
        "ordersByStatus": {
          "pending": 5,
          "confirmed": 12,
          "in_transit": 8,
          "delivered": 18,
          "cancelled": 2
        },
        "topProducts": [
          {
            "productId": "64a7b8c9d1e2f3g4h5i6j7k9",
            "name": "Premium Coffee Beans",
            "quantitySold": 150,
            "revenue": 7500
          }
        ],
        "topFarmers": [
          {
            "farmerId": "64a7b8c9d1e2f3g4h5i6j7k10",
            "name": "Green Valley Farm",
            "orderCount": 8,
            "revenue": 4200
          }
        ],
        "regionBreakdown": [
          {
            "region": "Nairobi",
            "orderCount": 25,
            "revenue": 12500,
            "averageOrderValue": 500
          }
        ]
      }
    ]
  }
}
```

### Inventory Metrics

Get inventory health and stock level metrics.

**Endpoint:** `GET /inventory`  
**Access:** Admin, Superadmin, Farmer

**Query Parameters:**
- `period` - Time period (daily, weekly, monthly)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `limit` - Number of records (default: 50)

**Response:**
```json
{
  "status": "success",
  "results": 30,
  "data": {
    "inventoryMetrics": [
      {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
        "date": "2024-01-15T00:00:00.000Z",
        "period": "daily",
        "totalProducts": 456,
        "totalValue": 850000,
        "lowStockProducts": [
          {
            "productId": "64a7b8c9d1e2f3g4h5i6j7k9",
            "name": "Coffee Beans - Grade A",
            "currentStock": 15,
            "minimumThreshold": 50,
            "farmerId": "64a7b8c9d1e2f3g4h5i6j7k10"
          }
        ],
        "expiringProducts": [
          {
            "productId": "64a7b8c9d1e2f3g4h5i6j7k11",
            "name": "Fresh Mangoes",
            "quantity": 25,
            "expiryDate": "2024-01-18T00:00:00.000Z",
            "daysUntilExpiry": 3,
            "farmerId": "64a7b8c9d1e2f3g4h5i6j7k12"
          }
        ],
        "categoryBreakdown": [
          {
            "category": "Coffee",
            "productCount": 85,
            "totalQuantity": 2150,
            "totalValue": 320000,
            "averagePrice": 148.84
          }
        ],
        "turnoverRate": 15.5,
        "wasteMetrics": {
          "expiredProducts": 8,
          "wastedQuantity": 125,
          "wastedValue": 6250,
          "wastePercentage": 2.3
        },
        "stockHealth": {
          "score": 85,
          "status": "good",
          "lowStockPercentage": 8.5,
          "expiringPercentage": 3.2
        }
      }
    ]
  }
}
```

### Performance Metrics

Get system and business performance metrics.

**Endpoint:** `GET /performance`  
**Access:** Admin, Superadmin

**Response:**
```json
{
  "status": "success",
  "results": 30,
  "data": {
    "performanceMetrics": [
      {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
        "date": "2024-01-15T00:00:00.000Z",
        "period": "daily",
        "userMetrics": {
          "totalUsers": 2500,
          "activeUsers": 1234,
          "newRegistrations": 45,
          "userRetentionRate": 78.5,
          "farmersCount": 850,
          "buyersCount": 1650
        },
        "systemMetrics": {
          "apiResponseTime": 250,
          "uptime": 99.9,
          "errorRate": 0.02,
          "successfulTransactions": 2840,
          "failedTransactions": 5
        },
        "deliveryMetrics": {
          "totalDeliveries": 150,
          "onTimeDeliveries": 142,
          "lateDeliveries": 6,
          "failedDeliveries": 2,
          "averageDeliveryTime": 2.5,
          "onTimePercentage": 94.7
        },
        "qualityMetrics": {
          "averageRating": 4.2,
          "totalReviews": 1850,
          "qualityComplaints": 12,
          "resolvedComplaints": 10,
          "customerSatisfactionScore": 85
        },
        "financialMetrics": {
          "totalTransactionValue": 1250000,
          "platformCommission": 62500,
          "averageTransactionValue": 439.37,
          "refundsIssued": 8,
          "refundAmount": 3200
        },
        "kpis": {
          "userGrowthRate": 18.7,
          "systemHealthScore": 96.5,
          "deliverySuccessRate": 94.2,
          "customerSatisfactionIndex": 85,
          "revenuePerUser": 1013.45
        }
      }
    ]
  }
}
```

### User Analytics

Get detailed user behavior and engagement analytics.

**Endpoint:** `GET /users`  
**Access:** Admin, Superadmin

**Query Parameters:**
- `userId` - Filter by specific user ID
- `userType` - Filter by user type (farmer, buyer)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `limit` - Number of records (default: 50)

**Response:**
```json
{
  "status": "success",
  "results": 25,
  "data": {
    "userAnalytics": [
      {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
        "userId": "64a7b8c9d1e2f3g4h5i6j7k9",
        "userType": "farmer",
        "date": "2024-01-15T00:00:00.000Z",
        "sessionData": {
          "loginCount": 8,
          "totalSessionTime": 14400,
          "averageSessionTime": 1800,
          "lastLoginDate": "2024-01-15T14:30:00.000Z",
          "deviceInfo": {
            "browser": "Chrome",
            "os": "Android",
            "deviceType": "mobile"
          },
          "locationData": {
            "country": "Kenya",
            "region": "Nairobi",
            "city": "Nairobi"
          }
        },
        "activityMetrics": {
          "ordersPlaced": 0,
          "ordersReceived": 12,
          "productsListed": 5,
          "productsViewed": 45,
          "searchesPerformed": 23,
          "messagesExchanged": 8
        },
        "performanceMetrics": {
          "averageResponseTime": 2.5,
          "completionRate": 95.5,
          "cancellationRate": 4.5,
          "rating": 4.3,
          "totalEarnings": 8500,
          "totalSpent": 0
        },
        "engagementScore": 78
      }
    ]
  }
}
```

## Report Management

### Create Custom Report

Generate a custom analytics report.

**Endpoint:** `POST /reports`  
**Access:** Admin, Superadmin

**Request Body:**
```json
{
  "title": "Monthly Sales Report - January 2024",
  "type": "sales",
  "dateRange": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  },
  "filters": {
    "regions": ["Nairobi", "Mombasa"],
    "categories": ["Coffee", "Tea"],
    "status": ["delivered", "completed"]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "report": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "title": "Monthly Sales Report - January 2024",
      "type": "sales",
      "dateRange": {...},
      "filters": {...},
      "data": {...},
      "insights": [
        {
          "metric": "Total Revenue",
          "value": 450000,
          "trend": "increasing",
          "percentage": 15.5,
          "description": "Total revenue of KES 450,000 generated during January 2024"
        }
      ],
      "charts": [
        {
          "type": "line",
          "title": "Revenue Trend",
          "data": [...],
          "config": {...}
        }
      ],
      "status": "completed",
      "generatedBy": "64a7b8c9d1e2f3g4h5i6j7k9",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

### Get All Reports

Retrieve all generated reports with filtering and pagination.

**Endpoint:** `GET /reports`  
**Access:** Admin, Superadmin

**Query Parameters:**
- `type` - Filter by report type
- `status` - Filter by report status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (default: -createdAt)

### Get Report Details

Get detailed information about a specific report.

**Endpoint:** `GET /reports/:id`  
**Access:** Admin, Superadmin

### Update Report

Update report information (title, filters, schedule).

**Endpoint:** `PUT /reports/:id`  
**Access:** Admin, Superadmin

### Delete Report

Delete a report.

**Endpoint:** `DELETE /reports/:id`  
**Access:** Admin, Superadmin

## Analytics Insights

### Get Top Performers

Get top performing farmers, buyers, or products.

**Endpoint:** `GET /top-performers`  
**Access:** Admin, Superadmin

**Query Parameters:**
- `type` - Type of performers (farmers, buyers, products) - required
- `period` - Time period (daily, weekly, monthly)
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "status": "success",
  "results": 10,
  "data": {
    "topPerformers": [
      {
        "productId": "64a7b8c9d1e2f3g4h5i6j7k8",
        "name": "Premium Coffee Beans",
        "quantitySold": 500,
        "revenue": 25000
      }
    ],
    "period": "monthly",
    "date": "2024-01-15T00:00:00.000Z"
  }
}
```

### Get Regional Analytics

Get performance analytics broken down by region.

**Endpoint:** `GET /regional`  
**Access:** Admin, Superadmin

**Query Parameters:**
- `period` - Time period (daily, weekly, monthly)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Response:**
```json
{
  "status": "success",
  "results": 8,
  "data": {
    "regionalAnalytics": [
      {
        "region": "Nairobi",
        "totalOrders": 450,
        "totalRevenue": 225000,
        "averageOrderValue": 500,
        "periods": [
          {
            "date": "2024-01-15T00:00:00.000Z",
            "orderCount": 45,
            "revenue": 22500,
            "averageOrderValue": 500
          }
        ]
      }
    ]
  }
}
```

### Get Category Analytics

Get analytics broken down by product categories.

**Endpoint:** `GET /categories`  
**Access:** Admin, Superadmin, Farmer

**Query Parameters:**
- `period` - Time period (daily, weekly, monthly)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Response:**
```json
{
  "status": "success",
  "results": 12,
  "data": {
    "categoryAnalytics": [
      {
        "category": "Coffee",
        "totalProducts": 85,
        "totalQuantity": 2150,
        "totalValue": 320000,
        "averagePrice": 148.84,
        "periods": [
          {
            "date": "2024-01-15T00:00:00.000Z",
            "productCount": 85,
            "totalQuantity": 215,
            "totalValue": 32000,
            "averagePrice": 148.84
          }
        ]
      }
    ]
  }
}
```

## Metrics Generation

### Generate Metrics

Manually trigger metrics generation for a specific time period.

**Endpoint:** `POST /generate`  
**Access:** Admin, Superadmin

**Request Body:**
```json
{
  "type": "daily",
  "date": "2024-01-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Daily metrics generated successfully",
  "data": {
    "generatedFor": "2024-01-15T00:00:00.000Z"
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

## Enums and Constants

### Report Types
- `sales` - Sales performance report
- `inventory` - Inventory analysis report
- `performance` - System performance report
- `user` - User behavior report
- `financial` - Financial metrics report
- `custom` - Custom analytics report

### Time Periods
- `daily` - Daily metrics
- `weekly` - Weekly metrics
- `monthly` - Monthly metrics
- `yearly` - Yearly metrics

### Chart Types
- `line` - Line chart
- `bar` - Bar chart
- `pie` - Pie chart
- `area` - Area chart
- `scatter` - Scatter plot

### Report Status
- `pending` - Report generation pending
- `generating` - Report being generated
- `completed` - Report completed successfully
- `failed` - Report generation failed

## Usage Examples

### Dashboard Data Retrieval

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/dashboard?dateRange=30" \
  -H "Authorization: Bearer <token>"
```

### Generate Custom Sales Report

```bash
curl -X POST http://localhost:5000/api/v1/analytics/reports \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q1 2024 Sales Report",
    "type": "sales",
    "dateRange": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.999Z"
    },
    "filters": {
      "regions": ["Nairobi", "Mombasa"],
      "categories": ["Coffee", "Tea"]
    }
  }'
```

### Get Top Performing Products

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/top-performers?type=products&period=monthly&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Retrieve Inventory Health Metrics

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/inventory?period=weekly&limit=4" \
  -H "Authorization: Bearer <token>"
```