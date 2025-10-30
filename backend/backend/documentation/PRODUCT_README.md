# Product Management System API Documentation

> Comprehensive product management system for Shamba2Shelf platform - enabling farmers to showcase their coffee products and manage inventory effectively.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)

## 📋 Overview

The Product Management System provides comprehensive CRUD operations, advanced search capabilities, inventory management, and analytics for coffee products on the Shamba2Shelf platform. This system enables farmers to effectively showcase their products while providing buyers with detailed product information and search functionality.

### Key Features

- **Product CRUD Operations** - Complete product lifecycle management
- **Advanced Search & Filtering** - Multi-criteria product discovery
- **Inventory Management** - Real-time stock tracking and updates
- **Farmer Product Management** - Farmer-specific product operations
- **Analytics & Statistics** - Comprehensive product insights
- **Role-based Access Control** - Secure operations based on user roles
- **Input Validation** - Comprehensive data validation and sanitization

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Product API   │    │   MongoDB       │
│   (Frontend)    │◄──►│   Controller    │◄──►│   Product       │
│                 │    │                 │    │   Collection    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                        ┌───────┴───────┐
                        │               │
                   ┌─────▼─────┐   ┌─────▼─────┐
                   │  Farmer   │   │   Order   │
                   │Collection │   │Collection │
                   └───────────┘   └───────────┘
