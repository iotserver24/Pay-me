const Payment = require('../models/Payment');
const { generateToken } = require('../utils/jwt');

// 6) POST /api/admin/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = generateToken({ email, role: 'admin' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// 7) GET /api/admin/payments
exports.getPayments = async (req, res) => {
  try {
    const { status, limit = 20, page = 1, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { paymentId: search },
        { razorpay_order_id: search }
      ];
    }

    const skip = (page - 1) * limit;
    
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Admin get payments error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 8) GET /api/admin/payments/:paymentId
exports.getPaymentDetail = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Admin get payment detail error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
