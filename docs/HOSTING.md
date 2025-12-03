# Hosting Guide for PayMe

This guide covers the deployment and configuration of the PayMe application, including the Backend (Node.js/Express), Frontend (Next.js), Database (MongoDB), and Razorpay Webhooks.

## 1. Architecture Overview

*   **Frontend**: Next.js application (React). Connects to the Backend API.
*   **Backend**: Node.js & Express. Connects to MongoDB and Razorpay.
*   **Database**: MongoDB (Stores payment records and admin logs).
*   **Payment Gateway**: Razorpay (Handles actual payment processing).

---

## 2. Prerequisites

*   **Node.js** (v18 or higher recommended)
*   **MongoDB Connection String** (MongoDB Atlas or self-hosted)
*   **Razorpay Account** (Key ID and Key Secret)
*   **Domain Name(s)** (Optional but recommended for production)

---

## 3. Database Setup (MongoDB)

1.  **Create a Cluster**: Sign up for [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster.
2.  **Create a User**: Create a database user with read/write permissions.
3.  **Network Access**: Allow access from `0.0.0.0/0` (or your specific server IP).
4.  **Get Connection String**:
    *   Format: `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/payments`
    *   Save this for the Backend `.env` file.

---

## 4. Backend Deployment

The backend is an Express.js application. You can host it on platforms like **Render**, **Railway**, **Heroku**, or a **VPS** (DigitalOcean, AWS).

### Environment Variables (`backend/.env`)

Create a `.env` file in the `backend` directory (or configure these in your hosting provider's dashboard):

```env
# Server Configuration
PORT=3000
# Allowed Frontend URLs (comma-separated)
FRONTEND_URL=https://your-frontend-domain.com,http://localhost:3001

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/payments

# Admin Credentials (for accessing the dashboard)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here

# JWT Secret (for admin session tokens)
JWT_SECRET=generate_a_long_random_string

# Razorpay API Keys (from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Razorpay Webhook Secret (Defined by you, used in Razorpay Dashboard)
RAZORPAY_WEBHOOK_SECRET=your_custom_webhook_secret
```

### Deployment Steps (Example: Render/Railway)

1.  Connect your repository.
2.  Set Root Directory to `backend`.
3.  Build Command: `npm install`
4.  Start Command: `npm start`
5.  Add the Environment Variables listed above.

---

## 5. Frontend Deployment

The frontend is a Next.js application. The easiest way to deploy is using **Vercel** or **Netlify**.

### Environment Variables (`frontend/.env`)

Configure these in your Vercel/Netlify project settings:

```env
# URL of your deployed Backend (e.g., https://api.payme.com)
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com

# Razorpay Key ID (Must match the one in Backend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx

# URL of this Frontend (used for some internal logic/docs)
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Steps (Vercel)

1.  Import your repository to Vercel.
2.  Select `frontend` as the Root Directory.
3.  Framework Preset: `Next.js`.
4.  Add the Environment Variables.
5.  Deploy.

---

## 6. Razorpay & Webhook Configuration

Webhooks are critical for updating payment statuses (e.g., marking them as `VERIFIED` or `FAILED`) if the user closes the browser window early.

### Setup Steps

1.  Login to **Razorpay Dashboard**.
2.  Go to **Settings** -> **Webhooks**.
3.  Click **+ Add New Webhook**.
4.  **Webhook URL**: `https://your-backend-domain.com/api/payments/webhook`
    *   *Note: Ensure this points to your deployed backend URL.*
5.  **Secret**: Enter the value you set for `RAZORPAY_WEBHOOK_SECRET` in your Backend `.env`.
    *   *Important: These MUST match exactly.*
6.  **Active Events**: Select the following:
    *   `payment.captured`
    *   `payment.failed`
7.  Click **Create Webhook**.

### Verification

*   Create a test payment on your deployed frontend.
*   Check the **Admin Dashboard** (`/admin`).
*   The payment status should update to `VERIFIED` automatically once the payment is successful.

---

## 7. Troubleshooting

*   **CORS Errors**: Ensure `FRONTEND_URL` in Backend `.env` includes your frontend domain exactly (no trailing slash).
*   **Database Connection Failed**: Check if your IP is whitelisted in MongoDB Atlas.
*   **Webhook Signature Invalid**: Ensure `RAZORPAY_WEBHOOK_SECRET` in Backend `.env` matches the Secret entered in Razorpay Dashboard.
