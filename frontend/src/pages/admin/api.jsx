import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

const ApiDocs = () => {
    const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_BACKEND_URL);

    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    //     }
    // }, []);

    const endpoints = [
        {
            title: 'Create Payment',
            method: 'POST',
            url: `${baseUrl}/api/payments/create`,
            desc: 'Create a new payment link.',
            body: {
                amount: 1000,
                currency: 'INR',
                description: 'Order #123',
                adminNotes: 'VIP Client'
            },
            response: { id: 'A1b2C3d4E5f6G7' }
        },
        {
            title: 'Check Status',
            method: 'GET',
            url: `${baseUrl}/api/payments/status/:paymentId`,
            desc: 'Check the current status of a payment.',
            response: {
                paymentId: 'A1b2C3d4E5f6G7',
                status: 'VERIFIED',
                amount: 1000,
                currency: 'INR'
            }
        },
        {
            title: 'Verify Payment (Manual)',
            method: 'POST',
            url: `${baseUrl}/api/payments/verify`,
            desc: 'Manually verify a payment using Razorpay signature.',
            body: {
                paymentId: 'A1b2C3d4E5f6G7',
                razorpay_payment_id: 'pay_...',
                razorpay_order_id: 'order_...',
                razorpay_signature: '...'
            },
            response: { status: 'NOT_VERIFIED' }
        }
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen p-8">
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">API Documentation</h1>
                            <p className="text-gray-400">Secure integration details for your application</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {endpoints.map((ep, idx) => (
                            <div key={idx} className="bg-dark-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                                        'bg-green-500/20 text-green-400 border border-green-500/50'
                                        }`}>
                                        {ep.method}
                                    </span>
                                    <h2 className="text-xl font-bold text-white">{ep.title}</h2>
                                </div>

                                <p className="text-gray-400 mb-4">{ep.desc}</p>

                                <div className="bg-dark-900/50 rounded-xl border border-white/10 p-4 mb-4 font-mono text-sm text-gray-300 break-all">
                                    {ep.url}
                                </div>

                                {ep.body && (
                                    <div className="mb-4">
                                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Request Body</p>
                                        <div className="bg-dark-900/80 rounded-xl border border-white/5 p-4 overflow-x-auto">
                                            <pre className="text-xs text-primary-400 font-mono">
                                                {JSON.stringify(ep.body, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-2">Response</p>
                                    <div className="bg-dark-900/80 rounded-xl border border-white/5 p-4 overflow-x-auto">
                                        <pre className="text-xs text-green-400 font-mono">
                                            {JSON.stringify(ep.response, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ApiDocs;
