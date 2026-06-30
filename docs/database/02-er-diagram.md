# SheoMart - ER Diagram

Version: 1.0

---

# Purpose

Define the relationship between major collections in SheoMart.

---

# Entity Relationship Diagram

```text
                         +----------------+
                         |     Users      |
                         +----------------+
                          |            |
              Customer ---|            |--- Store Owner
                          |            |
                          |            |
                          ▼            ▼
                   +-----------+   +-----------+
                   | Addresses |   |  Stores   |
                   +-----------+   +-----------+
                          |              |
                          |              |
                          |              ├─────────────┐
                          |              |             |
                          ▼              ▼             ▼
                    +-----------+   +-----------+ +-------------+
                    |   Orders  |   |Categories | |  Products   |
                    +-----------+   +-----------+ +-------------+
                          |                               |
                          |                               |
                          ▼                               |
                   +---------------+                      |
                   |  Order Items  |◄─────────────────────┘
                   +---------------+
                          |
                          ▼
                    +------------+
                    |  Payments  |
                    +------------+

Users
  │
  ├────────────► Cart
  │
  ├────────────► Notifications
  │
  └────────────► Sessions

Stores
  │
  ├────────────► Verified Customers
  │
  ├────────────► Inventory Logs
  │
  └────────────► Audit Logs
```

---

# Relationship Summary

| Parent | Child | Relation |
|---------|-------|----------|
| User | Address | 1 : Many |
| User | Cart | 1 : 1 |
| User | Orders | 1 : Many |
| User | Sessions | 1 : Many |
| Store | Categories | 1 : Many |
| Store | Products | 1 : Many |
| Store | Orders | 1 : Many |
| Store | Verified Customers | 1 : Many |
| Category | Products | 1 : Many |
| Order | Order Items | 1 : Many |
| Order | Payment | 1 : 1 |

---

# Ownership Rules

- One Store Owner owns one Store (v1.0).
- One Product belongs to one Store.
- One Category belongs to one Store.
- One Product belongs to one Category.
- One Cart belongs to one Customer.
- One Order belongs to one Customer.
- One Order belongs to one Store.
- One Payment belongs to one Order.
- Customer verification is specific to a Store.

---

# Multi-Tenant Rule

Every store-owned resource must include:

- `storeId`

This applies to:

- Categories
- Products
- Orders
- Verified Customers
- Inventory Logs

---

# Future Expansion

The schema supports:

- Multiple Districts
- Multiple Cities
- Store Staff
- Delivery Partners
- Multi-Branch Stores

---

# Version

v1.0