# SheoMart - Backend Architecture

Version: 1.0

---

# Purpose

Define the backend architecture and request flow for SheoMart.

---

# Architecture Style

- Modular Monolith
- Layered Architecture
- REST API
- Service-Based Design

---

# Request Flow

```text
Client
   │
Routes
   │
Middleware
   │
Controller
   │
Service
   │
Model
   │
MongoDB
```

---

# Layer Responsibilities

## Routes

- Define API endpoints
- Apply middleware
- Forward requests to controllers

---

## Middleware

- Authentication
- Authorization
- Validation
- Rate Limiting
- Error Handling
- Logging

---

## Controllers

- Receive requests
- Call services
- Return responses

Business logic should NOT exist here.

---

## Services

- Business logic
- Database operations
- Transactions
- External services

---

## Models

- Database schema
- Indexes
- Relationships

---

# Core Modules

- Auth
- Users
- Stores
- Categories
- Products
- Inventory
- Cart
- Orders
- Payments
- Notifications
- Analytics
- Admin

Each module follows:

```text
module/
│
├── controller
├── service
├── model
├── routes
├── validator
└── types
```

---

# Configuration

`config/`

- Database
- JWT
- Cloudinary
- Environment
- Logger

---

# Validation

Every request must be validated before reaching the controller.

Validation Library:

- Zod

---

# Error Handling

Centralized error handler.

Standard API response:

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "",
  "errors": []
}
```

---

# Authentication

- Access Token
- Refresh Token
- RBAC
- Secure Password Hashing

---

# Logging

Log:

- Login
- Orders
- Payments
- Inventory Updates
- Admin Actions
- Server Errors

---

# File Upload

- Cloudinary
- Image Validation
- Size Limits

---

# Background Jobs (Future)

- Notifications
- Email
- Scheduled Cleanup
- Reports

---

# Security

- Helmet
- CORS
- Rate Limiting
- Input Validation
- Sanitization
- Audit Logs

---

# Future Ready

Architecture supports:

- Multi-District
- Store Staff
- Delivery Partners
- AI Services
- Microservice Migration

---

# Version

v1.0