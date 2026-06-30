# SheoMart - Database Indexing Strategy

Version: 1.0

---

# Purpose

Define indexes to improve query performance.

---

# Users

Indexes

- email (Unique)
- mobile (Unique)
- role
- isDeleted

---

# Stores

Indexes

- ownerId (Unique)
- district
- status
- isDeleted

---

# Categories

Indexes

- storeId
- name
- isDeleted

Compound

- storeId + name (Unique)

---

# Products

Indexes

- storeId
- categoryId
- name
- status
- stock
- isFeatured
- isDeleted

Compound

- storeId + categoryId

---

# Addresses

Indexes

- userId
- isDefault

---

# Cart

Indexes

- userId (Unique)
- storeId

---

# Orders

Indexes

- customerId
- storeId
- status
- paymentStatus
- createdAt

Compound

- customerId + createdAt
- storeId + status

---

# Order Items

Indexes

- orderId
- productId

---

# Payments

Indexes

- orderId (Unique)
- customerId
- paymentStatus
- transactionId (Unique)

---

# Verified Customers

Indexes

- customerId
- storeId

Compound

- customerId + storeId (Unique)

---

# Notifications

Indexes

- userId
- isRead
- createdAt

---

# Inventory Logs

Indexes

- storeId
- productId
- createdAt

---

# Audit Logs

Indexes

- userId
- action
- createdAt

---

# Sessions

Indexes

- userId
- refreshToken
- expiresAt

---

# General Rules

- Index frequently queried fields.
- Avoid unnecessary indexes.
- Use compound indexes for common query combinations.
- Review indexes as the application grows.

---

# Version

v1.0