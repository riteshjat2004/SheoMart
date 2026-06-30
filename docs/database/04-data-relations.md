# SheoMart - Data Relationships

Version: 1.0

---

# Purpose

Define how collections are related and reference each other.

---

# User Relationships

## User → Store

- One Store Owner owns one Store (v1.0)
- One User can own multiple Stores (Future)

Relationship

```
User (1) ───────► Store (1)
```

---

## User → Address

One Customer can have multiple addresses.

```
User (1) ───────► Address (N)
```

---

## User → Cart

One active cart per customer.

```
User (1) ───────► Cart (1)
```

---

## User → Orders

One customer can place many orders.

```
User (1) ───────► Orders (N)
```

---

## User → Sessions

One user can log in from multiple devices.

```
User (1) ───────► Sessions (N)
```

---

# Store Relationships

## Store → Categories

```
Store (1) ───────► Categories (N)
```

---

## Store → Products

```
Store (1) ───────► Products (N)
```

---

## Store → Orders

```
Store (1) ───────► Orders (N)
```

---

## Store → Verified Customers

```
Store (1) ───────► Verified Customers (N)
```

---

## Store → Inventory Logs

```
Store (1) ───────► Inventory Logs (N)
```

---

# Category Relationships

One category contains many products.

```
Category (1) ───────► Products (N)
```

---

# Product Relationships

A product belongs to one category and one store.

Products can appear in many order items.

```
Product (1) ───────► Order Items (N)
```

---

# Order Relationships

## Order → Order Items

```
Order (1) ───────► Order Items (N)
```

---

## Order → Payment

```
Order (1) ───────► Payment (1)
```

---

# Notification Relationships

One user receives many notifications.

```
User (1) ───────► Notifications (N)
```

---

# Audit Relationships

One user can generate many audit log entries.

```
User (1) ───────► Audit Logs (N)
```

---

# Ownership Rules

- Customer owns only their data.
- Store Owner owns only their store's data.
- Platform Admin has platform-wide access.
- Products never exist without a Store.
- Categories never exist without a Store.
- Orders always belong to one Customer and one Store.

---

# Reference Strategy

Use ObjectId references for:

- ownerId
- customerId
- storeId
- categoryId
- productId
- orderId
- paymentId

Avoid embedding large documents.

---

# Data Integrity Rules

- Prevent orphan records.
- Maintain referential consistency.
- Use soft delete where applicable.
- Preserve historical order data.
- Never delete completed order records.

---

# Future Expansion

Designed to support:

- Multi-District
- Multi-City
- Multi-Branch Stores
- Store Staff
- Delivery Partners
- Loyalty System

---

# Version

v1.0