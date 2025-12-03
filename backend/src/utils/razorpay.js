const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('Razorpay credentials missing in environment variables');
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

const createOrder = async (amount, currency, receipt) => {
  const rzp = initRazorpay();
  if (!rzp) throw new Error('Razorpay not initialized');

  const options = {
    amount: amount, // amount in the smallest currency unit
    currency: currency,
    receipt: receipt,
  };

  try {
    const order = await rzp.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay createOrder error:', error);
    throw error;
  }
};

const verifySignature = (orderId, paymentId, signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay secret missing');
  }
  const text = orderId + '|' + paymentId;
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generated_signature === signature;
};

const verifyWebhookSignature = (body, signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay secret missing');
  }
  // Razorpay sends the body as a JSON string for signature verification
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  return generated_signature === signature;
};

// Raw body verification is usually safer for webhooks to avoid JSON parsing changes
const verifyWebhookSignatureRaw = (rawBody, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('Razorpay webhook secret missing');
  }
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return generated_signature === signature;
}

module.exports = {
  createOrder,
  verifySignature,
  verifyWebhookSignature,
  verifyWebhookSignatureRaw
};
