# DSIP Backend API Documentation

**Base URL:** `http://localhost:8080`

**Authentication:** Session-based (Google OAuth2)

**Admin Endpoints:** Require `X-Admin-API-Key` header

---

## Table of Contents

1. [Health & Info](#health--info)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [DSIP Tracker Management](#dsip-tracker-management)
5. [Stock Management](#stock-management)
6. [Admin - Whitelist Management](#admin---whitelist-management)

---

## Health & Info

### 1. Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2026-02-07T17:46:11.123Z"
}
```

### 2. Root Info
**GET** `/`

**Response:**
```json
{
  "application": "DSIP Backend",
  "version": "1.0.0"
}
```

---

## Authentication

### 1. Get Auth Status
**GET** `/api/auth/status`

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "https://example.com/photo.jpg",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

---

## User Management

### 1. Get Current User
**GET** `/api/user/me`

**Headers:**
- `Cookie: SESSION=<session-id>`

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "profilePicture": "https://example.com/photo.jpg",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

### 2. Get Active Session Count
**GET** `/api/user/sessions/count`

**Response:**
```json
{
  "activeSessions": 3
}
```

### 3. Invalidate All Sessions
**POST** `/api/user/sessions/invalidate-all`

**Response:**
```json
{
  "message": "All sessions invalidated"
}
```

---

## DSIP Tracker Management

### 1. Create Tracker
**POST** `/api/dsip-trackers`

**Request Body:**
```json
{
  "stock_symbol": "AAPL",
  "conviction_period_years": 5,
  "total_capital_planned": 100000,
  "partition_days": 30,
  "deployment_style": 1,
  "base_conviction_score": 75,
  "initial_invested_amount": 5000,
  "initial_shares_held": 25,
  "is_fractional_shares_allowed": true
}
```

**Field Descriptions:**
- `stock_symbol` (string, required): Stock ticker symbol
- `conviction_period_years` (integer, required): Investment period in years (min: 1)
- `total_capital_planned` (number, required): Total capital to invest (min: 1)
- `partition_days` (integer, required): Days between partitions (min: 1)
- `deployment_style` (integer, required): Deployment strategy (0=UNIFORM, 1=AGGRESSIVE, 2=CONSERVATIVE)
- `base_conviction_score` (integer, required): Base conviction score (0-100)
- `initial_invested_amount` (number, optional): Initial amount already invested (default: 0)
- `initial_shares_held` (number, optional): Initial shares already held (default: 0)
- `is_fractional_shares_allowed` (boolean, optional): Allow fractional shares (default: false)

**Response:**
```json
{
  "trackerId": 1,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "stock_id": 123,
  "stock_symbol": "AAPL",
  "conviction_period_years": 5,
  "total_capital_planned": 100000,
  "partition_days": 30,
  "deployment_style": 1,
  "base_conviction_score": 75,
  "initial_invested_amount": 5000,
  "initial_shares_held": 25,
  "status": 1,
  "active_partition_index": 1,
  "total_capital_invested_so_far": 5000,
  "shares_held_so_far": 25,
  "is_fractional_shares_allowed": true,
  "createdAt": "2026-02-07T10:00:00Z"
}
```

### 2. Get All Trackers (Portfolio)
**GET** `/api/dsip-trackers`

**Response:**
```json
{
  "trackers": [
    {
      "trackerId": 1,
      "stockSymbol": "AAPL",
      "stockName": "Apple Inc.",
      "currentPrice": 175.50,
      "totalCapitalPlanned": 100000,
      "totalCapitalInvestedSoFar": 25000,
      "sharesHeldSoFar": 142.5,
      "status": 1,
      "activePartitionIndex": 3,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "summary": {
    "totalTrackers": 1,
    "activeTrackers": 1,
    "totalCapitalPlanned": 100000,
    "totalCapitalInvested": 25000,
    "totalCurrentValue": 25006.25
  }
}
```

### 3. Get Tracker Details
**GET** `/api/dsip-trackers/{trackerId}`

**Path Parameters:**
- `trackerId` (integer): Tracker ID

**Response:**
```json
{
  "tracker": {
    "trackerId": 1,
    "stockSymbol": "AAPL",
    "stockName": "Apple Inc.",
    "currentPrice": 175.50,
    "convictionPeriodYears": 5,
    "totalCapitalPlanned": 100000,
    "partitionDays": 30,
    "deploymentStyle": 1,
    "baseConvictionScore": 75,
    "status": 1,
    "activePartitionIndex": 3,
    "totalCapitalInvestedSoFar": 25000,
    "sharesHeldSoFar": 142.5,
    "isFractionalSharesAllowed": true,
    "createdAt": "2026-01-15T10:00:00Z"
  },
  "partitions": [
    {
      "partitionId": 1,
      "partitionIndex": 1,
      "expectedPartitionDays": 30,
      "partitionCapitalAllocated": 10000,
      "capitalInvestedSoFar": 10000,
      "noOfSharesBought": 57.5,
      "successfulGrowthCount": 5,
      "status": 2,
      "partitionEndDate": "2026-02-15",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "recentExecutions": [
    {
      "executionId": 1,
      "trackerId": 1,
      "partitionId": 1,
      "lockInPercentage": 50,
      "convictionOverride": 80,
      "executedAmount": 5000,
      "executionPrice": 173.50,
      "createdAt": "2026-01-20T14:30:00Z"
    }
  ]
}
```

### 4. Update Tracker
**PUT** `/api/dsip-trackers/{trackerId}`

**Path Parameters:**
- `trackerId` (integer): Tracker ID

**Request Body:**
```json
{
  "deployment_style": 2,
  "base_conviction_score": 80,
  "status": 1,
  "total_capital_planned": 120000,
  "conviction_period_years": 6,
  "partition_days": 45
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Response:** Same as "Get Tracker Details"

### 5. Execute Trade
**POST** `/api/dsip-trackers/{trackerId}/execute`

**Path Parameters:**
- `trackerId` (integer): Tracker ID

**Request Body:**
```json
{
  "lock_in_percentage": 50,
  "conviction_override": 85,
  "executed_amount": 5000,
  "execution_price": 176.25
}
```

**Field Descriptions:**
- `lock_in_percentage` (integer, required): Percentage of capital to lock in (0-100)
- `conviction_override` (integer, required): Override conviction score (0-100)
- `executed_amount` (number, required): Amount invested in this execution (min: 1)
- `execution_price` (number, required): Price per share at execution (min: 1)

**Response:**
```json
{
  "executionId": 5,
  "trackerId": 1,
  "partitionId": 3,
  "sharesBought": 28.37,
  "newTotalShares": 170.87,
  "newTotalCapitalInvested": 30000,
  "message": "Trade executed successfully"
}
```

### 6. Get Tracker Executions
**GET** `/api/dsip-trackers/{trackerId}/executions?limit=6`

**Path Parameters:**
- `trackerId` (integer): Tracker ID

**Query Parameters:**
- `limit` (integer, optional): Number of recent executions to return (default: 6)

**Response:**
```json
[
  {
    "executionId": 5,
    "trackerId": 1,
    "partitionId": 3,
    "lockInPercentage": 50,
    "convictionOverride": 85,
    "executedAmount": 5000,
    "executionPrice": 176.25,
    "createdAt": "2026-02-05T14:30:00Z"
  }
]
```

### 7. Get Partition Details
**GET** `/api/dsip-trackers/{trackerId}/partitions/{partitionIndex}`

**Path Parameters:**
- `trackerId` (integer): Tracker ID
- `partitionIndex` (integer): Partition index (1-based)

**Response:**
```json
{
  "partitionId": 3,
  "trackerId": 1,
  "partitionIndex": 3,
  "expectedPartitionDays": 30,
  "partitionCapitalAllocated": 10000,
  "capitalInvestedSoFar": 7500,
  "noOfSharesBought": 42.5,
  "successfulGrowthCount": 3,
  "status": 1,
  "partitionEndDate": null,
  "createdAt": "2026-02-01T10:00:00Z"
}
```

### 8. Delete Tracker
**DELETE** `/api/dsip-trackers/{trackerId}`

**Path Parameters:**
- `trackerId` (integer): Tracker ID

**Response:**
```json
{
  "message": "Tracker deleted successfully"
}
```

---

## Stock Management

### 1. Get Stock Closing Price
**GET** `/api/stocks/close?symbol=AAPL&exchange=US`

**Query Parameters:**
- `symbol` (string, required): Stock ticker symbol
- `exchange` (enum, required): Exchange code (`US`, `NSE`, `BSE`)

**Response:**
```json
{
  "symbol": "AAPL",
  "stockName": "Apple Inc.",
  "closePrice": 175.50,
  "lastUpdatedDate": "2026-02-07T00:00:00Z",
  "source": "cache"
}
```

**Note:** `source` can be `"cache"` (from DB) or `"api"` (freshly fetched)

### 2. Check if Stock is Cached
**GET** `/api/stocks/cached?symbol=AAPL`

**Query Parameters:**
- `symbol` (string, required): Stock ticker symbol

**Response:**
```json
{
  "symbol": "AAPL",
  "cached": true
}
```

### 3. Remove Stock from Cache
**DELETE** `/api/stocks/cache?symbol=AAPL`

**Query Parameters:**
- `symbol` (string, required): Stock ticker symbol

**Response:**
```json
{
  "symbol": "AAPL",
  "message": "Stock removed from cache",
  "status": "success"
}
```

---

## Admin - Whitelist Management

**All admin endpoints require the `X-Admin-API-Key` header.**

### 1. Get All Whitelisted Emails
**GET** `/api/admin/whitelist`

**Headers:**
- `X-Admin-API-Key: <your-admin-api-key>`

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "addedBy": "admin",
    "createdAt": "2026-01-10T08:00:00Z"
  }
]
```

### 2. Add Whitelisted Email
**POST** `/api/admin/whitelist`

**Headers:**
- `X-Admin-API-Key: <your-admin-api-key>`

**Request Body:**
```json
{
  "email": "newuser@example.com"
}
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "newuser@example.com",
  "addedBy": "admin",
  "createdAt": "2026-02-07T17:46:11Z"
}
```

### 3. Bulk Add Whitelisted Emails
**POST** `/api/admin/whitelist/bulk`

**Headers:**
- `X-Admin-API-Key: <your-admin-api-key>`

**Request Body:**
```json
[
  "user1@example.com",
  "user2@example.com",
  "user3@example.com"
]
```

**Response:**
```json
{
  "added": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "email": "user1@example.com",
      "addedBy": "admin",
      "createdAt": "2026-02-07T17:46:11Z"
    }
  ],
  "alreadyExists": [
    "user2@example.com"
  ],
  "totalAdded": 1,
  "totalAlreadyExists": 1
}
```

### 4. Remove Whitelisted Email
**DELETE** `/api/admin/whitelist/{email}`

**Headers:**
- `X-Admin-API-Key: <your-admin-api-key>`

**Path Parameters:**
- `email` (string): Email to remove

**Response:**
```json
{
  "message": "Email removed from whitelist"
}
```

### 5. Check if Email is Whitelisted
**GET** `/api/admin/whitelist/check/{email}`

**Headers:**
- `X-Admin-API-Key: <your-admin-api-key>`

**Path Parameters:**
- `email` (string): Email to check

**Response:**
```json
{
  "whitelisted": true
}
```

---

## Enums Reference

### Deployment Style
- `0` - UNIFORM
- `1` - AGGRESSIVE
- `2` - CONSERVATIVE

### Tracker Status
- `0` - INACTIVE
- `1` - ACTIVE
- `2` - COMPLETED
- `3` - PAUSED

### Partition Status
- `0` - PENDING
- `1` - ACTIVE
- `2` - COMPLETED

### Exchange
- `US` - US Stock Market
- `NSE` - National Stock Exchange (India)
- `BSE` - Bombay Stock Exchange (India)

---

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Total capital planned must be at least 1",
  "timestamp": "2026-02-07T17:46:11Z"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "timestamp": "2026-02-07T17:46:11Z"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Invalid admin API key",
  "timestamp": "2026-02-07T17:46:11Z"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Tracker not found",
  "timestamp": "2026-02-07T17:46:11Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2026-02-07T17:46:11Z"
}
```

---

## Swagger UI Access

When the application is running, you can access the interactive Swagger UI at:

**URL:** `http://localhost:8080/swagger-ui.html`

Or the OpenAPI JSON spec at:

**URL:** `http://localhost:8080/v3/api-docs`
