# SheoMart Component Library

Version: 1.0

---

# Purpose

This document defines the reusable UI components used throughout the SheoMart platform.

The objective is to maximize reusability, maintainability, consistency, and scalability.

All screens should be composed from these components whenever possible.

---

# Component Categories

- Layout Components
- Navigation Components
- Form Components
- Product Components
- Store Components
- Order Components
- Analytics Components
- Feedback Components
- Utility Components

---

# 1. Layout Components

## Screen Container

Purpose

Provides consistent page layout with safe area support.

Used In

All Screens

---

## Section Header

Contains

- Title
- Subtitle (Optional)
- Action Button (Optional)

---

## Divider

Horizontal separator between sections.

---

## Card Container

Reusable card wrapper.

Variants

- Default
- Elevated
- Outlined

---

## Bottom Sheet Container

Reusable bottom sheet layout.

---

# 2. Navigation Components

## Top App Bar

Contains

- Back Button
- Screen Title
- Action Icons

---

## Bottom Navigation Bar

Customer Navigation

- Home
- Search
- Cart
- Orders
- Profile

---

## Sidebar Menu

Admin Dashboard Navigation

---

## Tab Navigation

Used for

- Product Tabs
- Analytics
- Orders
- Categories

---

# 3. Buttons

## Primary Button

Usage

Primary actions

Examples

- Login
- Checkout
- Save
- Place Order

---

## Secondary Button

Usage

Secondary actions

Examples

- Cancel
- Edit
- Back

---

## Text Button

Examples

- Forgot Password
- View All

---

## Icon Button

Examples

- Favorite
- Delete
- Share
- Search

---

## Floating Action Button

Examples

- Add Product
- Add Category
- Add Address

---

# 4. Form Components

## Text Input

Variants

- Single Line
- Multi Line

---

## Password Input

Features

- Show Password
- Hide Password

---

## Search Bar

Features

- Search Icon
- Clear Button

Future

Voice Search

---

## Dropdown

Examples

- Category
- District
- Unit

---

## Checkbox

---

## Radio Button

---

## Toggle Switch

---

## OTP Input

6 Digit Input

---

## Quantity Stepper

Buttons

+

-

---

# 5. Store Components

## Store Card

Contains

- Logo
- Store Name
- Address
- Rating
- Open Status
- Distance

---

## Store Banner

Displays promotional banner.

---

## Store Status Badge

Variants

- Open
- Closed
- Busy

---

# 6. Product Components

## Product Card

Contains

- Product Image
- Product Name
- Price
- Discount
- Stock
- Add Button

---

## Product List Item

Compact version.

---

## Product Image Gallery

Supports multiple images.

---

## Price Component

Displays

- Selling Price
- Original Price
- Discount

---

## Stock Indicator

Variants

- In Stock
- Low Stock
- Out of Stock

---

## Category Card

Contains

- Category Icon
- Category Name

---

# 7. Cart Components

## Cart Item

Contains

- Product
- Quantity Stepper
- Price
- Remove Button

---

## Order Summary Card

Displays

- Subtotal
- Delivery Charges
- Total Amount

---

## Coupon Card (Future)

---

# 8. Address Components

## Address Card

Contains

- Name
- Address
- Mobile Number
- Default Badge

---

## Address Selector

Used during checkout.

---

# 9. Order Components

## Order Card

Contains

- Order ID
- Store Name
- Amount
- Date
- Status

---

## Order Timeline

Displays

- Pending
- Accepted
- Preparing
- Ready
- Delivered

---

## Invoice Card

Displays payment summary.

---

# 10. Customer Components

## Customer Card

Contains

- Profile Image
- Name
- Mobile Number
- Verified Badge

---

## Verified Badge

Variants

- Verified
- Not Verified

---

# 11. Analytics Components

## Statistic Card

Contains

- Title
- Value
- Icon
- Trend

---

## Sales Chart

---

## Revenue Chart

---

## Inventory Chart

---

## Customer Growth Chart

---

# 12. Feedback Components

## Loading Indicator

Variants

- Full Screen
- Inline
- Button

---

## Skeleton Loader

---

## Empty State

Examples

- No Orders
- No Products
- No Internet
- No Notifications

---

## Success Message

---

## Error Message

---

## Warning Message

---

## Info Message

---

# 13. Dialog Components

## Confirmation Dialog

---

## Delete Dialog

---

## Logout Dialog

---

## Payment Confirmation Dialog

---

## Error Dialog

---

# 14. Notification Components

## Notification Card

Contains

- Icon
- Title
- Message
- Time

---

## Toast

Variants

- Success
- Error
- Warning
- Info

---

## Snackbar

Actionable notification.

---

# 15. Image Components

## Avatar

Sizes

- Small
- Medium
- Large

---

## Product Image

---

## Store Logo

---

## Banner Image

---

# 16. Utility Components

## Status Badge

Variants

- Pending
- Accepted
- Preparing
- Delivered
- Cancelled
- Paid
- Unpaid
- Verified

---

## Chip

Examples

- Organic
- Bestseller
- New
- Discount

---

## Divider

---

## Spacer

Reusable spacing component.

---

# 17. Future Components

- Barcode Scanner
- QR Scanner
- AI Chat Widget
- Voice Search
- Loyalty Card
- Coupon Banner
- Delivery Tracking Map
- Store Staff Card
- Expense Card

---

# Component Development Guidelines

- Every component shall have a single responsibility.
- Components shall be reusable across multiple screens.
- Business logic shall remain outside UI components.
- Components shall receive data through props.
- Avoid duplicate UI implementations.

---

# Naming Convention

Examples

```
PrimaryButton
SecondaryButton
StoreCard
ProductCard
CartItem
OrderCard
AddressCard
SearchBar
StatusBadge
LoadingOverlay
```

---

# Folder Structure

```
components/
│
├── ui/
├── buttons/
├── cards/
├── forms/
├── navigation/
├── layout/
├── feedback/
├── analytics/
├── orders/
├── products/
├── stores/
├── profile/
└── common/
```

---

# Version History

Version 1.0

- Initial reusable component library defined.
- Covers MVP components with placeholders for future expansion.