```

## 🚀 API Endpoints

### Base URL
```
/api/products
```

### Authentication Required
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📊 Product Endpoints

### 1. Get All Products
Retrieve all active products with pagination, filtering, and sorting.

**Endpoint:** `GET /api/products`

**Access:** Public

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort fields (e.g., 'price', '-createdAt')
- `fields` (optional): Specific fields to return
- `variety` (optional): Filter by coffee variety
- `roastLevel` (optional): Filter by roast level
- `processingMethod` (optional): Filter by processing method
- `price[gte]` (optional): Minimum price filter
- `price[lte]` (optional): Maximum price filter

**Example Request:**
```bash
GET /api/products?page=1&limit=5&sort=-averageRating&variety=SL28
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "total": 23,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 5
    }
  },
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Premium AA Coffee",
      "variety": "SL28",
      "roastLevel": "Medium",
      "processingMethod": "Washed",
      "altitudeGrown": 1800,
      "price": 750,
      "quantityAvailable": 100,
      "description": "High quality coffee from Nyeri highlands",
      "flavorNotes": ["chocolate", "citrus", "berry"],
      "averageRating": 4.8,
      "totalReviews": 15,
      "stockStatus": "In Stock",
      "images": [
        "https://example.com/image1.jpg"
      ],
      "farmerId": {
        "_id": "64a1b2c3d4e5f6789012346",
        "firstName": "John",
        "lastName": "Doe",
        "location": {
          "county": "Nyeri",
          "subCounty": "Mathira"
        },
        "averageRating": 4.7
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Product by ID
Retrieve detailed information about a specific product.

**Endpoint:** `GET /api/products/:id`

**Access:** Public

**Path Parameters:**
- `id`: Product ID (MongoDB ObjectId)

**Example Request:**
```bash
GET /api/products/64a1b2c3d4e5f6789012345
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Premium AA Coffee",
    "variety": "SL28",
    "roastLevel": "Medium",
    "processingMethod": "Washed",
    "altitudeGrown": 1800,
    "harvestDate": "2023-12-01T00:00:00.000Z",
    "price": 750,
    "quantityAvailable": 100,
    "description": "High quality coffee from Nyeri highlands with exceptional cup profile",
    "flavorNotes": ["chocolate", "citrus", "berry"],
    "averageRating": 4.8,
    "totalReviews": 15,
    "stockStatus": "In Stock",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "farmerId": {
      "_id": "64a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "location": {
        "county": "Nyeri",
        "subCounty": "Mathira",
        "ward": "Ruguru"
      },
      "averageRating": 4.7,
      "contactInfo": {
        "phone": "+254712345678",
        "email": "john@example.com"
      }
    },
    "qrCode": "QR123456789",
    "certifications": ["Organic", "Fair Trade"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

### 3. Create Product
Create a new product (Farmers, Admins only).

**Endpoint:** `POST /api/products`

**Access:** Requires authentication (farmer, admin, superadmin)

**Request Body:**
```json
{
  "farmerId": "64a1b2c3d4e5f6789012346",
  "name": "Premium AA Coffee",
  "variety": "SL28",
  "roastLevel": "Medium",
  "processingMethod": "Washed",
  "altitudeGrown": 1800,
  "harvestDate": "2023-12-01",
  "price": 750,
  "quantityAvailable": 100,
  "description": "High quality coffee from Nyeri highlands",
  "flavorNotes": ["chocolate", "citrus", "berry"],
  "images": [
    "https://example.com/image1.jpg"
  ],
  "certifications": ["Organic"]
}
```

**Required Fields:**
- `farmerId`: Valid farmer ID
- `name`: Product name (2-100 characters)
- `variety`: Coffee variety (SL28, SL34, Ruiru 11, Batian, Blue Mountain, K7, Kent)
- `roastLevel`: Roast level (Light, Medium, Dark)
- `processingMethod`: Processing method (Washed, Natural, Honey, Semi-washed, Pulped Natural)
- `altitudeGrown`: Altitude in meters (1000-2500)
- `price`: Price per kg (100-10000 KES)
- `quantityAvailable`: Available quantity in kg (1-10000)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Premium AA Coffee",
    "variety": "SL28",
    "roastLevel": "Medium",
    "processingMethod": "Washed",
    "altitudeGrown": 1800,
    "price": 750,
    "quantityAvailable": 100,
    "description": "High quality coffee from Nyeri highlands",
    "flavorNotes": ["chocolate", "citrus", "berry"],
    "stockStatus": "In Stock",
    "averageRating": 0,
    "totalReviews": 0,
    "isActive": true,
    "farmerId": {
      "_id": "64a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "location": {
        "county": "Nyeri"
      },
      "averageRating": 4.7
    },
    "createdAt": "2024-01-20T15:30:00.000Z"
  }
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "error": "Validation Error: Product name is required, Price must be between KES 100 and KES 10,000 per kg"
}
```

---

### 4. Update Product
Update an existing product (Product owner or Admin only).

**Endpoint:** `PUT /api/products/:id`

**Access:** Requires authentication (product owner, admin, superadmin)

**Path Parameters:**
- `id`: Product ID

**Request Body:**
```json
{
  "name": "Updated Premium AA Coffee",
  "price": 800,
  "quantityAvailable": 150,
  "description": "Updated description with improved details",
  "flavorNotes": ["chocolate", "citrus", "berry", "caramel"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Updated Premium AA Coffee",
    "variety": "SL28",
    "roastLevel": "Medium",
    "price": 800,
    "quantityAvailable": 150,
    "description": "Updated description with improved details",
    "flavorNotes": ["chocolate", "citrus", "berry", "caramel"],
    "farmerId": {
      "_id": "64a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe"
    },
    "updatedAt": "2024-01-20T16:45:00.000Z"
  }
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "error": "Not authorized to update this product"
}
```

---

### 5. Delete Product (Soft Delete)
Deactivate a product (Product owner or Admin only).

**Endpoint:** `DELETE /api/products/:id`

**Access:** Requires authentication (product owner, admin, superadmin)

**Path Parameters:**
- `id`: Product ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {}
}
```

**Business Logic Error (400):**
```json
{
  "success": false,
  "error": "Cannot delete product with active orders"
}
```

---

### 6. Search Products
Advanced product search with multiple filters.

**Endpoint:** `GET /api/products/search`

**Access:** Public

**Query Parameters:**
- `q` (optional): Search query (searches name, description, flavor notes)
- `variety` (optional): Coffee variety filter
- `roastLevel` (optional): Roast level filter
- `processingMethod` (optional): Processing method filter
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `location` (optional): Location filter (county, sub-county, ward)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example Request:**
```bash
GET /api/products/search?q=premium&variety=SL28&minPrice=600&maxPrice=1000&location=Nyeri
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "total": 8,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  },
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Premium AA Coffee",
      "variety": "SL28",
      "roastLevel": "Medium",
      "processingMethod": "Washed",
      "price": 750,
      "quantityAvailable": 100,
      "description": "High quality premium coffee",
      "flavorNotes": ["chocolate", "citrus"],
      "averageRating": 4.8,
      "totalReviews": 15,
      "images": ["https://example.com/image1.jpg"],
      "farmer": {
        "firstName": "John",
        "lastName": "Doe",
        "location": {
          "county": "Nyeri",
          "subCounty": "Mathira"
        },
        "averageRating": 4.7
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 7. Get Product Statistics
Retrieve comprehensive product analytics and statistics.

**Endpoint:** `GET /api/products/stats`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProducts": 156,
      "averagePrice": 725.50,
      "totalQuantity": 12450,
      "averageRating": 4.3
    },
    "byVariety": [
      {
        "_id": "SL28",
        "count": 45,
        "averagePrice": 780,
        "totalQuantity": 3500
      },
      {
        "_id": "SL34",
        "count": 38,
        "averagePrice": 750,
        "totalQuantity": 2800
      }
    ],
    "byRoastLevel": [
      {
        "_id": "Medium",
        "count": 67,
        "averagePrice": 720
      },
      {
        "_id": "Light",
        "count": 45,
        "averagePrice": 750
      },
      {
        "_id": "Dark",
        "count": 44,
        "averagePrice": 700
      }
    ],
    "monthlyTrends": [
      {
        "_id": {
          "year": 2024,
          "month": 1
        },
        "count": 23,
        "totalValue": 1725000
      }
    ]
  }
}
```

---

### 8. Get Farmer Products
Retrieve all products for a specific farmer.

**Endpoint:** `GET /api/products/farmer/:farmerId`

**Access:** Public

**Path Parameters:**
- `farmerId`: Farmer ID

**Query Parameters:**
- `page`, `limit`, `sort`, `fields` (same as Get All Products)
- Additional filtering by product attributes

**Example Request:**
```bash
GET /api/products/farmer/64a1b2c3d4e5f6789012346?page=1&limit=10&sort=-createdAt
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  },
  "farmer": {
    "id": "64a1b2c3d4e5f6789012346",
    "name": "John Doe",
    "location": {
      "county": "Nyeri",
      "subCounty": "Mathira"
    },
    "averageRating": 4.7
  },
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Premium AA Coffee",
      "variety": "SL28",
      "roastLevel": "Medium",
      "price": 750,
      "quantityAvailable": 100,
      "averageRating": 4.8,
      "stockStatus": "In Stock",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 9. Update Product Stock
