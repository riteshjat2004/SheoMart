# SheoMart - Admin Dashboard Architecture

Version: 1.0

---

# Purpose

Define the architecture of the SheoMart Admin Dashboard for platform administrators.

---

# Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

---

# Architecture Style

- Modular
- Component-Based
- Feature-Oriented

---

# Responsibilities

- Platform Management
- Store Management
- Customer Management
- Analytics
- Reports
- Audit Logs

---

# Folder Structure

```text
app/
components/
services/
hooks/
store/
utils/
types/
validations/
lib/
```

---

# Modules

- Authentication
- Dashboard
- Stores
- Customers
- Categories
- Orders
- Analytics
- Reports
- Notifications
- Audit Logs
- Settings

---

# Dashboard Widgets

- Total Stores
- Total Customers
- Total Orders
- Revenue
- Active Stores
- Recent Activities

---

# State Management

## Global State

- Authentication
- User
- Theme

## Server State

- Stores
- Customers
- Orders
- Analytics

---

# Routing

Protected Routes

```
/login
/dashboard
/stores
/customers
/orders
/categories
/analytics
/reports
/settings
```

---

# Forms

Library

- React Hook Form

Validation

- Zod

---

# Tables

Support:

- Search
- Filter
- Sorting
- Pagination
- Export (Future)

---

# Charts

- Revenue
- Orders
- Store Growth
- Customer Growth

---

# Security

- JWT Authentication
- RBAC
- Protected Routes
- Secure API Access
- Input Validation

---

# Error Handling

- Global Error Page
- Loading States
- Empty States
- Retry Support

---

# Future Ready

Supports:

- District Management
- Store Staff Management
- Feature Flags
- Platform Settings
- AI Insights

---

# Version

v1.0