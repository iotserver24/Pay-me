const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());

// Capture raw body for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true }));

app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Payment Microservice API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

module.exports = app;