Update product inventory quantity (Product owner or Admin only).

**Endpoint:** `PUT /api/products/:id/stock`

**Access:** Requires authentication (product owner, admin, superadmin)

**Path Parameters:**
- `id`: Product ID

**Request Body:**
```json
{
  "quantity": 75
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Premium AA Coffee",
    "quantityAvailable": 75,
    "stockStatus": "In Stock",
    "updatedAt": "2024-01-20T17:00:00.000Z"
  }
}
```

**Stock Status Logic:**
- `quantity > 10`: "In Stock"
- `1 <= quantity <= 10`: "Low Stock"
- `quantity = 0`: "Out of Stock"

---

## 🔒 Authorization & Security

### Role-based Access Control

| Endpoint | Public | Farmer | Buyer | Admin |
|----------|--------|--------|-------|-------|
| GET /products | ✅ | ✅ | ✅ | ✅ |
| GET /products/:id | ✅ | ✅ | ✅ | ✅ |
| POST /products | ❌ | ✅ (own) | ❌ | ✅ |
| PUT /products/:id | ❌ | ✅ (own) | ❌ | ✅ |
| DELETE /products/:id | ❌ | ✅ (own) | ❌ | ✅ |
| PUT /products/:id/stock | ❌ | ✅ (own) | ❌ | ✅ |

### Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using express-validator
- **XSS Protection**: Cross-site scripting prevention
- **SQL Injection Prevention**: NoSQL injection protection
- **Rate Limiting**: API rate limiting (configured at server level)
- **Data Sanitization**: Input sanitization and normalization

---

## 📝 Validation Rules

### Product Creation/Update Validation

