import React from 'react';
import { format } from 'date-fns';

const PaymentCard = ({ payment, onPay, loading }) => {
  const isExpired = payment.status === 'EXPIRED';
  const isPaid = payment.status === 'VERIFIED';

  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Payment Request</h2>
      
      <div className="border-t border-b border-gray-200 py-4 my-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Payment ID</span>
          <span className="font-mono text-gray-800">{payment.paymentId}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Amount</span>
          <span className="font-bold text-gray-800">
            {payment.currency} {(payment.amount / 100).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Description</span>
          <span className="text-gray-800 text-right">{payment.description || 'N/A'}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Status</span>
          <span className={`font-bold ${
            isPaid ? 'text-green-600' : isExpired ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {payment.status}
          </span>
        </div>
         <div className="flex justify-between">
          <span className="text-gray-600">Expires At</span>
          <span className="text-gray-800 text-right">
            {payment.expiresAt ? format(new Date(payment.expiresAt), 'PPpp') : 'N/A'}
          </span>
        </div>
      </div>

      <div className="mt-6">
        {payment.status === 'PENDING' && (
          <button
            onClick={onPay}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition duration-150"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        )}
        {isExpired && (
          <div className="w-full bg-red-100 text-red-700 text-center py-3 px-4 rounded">
            This payment link has expired.
          </div>
        )}
        {isPaid && (
          <div className="w-full bg-green-100 text-green-700 text-center py-3 px-4 rounded">
            Payment successfully verified.
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
