# SheoMart - Authentication Flow

Version: 1.0

---

# Purpose

Define the authentication and authorization flow for SheoMart.

---

# Authentication Method

- JWT Access Token
- JWT Refresh Token
- Role-Based Access Control (RBAC)

---

# User Roles

- Customer
- Store Owner
- Platform Admin

---

# Login Flow

```text
User
   │
Enter Credentials
   │
Backend Validation
   │
Password Verification
   │
Generate Access Token
   │
Generate Refresh Token
   │
Return User + Tokens
   │
Redirect to Dashboard/Home
```

---

# Registration Flow

```text
Register
   │
Validate Input
   │
Check Existing User
   │
Hash Password
   │
Create Account
   │
Generate Tokens
   │
Login
```

---

# Protected API Flow

```text
Client Request
      │
Access Token
      │
JWT Verification
      │
Role Verification
      │
Resource Ownership Check
      │
Controller
```

---

# Token Strategy

## Access Token

- Short Expiry
- Sent with API Requests

---

## Refresh Token

- Longer Expiry
- Used to Generate New Access Token
- Stored Securely

---

# Authorization Flow

```text
Authenticated?
      │
      ├── No → 401 Unauthorized
      │
      ▼
Role Allowed?
      │
      ├── No → 403 Forbidden
      │
      ▼
Owns Resource?
      │
      ├── No → 403 Forbidden
      │
      ▼
Allow Request
```

---

# Password Security

- bcrypt Hashing
- Minimum Password Policy
- Never Store Plain Text Passwords

---

# Logout Flow

```text
Logout
   │
Invalidate Refresh Token
   │
Clear Session
   │
Redirect to Login
```

---

# Password Reset (Future)

```text
Forgot Password
      │
Verify Identity
      │
OTP / Email Verification
      │
Reset Password
      │
Login
```

---

# Session Management

- One Active Session per Device
- Refresh Tokens Can Be Revoked
- Automatic Logout on Invalid Session

---

# Route Protection

Public Routes

- Login
- Register
- Forgot Password

Protected Routes

- Profile
- Cart
- Orders
- Dashboard
- Products
- Analytics

---

# Security Rules

- Never Trust Client Data
- Validate Every Request
- Verify JWT on Every Protected API
- Check User Role
- Check Resource Ownership
- Log Authentication Events

---

# Future Enhancements

- Email Verification
- Mobile OTP Login
- Two-Factor Authentication (2FA)
- Biometric Login
- Social Login

---

# Version

v1.0