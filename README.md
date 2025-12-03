# PayMe - Open Source Payment Gateway Wrapper

PayMe is a robust, open-source payment microservice wrapper built with **Next.js**, **Node.js**, and **MongoDB**. It simplifies integrating **Razorpay** into your applications by providing a ready-to-use Payment Page, Admin Dashboard, and secure Backend API.

![PayMe Banner](https://via.placeholder.com/1200x400?text=PayMe+Open+Source+Payment+Gateway)

## 🚀 Features

* **Secure Payment Processing**: Integrated with Razorpay for seamless transactions.
* **Admin Dashboard**: View transaction history, verify payments, and manage status.
* **Dynamic Payment Pages**: Beautiful, responsive payment pages (`/pay/:id`).
* **Webhook Support**: Automatically updates payment status (Verified/Failed) via Razorpay Webhooks.
* **API Proxy**: Frontend proxies public API requests to the backend for easier integration.
* **Direct Admin Access**: Secure, direct connection to backend for Admin operations.
* **Docker Ready**: One-command setup with Docker Compose.

## 🏗 Architecture

* **Frontend**: Next.js 14 (React) + Tailwind CSS
* **Backend**: Node.js + Express + Mongoose
* **Database**: MongoDB
* **Gateway**: Razorpay

## 📚 Documentation

We have detailed guides to help you get started:

* **[Hosting & Deployment Guide](docs/HOSTING.md)**: Complete guide to deploying on Vercel, Render, VPS, and setting up Webhooks.
* **[API Documentation](docs/API.md)**: Full list of API endpoints and usage examples.

## ⚡ Quick Start (Local Development)

### Option 1: Docker (Recommended)

1. **Clone the repo**:

    ```bash
    git clone https://github.com/iotserver24/pay-me.git
    cd pay-me
    ```

2. **Configure Environment**:
    Copy `example.env` to `.env` and fill in your Razorpay credentials.

    ```bash
    cp example.env .env
    ```

3. **Run**:

    ```bash
    docker compose up --build
    ```

    * Frontend: [http://localhost:3001](http://localhost:3001)
    * Backend: [http://localhost:3000](http://localhost:3000)

### Option 2: Manual Setup

See the [Hosting Guide](docs/HOSTING.md) for detailed manual setup instructions for both Backend and Frontend.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🗺️ Future Roadmap

We are actively working on expanding PayMe to support multiple payment platforms to give you more flexibility:

* **Cashfree**
* **Polar.sh**
* **Stripe**
* **PayPal**
* **Lemon Squeezy**
* **Paddle**
* **PhonePe**
* **Paytm**

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License** with additional terms regarding donation links. See the [LICENSE](LICENSE) file for details.
