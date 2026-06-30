# SheoMart - Business Rules

Version: v1.0

---

# 1. Introduction

This document defines the business rules governing the SheoMart platform.

Business rules describe the constraints, policies, and operational logic that ensure consistent behavior across the application.

These rules shall be enforced by the backend and shall not rely solely on frontend validation.

---

# 2. Platform Rules

BR-001

The platform shall initially operate only within Sheopur district.

Future versions shall support multiple districts without requiring major architectural changes.

---

BR-002

Every registered grocery store shall belong to exactly one district.

---

BR-003

Every store shall have one primary owner in v1.0.

Future versions may support multiple owners or staff accounts.

---

# 3. Customer Rules

BR-004

Every customer shall register with a unique mobile number.

---

BR-005

Each customer account shall have only one active profile.

---

BR-006

Customers may shop from any available store within their selected district.

---

BR-007

Customers shall only access their own personal information and orders.

---

# 4. Store Rules

BR-008

Each store shall manage only its own inventory.

---

BR-009

Store owners shall never access another store's products, orders, customers, or analytics.

---

BR-010

A store may temporarily disable order acceptance without deleting its account.

---

BR-011

Suspended stores shall not receive new orders.

---

# 5. Product Rules

BR-012

Every product shall belong to exactly one store.

---

BR-013

A product shall belong to one category.

---

BR-014

Products marked as unavailable shall not be purchasable.

---

BR-015

Products with zero stock shall not be added to new orders.

---

BR-016

Product prices shall always be determined by the store owner.

The backend shall calculate the final payable amount.

---

# 6. Inventory Rules

BR-017

Inventory shall never become negative.

---

BR-018

Successful orders shall reduce available stock.

---

BR-019

Cancelled orders shall restore inventory where applicable.

---

BR-020

Manual inventory updates shall be recorded in inventory history.

---

# 7. Cart Rules

BR-021

A shopping cart shall contain products from only one store.

---

BR-022

Adding a product from another store shall require clearing the current cart or creating a separate cart in a future version.

---

BR-023

Cart totals shall always be recalculated by the backend.

---

# 8. Order Rules

BR-024

Every order shall belong to exactly one customer.

---

BR-025

Every order shall belong to exactly one store.

---

BR-026

An order shall contain at least one product.

---

BR-027

Delivered orders cannot be modified.

---

BR-028

Cancelled orders cannot be restored.

A new order must be created instead.

---

BR-029

Order history shall remain available to customers and store owners.

---

# 9. Payment Rules

BR-030

Payment status shall be maintained independently from order status.

---

BR-031

Only verified customers may use the Pay Later facility.

---

BR-032

Customer verification shall be store-specific.

Being verified by one store shall not grant credit privileges at another store.

---

BR-033

Payment records shall be immutable except through authorized correction procedures.

---

# 10. Verified Customer Rules

BR-034

Only the store owner may mark a customer as verified.

---

BR-035

Verification may be revoked at any time.

---

BR-036

Removing verification shall not affect existing completed orders.

---

BR-037

Future credit purchases shall follow the customer's current verification status.

---

# 11. Security Rules

BR-038

Authentication shall be required for all protected resources.

---

BR-039

Authorization shall be verified for every protected request.

---

BR-040

Sensitive business logic shall execute only on the backend.

---

BR-041

Client-provided prices, totals, or discounts shall never be trusted.

---

BR-042

All critical actions shall be logged.

---

# 12. Admin Rules

BR-043

Platform administrators may suspend stores violating platform policies.

---

BR-044

Administrators may suspend customer accounts.

---

BR-045

Administrative actions affecting platform data shall be recorded in audit logs.

---

# 13. Data Integrity Rules

BR-046

Products, orders, and payments shall maintain referential integrity.

---

BR-047

Deleting a store shall not orphan historical order records.

Historical records shall remain accessible for auditing.

---

BR-048

Deleting a product shall not invalidate completed order history.

Order items shall preserve historical purchase information.

---

# 14. Future Business Rules

Future versions may include:

- Delivery assignment rules
- Coupon validation rules
- Loyalty point calculation
- Subscription ordering
- Multiple delivery addresses per order
- District-specific pricing
- Dynamic delivery charges
- Store operating schedules
- Holiday closures

---

# 15. Business Rule Summary

The following principles shall guide all future development:

- One store owns its own data.
- Customers own only their own information.
- Backend owns all business logic.
- Inventory accuracy is mandatory.
- Orders are immutable after completion.
- Verification is store-specific.
- Security takes precedence over convenience.
- Future expansion shall not require redesigning the core architecture.