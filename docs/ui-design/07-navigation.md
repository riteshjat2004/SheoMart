# SheoMart Navigation Architecture

Version: 1.0

---

# Purpose

This document defines the navigation architecture for the SheoMart platform.

The navigation system is designed to provide a simple, intuitive, and scalable user experience while supporting future expansion.

---

# Navigation Overview

SheoMart consists of three primary applications:

- Customer Mobile Application
- Store Owner Mobile Application
- Platform Admin Dashboard (Web)

Each application has its own navigation hierarchy.

---

# Customer Application

## Navigation Type

- Stack Navigation
- Bottom Tab Navigation
- Modal Navigation
- Bottom Sheets

---

## Authentication Stack

Splash

↓

Onboarding

↓

Welcome

↓

Login

↓

Register

↓

Forgot Password

↓

Reset Password

---

## Main Application

After successful login:

Bottom Tab Navigation

```
Home
Search
Cart
Orders
Profile
```

---

# Home Stack

Home

↓

Store Details

↓

Category Products

↓

Product Details

↓

Cart

↓

Checkout

↓

Order Success

---

# Search Stack

Search

↓

Search Results

↓

Product Details

↓

Cart

---

# Cart Stack

Cart

↓

Checkout

↓

Address Selection

↓

Payment

↓

Order Success

---

# Orders Stack

Orders

↓

Order Details

↓

Invoice

---

# Profile Stack

Profile

↓

Edit Profile

↓

Saved Addresses

↓

Notifications

↓

Settings

---

# Modal Screens

Confirmation Dialog

Image Viewer

Filters

Sorting

Select Address

Payment Method

---

# Store Owner Application

## Navigation Type

- Stack Navigation
- Bottom Navigation
- Modal Navigation

---

## Authentication

Login

↓

Dashboard

---

## Bottom Navigation

Dashboard

Orders

Products

Analytics

Settings

---

# Dashboard Stack

Dashboard

↓

Store Profile

↓

Edit Store

---

# Products Stack

Products

↓

Add Product

↓

Edit Product

↓

Product Details

---

# Categories Stack

Products

↓

Categories

↓

Add Category

↓

Edit Category

---

# Inventory Stack

Inventory

↓

Inventory History

---

# Orders Stack

Orders

↓

Order Details

---

# Customers Stack

Verified Customers

↓

Customer Details

---

# Analytics Stack

Analytics

↓

Reports (Future)

---

# Platform Admin Dashboard

## Navigation Type

Sidebar Navigation

---

# Sidebar Menu

Dashboard

Stores

Customers

Orders

Categories

Reports

Analytics

Audit Logs

Security Logs

Notifications

Settings

Profile

---

# Dashboard Flow

Dashboard

↓

Store Details

↓

Customer Details

↓

Reports

---

# Authentication Rules

Unauthenticated Users

↓

Authentication Stack Only

---

Authenticated Customer

↓

Customer Navigation

---

Authenticated Store Owner

↓

Store Owner Navigation

---

Authenticated Platform Admin

↓

Admin Dashboard

---

# Deep Linking (Future)

Support deep links for:

Store

```
sheomart://store/{storeId}
```

---

Product

```
sheomart://product/{productId}
```

---

Order

```
sheomart://order/{orderId}
```

---

QR Store

```
sheomart://store/{storeSlug}
```

---

# Navigation Guards

Protected screens require authentication.

Examples

- Cart
- Orders
- Checkout
- Profile
- Dashboard
- Analytics

---

Unauthorized users shall be redirected to Login.

---

# Session Handling

Expired Session

↓

Refresh Token

↓

Success

↓

Continue Navigation

---

Failure

↓

Logout

↓

Login

---

# Future Navigation

District Selection

↓

Store Selection

↓

Shopping

---

Delivery Partner

↓

Assigned Orders

↓

Delivery Details

↓

Navigation

---

Store Staff

↓

Dashboard

↓

Assigned Tasks

---

# Navigation Principles

- Maximum three taps to reach major features.
- Preserve navigation history.
- Avoid unnecessary screen transitions.
- Support deep linking.
- Keep navigation predictable.
- Provide consistent back navigation.

---

# Performance Guidelines

- Lazy load screens where appropriate.
- Avoid unnecessary re-renders.
- Cache navigation state when possible.
- Preserve scroll position where practical.

---

# Accessibility

- Support screen readers.
- Maintain logical navigation order.
- Ensure touch targets meet accessibility guidelines.
- Provide descriptive labels for navigation items.

---

# Version History

Version 1.0

- Initial navigation architecture created.
- Customer, Store Owner, and Admin navigation defined.
- Future expansion paths documented.