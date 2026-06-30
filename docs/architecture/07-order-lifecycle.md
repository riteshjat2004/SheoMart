# SheoMart - Order Lifecycle

Version: 1.0

---

# Purpose

Define the complete lifecycle of an order from creation to completion.

---

# Order Flow

```text
Cart
   │
Checkout
   │
Order Created
   │
Store Reviews Order
   │
Accepted / Rejected
   │
Preparing
   │
Ready
   │
Delivered
   │
Completed
```

---

# Order Status

| Status | Description |
|---------|-------------|
| Pending | Order placed, awaiting store action |
| Accepted | Store accepted the order |
| Rejected | Store rejected the order |
| Preparing | Order is being prepared |
| Ready | Order is ready for pickup/delivery |
| Delivered | Customer received the order |
| Cancelled | Order cancelled |
| Completed | Order successfully closed |

---

# Customer Flow

1. Add products to cart.
2. Proceed to checkout.
3. Select address.
4. Review order.
5. Choose payment method.
6. Place order.
7. Track order.
8. View invoice.

---

# Store Owner Flow

1. Receive order.
2. Review availability.
3. Accept or reject.
4. Prepare order.
5. Mark ready.
6. Deliver / Hand over.
7. Complete order.

---

# Payment Flow

## Verified Customer

```
Place Order
      │
Credit Allowed
      │
Order Accepted
      │
Payment Later
```

---

## Normal Customer

```
Place Order
      │
Payment Required
      │
Payment Success
      │
Order Accepted
```

---

# Inventory Flow

```text
Order Accepted
      │
Reduce Stock
      │
Inventory Updated
```

Cancelled Before Preparation

```text
Restore Stock
```

---

# Cancellation Rules

Customer

- Allowed only before preparation.

Store Owner

- Can reject pending orders.

System

- Logs cancellation reason.

---

# Notifications

Customer Receives

- Order Placed
- Order Accepted
- Order Rejected
- Preparing
- Ready
- Delivered

Store Owner Receives

- New Order
- Payment Confirmation (Future)

---

# Business Rules

- One order belongs to one customer.
- One order belongs to one store.
- Cart contains products from one store only.
- Final price calculated by backend.
- Delivered orders cannot be edited.
- Every status change is logged.

---

# Future Enhancements

- Delivery Partner Assignment
- Live Order Tracking
- ETA Calculation
- Partial Order Fulfillment
- Scheduled Orders

---

# Version

v1.0