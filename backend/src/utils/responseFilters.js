const getPublicPaymentData = (payment) => {
  return {
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency,
    description: payment.description,
    status: payment.status,
    createdAt: payment.createdAt,
    expiresAt: payment.expiresAt,
    razorpay_order_id: payment.razorpay_order_id, // Needed for frontend checkout
  };
};

module.exports = {
  getPublicPaymentData
};
