import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

const ApiDocs = () => {
    const [baseUrl, setBaseUrl] = useState('');
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ name: '', description: '' });
    const [generatedKey, setGeneratedKey] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/api-keys', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setApiKeys(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateKey = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/api-keys/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newKeyData)
            });
            if (res.ok) {
                const data = await res.json();
                setGeneratedKey(data);
                fetchApiKeys();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeKey = async (id) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`/api/admin/api-keys/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchApiKeys();
        } catch (err) {
            console.error(err);
        }
    };

    const endpoints = [
        {
            title: 'Create Payment',
            method: 'POST',
            url: `${baseUrl}/api/payments/create`,
            desc: 'Create a new payment link. Requires a valid API Key. On success, redirects to returnUrl?id={paymentId}',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'YOUR_API_KEY'
            },
            body: {
                amount: 1000,
                currency: 'INR',
                description: 'Order #123',
                userId: 'user_001',
                returnUrl: 'https://your-site.com/success',
                adminNotes: 'VIP Client',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '9876543210'
            },
            response: { id: 'A1b2C3d4E5f6G7' }
        },
        // ... other endpoints
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen p-8">
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">API Management</h1>
                            <p className="text-gray-400">Manage API keys and view documentation</p>
                        </div>
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                        >
                            + Generate New Key
                        </button>
                    </div>

                    {/* API Keys List */}
                    <div className="bg-dark-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl mb-12">
                        <h2 className="text-xl font-bold text-white mb-4">Active API Keys</h2>
                        {apiKeys.length === 0 ? (
                            <p className="text-gray-400">No API keys found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-400 border-b border-white/10">
                                            <th className="pb-3">Name</th>
                                            <th className="pb-3">Prefix</th>
                                            <th className="pb-3">Created</th>
                                            <th className="pb-3">Last Used</th>
                                            <th className="pb-3">Usage</th>
                                            <th className="pb-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        {apiKeys.map(key => (
                                            <tr key={key.id} className="border-b border-white/5 last:border-0">
                                                <td className="py-3 font-medium text-white">{key.name}</td>
                                                <td className="py-3 font-mono text-sm text-primary-400">{key.prefix}**************************</td>
                                                <td className="py-3 text-sm">{new Date(key.createdAt).toLocaleDateString()}</td>
                                                <td className="py-3 text-sm">{key.lastUsed ? new Date(key.lastUsed).toLocaleString() : '-'}</td>
                                                <td className="py-3 text-sm">{key.usageCount}</td>
                                                <td className="py-3">
                                                    <button
                                                        onClick={() => handleRevokeKey(key.id)}
                                                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                                                    >
                                                        Revoke
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-white mb-4">API Reference</h2>
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

                                {ep.headers && (
                                    <div className="mb-4">
                                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Headers</p>
                                        <div className="bg-dark-900/80 rounded-xl border border-white/5 p-4 overflow-x-auto">
                                            <pre className="text-xs text-blue-400 font-mono">
                                                {Object.entries(ep.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
                                            </pre>
                                        </div>
                                    </div>
                                )}

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

                {/* Generate Key Modal */}
                {showGenerateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !generatedKey && setShowGenerateModal(false)}></div>
                        <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-md w-full relative z-10 shadow-2xl animate-slide-up">
                            {!generatedKey ? (
                                <>
                                    <h3 className="text-xl font-bold text-white mb-4">Generate New API Key</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Key Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                                placeholder="e.g. Production Server"
                                                value={newKeyData.name}
                                                onChange={e => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Description</label>
                                            <input
                                                type="text"
                                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                                placeholder="Optional description"
                                                value={newKeyData.description}
                                                onChange={e => setNewKeyData({ ...newKeyData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => setShowGenerateModal(false)}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleGenerateKey}
                                                disabled={!newKeyData.name || loading}
                                                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-2 rounded-lg transition"
                                            >
                                                {loading ? 'Generating...' : 'Generate Key'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">API Key Generated</h3>
                                        <p className="text-gray-400 text-sm mt-2">Copy this key now. You won't be able to see it again!</p>
                                    </div>

                                    <div className="bg-dark-900 border border-white/10 rounded-xl p-4 mb-6 break-all">
                                        <code className="text-primary-400 font-mono text-lg">{generatedKey.key}</code>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowGenerateModal(false);
                                            setGeneratedKey(null);
                                            setNewKeyData({ name: '', description: '' });
                                        }}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition"
                                    >
                                        I have copied the key
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default ApiDocs;
