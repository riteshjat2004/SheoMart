# SheoMart - Database Collections

Version: 1.0

---

# Purpose

Define the MongoDB collections used in SheoMart.

---

# Core Collections

## 1. Users

Stores all platform users.

- Customers
- Store Owners
- Platform Admins

---

## 2. Stores

Store information.

- Name
- Address
- District
- Status
- Owner

---

## 3. Categories

Product categories for each store.

Examples:

- Fruits
- Vegetables
- Dairy
- Bakery

---

## 4. Products

Store inventory.

- Name
- Price
- Stock
- Images
- Category
- Store

---

## 5. Addresses

Customer delivery addresses.

---

## 6. Cart

Customer shopping cart.

One active cart per customer.

---

## 7. Orders

Customer orders.

Contains:

- Customer
- Store
- Products
- Payment
- Status

---

## 8. Order Items

Products belonging to an order.

---

## 9. Payments

Payment transactions.

---

## 10. Verified Customers

Customers allowed to purchase on credit.

Store-specific verification.

---

## 11. Notifications

System notifications.

---

## 12. Inventory Logs

Track stock changes.

---

## 13. Audit Logs

Track important system actions.

---

## 14. Sessions

Refresh tokens and active sessions.

---

# Future Collections

- Reviews
- Coupons
- Loyalty Points
- Delivery Partners
- Staff
- Reports
- Expenses
- AI Recommendations

---

# Common Fields

Every collection should include:

- _id
- createdAt
- updatedAt

Soft Delete Collections

- isDeleted
- deletedAt
- deletedBy

---

# Relationships

- User → Store (Owner)
- Store → Products
- Store → Categories
- Customer → Cart
- Customer → Orders
- Order → Order Items
- Order → Payment

---

# Version

v1.0