# Backend API

## Quick Start

```bash
npm install
npm run init-db
npm start
```

Server runs on http://localhost:5000

## API Endpoints

### Authentication

**POST** `/api/auth/register`
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

**POST** `/api/auth/login`
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**GET** `/api/auth/profile` (requires auth token)

### Items

**GET** `/api/items` - Get all items
**POST** `/api/items` - Create item
**PUT** `/api/items/:id` - Update item
**DELETE** `/api/items/:id` - Delete item

### Inventory

**GET** `/api/inventory` - Get all inventory
**GET** `/api/inventory/location/:id` - Get inventory by location
**GET** `/api/inventory/low-stock` - Get low stock items
**GET** `/api/inventory/overstock` - Get overstock items
**POST** `/api/inventory/update` - Update inventory
**POST** `/api/inventory/adjust` - Adjust inventory

### Locations

**GET** `/api/locations` - Get all locations
**POST** `/api/locations` - Create location
**PUT** `/api/locations/:id` - Update location

### Purchase Orders

**GET** `/api/purchase-orders` - Get all purchase orders
**GET** `/api/purchase-orders/:id` - Get single PO
**POST** `/api/purchase-orders` - Create PO
**PATCH** `/api/purchase-orders/:id/status` - Update PO status

### Requests

**GET** `/api/requests` - Get all requests
**POST** `/api/requests` - Create request
**PATCH** `/api/requests/:id/status` - Update request status
**POST** `/api/requests/:id/fulfill` - Fulfill request

### Budgets

**GET** `/api/budgets` - Get all budgets
**POST** `/api/budgets` - Create budget
**GET** `/api/budgets/summary/:location_id` - Get budget summary

## Authentication

All API endpoints (except register/login) require JWT token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database

SQLite database located at `backend/data/inventory.db`

Initialize with: `npm run init-db`
