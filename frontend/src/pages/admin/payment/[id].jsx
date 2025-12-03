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

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!payment) return <div className="text-center mt-10">Payment not found</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <button onClick={() => router.back()} className="text-blue-500">Back</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Basic Info</h3>
              <p><span className="font-semibold">ID:</span> {payment.paymentId}</p>
              <p><span className="font-semibold">Amount:</span> {payment.currency} {(payment.amount / 100).toFixed(2)}</p>
              <p><span className="font-semibold">Status:</span> {payment.status}</p>
              <p><span className="font-semibold">Created:</span> {format(new Date(payment.createdAt), 'PPpp')}</p>
              <p><span className="font-semibold">Expires:</span> {format(new Date(payment.expiresAt), 'PPpp')}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Razorpay Info</h3>
              <p><span className="font-semibold">Order ID:</span> {payment.razorpay_order_id}</p>
              <p><span className="font-semibold">Payment ID:</span> {payment.razorpay_payment_id || 'N/A'}</p>
              <p><span className="font-semibold">User ID:</span> {payment.userId || 'N/A'}</p>
              <p><span className="font-semibold">IP:</span> {payment.ipAddress || 'N/A'}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-2">Verification History</h3>
            <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
              {payment.verificationHistory.map((item, idx) => (
                <div key={idx} className="mb-2 border-b border-gray-200 pb-2">
                   <p className="text-sm text-gray-600">{format(new Date(item.timestamp), 'PPpp')}</p>
                   <p className="font-semibold">{item.action}</p>
                   <p className="text-sm">{item.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-700 mb-2">Webhook Logs</h3>
            <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
              {payment.webhookLogs.length === 0 ? <p>No logs</p> : (
                payment.webhookLogs.map((log, idx) => (
                  <details key={idx} className="mb-2">
                    <summary className="cursor-pointer font-mono text-sm text-blue-600">
                      {log.event} - {log.id}
                    </summary>
                    <pre className="text-xs bg-gray-800 text-white p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </details>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PaymentDetail;
