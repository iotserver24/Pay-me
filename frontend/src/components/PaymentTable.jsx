import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

const PaymentTable = ({ payments }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Date</th>
            <th className="py-3 px-6 text-left">Payment ID</th>
            <th className="py-3 px-6 text-left">Order ID</th>
            <th className="py-3 px-6 text-right">Amount</th>
            <th className="py-3 px-6 text-center">Status</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {payments.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-3 px-6 text-center">No payments found</td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="py-3 px-6 text-left font-mono">
                  {payment.paymentId}
                </td>
                <td className="py-3 px-6 text-left font-mono text-xs">
                  {payment.razorpay_order_id || '-'}
                </td>
                <td className="py-3 px-6 text-right font-medium">
                   {payment.currency} {(payment.amount / 100).toFixed(2)}
                </td>
                <td className="py-3 px-6 text-center">
                  <span className={`py-1 px-3 rounded-full text-xs ${
                    payment.status === 'VERIFIED' ? 'bg-green-200 text-green-600' :
                    payment.status === 'PENDING' ? 'bg-yellow-200 text-yellow-600' :
                    payment.status === 'FAILED' ? 'bg-red-200 text-red-600' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <Link href={`/admin/payment/${payment.paymentId}`} className="text-blue-500 hover:text-blue-700 font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
