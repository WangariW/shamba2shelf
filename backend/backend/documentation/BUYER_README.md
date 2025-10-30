# Buyer System Documentation

## Overview

The Buyer system manages individual consumers, retailers, wholesalers, restaurants, cafes, exporters, and processing companies that purchase coffee from farmers in the Shamba2Shelf platform. This system handles buyer profiles, purchase preferences, order history, analytics, and personalized recommendations.

## Table of Contents

1. [Model Structure](#model-structure)
2. [API Endpoints](#api-endpoints)
3. [Authentication & Authorization](#authentication--authorization)
4. [Business Logic](#business-logic)
5. [Validation Rules](#validation-rules)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

## Model Structure

### Buyer Schema

The Buyer model (`src/models/Buyer.js`) contains the following main sections:

#### Basic Information
- `name`: Buyer's full name (required, 2-100 characters)
- `email`: Unique email address (required, validated format)
- `password`: Hashed password (required, min 8 characters)
- `phone`: Kenyan phone number format (+254XXXXXXXXX)

#### Business Details
- `businessType`: Type of buyer (Retail, Wholesale, Restaurant, Cafe, Export, Processing, Individual)
- `businessName`: Required for non-individual buyers
- `businessLicense`: Required for wholesale, export, and processing businesses

#### Delivery Address
- `street`: Street address (required)
- `city`: City name (required)
- `county`: County from predefined list
- `postalCode`: 5-digit postal code
- `coordinates`: Latitude and longitude for location-based services

#### Preferences
- `coffeeVarieties`: Preferred coffee varieties (Arabica, Robusta, SL28, etc.)
- `qualityGrades`: Preferred grades (AA, AB, C, PB, E, TT, T)
- `processingMethods`: Preferred processing (Washed, Natural, Honey, Semi-washed)
- `certifications`: Preferred certifications (Organic, Fair Trade, etc.)
- `minQuantity`/`maxQuantity`: Quantity range preferences
- `priceRange`: Price range preferences

#### Purchase History
- `totalOrders`: Total number of orders placed
- `totalSpent`: Total amount spent
- `averageOrderValue`: Calculated average order value
- `lastOrderDate`: Date of last order
- `favoriteVarieties`: Top coffee varieties by order frequency
- `preferredFarmers`: Top farmers by spending and order count

#### Rating System
- `average`: Average rating (0-5)
- `totalReviews`: Total number of reviews received

#### Payment & Notifications
- `paymentMethods`: Array of payment methods with default settings
- `notifications`: Email and SMS notification preferences

## API Endpoints

### Public Endpoints

#### GET /api/buyers
Get all verified and active buyers with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort fields (default: -rating.average -createdAt)
- `fields`: Select specific fields
- `businessType`: Filter by business type

**Response:**
```json
{
  "success": true,
  "count": 15,
  "pagination": {
    "next": { "page": 2, "limit": 10 },
    "prev": { "page": 1, "limit": 10 }
  },
  "data": [...]
}
```

#### GET /api/buyers/:id
Get detailed buyer information including order statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "buyer": {...},
    "stats": {
      "totalOrders": 45,
      "totalSpent": 125000,
      "averageOrderValue": 2777.78,
      "completedOrders": 42
    },
    "recentOrders": [...]
  }
}
```

#### GET /api/buyers/top-rated
Get top-rated buyers with at least one review.

#### GET /api/buyers/search/location
Search buyers by geographic location.

**Query Parameters:**
- `latitude`: Latitude coordinate (required)
- `longitude`: Longitude coordinate (required)
- `maxDistance`: Maximum distance in kilometers (default: 50)

#### GET /api/buyers/county/:county
Get buyers filtered by county.

#### GET /api/buyers/business-type/:businessType
Get buyers filtered by business type.

### Protected Endpoints (Authentication Required)

#### GET /api/buyers/:id/dashboard
Get comprehensive dashboard data for the buyer.

**Authorization:** Own profile or admin/superadmin

**Response:**
```json
{
  "success": true,
  "data": {
    "buyer": {...},
    "stats": {
      "totalOrders": 45,
      "totalSpent": 125000,
      "pendingOrders": 3,
      "completedOrders": 42
    },
    "recentOrders": [...],
    "monthlySpending": [...],
    "favoriteVarieties": [...]
  }
}
```

#### PUT /api/buyers/:id
Update buyer profile information.

**Authorization:** Own profile or admin/superadmin

**Request Body:**
```json
{
  "name": "Updated Buyer Name",
  "businessType": "Wholesale",
  "preferences": {
    "coffeeVarieties": ["Arabica", "SL28"],
    "priceRange": { "min": 200, "max": 800 }
  }
}
```

#### DELETE /api/buyers/:id
Soft delete buyer profile (sets isActive to false).

**Authorization:** Own profile or admin/superadmin

**Restrictions:** Cannot delete buyer with active orders

#### GET /api/buyers/:id/orders
Get buyer's order history with pagination and filtering.

**Authorization:** Own profile or admin/superadmin

**Query Parameters:**
- Standard pagination and filtering options
- `status`: Filter by order status

#### GET /api/buyers/:id/analytics
Get detailed analytics for the buyer.

**Authorization:** Own profile or admin/superadmin

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalOrders": 45,
      "totalSpent": 125000,
      "completedOrders": 42,
      "cancelledOrders": 2
    },
    "monthlySpending": [...],
    "varietyPreferences": [...],
    "farmerInteractions": [...],
    "purchaseHistory": {...}
  }
}
```

#### GET /api/buyers/:id/recommendations
Get personalized product and farmer recommendations.

**Authorization:** Own profile or admin/superadmin

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "newProductsFromPreferredFarmers": [...],
    "popularWithSimilarBuyers": [...]
  }
}
```

### Admin-Only Endpoints

#### PUT /api/buyers/:id/verify
Update buyer verification status.

**Authorization:** admin or superadmin

**Request Body:**
```json
{
  "isVerified": true
}
```

## Authentication & Authorization

### Access Levels

1. **Public Access:**
   - View buyer profiles
   - Search and filter buyers
   - View top-rated buyers

2. **Buyer Access:**
   - Full access to own profile and data
   - Update own profile
   - Delete own profile
   - View own orders, analytics, and recommendations

3. **Admin Access:**
   - Access to all buyer profiles
   - Verify/unverify buyers
   - View all buyer analytics

### JWT Token Requirements

Protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Business Logic

### Buyer Types and Requirements

1. **Individual Buyers:**
   - Basic personal information required
   - No business license needed

2. **Business Buyers (Retail, Restaurant, Cafe):**
   - Business name required
   - Business license optional

3. **Commercial Buyers (Wholesale, Export, Processing):**
   - Business name required
   - Business license required
   - Additional verification may be needed

### Purchase Tracking

The system automatically tracks:
- Order frequency and spending patterns
- Favorite coffee varieties
- Preferred farmers
- Purchase history statistics
- Quality and certification preferences

### Recommendation Engine

Recommendations are generated based on:
- Historical purchase patterns
- Stated preferences
- Similar buyer behavior
- New products from preferred farmers
- Popular products in the same business category

### Payment Methods

Buyers can configure multiple payment methods:
- M-Pesa
- Bank Transfer
- Credit Card
- Cash on Delivery

Only one payment method can be set as default.

## Validation Rules

### Profile Validation

- **Name:** 2-100 characters, no XSS content
- **Email:** Valid email format, unique
- **Phone:** Must match +254XXXXXXXXX format
- **Business Type:** Must be from predefined enum
- **Coordinates:** Must be within Kenya boundaries
- **Postal Code:** Must be 5 digits

### Preference Validation

- **Coffee Varieties:** Must be from predefined enum
- **Quality Grades:** Must be from predefined enum
- **Processing Methods:** Must be from predefined enum
- **Quantity Ranges:** Must be positive integers
- **Price Ranges:** Must be non-negative numbers

### Business Rules

- Business name required for non-individual buyers
- Business license required for wholesale/export/processing
- Only one default payment method allowed
- Cannot delete buyer with active orders

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Name must be between 2 and 100 characters"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Please provide a valid token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You can only update your own profile"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Buyer not found"
}
```

### Validation Errors

Validation errors provide detailed field-level feedback:
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid business type, Phone number must be in format +254XXXXXXXXX",
  "details": [
    {
      "field": "businessType",
      "message": "Invalid business type",
      "value": "InvalidType"
    }
  ]
}
```

## Testing

### Test Coverage

The buyer system includes comprehensive test coverage:

#### Unit Tests (`tests/unit/buyer.test.js`)
- Model creation and validation
- Password hashing
- Method functionality
- Virtual fields
- Pre-save middleware

#### Integration Tests (`tests/integration/buyers.test.js`)
- API endpoint functionality
- Authentication and authorization
- Data validation
- Error handling
- Business logic

### Running Tests

```bash
# Run all buyer tests
npm test -- --grep "Buyer"

