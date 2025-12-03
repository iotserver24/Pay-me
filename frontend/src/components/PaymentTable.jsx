import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

const PaymentTable = ({ payments }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 shadow-xl">
      <table className="min-w-full bg-dark-800/50 backdrop-blur-md">
        <thead>
          <tr className="bg-dark-900/50 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-white/10">
            <th className="py-4 px-6 text-left">Date</th>
            <th className="py-4 px-6 text-left">Payment ID</th>
            <th className="py-4 px-6 text-left">Order ID</th>
            <th className="py-4 px-6 text-right">Amount</th>
            <th className="py-4 px-6 text-center">Status</th>
            <th className="py-4 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-300 text-sm font-light divide-y divide-white/5">
          {payments.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 px-6 text-center text-gray-500">No payments found</td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment._id} className="hover:bg-white/5 transition duration-150">
                <td className="py-4 px-6 text-left whitespace-nowrap">
                  {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="py-4 px-6 text-left font-mono text-xs text-primary-400">
                  {payment.paymentId}
                </td>
                <td className="py-4 px-6 text-left font-mono text-xs text-gray-500">
                  {payment.razorpay_order_id || '-'}
                </td>
                <td className="py-4 px-6 text-right font-medium text-white">
                  {payment.currency} {(payment.amount / 100).toFixed(2)}
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`py-1 px-3 rounded-full text-xs font-bold border ${payment.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                      payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                        payment.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <Link href={`/admin/payment/${payment.paymentId}`} className="text-primary-400 hover:text-primary-300 font-medium transition">
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
