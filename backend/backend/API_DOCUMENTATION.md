# Shamba2Shelf API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the Shamba2Shelf agricultural logistics and market access platform. The API follows RESTful principles and uses JSON for data exchange.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow a consistent format:
```json
{
  "success": true/false,
  "data": {...},
  "message": "Response message",
  "error": "Error details (if applicable)"
}
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Route | Description | Access Level |
|--------|-------|-------------|--------------|
| POST | `/register` | Register a new user (farmer, buyer, or admin) | Public |
| POST | `/login` | User login with email and password | Public |
| POST | `/logout` | Logout current user | Authenticated |
| POST | `/logout-all` | Logout from all devices | Authenticated |
| POST | `/refresh` | Refresh JWT token using refresh token | Public |
| POST | `/forgot-password` | Request password reset email | Public |
| PUT | `/reset-password/:resettoken` | Reset password using reset token | Public |
| GET | `/me` | Get current user profile | Authenticated |
| PUT | `/profile` | Update user profile information | Authenticated |
| PUT | `/password` | Change user password | Authenticated |
| DELETE | `/account` | Delete user account | Authenticated |
| GET | `/users` | Get all users (admin only) | Admin |
| GET | `/users/:id` | Get specific user by ID | Admin |
| PUT | `/users/:id/role` | Update user role | Admin |
| PUT | `/users/:id/status` | Toggle user active status | Admin |

### Farmer Routes (`/api/farmers`)

| Method | Route | Description | Access Level |
|--------|-------|-------------|--------------|
| GET | `/` | Get all verified farmers with pagination | Public |
| GET | `/top-rated` | Get top-rated farmers | Public |
| GET | `/search/location` | Search farmers by location (lat/lng) | Public |
| GET | `/county/:county` | Get farmers by county | Public |
| GET | `/:id` | Get specific farmer profile | Public |
| GET | `/:id/products` | Get products by specific farmer | Public |
| GET | `/:id/dashboard` | Get farmer dashboard data | Farmer/Admin |
| GET | `/:id/orders` | Get orders for specific farmer | Farmer/Admin |
| GET | `/:id/analytics` | Get analytics for specific farmer | Farmer/Admin |
| PUT | `/:id` | Update farmer profile | Farmer/Admin |
| DELETE | `/:id` | Delete farmer account | Farmer/Admin |
| PUT | `/:id/verify` | Update farmer verification status | Admin |

### Buyer Routes (`/api/buyers`)

| Method | Route | Description | Access Level |
|--------|-------|-------------|--------------|
| GET | `/` | Get all verified buyers with pagination | Public |
| GET | `/top-rated` | Get top-rated buyers | Public |
| GET | `/search/location` | Search buyers by location (lat/lng) | Public |
| GET | `/county/:county` | Get buyers by county | Public |
| GET | `/business-type/:businessType` | Get buyers by business type | Public |
| GET | `/:id` | Get specific buyer profile | Public |
| GET | `/:id/dashboard` | Get buyer dashboard data | Buyer/Admin |
| GET | `/:id/orders` | Get orders for specific buyer | Buyer/Admin |
| GET | `/:id/analytics` | Get analytics for specific buyer | Buyer/Admin |
| GET | `/:id/recommendations` | Get product recommendations for buyer | Buyer/Admin |
| PUT | `/:id` | Update buyer profile | Buyer/Admin |
| DELETE | `/:id` | Delete buyer account | Buyer/Admin |
| PUT | `/:id/verify` | Update buyer verification status | Admin |

### Product Routes (`/api/products`)

| Method | Route | Description | Access Level |
|--------|-------|-------------|--------------|
| GET | `/` | Get all available products with filtering | Public |
| GET | `/search` | Search products by name, variety, or description | Public |
| GET | `/stats` | Get product statistics | Public |
| GET | `/farmer/:farmerId` | Get all products by specific farmer | Public |
| GET | `/:id` | Get specific product details | Public |
| POST | `/` | Create new product | Farmer/Admin |
| PUT | `/:id` | Update product information | Farmer/Admin |
| PUT | `/:id/stock` | Update product stock quantity | Farmer/Admin |
| DELETE | `/:id` | Delete product | Farmer/Admin |

### Order Routes (`/api/orders`)

| Method | Route | Description | Access Level |
|--------|-------|-------------|--------------|
| GET | `/` | Get all orders (filtered by user role) | Authenticated |
| GET | `/stats` | Get order statistics | Authenticated |
| GET | `/farmer/:farmerId` | Get orders for specific farmer | Farmer/Admin |
| GET | `/buyer/:buyerId` | Get orders for specific buyer | Buyer/Admin |
| GET | `/:id` | Get specific order details | Authenticated |
| POST | `/` | Create new order | Buyer/Admin |
| PUT | `/:id/status` | Update order status | Authenticated |
| PUT | `/:id/payment` | Update payment status | Authenticated |
| PUT | `/:id/cancel` | Cancel order | Buyer/Admin |

### Logistics Routes (`/api/v1/logistics`)

| Method | Route | Description | Access Level |
|--------|-------|-------------|--------------|
| GET | `/tracking` | Get all tracking orders | Authenticated |
| POST | `/tracking` | Create new tracking order | Logistics/Admin |
| GET | `/tracking/:trackingNumber` | Get tracking information | Authenticated |
| PUT | `/tracking/:trackingNumber/location` | Update tracking location | Driver/Logistics/Admin |
| POST | `/tracking/:trackingId/assign-vehicle` | Assign vehicle to tracking order | Logistics/Admin |
| POST | `/estimate` | Get delivery time estimate | Authenticated |
| POST | `/optimize-routes` | Optimize delivery routes | Logistics/Admin |
| GET | `/warehouses` | Get all warehouses | Authenticated |
| POST | `/warehouses` | Create new warehouse | Admin |
| GET | `/warehouses/:id` | Get specific warehouse | Authenticated |
| PUT | `/warehouses/:id` | Update warehouse information | Admin |
| DELETE | `/warehouses/:id` | Delete warehouse | Admin |
| POST | `/warehouses/:warehouseId/inventory` | Manage warehouse inventory | Warehouse/Admin |
| GET | `/fleet` | Get all fleet vehicles | Authenticated |
| POST | `/fleet` | Create new fleet vehicle | Admin |
| GET | `/fleet/available` | Get available vehicles | Authenticated |
| GET | `/fleet/:id` | Get specific vehicle | Authenticated |
| PUT | `/fleet/:id` | Update vehicle information | Admin |
| DELETE | `/fleet/:id` | Delete vehicle | Admin |
| GET | `/reports/delivery` | Generate delivery reports | Logistics/Admin |

### Analytics Routes (`/api/v1/analytics`)

| Method | Route | Description | Access Level |
|--------|-------|-------------|--------------|
| GET | `/dashboard` | Get dashboard analytics data | Admin |
| GET | `/sales` | Get sales metrics | Admin |
| GET | `/inventory` | Get inventory metrics | Farmer/Admin |
| GET | `/performance` | Get performance metrics | Admin |
| GET | `/users` | Get user analytics | Admin |
| POST | `/generate` | Generate new analytics metrics | Admin |
| GET | `/reports` | Get all custom reports | Admin |
| POST | `/reports` | Create custom report | Admin |
| GET | `/reports/:id` | Get specific report | Admin |
| PUT | `/reports/:id` | Update custom report | Admin |
| DELETE | `/reports/:id` | Delete custom report | Admin |
| GET | `/top-performers` | Get top performing users/products | Admin |
| GET | `/regional` | Get regional analytics | Admin |
| GET | `/categories` | Get category-wise analytics | Farmer/Admin |

### Health Check

| Method | Route | Description | Access Level |
|--------|-------|-------------|--------------|
| GET | `/health` | Check API health status | Public |

---

## Access Levels

- **Public**: No authentication required
- **Authenticated**: Requires valid JWT token
- **Farmer**: Requires farmer role and valid token
- **Buyer**: Requires buyer role and valid token
- **Admin**: Requires admin/superadmin role and valid token
- **Logistics**: Requires logistics role and valid token
- **Driver**: Requires driver role and valid token
- **Warehouse**: Requires warehouse role and valid token

## Query Parameters

Many endpoints support query parameters for filtering, pagination, and sorting:

- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)
- `sort`: Field to sort by
- `fields`: Specific fields to return
- `status`: Filter by status
- `county`: Filter by county
- `businessType`: Filter by business type

Example:
```
GET /api/products?page=2&limit=20&sort=-createdAt&county=Nyeri
```

## Error Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

- Authentication endpoints: 20 requests per 15 minutes
- Login endpoint: 5 requests per 15 minutes
- Other endpoints: Standard rate limiting applies

## Data Validation

All endpoints validate input data according to their respective schemas. Common validation rules include:

- Email format validation
- Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
- Phone number format (+254XXXXXXXXX for Kenya)
- Required field validation
- Data type validation

## Examples

### Register a New Farmer
```bash
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+254712345678",
  "role": "farmer"
}
```

### Create a Product
```bash
POST /api/products
Authorization: Bearer <token>
{
  "name": "Arabica Coffee",
  "variety": "SL28",
  "price": 450,
  "quantity": 100,
  "description": "Premium quality Arabica coffee from Nyeri",
  "farmerId": "farmer_id_here"
}
```

### Place an Order
```bash
POST /api/orders
Authorization: Bearer <token>
{
  "productId": "product_id_here",
  "quantity": 10,
  "deliveryAddress": "123 Coffee Street, Nairobi"
}
```

---

## Additional Notes

1. All timestamps are in ISO 8601 format
2. Coordinates use decimal degrees format
3. Prices are in Kenyan Shillings (KES)
4. Quantities are in kilograms (kg)
5. All text fields support UTF-8 encoding
6. File uploads (if any) support common image formats (JPEG, PNG, WebP)

For more detailed information about request/response schemas, refer to the individual controller files in the codebase.