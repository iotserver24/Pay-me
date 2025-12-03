import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { format } from 'date-fns';

const PaymentDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPaymentDetail();
    }
  }, [id]);

  const fetchPaymentDetail = async () => {
    try {
      const res = await api.get(`/api/admin/payments/${id}`);
      setPayment(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );

  if (!payment) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Payment not found</div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Payment Details</h1>
              <p className="text-gray-400">View comprehensive transaction information</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-dark-800/50 hover:bg-white/5 border border-white/10 text-white px-6 py-2 rounded-lg transition"
            >
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-dark-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                  Transaction Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-gray-400 text-sm mb-1">Payment ID</p>
                    <p className="text-white font-mono text-lg">{payment.paymentId}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-gray-400 text-sm mb-1">Amount</p>
                    <p className="text-white font-bold text-2xl text-primary-400">
                      {payment.currency} {(payment.amount / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${payment.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                      payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                        payment.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/50'
                      }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-gray-400 text-sm mb-1">Created At</p>
                    <p className="text-white">{format(new Date(payment.createdAt), 'PPpp')}</p>
                  </div>
                </div>
              </div>

              {/* Verification History */}
              <div className="bg-dark-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                  Verification History
                </h2>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {payment.verificationHistory.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">{format(new Date(item.timestamp), 'PPpp')}</p>
                        <p className="text-white font-semibold mb-1">{item.action}</p>
                        <p className="text-gray-400 text-sm">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-8">
              <div className="bg-dark-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                  Razorpay Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order ID</p>
                    <p className="text-white font-mono text-sm break-all">{payment.razorpay_order_id}</p>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div>
                    <p className="text-gray-400 text-sm">Payment ID</p>
                    <p className="text-white font-mono text-sm break-all">{payment.razorpay_payment_id || 'N/A'}</p>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div>
                    <p className="text-gray-400 text-sm">User ID</p>
                    <p className="text-white font-mono text-sm">{payment.userId || 'N/A'}</p>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div>
                    <p className="text-gray-400 text-sm">IP Address</p>
                    <p className="text-white font-mono text-sm">{payment.ipAddress || 'N/A'}</p>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div>
                    <p className="text-gray-400 text-sm">Admin Notes</p>
                    <p className="text-white text-sm">{payment.adminNotes || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                  Webhook Logs
                </h2>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {payment.webhookLogs.length === 0 ? (
                    <p className="text-gray-500 italic">No logs available</p>
                  ) : (
                    payment.webhookLogs.map((log, idx) => (
                      <details key={idx} className="group">
                        <summary className="cursor-pointer list-none p-3 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/5 flex justify-between items-center">
                          <span className="text-primary-400 font-mono text-xs">{log.event}</span>
                          <span className="text-gray-500 text-xs group-open:rotate-180 transition">▼</span>
                        </summary>
                        <div className="mt-2 p-3 rounded-lg bg-dark-900/80 border border-white/10 overflow-x-auto">
                          <pre className="text-xs text-gray-300 font-mono">
                            {JSON.stringify(log, null, 2)}
                          </pre>
                        </div>
                      </details>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PaymentDetail;
