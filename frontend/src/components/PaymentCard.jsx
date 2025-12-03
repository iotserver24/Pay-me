import React from 'react';
import { format } from 'date-fns';

const PaymentCard = ({ payment, onPay, loading }) => {
  const isExpired = payment.status === 'EXPIRED';
  const isPaid = payment.status === 'VERIFIED';
  const isProcessing = payment.status === 'NOT_VERIFIED';

  const statusColors = {
    VERIFIED: 'bg-green-500/20 text-green-400 border-green-500/50',
    EXPIRED: 'bg-red-500/20 text-red-400 border-red-500/50',
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    NOT_VERIFIED: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };

  return (
    <div className="max-w-md w-full bg-dark-800/50 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden mx-auto mt-4 md:mt-10 border border-white/10 animate-fade-in">
      <div className="p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">Payment Request</h2>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
            <span className="text-gray-400 text-sm">Payment ID</span>
            <span className="font-mono text-white text-sm">{payment.paymentId}</span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
            <span className="text-gray-400 text-sm">Amount</span>
            <span className="font-bold text-xl md:text-2xl text-white">
              {payment.currency} {(payment.amount / 100).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-start p-3 rounded-lg bg-white/5">
            <span className="text-gray-400 text-sm">Description</span>
            <span className="text-white text-right text-sm max-w-[60%]">{payment.description || 'N/A'}</span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
            <span className="text-gray-400 text-sm">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[payment.status] || 'bg-gray-500/20 text-gray-400'}`}>
              {payment.status === 'NOT_VERIFIED' ? 'PROCESSING' : payment.status}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
            <span className="text-gray-400 text-sm">Expires At</span>
            <span className="text-white text-right text-sm">
              {payment.expiresAt ? format(new Date(payment.expiresAt), 'PPpp') : 'N/A'}
            </span>
          </div>
        </div>

        <div className="mt-6">
          {payment.status === 'PENDING' && (
            <button
              onClick={onPay}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 px-4 rounded-xl focus:outline-none focus:shadow-outline disabled:opacity-50 transition shadow-lg shadow-primary-500/25"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          )}
          {isExpired && (
            <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-center py-3 px-4 rounded-xl">
              This payment link has expired.
            </div>
          )}
          {isPaid && (
            <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 text-center py-3 px-4 rounded-xl">
              Payment successfully verified.
            </div>
          )}
          {isProcessing && (
            <div className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-center py-3 px-4 rounded-xl">
              Payment submitted. Waiting for confirmation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
