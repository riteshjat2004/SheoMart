# SheoMart User Flow

Version: 1.0

---

# Purpose

This document defines the primary user journeys within SheoMart.

These flows describe how users interact with the application from entry to task completion.

---

# Customer Journey

## First-Time User

Open App

↓

Splash Screen

↓

Onboarding

↓

Welcome

↓

Register

↓

Login

↓

Home

---

## Returning User

Open App

↓

Splash Screen

↓

Auto Login (If Session Exists)

↓

Home

---

# Store Selection Flow

Home

↓

Nearby Stores

↓

Select Store

↓

Store Details

↓

Browse Categories

↓

Browse Products

---

# Product Discovery Flow

Home

↓

Categories

↓

Category Products

↓

Product Details

↓

Add to Cart

---

Alternative

Home

↓

Search

↓

Search Results

↓

Product Details

↓

Add to Cart

---

# Shopping Flow

Home

↓

Store

↓

Category

↓

Product

↓

Cart

↓

Checkout

↓

Address Selection

↓

Payment

↓

Order Confirmation

↓

Order Tracking

---

# Checkout Flow

Cart

↓

Review Products

↓

Select Delivery Address

↓

Review Order Summary

↓

Payment Method

↓

Place Order

↓

Order Success

---

# Order Tracking Flow

Orders

↓

Current Orders

↓

Order Details

↓

Track Status

↓

Delivered

↓

Invoice

---

# Profile Flow

Profile

↓

Edit Profile

↓

Save Changes

---

Profile

↓

Manage Addresses

↓

Add Address

↓

Save

---

Profile

↓

Notifications

↓

Notification Details

---

# Verified Customer Flow

Customer

↓

Place Order

↓

Backend Checks Verification

↓

Verified

↓

Pay Later Allowed

↓

Order Confirmed

---

Not Verified

↓

Online Payment Required (Future)

↓

Payment Success

↓

Order Confirmed

---

# Store Owner Journey

Login

↓

Dashboard

↓

Orders

↓

Accept Order

↓

Prepare Order

↓

Ready

↓

Delivered

↓

Complete

---

# Product Management Flow

Dashboard

↓

Products

↓

Add Product

↓

Upload Image

↓

Set Price

↓

Set Stock

↓

Save

↓

Product List

---

# Inventory Flow

Dashboard

↓

Inventory

↓

Select Product

↓

Update Stock

↓

Save

↓

Inventory History Updated

---

# Category Management Flow

Dashboard

↓

Categories

↓

Add Category

↓

Save

↓

Category List

---

# Verified Customer Flow (Store Owner)

Dashboard

↓

Customers

↓

Select Customer

↓

Mark Verified

↓

Confirmation

↓

Customer Updated

---

# Analytics Flow

Dashboard

↓

Analytics

↓

Select Date Range

↓

View Reports

↓

Export (Future)

---

# Admin Journey

Login

↓

Dashboard

↓

Stores

↓

Store Details

↓

Suspend / Activate

↓

Dashboard

---

Dashboard

↓

Customers

↓

Customer Details

↓

Suspend / Restore

↓

Dashboard

---

Dashboard

↓

Analytics

↓

Platform Reports

---

# Authentication Flow

App Launch

↓

Access Token Valid?

↓

Yes

↓

Home

---

No

↓

Refresh Token Valid?

↓

Yes

↓

Generate New Access Token

↓

Home

---

No

↓

Login

---

# Password Reset Flow

Forgot Password

↓

Enter Mobile / Email

↓

OTP Verification (Future)

↓

Reset Password

↓

Login

---

# Error Flow

API Failure

↓

Error Screen

↓

Retry

↓

Success

OR

Return to Previous Screen

---

# Empty State Flow

Search

↓

No Results

↓

Show Empty State

↓

Return to Search

---

# Notification Flow

Order Status Updated

↓

Backend Event

↓

Push Notification (Future)

↓

Open Order Details

---

# Future Delivery Flow

Order Ready

↓

Assign Delivery Partner

↓

Pickup

↓

Navigation

↓

Delivered

↓

Complete

---

# Future Multi-District Flow

Open App

↓

Select State

↓

Select District

↓

Load Stores

↓

Home

---

# Navigation Principles

- Keep important actions within three taps.
- Minimize unnecessary navigation.
- Preserve user context.
- Provide clear back navigation.
- Avoid dead-end screens.

---

# UX Principles

- Reduce user effort.
- Show progress where applicable.
- Provide immediate feedback.
- Prevent accidental actions.
- Confirm destructive operations.
- Maintain consistent navigation patterns.

---

# Business Flow Summary

Customer

Browse

↓

Cart

↓

Checkout

↓

Order

↓

Track

↓

Receive

---

Store Owner

Receive Order

↓

Accept

↓

Prepare

↓

Deliver

↓

Complete

---

Administrator

Monitor

↓

Manage

↓

Support

↓

Analyze

---

# Version History

Version 1.0

- Initial customer, store owner, and administrator user flows defined.
- Future expansion flows included for scalability.