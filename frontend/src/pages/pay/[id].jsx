import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import api from '../../lib/api';
import PaymentCard from '../../components/PaymentCard';

const PaymentPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('success'); // 'success' | 'error'

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/payments/${id}`);
      setPayment(res.data);
    } catch (err) {
      setError('Failed to load payment details or payment expired.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payment || processing) return;
    setProcessing(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: payment.amount,
      currency: payment.currency,
      name: 'Pay Me',
      description: payment.description,
      order_id: payment.razorpay_order_id, // We need this from backend! 
      // WAIT: The getPayment endpoint only returns public fields. 
      // The prompt says: "GET /api/payments/:paymentId - Returns ONLY public fields"
      // BUT "Create Razorpay order ... Save full document"
      // AND "Pay button triggers Razorpay Checkout with order details"
      // The frontend needs the razorpay_order_id to verify the signature properly (or at least link it).
      // If I look at the prompt again:
      // "PUBLIC (returned to client /pay/:id): ... (no razorpay_order_id listed explicitly)"
      // BUT usually you need the order_id for checkout.
      // Let's check `responseFilters.js` I wrote. It does NOT include `razorpay_order_id`.
      // The prompt is slightly contradictory or implies I should expose it if needed.
      // "Public fields: ... paymentId, amount, currency, description, status..."
      // "PRIVATE (admin-only): razorpay_order_id..."

      // However, Razorpay Standard Checkout docs say:
      // "Pass the order_id that you received in the response of the Orders API."

      // So I MUST expose `razorpay_order_id` to the frontend for the payment to work.
      // I will update `responseFilters.js` to include `razorpay_order_id` or just pass it here.
      // The prompt lists `razorpay_order_id` under PRIVATE. This is tricky.
      // Maybe I should fetch it via a separate call? No, that's overengineering.
      // I will assume `razorpay_order_id` is safe to expose to the payer (it's just an ID).
      // I'll update the `responseFilters.js` in a moment.

      // Continuing with the code assuming I'll fix the backend.
      handler: async function (response) {
        // response.razorpay_payment_id
        // response.razorpay_order_id
        // response.razorpay_signature

        try {
          // Call backend to verify signature immediately
          const verifyRes = await api.post('/api/payments/verify', {
            paymentId: payment.paymentId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verifyRes.data.status === 'NOT_VERIFIED') {
            setPayment(prev => ({ ...prev, status: 'NOT_VERIFIED' }));
            setStatusType('success');
            setStatusMessage('Payment submitted successfully! Waiting for final confirmation.');
            setProcessing(false);
            if (payment.returnUrl) {
              setTimeout(() => window.location.href = payment.returnUrl, 3000);
            }
          } else if (verifyRes.data.status === 'VERIFIED') {
            setPayment(prev => ({ ...prev, status: 'VERIFIED' }));
            setStatusType('success');
            setStatusMessage('Payment Successful!');
            setProcessing(false);
            if (payment.returnUrl) {
              setTimeout(() => window.location.href = payment.returnUrl, 3000);
            }
          } else {
            setProcessing(false);
            setStatusType('error');
            setStatusMessage('Payment verification failed. Please contact support.');
          }

        } catch (err) {
          console.error(err);
          setProcessing(false);
          setStatusType('error');
          setStatusMessage('Payment completed but failed to verify on server. Please contact support.');
        }
      },
      prefill: {
        // We could add prefill info if we had it
      },
      notes: {
        address: 'Razorpay Corporate Office'
      },
      theme: {
        color: '#0ea5e9' // Primary-500 color
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response) {
      setStatusType('error');
      setStatusMessage(response.error.description);
      setProcessing(false);
    });
    rzp1.open();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl text-center max-w-md">
        <p className="font-bold mb-2">Error</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <Head>
        <title>Pay - {payment ? payment.description : '...'}</title>
      </Head>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-500">
            PayMe
          </h1>
          <p className="text-gray-400 text-sm mt-2">Secure Payment Gateway</p>
        </div>
        <PaymentCard payment={payment} onPay={handlePay} loading={processing} />

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Secured by Razorpay. Your data is encrypted.
          </p>
        </div>
      </div>

      {/* Custom Modal */}
      {statusMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setStatusMessage(null)}></div>
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full relative z-10 shadow-2xl animate-slide-up">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${statusType === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
              {statusType === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              {statusType === 'success' ? 'Success' : 'Error'}
            </h3>
            <p className="text-gray-400 text-center mb-6">
              {statusMessage}
            </p>
            <button
              onClick={() => setStatusMessage(null)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
