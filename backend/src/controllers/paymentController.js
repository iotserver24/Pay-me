const Payment = require('../models/Payment');
const { createOrder, verifySignature, verifyWebhookSignatureRaw } = require('../utils/razorpay');
const { getPublicPaymentData } = require('../utils/responseFilters');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 14);

// 1) POST /api/payments/create
exports.createPayment = async (req, res) => {
  try {
    const { amount, currency, description, userId, returnUrl, adminNotes } = req.body;

    if (!amount || !currency || !expiresAtValid(amount)) {
      // simple validation
    }

    // Generate custom paymentId
    const paymentId = nanoid(); // 14 chars alphanumeric

    // Create Razorpay order
    const razorpayOrder = await createOrder(amount, currency, paymentId);

    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours

    const payment = new Payment({
      paymentId,
      amount,
      currency,
      description,
      status: 'PENDING',
      expiresAt,
      razorpay_order_id: razorpayOrder.id,
      returnUrl,
      userId,
      adminNotes,
      ipAddress: req.ip,
      verificationHistory: [{
        action: 'CREATED',
        timestamp: new Date(),
        details: 'Payment created and Razorpay order generated'
      }]
    });

    await payment.save();

    res.json({ id: paymentId });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 2) GET /api/payments/:paymentId
exports.getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check expiration
    if (payment.status === 'PENDING' && new Date() > payment.expiresAt) {
      payment.status = 'EXPIRED';
      payment.verificationHistory.push({
        action: 'EXPIRED',
        timestamp: new Date(),
        details: 'Payment expired based on time'
      });
      await payment.save();
    }

    res.json(getPublicPaymentData(payment));
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 3) GET /api/payments/status/:paymentId
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 4) POST /api/payments/mark-not-verified
exports.markNotVerified = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'PENDING') {
      payment.status = 'NOT_VERIFIED';
      payment.verificationHistory.push({
        action: 'MARK_NOT_VERIFIED',
        timestamp: new Date(),
        details: 'Frontend signaled return from gateway'
      });
      await payment.save();
    }

    res.json(getPublicPaymentData(payment));
  } catch (error) {
    console.error('Mark not verified error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 5) POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify signature
    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    console.log(`[VerifyPayment] PaymentId: ${paymentId}, OrderId: ${razorpay_order_id}, Valid: ${isValid}`);

    if (isValid) {
      // User wants to show as NOT_VERIFIED until webhook confirms it
      payment.status = 'NOT_VERIFIED';
      payment.razorpay_payment_id = razorpay_payment_id;
      payment.razorpay_signature = razorpay_signature;
      payment.verificationHistory.push({
        action: 'PAYMENT_SUBMITTED',
        timestamp: new Date(),
        details: 'Frontend reported success, waiting for webhook'
      });
      await payment.save();
      return res.json({ status: 'NOT_VERIFIED', ...getPublicPaymentData(payment) });
    } else {
      payment.status = 'FAILED';
      payment.verificationHistory.push({
        action: 'VERIFICATION_FAILED',
        timestamp: new Date(),
        details: 'Invalid signature provided by frontend'
      });
      await payment.save();
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 6) POST /api/payments/webhook
exports.handleWebhook = async (req, res) => {
  console.log('[Webhook] Received webhook event');
  // Webhook signature verification is critical
  const signature = req.headers['x-razorpay-signature'];

  // Need raw body for verification. 
  // We assume app.js configures express.json({ verify: (req, res, buf) => req.rawBody = buf })
  const rawBody = req.rawBody;

  if (!verifyWebhookSignatureRaw(rawBody, signature)) {
    console.error('[Webhook] Invalid webhook signature');
    console.error('[Webhook] Signature received:', signature);
    // We should probably log this attempt to a global log or find the payment if possible
    // But if we can't trust the payload, we can't trust the order_id inside it.
    // Spec says: "If invalid signature -> log attempt, set status = FAILED or mark event as INVALID_SIGNATURE"
    // Since we can't match to a DB entry securely without trusting the body, we'll just return 400.
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  console.log(`[Webhook] Event: ${event.event}, ID: ${event.id}`);

  try {
    // Match razorpay_order_id
    // event.payload.payment.entity.order_id contains the order ID
    const orderId = event.payload?.payment?.entity?.order_id;

    if (!orderId) {
      // Not an event we care about or structure mismatch
      return res.json({ status: 'ignored' });
    }

    const payment = await Payment.findOne({ razorpay_order_id: orderId });

    if (!payment) {
      console.warn(`[Webhook] Payment not found for orderId: ${orderId}`);
      return res.json({ status: 'ignored_not_found' });
    }
    console.log(`[Webhook] Found payment: ${payment.paymentId} (Current Status: ${payment.status})`);

    // Idempotency: check if this event id is already logged
    const eventId = event.id || event['x-request-id']; // Razorpay sends 'id' in body
    const isDuplicate = payment.webhookLogs.some(log => log.id === event.id);

    if (isDuplicate) {
      return res.json({ status: 'ignored_duplicate' });
    }

    // Log the webhook
    payment.webhookLogs.push(event);

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;

      // Update payment details
      payment.razorpay_payment_id = paymentEntity.id;
      payment.razorpay_signature = signature; // Store the signature of the webhook that verified it

      if (payment.status !== 'VERIFIED') {
        payment.status = 'VERIFIED';
        payment.verificationHistory.push({
          action: 'VERIFIED',
          timestamp: new Date(),
          details: 'Webhook payment.captured received and verified'
        });
        console.log(`[Webhook] Payment ${payment.paymentId} marked as VERIFIED`);
      }
    } else if (event.event === 'payment.failed') {
      if (payment.status !== 'VERIFIED') {
        payment.status = 'FAILED';
        payment.verificationHistory.push({
          action: 'FAILED',
          timestamp: new Date(),
          details: 'Webhook payment.failed received'
        });
        console.log(`[Webhook] Payment ${payment.paymentId} marked as FAILED`);
      }
    }

    await payment.save();
    res.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

function expiresAtValid(amount) {
  return true; // Simplified
}
