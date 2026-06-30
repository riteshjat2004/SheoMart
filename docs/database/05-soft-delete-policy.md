# SheoMart - Soft Delete Policy

Version: 1.0

---

# Purpose

Define how records are safely removed without losing historical data.

---

# Why Soft Delete?

- Prevent accidental data loss
- Preserve order history
- Enable record restoration
- Support auditing

---

# Soft Delete Fields

Applicable collections shall include:

```ts
isDeleted: boolean
deletedAt: Date | null
deletedBy: ObjectId | null
```

---

# Collections Using Soft Delete

- Users
- Stores
- Categories
- Products
- Addresses
- Verified Customers

Future:

- Coupons
- Staff
- Delivery Partners

---

# Collections NOT Using Soft Delete

- Orders
- Order Items
- Payments
- Audit Logs
- Inventory Logs
- Sessions

These collections are historical records and should remain immutable.

---

# Delete Process

```text
Delete Request
      │
Authorization Check
      │
Soft Delete
      │
Set isDeleted = true
      │
Record deletedAt
      │
Record deletedBy
```

---

# Restore Process

```text
Restore Request
      │
Authorization Check
      │
Set isDeleted = false
      │
Clear deletedAt
      │
Clear deletedBy
```

---

# Query Rules

Normal queries must exclude deleted records.

Example

```ts
{
  isDeleted: false
}
```

Administrative tools may include deleted records when required.

---

# Business Rules

- Soft deleted products cannot be purchased.
- Soft deleted stores cannot receive orders.
- Soft deleted users cannot log in.
- Restoring a record restores its availability but does not alter historical data.

---

# Audit Requirements

Every delete and restore action should record:

- User ID
- Resource
- Resource ID
- Action
- Timestamp

---

# Future Enhancements

- Trash Bin
- Bulk Restore
- Auto Permanent Deletion After Configurable Period
- Restore History

---

# Version

v1.0