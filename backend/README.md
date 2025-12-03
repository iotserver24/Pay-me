# PayMe Backend API

The robust Node.js/Express backend for the PayMe ecosystem. It handles payment creation, verification, admin authentication, and Razorpay webhooks.

## 🚀 Features

* **RESTful API**: Clean endpoints for creating and managing payments.
* **Razorpay Integration**: Handles Order Creation and Signature Verification.
* **Webhook Handler**: Securely processes `payment.captured` and `payment.failed` events.
* **Admin Auth**: JWT-based authentication for the Admin Dashboard.
* **MongoDB**: Stores all transaction logs and history.

## 🛠 Setup & Deployment

For detailed instructions on how to configure environment variables (`.env`), set up the database, and deploy to production, please refer to the main **[Hosting Guide](../docs/HOSTING.md)**.

## 📖 API Documentation

For a complete list of endpoints and usage examples, see the **[API Documentation](../docs/API.md)**.

## 📦 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```
