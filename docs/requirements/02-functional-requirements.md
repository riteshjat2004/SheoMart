# SheoMart - Functional Requirements

Version: v1.0

---

# 1. Introduction

This document defines the functional requirements of SheoMart. These requirements describe the features and capabilities the system must provide for customers, store owners, and platform administrators.

---

# 2. User Types

The platform supports three primary user roles:

- Customer
- Store Owner
- Platform Administrator

Each role has different permissions and responsibilities.

---

# 3. Authentication Module

The system shall allow users to:

- Register as a customer.
- Login securely.
- Logout.
- Reset forgotten passwords.
- Change password after login.
- Verify email (future).
- Refresh expired access tokens.
- Maintain secure authenticated sessions.

Store Owners shall:

- Register their grocery store.
- Wait for platform approval (optional for v1).
- Login securely.

Platform Administrators shall:

- Login through a dedicated admin portal.

---

# 4. Customer Module

Customers shall be able to:

- Create an account.
- Update profile information.
- Upload profile picture.
- Manage delivery addresses.
- Select a grocery store.
- Browse categories.
- Search products.
- Filter products.
- View product details.
- Add products to cart.
- Update cart quantity.
- Remove products from cart.
- Place orders.
- Track order status.
- View order history.
- Cancel eligible orders.
- View invoices.
- Receive notifications.
- Contact store owner.

---

# 5. Store Module

Store Owners shall be able to:

- Register their store.
- Update store information.
- Upload store logo.
- Set business hours.
- Enable or disable store availability.
- View store analytics.
- Manage customer requests.

Future versions:

- Multiple store branches.
- Store staff management.

---

# 6. Product Management

Store Owners shall be able to:

- Create product categories.
- Edit categories.
- Delete categories.
- Add products.
- Edit products.
- Delete products.
- Upload product images.
- Manage pricing.
- Update stock quantity.
- Enable or disable products.
- Mark products as featured.
- View inventory.

Each product shall belong to exactly one store.

---

# 7. Inventory Management

The system shall:

- Track stock quantities.
- Reduce stock after successful orders.
- Restore stock after cancelled orders.
- Prevent negative inventory.
- Display out-of-stock products.
- Generate low-stock alerts.
- Maintain inventory history.

Future:

- Barcode support.
- Bulk inventory import.

---

# 8. Cart Module

Customers shall be able to:

- Add products.
- Remove products.
- Change quantities.
- View subtotal.
- View delivery charges.
- View total amount.
- Clear cart.

The cart shall only contain products from one store at a time.

---

# 9. Order Module

Customers shall be able to:

- Place orders.
- View current orders.
- View completed orders.
- Cancel eligible orders.

Store Owners shall be able to:

- View incoming orders.
- Accept orders.
- Reject orders.
- Mark orders as preparing.
- Mark orders as ready.
- Mark orders as delivered.
- Record payment status.

---

# 10. Payment Module

The system shall support:

Cash on Delivery (if allowed)

Online Payment (future)

Verified Customer Credit

Store Owners shall be able to:

- Approve verified customers.
- Remove verification.
- Set customer credit limits (future).

Customers who are not verified shall complete payment before order confirmation (when online payments are enabled).

---

# 11. Customer Verification

Store Owners shall:

- Mark trusted customers as verified.
- Remove verification.
- View verification history.

Verified customers may:

- Purchase on credit.
- Pay later according to store policy.

Verification is store-specific.

A verified customer in one store is not automatically verified in another store.

---

# 12. Notification Module

The system shall notify users about:

- Order confirmation.
- Order acceptance.
- Order rejection.
- Order ready.
- Order delivered.
- Payment received.
- Low stock alerts.
- Important announcements.

Future:

Push Notifications

SMS

Email

---

# 13. Admin Module

Platform Administrators shall:

- Manage stores.
- Manage customers.
- Suspend users.
- Suspend stores.
- View platform analytics.
- Manage categories (optional).
- Review reported issues.

Future:

District management.

Platform announcements.

---

# 14. Search Module

Customers shall be able to:

- Search products.
- Search categories.
- Search stores.

Future:

Fuzzy search.

Voice search.

Barcode search.

---

# 15. Analytics Module

Store Owners shall view:

- Daily sales.
- Weekly sales.
- Monthly sales.
- Revenue.
- Best-selling products.
- Low-stock products.
- Customer count.
- Repeat customers.

Platform Administrators shall view:

- Total stores.
- Total customers.
- Total orders.
- Platform growth.

---

# 16. Security Features

The system shall:

- Require authentication for protected resources.
- Validate all user inputs.
- Authorize every protected request.
- Encrypt passwords.
- Record important security events.
- Protect APIs against abuse.

---

# 17. Audit Logging

The system shall maintain logs for:

- User login.
- User logout.
- Product creation.
- Product deletion.
- Order creation.
- Order cancellation.
- Inventory updates.
- Admin actions.

---

# 18. Future Enhancements

Future versions may include:

- Multi-district support.
- Delivery partners.
- Loyalty points.
- Coupons.
- Reviews & ratings.
- Wishlist.
- AI recommendations.
- Barcode scanning.
- QR store sharing.
- Offline synchronization.
- Inventory forecasting.
- Multi-language support.
- Dark mode.

---

# 19. Functional Scope (v1.0)

The initial release shall include:

- Customer authentication
- Store owner authentication
- Admin authentication
- Product management
- Category management
- Inventory management
- Shopping cart
- Order management
- Verified customer system
- Admin dashboard
- Mobile application
- Basic analytics

Features marked as "Future" are outside the scope of v1.0.