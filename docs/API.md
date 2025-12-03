# PayMe API Documentation

This document outlines the API endpoints available via the **Frontend Proxy**.
For security and simplicity, all client-side requests should be made to the Frontend URL (`http://localhost:3001` or your production domain), which proxies them to the backend.

**Base URL**: `http://localhost:3001/api`

---

## 1. Create Payment

Create a new payment link.

- **Endpoint**: `POST /api/payments/create`
- **URL**: `http://localhost:3001/api/payments/create`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "amount": 1000,             // Amount in smallest currency unit (e.g., 1000 paise = 10 INR)
  "currency": "INR",          // Currency code
  "description": "Order #123",// Description of the payment
  "userId": "user_001",       // Optional: Your system's user ID
  "returnUrl": "https://...", // Optional: Redirect URL after success. The system will append ?id={paymentId} to this URL.
  "adminNotes": "VIP Client"  // Optional: Internal notes visible only to admins
}
```

- **Response**:

```json
{
  "id": "A1b2C3d4E5f6G7" // 14-character alphanumeric Payment ID
}
```

---

## 2. Check Payment Status

Check the current status of a payment.

- **Endpoint**: `GET /api/payments/status/:paymentId`
- **URL**: `http://localhost:3001/api/payments/status/<PAYMENT_ID>`
- **Response**:

```json
{
  "paymentId": "A1b2C3d4E5f6G7",
  "status": "VERIFIED", // PENDING | NOT_VERIFIED | VERIFIED | FAILED | EXPIRED
  "amount": 1000,
  "currency": "INR"
}
```

---

## 3. Verify Payment (Manual)

Manually verify a payment using Razorpay signature (used by the frontend checkout page).

- **Endpoint**: `POST /api/payments/verify`
- **URL**: `http://localhost:3001/api/payments/verify`
- **Body**:

```json
{
  "paymentId": "A1b2C3d4E5f6G7",
  "razorpay_payment_id": "pay_...",
  "razorpay_order_id": "order_...",
  "razorpay_signature": "..."
}
```

- **Response**:

```json
{
  "status": "NOT_VERIFIED", // or VERIFIED
  "paymentId": "...",
  ...
}
```

---

## 4. Admin Login

Login to the admin dashboard.

- **Endpoint**: `POST /api/admin/login`
- **URL**: `http://localhost:3001/api/admin/login`
- **Body**:

```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

- **Response**:

```json
{
  "token": "JWT_TOKEN_STRING"
}
```
