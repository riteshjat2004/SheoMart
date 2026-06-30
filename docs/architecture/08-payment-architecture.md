# SheoMart - Payment Architecture

Version: 1.0

---

# Purpose

Define the payment workflow and payment-related business logic for SheoMart.

---

# Payment Modes

## Version 1.0

- Pay Later (Verified Customer)
- Cash Payment (Store Supported)

---

## Future

- Razorpay
- UPI
- Credit/Debit Card
- Net Banking
- Wallets

---

# Payment Flow

## Verified Customer

```text
Checkout
    │
Customer Verified?
    │
    ├── Yes
    │      │
    │   Place Order
    │      │
    │ Payment Pending
    │      │
    │ Pay Later
    │
    └── No
           │
      Payment Required
```

---

## Online Payment (Future)

```text
Checkout
    │
Create Payment Order
    │
Razorpay
    │
Payment Success
    │
Verify Signature
    │
Create Order
```

---

# Payment Status

| Status | Description |
|---------|-------------|
| Pending | Awaiting payment |
| Paid | Payment completed |
| Failed | Payment unsuccessful |
| Refunded | Amount refunded |
| Cancelled | Payment cancelled |

---

# Payment Record

Each payment stores:

- Payment ID
- Order ID
- Customer ID
- Store ID
- Amount
- Payment Method
- Payment Status
- Transaction Date

---

# Business Rules

- Backend calculates final amount.
- Client cannot modify price.
- One payment belongs to one order.
- Payment records are immutable.
- Every payment event is logged.

---

# Security

- Verify all payment callbacks.
- Never trust frontend payment status.
- Store only required transaction data.
- Validate payment amount on backend.
- Log failed payment attempts.

---

# Future Enhancements

- Partial Payments
- Credit Limit
- Monthly Billing
- Refund Management
- Digital Invoices

---

# Version

v1.0