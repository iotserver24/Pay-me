# Payment Microservice Wrapper

A complete payment microservice + frontend for a custom Razorpay-based payment gateway wrapper.

## Architecture

- **Backend**: Node.js + Express + Mongoose (Port 3000)
- **Frontend**: Next.js (React) + Tailwind CSS (Port 3001)
- **Database**: MongoDB (Port 27017)
- **Management**: Mongo Express (Port 8081)

## Prerequisites

- Docker & Docker Compose
- Razorpay Account (Test Mode)

## Setup & Run

1. **Clone the repository** (if not already done).
2. **Environment Variables**:
   Copy `example.env` to `.env` in the root directory and fill in your details.
   ```bash
   cp example.env .env
   ```
   Edit `.env`:
   - `RAZORPAY_KEY_ID`: Get from Razorpay Dashboard
   - `RAZORPAY_KEY_SECRET`: Get from Razorpay Dashboard
   - `ADMIN_EMAIL`: Your desired admin email
   - `ADMIN_PASSWORD`: Your desired admin password
   - `JWT_SECRET`: Random string

3. **Run with Docker Compose**:
   ```bash
   docker compose up --build
   ```

4. **Access the Application**:
   - Frontend (Pay & Admin): [http://localhost:3001](http://localhost:3001)
   - Backend API: [http://localhost:3000](http://localhost:3000)
   - Mongo Express: [http://localhost:8081](http://localhost:8081)

## Manual Run (without Docker)

**Backend**:
1. `cd backend`
2. `cp example.env .env` (Update values, ensure MONGO_URI points to localhost if running local mongo)
3. `npm install`
4. `npm start`

**Frontend**:
1. `cd frontend`
2. `cp example.env .env.local`
3. `npm install`
4. `npm run dev`

## API & Usage Examples

### 1. Create a Payment (Backend)
```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "description": "Test Payment",
    "userId": "user_123",
    "returnUrl": "http://localhost:3001/success"
  }'
```
Response:
```json
{ "id": "PaymentIdString" }
```

### 2. Pay (Frontend)
Go to `http://localhost:3001/pay/PaymentIdString`.
Click "Pay Now", complete the Razorpay test checkout.

### 3. Check Status
```bash
curl http://localhost:3000/api/payments/status/PaymentIdString
```

### 4. Admin Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "supersecurepassword"
  }'
```

### 5. Webhook Setup
1. Go to Razorpay Dashboard > Settings > Webhooks.
2. Add New Webhook.
3. Webhook URL: `YOUR_PUBLIC_DOMAIN/api/payments/webhook` (Use ngrok for local dev: `ngrok http 3000`).
4. Secret: Same as `RAZORPAY_KEY_SECRET` in `.env` (or whatever logic you prefer, usually key secret is used for signature verif, but you can set a separate webhook secret if you modify the code). The code currently uses `RAZORPAY_KEY_SECRET` to verify the `x-razorpay-signature`.
5. Active Events: `payment.captured`, `payment.failed`.

**Mock Webhook Payload (for local testing):**
You need to generate a valid signature for the payload using your secret to test locally, or disable signature verification temporarily in code.

```javascript
// Generate signature in node
const crypto = require('crypto');
const body = JSON.stringify({...});
const signature = crypto.createHmac('sha256', 'YOUR_SECRET').update(body).digest('hex');
```