```javascript
// Required Fields
name: {
  required: true,
  type: String,
  minLength: 2,
  maxLength: 100,
  noXSS: true
}

variety: {
  required: true,
  enum: ['SL28', 'SL34', 'Ruiru 11', 'Batian', 'Blue Mountain', 'K7', 'Kent']
}

roastLevel: {
  required: true,
  enum: ['Light', 'Medium', 'Dark']
}

processingMethod: {
  required: true,
  enum: ['Washed', 'Natural', 'Honey', 'Semi-washed', 'Pulped Natural']
}

altitudeGrown: {
  required: true,
  type: Number,
  min: 1000,
  max: 2500
}

price: {
  required: true,
  type: Number,
  min: 100,
  max: 10000
}

quantityAvailable: {
  required: true,
  type: Number,
  min: 1,
  max: 10000
}

// Optional Fields
description: {
  optional: true,
  type: String,
  maxLength: 1000,
  noXSS: true
}

flavorNotes: {
  optional: true,
  type: Array,
  uniqueArray: true,
  maxItems: 10
}

harvestDate: {
  optional: true,
  type: Date,
  notFutureDate: true
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all product tests
npm test tests/integration/products.test.js

# Run specific test suite
npm test -- --grep "Product Integration Tests"

# Run with coverage
npm run test:coverage
```

### Test Coverage

The product system includes comprehensive test coverage:

- **Unit Tests**: Controller functions, validation logic
- **Integration Tests**: Full API endpoint testing
- **Authentication Tests**: Role-based access control
- **Validation Tests**: Input validation and sanitization
- **Business Logic Tests**: Product lifecycle, stock management
- **Error Handling Tests**: Error scenarios and edge cases

### Sample Test Results

```
Product Integration Tests
  ✓ GET /api/products - should get all products (45ms)
  ✓ GET /api/products/:id - should get product by id (32ms)
  ✓ POST /api/products - should create product as farmer (67ms)
  ✓ PUT /api/products/:id - should update product (43ms)
  ✓ DELETE /api/products/:id - should soft delete product (38ms)
  ✓ GET /api/products/search - should search products (52ms)
  ✓ GET /api/products/stats - should get statistics (41ms)
  ✓ PUT /api/products/:id/stock - should update stock (35ms)

  48 passing (2.1s)
  0 failing
```

---

## 🚨 Error Handling

### Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": "Validation Error: Product name is required, Price must be between KES 100 and KES 10,000 per kg"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Access denied. No token provided"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Not authorized to update this product"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Something went wrong. Please try again later."
}
```

---

## 📊 Performance Considerations

### Database Optimization

- **Indexes**: Optimized indexes on frequently queried fields
  - `farmerId` (compound index with `isActive`)
  - `variety` (compound index with `isActive`)
  - `price` (range queries)
  - `averageRating` (sorting)
  - `createdAt` (sorting)

- **Aggregation Pipelines**: Efficient aggregation for statistics and search
- **Population Optimization**: Selective field population to minimize data transfer
- **Pagination**: Efficient pagination with cursor-based navigation

### API Performance

- **Response Caching**: Implement Redis caching for frequently accessed data
- **Rate Limiting**: API rate limiting to prevent abuse
- **Compression**: Response compression for large datasets
- **Field Selection**: Support for field selection to reduce payload size

---

## 🔄 Integration Points

### Related Systems

- **Farmer Management**: Product creation requires verified farmer accounts
- **Order Management**: Products are linked to orders for inventory management
- **User Authentication**: JWT-based authentication for secure operations
- **File Upload**: Image upload integration for product photos
- **Payment Processing**: Integration with payment systems for premium features

### External APIs

- **Image Storage**: Cloud storage integration for product images
- **QR Code Generation**: QR code service for product traceability
- **Price Intelligence**: Market price data integration
- **Notification Service**: Product status notifications

---

## 📈 Future Enhancements

- **Advanced Analytics**: Machine learning-based product recommendations
- **Bulk Operations**: Bulk product management capabilities
- **Version Control**: Product version history and rollback
- **Multi-language Support**: Internationalization for product descriptions
- **Advanced Search**: Elasticsearch integration for full-text search
- **Product Variants**: Support for product variations and bundles
- **Seasonal Availability**: Seasonal product availability management
- **Quality Scoring**: Automated quality assessment integration

---

## 🤝 Contributing

When contributing to the product system:

1. Follow the established patterns from auth and farmer systems
2. Maintain comprehensive test coverage (>90%)
3. Include proper validation and error handling
4. Update documentation for any API changes
5. Follow the existing code structure and naming conventions

---

## 📞 Support

For technical support or questions about the Product Management System:

- **Technical Issues**: Create an issue in the project repository
- **API Questions**: Refer to this documentation or contact the development team
- **Feature Requests**: Submit detailed feature requests through proper channels

---

*Last Updated: January 2024*
*Version: 1.0.0*