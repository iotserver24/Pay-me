const Payment = require('../models/Payment');
const ApiKey = require('../models/ApiKey');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');

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
        { paymentId: { $regex: search, $options: 'i' } },
        { razorpay_order_id: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
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
// 9) POST /api/admin/api-keys/generate
exports.generateApiKey = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Generate a random key
    const rawKey = crypto.randomBytes(32).toString('hex');
    const prefix = rawKey.substring(0, 6);

    // Hash it for storage
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = new ApiKey({
      key: hashedKey,
      prefix,
      name,
      description
    });

    await apiKey.save();

    // Return the raw key ONLY ONCE
    res.json({ key: rawKey, name, prefix });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 10) GET /api/admin/api-keys
exports.listApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find().sort({ createdAt: -1 });
    // Do not return the full key hash, just metadata
    const safeKeys = keys.map(k => ({
      id: k._id,
      prefix: k.prefix,
      name: k.name,
      description: k.description,
      usageCount: k.usageCount,
      lastUsed: k.lastUsed,
      createdAt: k.createdAt
    }));

    res.json(safeKeys);
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 11) DELETE /api/admin/api-keys/:id
exports.revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    await ApiKey.findByIdAndDelete(id);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 12) GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Overall Stats
    const totalVolumeAgg = await Payment.aggregate([
      { $match: { status: 'VERIFIED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalVolume = totalVolumeAgg.length > 0 ? totalVolumeAgg[0].total : 0;

    const countTotal = await Payment.countDocuments();
    const countVerified = await Payment.countDocuments({ status: 'VERIFIED' });
    const countPending = await Payment.countDocuments({ status: 'PENDING' });
    const countFailed = await Payment.countDocuments({ status: 'FAILED' });

    // 2. Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const chartAgg = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          volume: {
            $sum: {
              $cond: [{ $eq: ["$status", "VERIFIED"] }, "$amount", 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const found = chartAgg.find(item => item._id === dateStr);
      chartData.push({
        name: dayName,
        date: dateStr,
        volume: found ? found.volume : 0,
        count: found ? found.count : 0
      });
    }

    res.json({
      stats: {
        totalVolume,
        countTotal,
        countVerified,
        countPending,
        countFailed
      },
      chartData
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 13) DELETE /api/admin/payments/clear
exports.clearHistory = async (req, res) => {
  try {
    const { type, startDate, endDate, status } = req.body;
    let query = {};

    if (type === 'all') {
      // Clear everything
      query = {};
    } else if (type === 'date') {
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start and End dates are required for date-wise deletion' });
      }
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (type === 'status') {
      if (!status) {
        return res.status(400).json({ error: 'Status is required for status-wise deletion' });
      }
      query.status = status;
    } else {
      return res.status(400).json({ error: 'Invalid clear type' });
    }

    const result = await Payment.deleteMany(query);
    res.json({ message: `Deleted ${result.deletedCount} records`, deletedCount: result.deletedCount });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
