# SheoMart - System Architecture

Version: 1.0

---

# Purpose

Define the high-level architecture of the SheoMart platform.

---

# Architecture Style

- Client-Server Architecture
- Multi-Tenant (Store Based)
- REST API
- Modular Monolith (v1.0)
- Scalable for Future Microservices

---

# Applications

## Mobile App
- Customer
- Store Owner

Tech:
- React Native
- Expo
- TypeScript

---

## Backend API

Responsibilities:
- Authentication
- Business Logic
- Inventory
- Orders
- Payments
- Notifications

Tech:
- Node.js
- Express
- TypeScript

---

## Admin Dashboard

Responsibilities:
- Platform Management
- Store Management
- Analytics

Tech:
- Next.js
- TypeScript

---

# External Services

- MongoDB Atlas
- Cloudinary
- Firebase Cloud Messaging
- Razorpay (Future)
- Google Maps (Future)

---

# High Level Flow

```
Customer App
        │
Store Owner App
        │
        ▼
   Express API
        │
 ┌──────┼──────┐
 │      │      │
 ▼      ▼      ▼
MongoDB Cloudinary Firebase
```

---

# Multi-Tenant Model

- One Platform
- Multiple Stores
- Each Store owns:
  - Products
  - Categories
  - Customers
  - Orders
  - Analytics

All resources are isolated using `storeId`.

---

# Core Modules

- Authentication
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

---

# Security Principles

- JWT Authentication
- RBAC
- Input Validation
- Secure File Upload
- Rate Limiting
- Audit Logs
- Never Trust Client Data

---

# Scalability

Current:
- Single District (Sheopur)

Future:
- Multi-District
- Multi-City
- Delivery Partners
- Store Staff
- AI Services

No major architectural redesign required.

---

# Development Order

1. Backend
2. Admin Dashboard
3. Mobile App
4. Testing
5. Deployment

---

# Version

v1.0