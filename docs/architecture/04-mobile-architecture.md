# SheoMart - Mobile Architecture

Version: 1.0

---

# Purpose

Define the architecture of the SheoMart mobile application.

---

# Tech Stack

- React Native
- Expo
- TypeScript
- Expo Router
- Zustand
- TanStack Query
- React Hook Form
- Zod

---

# Architecture Style

- Feature-Based
- Component-Driven
- Modular
- Scalable

---

# Folder Structure

```text
app/
components/
services/
store/
hooks/
utils/
constants/
types/
validations/
assets/
```

---

# Application Layers

```text
UI
│
Hooks
│
Services
│
API
│
Backend
```

---

# Routing

Expo Router

Main Groups

- Authentication
- Customer
- Store Owner

---

# State Management

## Global State (Zustand)

- Authentication
- User
- Cart
- Theme
- Notifications

---

## Server State (TanStack Query)

- Products
- Categories
- Stores
- Orders
- Analytics

---

## Local State

React Hooks

- Forms
- Dialogs
- UI States

---

# Feature Modules

- Authentication
- Home
- Search
- Categories
- Products
- Cart
- Checkout
- Orders
- Profile
- Notifications
- Store Dashboard
- Inventory
- Analytics

---

# Services

Responsible for:

- API Calls
- Token Refresh
- Error Handling
- Request Retry

---

# Forms

Library

- React Hook Form

Validation

- Zod

---

# Navigation

Customer

- Bottom Tabs
- Stack Navigation

Store Owner

- Bottom Tabs
- Stack Navigation

---

# Reusable Components

- Buttons
- Cards
- Inputs
- Dialogs
- Lists
- Badges
- Loaders

---

# Image Handling

- Lazy Loading
- Placeholder
- Cache
- Cloudinary URLs

---

# Error Handling

- Error Boundary
- Retry UI
- Empty States
- Offline Handling

---

# Security

- Secure Token Storage
- Protected Routes
- Input Validation
- No Sensitive Data in Local Storage

---

# Performance

- Lazy Loading
- Memoization
- Pagination
- Optimized Images
- Query Caching

---

# Future Ready

Supports:

- Push Notifications
- QR Scanner
- Barcode Scanner
- AI Assistant
- Offline Mode
- Dark Mode
- Multi-District

---

# Version

v1.0