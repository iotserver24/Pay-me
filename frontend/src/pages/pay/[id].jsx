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
      order_id: payment.razorpay_order_id,
      handler: async function (response) {
        try {
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
              const separator = payment.returnUrl.includes('?') ? '&' : '?';
              const redirectUrl = `${payment.returnUrl}${separator}id=${payment.paymentId}`;
              setTimeout(() => window.location.href = redirectUrl, 3000);
            }
          } else if (verifyRes.data.status === 'VERIFIED') {
            setPayment(prev => ({ ...prev, status: 'VERIFIED' }));
            setStatusType('success');
            setStatusMessage('Payment Successful!');
            setProcessing(false);
            if (payment.returnUrl) {
              const separator = payment.returnUrl.includes('?') ? '&' : '?';
              const redirectUrl = `${payment.returnUrl}${separator}id=${payment.paymentId}`;
              setTimeout(() => window.location.href = redirectUrl, 3000);
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
        color: '#0ea5e9'
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
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-8 py-6 rounded-2xl text-center max-w-md shadow-2xl backdrop-blur-sm">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <p className="font-bold text-xl mb-2">Unable to Load Payment</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-dark-900 selection:bg-primary-500/30">
      <Head>
        <title>Pay - {payment ? payment.description : '...'}</title>
      </Head>

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary-500/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-dark-900 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/20 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            PayMe
          </h1>
          <p className="text-gray-400">Secure Payment Gateway</p>
        </div>

        <div className="transform transition-all duration-300 hover:scale-[1.02]">
          <PaymentCard payment={payment} onPay={handlePay} loading={processing} />
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-500 text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <span>Secured by Razorpay. 256-bit SSL Encrypted.</span>
        </div>
      </div>

      {/* Status Modal */}
      {statusMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={() => statusType !== 'success' && setStatusMessage(null)}></div>
          <div className="bg-dark-800 border border-white/10 rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl animate-scale-in">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${statusType === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
              {statusType === 'success' ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-3">
              {statusType === 'success' ? 'Payment Successful!' : 'Payment Failed'}
            </h3>
            <p className="text-gray-400 text-center mb-8 leading-relaxed">
              {statusMessage}
            </p>
            {statusType === 'success' ? (
              <div className="w-full flex flex-col items-center justify-center py-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"></div>
                <span className="text-sm text-gray-400">Redirecting to merchant...</span>
              </div>
            ) : (
              <button
                onClick={() => setStatusMessage(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition duration-200"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