# Run only unit tests
npm test tests/unit/buyer.test.js

# Run only integration tests
npm test tests/integration/buyers.test.js
```

### Test Data Helpers

Test helpers are available in `tests/helpers/testHelpers.js`:

```javascript
const { createTestBuyer } = require('../helpers/testHelpers');

// Create test buyer with defaults
const buyer = await createTestBuyer();

// Create test buyer with overrides
const customBuyer = await createTestBuyer({
  businessType: 'Wholesale',
  businessName: 'Custom Business'
});
```

## Database Indexes

The Buyer model includes several indexes for optimal query performance:

- `email`: Unique index for email lookups
- `phone`: Index for phone number searches
- `businessType`: Index for business type filtering
- `deliveryAddress.county`: Index for location-based queries
- `deliveryAddress.coordinates`: 2dsphere index for geospatial queries
- `isActive, isVerified`: Compound index for active buyer queries
- `createdAt`: Index for chronological sorting
- `rating.average`: Index for rating-based sorting

## Security Considerations

1. **Password Security:** Passwords are hashed using bcrypt with salt rounds
2. **Input Sanitization:** All inputs are validated against XSS attacks
3. **Access Control:** Strict authorization checks for profile access
4. **Rate Limiting:** Recommended for public endpoints
5. **Data Privacy:** Sensitive fields excluded from public responses

## Performance Optimizations

1. **Pagination:** All list endpoints support pagination
2. **Field Selection:** Ability to select specific fields to reduce payload
3. **Caching:** Consider implementing caching for frequently accessed data
4. **Database Indexes:** Optimized indexes for common query patterns
5. **Aggregation Pipelines:** Efficient data aggregation for analytics

## Future Enhancements

1. **Advanced Recommendations:** Machine learning-based recommendation engine
2. **Social Features:** Buyer ratings and reviews system
3. **Loyalty Programs:** Point-based loyalty system for frequent buyers
4. **Bulk Operations:** Bulk import/export functionality
5. **Mobile API:** Optimized endpoints for mobile applications
6. **Real-time Features:** WebSocket support for real-time updates