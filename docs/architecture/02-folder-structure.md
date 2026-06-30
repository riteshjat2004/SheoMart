# SheoMart - Folder Structure

Version: 1.0

---

# Purpose

Define the standard folder structure for the entire SheoMart project.

---

# Repository Structure

```text
SheoMart/
│
├── sheomart-mobile/
├── sheomart-backend/
├── sheomart-admin/
│
├── docs/
├── assets/
├── scripts/
├── shared/
│
├── .github/
├── .gitignore
├── LICENSE
└── README.md
```

---

# Mobile Application

```text
sheomart-mobile/
│
├── app/
├── assets/
├── components/
├── constants/
├── hooks/
├── services/
├── store/
├── types/
├── utils/
├── validations/
└── package.json
```

---

# Backend

```text
sheomart-backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   ├── types/
│   ├── constants/
│   ├── jobs/
│   ├── sockets/
│   ├── app.ts
│   └── server.ts
│
├── uploads/
├── tests/
├── .env.example
└── package.json
```

---

# Admin Dashboard

```text
sheomart-admin/
│
├── app/
├── components/
├── hooks/
├── lib/
├── services/
├── store/
├── types/
├── utils/
├── validations/
└── package.json
```

---

# Shared

```text
shared/
│
├── constants/
├── types/
├── interfaces/
└── schemas/
```

---

# Documentation

```text
docs/
│
├── requirements/
├── architecture/
├── database/
├── api/
├── security/
├── deployment/
├── ui-design/
├── decisions/
└── meeting-notes/
```

---

# Naming Conventions

## Files

- kebab-case
- Example:
  - product-card.tsx
  - auth-service.ts

---

## Components

- PascalCase

Example:

- ProductCard
- StoreCard
- OrderCard

---

## Variables

camelCase

---

## Constants

UPPER_SNAKE_CASE

---

## Interfaces

Prefix with `I`

Example:

- IUser
- IProduct

---

## Git Branches

- main
- develop

---

# Development Rules

- Keep modules independent.
- Reuse code before creating new components.
- One responsibility per file.
- Never commit secrets.
- Keep shared types in `shared/`.

---

# Version

v1.0