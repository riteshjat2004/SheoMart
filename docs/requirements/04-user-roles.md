# SheoMart - User Roles & Permissions

Version: v1.0

---

# 1. Introduction

This document defines the user roles and permissions within the SheoMart platform.

The system follows Role-Based Access Control (RBAC), where every authenticated user is assigned one or more roles. Access to resources and actions is determined based on these roles.

---

# 2. User Roles

The platform currently supports three primary roles:

1. Customer
2. Store Owner
3. Platform Administrator

Future versions may introduce additional roles such as Store Staff and Delivery Partner.

---

# 3. Customer

Customers are the primary users of the mobile application.

### Responsibilities

- Register and manage their account.
- Browse stores and products.
- Add products to cart.
- Place orders.
- Make payments (when applicable).
- View order history.
- Maintain delivery addresses.

### Permissions

Account

- Register
- Login
- Logout
- Change Password
- Update Profile
- Upload Profile Photo

Store

- View Stores
- View Store Information
- View Store Timings

Products

- Browse Products
- Search Products
- Filter Products
- View Product Details

Cart

- Add Items
- Remove Items
- Update Quantity
- Clear Cart

Orders

- Place Order
- View Orders
- Track Orders
- Cancel Eligible Orders
- View Invoice

Addresses

- Add Address
- Edit Address
- Delete Address

Notifications

- Receive Notifications

Restrictions

Customers shall NOT:

- Modify store information.
- Modify inventory.
- Access admin APIs.
- Access other customers' data.
- Access another store's management features.

---

# 4. Store Owner

Each Store Owner manages exactly one grocery store in v1.0.

Future versions may support multiple stores under one owner.

### Responsibilities

- Manage grocery inventory.
- Manage customer orders.
- Manage trusted customers.
- View store analytics.

### Permissions

Store Management

- Update Store Information
- Upload Store Logo
- Update Business Hours
- Enable / Disable Store

Category Management

- Create Category
- Edit Category
- Delete Category

Product Management

- Create Product
- Edit Product
- Delete Product
- Upload Product Images
- Update Pricing
- Update Inventory
- Enable / Disable Products

Customer Management

- View Store Customers
- Mark Customer as Verified
- Remove Verification

Orders

- View Orders
- Accept Orders
- Reject Orders
- Update Order Status
- Record Payment Status

Analytics

- View Sales
- View Revenue
- View Inventory Reports

Restrictions

Store Owners shall NOT:

- View another store's products.
- View another store's customers.
- Modify platform settings.
- Access platform administrator APIs.

---

# 5. Platform Administrator

Platform Administrators manage the entire SheoMart platform.

### Responsibilities

- Manage platform operations.
- Manage stores.
- Manage users.
- Monitor platform health.

### Permissions

Store Management

- Approve Stores (Future)
- Suspend Stores
- Reactivate Stores

Customer Management

- Suspend Customers
- Restore Customer Accounts

Platform Management

- View Platform Analytics
- View Registered Stores
- View Registered Customers
- Manage Categories (optional)

Moderation

- Review Reports
- Resolve Issues

Security

- View Audit Logs
- Manage Platform Announcements (Future)

Restrictions

Platform Administrators shall NOT:

- Access customer passwords.
- Access authentication secrets.
- Modify payment records without audit logging.

---

# 6. Future Roles

## Store Staff

Future versions may allow Store Owners to create staff accounts.

Possible permissions:

- Inventory Updates
- Order Processing
- Customer Assistance

Restrictions

- Cannot change ownership.
- Cannot delete store.
- Cannot access platform administration.

---

## Delivery Partner

Future versions may support delivery personnel.

Possible permissions:

- View Assigned Orders
- Accept Delivery
- Update Delivery Status
- Navigate to Customer Location

Restrictions

- Cannot modify products.
- Cannot modify payments.
- Cannot access store management.

---

# 7. Permission Matrix

| Module | Customer | Store Owner | Platform Admin |
|----------|-----------|-------------|----------------|
| Authentication | ✅ | ✅ | ✅ |
| Profile Management | ✅ | ✅ | ✅ |
| Store Management | ❌ | ✅ (Own Store) | ✅ |
| Product Management | ❌ | ✅ (Own Store) | View Only |
| Category Management | ❌ | ✅ | Optional |
| Inventory | ❌ | ✅ | View |
| Shopping Cart | ✅ | ❌ | ❌ |
| Orders | Own Orders | Own Store Orders | View All |
| Customer Verification | ❌ | ✅ | ❌ |
| Analytics | ❌ | Own Store | Platform |
| Notifications | Receive | Receive | Receive |
| Audit Logs | ❌ | ❌ | ✅ |

---

# 8. Ownership Rules

The platform follows strict ownership rules.

Examples:

- Customers may only access their own orders.
- Customers may only edit their own profile.
- Store Owners may only manage their own store.
- Products belong to one store only.
- Orders belong to one customer and one store.
- Customer verification is store-specific.

No user shall access resources belonging to another tenant without authorization.

---

# 9. Authorization Principles

The backend shall verify:

- Authentication
- User Role
- Resource Ownership

Every protected API shall enforce these checks before executing business logic.

The frontend shall never be trusted for authorization decisions.

---

# 10. Security Notes

Role information shall be validated on the server.

Hidden UI elements do not provide security.

All permissions must be enforced by backend middleware.

Authorization failures shall return appropriate HTTP status codes.

Permission changes shall be reflected immediately in subsequent authenticated requests.

---

# 11. Future Enhancements

Future RBAC improvements may include:

- Custom Permissions
- Permission Groups
- Multiple Store Owners
- Store Staff Hierarchy
- Fine-Grained Permissions
- Feature Flags
- District Administrators

The architecture should remain flexible to support these enhancements.