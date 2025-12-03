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

## API Documentation

**All API requests should be routed through the Frontend Proxy for security and simplicity.**

👉 **[View Full API Documentation](docs/API.md)**

### Quick Example: Create Payment via Frontend Proxy

```bash
curl -X POST http://localhost:3001/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "description": "Test Payment",
    "adminNotes": "Created via API Proxy"
  }'
```

**Response:**

```json
{ "id": "A1b2C3d4E5f6G7" }
```

### Webhook Setup

1. Go to Razorpay Dashboard > Settings > Webhooks.
2. Add New Webhook.
3. Webhook URL: `YOUR_PUBLIC_DOMAIN/api/payments/webhook` (Note: Webhooks usually go directly to backend, but can go through proxy if configured, or direct to backend port 3000 if exposed).
   - *Recommendation*: For production, expose the backend directly for webhooks or ensure the proxy handles the traffic correctly.
4. Secret: Same as `RAZORPAY_KEY_SECRET` in `.env`.
5. Active Events: `payment.captured`, `payment.failed`.
