import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import PaymentTable from '../../components/PaymentTable';
import api from '../../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  CreditCard,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Key,
  LogOut,
  Search,
  FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Real Stats State
  const [stats, setStats] = useState({
    totalVolume: 0,
    countTotal: 0,
    countVerified: 0,
    countPending: 0,
    countFailed: 0
  });
  const [chartData, setChartData] = useState([]);

  // API Key State
  const [apiKeys, setApiKeys] = useState([]);
  const [showGenerateKeyModal, setShowGenerateKeyModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState({ name: '', description: '' });
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyLoading, setKeyLoading] = useState(false);

  // Create Payment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    amount: '',
    currency: 'INR',
    description: '',
    userId: '',
    returnUrl: '',
    adminNotes: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const [creating, setCreating] = useState(false);
  // Clear History State
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [clearType, setClearType] = useState('all'); // all, date, status
  const [clearStartDate, setClearStartDate] = useState('');
  const [clearEndDate, setClearEndDate] = useState('');
  const [clearStatus, setClearStatus] = useState('PENDING');
  const [clearing, setClearing] = useState(false);

  const handleClearHistory = async () => {
    if (!confirm('Are you sure? This action is irreversible.')) return;
    setClearing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/payments/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: clearType,
          startDate: clearStartDate,
          endDate: clearEndDate,
          status: clearStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setShowClearHistoryModal(false);
        fetchPayments();
        fetchStats();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to clear history');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setClearing(false);
    }
  };

  const [createdId, setCreatedId] = useState(null);

  const fetchPayments = async () => {
    if (loading) setLoading(true);
    try {
      const res = await api.get('/api/admin/payments', {
        params: { page, status: statusFilter, search }
      });
      setPayments(res.data.payments);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setChartData(data.chartData);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

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
      setKeyLoading(true);
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
      setKeyLoading(false);
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

  useEffect(() => {
    fetchPayments();
    fetchStats();
    fetchApiKeys();

    const interval = setInterval(() => {
      fetchPayments();
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/api/payments/create', createFormData);
      setCreatedId(res.data.id);
      fetchPayments();
      fetchStats(); // Update stats immediately
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create payment');
    } finally {
      setCreating(false);
    }
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-dark-900 via-dark-800 to-black text-white font-sans">
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-1">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 text-sm">Overview of your payment ecosystem</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-primary-600/20 hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Create Payment</span>
              </button>
              <Link href="/admin/api" className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-white/10 text-white px-5 py-2.5 rounded-xl transition hover:scale-105 active:scale-95">
                <FileText className="w-5 h-5" />
                <span>API Docs</span>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  window.location.href = '/admin/login';
                }}
                className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-gray-400 border border-white/10 px-5 py-2.5 rounded-xl transition hover:scale-105 active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* ... (Stats Grid, Analytics Chart, API Keys Section, Payments Table Section remain same) ... */}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Volume */}
            <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <CreditCard className="w-24 h-24 text-primary-500" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-400" /> Total Volume
                </p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.totalVolume)}</h3>
                <p className="text-xs text-gray-500 mt-2">Lifetime verified volume</p>
              </div>
            </div>

            {/* Verified Count */}
            <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <CheckCircle className="w-24 h-24 text-green-500" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Verified Payments
                </p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{stats.countVerified}</h3>
                <p className="text-xs text-gray-500 mt-2">Successful transactions</p>
              </div>
            </div>

            {/* Pending Count */}
            <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Clock className="w-24 h-24 text-yellow-500" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> Pending
                </p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{stats.countPending}</h3>
                <p className="text-xs text-gray-500 mt-2">Awaiting completion</p>
              </div>
            </div>

            {/* Failed Count */}
            <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <AlertCircle className="w-24 h-24 text-red-500" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" /> Failed
                </p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{stats.countFailed}</h3>
                <p className="text-xs text-gray-500 mt-2">Unsuccessful attempts</p>
              </div>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                Transaction Volume (Last 7 Days)
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value / 100}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#ffffff20', color: '#fff', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`₹${value / 100}`, 'Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-400" /> API Keys
              </h2>
              <button
                onClick={() => setShowGenerateKeyModal(true)}
                className="bg-dark-900 hover:bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Generate Key
              </button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-dark-900/30 rounded-xl border border-white/5 border-dashed">
                <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No API keys found. Generate one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10 text-sm uppercase tracking-wider">
                      <th className="pb-4 font-medium pl-4">Name</th>
                      <th className="pb-4 font-medium">Prefix</th>
                      <th className="pb-4 font-medium">Created</th>
                      <th className="pb-4 font-medium">Usage</th>
                      <th className="pb-4 font-medium text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300 text-sm">
                    {apiKeys.map(key => (
                      <tr key={key.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                        <td className="py-4 pl-4 font-medium text-white">{key.name}</td>
                        <td className="py-4 font-mono text-primary-400 bg-primary-500/10 px-2 rounded w-fit">{key.prefix}***</td>
                        <td className="py-4">{new Date(key.createdAt).toLocaleDateString()}</td>
                        <td className="py-4">{key.usageCount}</td>
                        <td className="py-4 text-right pr-4">
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="text-red-400 hover:text-red-300 font-medium hover:bg-red-500/10 px-3 py-1 rounded-lg transition"
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

          {/* Payments Table Section */}
          <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Recent Transactions
              </h2>

              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-64 bg-dark-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
                <button
                  onClick={() => setShowClearHistoryModal(true)}
                  type="button"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-red-500/10 text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
                <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-primary-500/20 text-sm">
                  Search
                </button>
              </form>
            </div>

            {loading && !payments.length ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <>
                <PaymentTable payments={payments} />
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-400 text-sm flex items-center">Page {page} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Clear History Modal */}
          {showClearHistoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowClearHistoryModal(false)}></div>
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-md w-full relative z-10 shadow-2xl animate-slide-up">
                <h3 className="text-xl font-bold text-white mb-4">Clear Transaction History</h3>
                <p className="text-gray-400 text-sm mb-6">Permanently delete transaction records. This cannot be undone.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Deletion Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setClearType('all')}
                        className={`py-2 rounded-lg text-sm font-medium transition ${clearType === 'all' ? 'bg-red-500 text-white' : 'bg-dark-900 text-gray-400 hover:bg-white/5'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setClearType('date')}
                        className={`py-2 rounded-lg text-sm font-medium transition ${clearType === 'date' ? 'bg-primary-500 text-white' : 'bg-dark-900 text-gray-400 hover:bg-white/5'}`}
                      >
                        Date Range
                      </button>
                      <button
                        onClick={() => setClearType('status')}
                        className={`py-2 rounded-lg text-sm font-medium transition ${clearType === 'status' ? 'bg-primary-500 text-white' : 'bg-dark-900 text-gray-400 hover:bg-white/5'}`}
                      >
                        By Status
                      </button>
                    </div>
                  </div>

                  {clearType === 'date' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Start Date</label>
                        <input
                          type="date"
                          className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                          value={clearStartDate}
                          onChange={e => setClearStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">End Date</label>
                        <input
                          type="date"
                          className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                          value={clearEndDate}
                          onChange={e => setClearEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {clearType === 'status' && (
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Select Status</label>
                      <select
                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        value={clearStatus}
                        onChange={e => setClearStatus(e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowClearHistoryModal(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearHistory}
                      disabled={clearing}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2 rounded-lg transition"
                    >
                      {clearing ? 'Deleting...' : 'Delete Records'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Payment Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-2xl w-full relative z-10 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6">Create New Payment</h3>

                {!createdId ? (
                  <form onSubmit={handleCreatePayment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Amount (Smallest Unit)</label>
                        <input type="number" required className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                          value={createFormData.amount} onChange={e => setCreateFormData({ ...createFormData, amount: e.target.value })} placeholder="e.g. 1000 for ₹10.00" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Currency</label>
                        <input type="text" required className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                          value={createFormData.currency} onChange={e => setCreateFormData({ ...createFormData, currency: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Description</label>
                      <input type="text" className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                        value={createFormData.description} onChange={e => setCreateFormData({ ...createFormData, description: e.target.value })} placeholder="Payment for..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Customer Name</label>
                        <input type="text" className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                          value={createFormData.customerName} onChange={e => setCreateFormData({ ...createFormData, customerName: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Customer Email</label>
                        <input type="email" className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                          value={createFormData.customerEmail} onChange={e => setCreateFormData({ ...createFormData, customerEmail: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Customer Phone</label>
                        <input type="tel" className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                          value={createFormData.customerPhone} onChange={e => setCreateFormData({ ...createFormData, customerPhone: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">User ID (Internal)</label>
                        <input type="text" className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                          value={createFormData.userId} onChange={e => setCreateFormData({ ...createFormData, userId: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Return URL</label>
                      <input type="url" className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                        value={createFormData.returnUrl} onChange={e => setCreateFormData({ ...createFormData, returnUrl: e.target.value })} placeholder="https://..." />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Admin Notes</label>
                      <textarea className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                        value={createFormData.adminNotes} onChange={e => setCreateFormData({ ...createFormData, adminNotes: e.target.value })} rows="2"></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition">Cancel</button>
                      <button type="submit" disabled={creating} className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-2 rounded-lg transition">
                        {creating ? 'Creating...' : 'Create Payment Link'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Payment Link Created!</h3>
                    <p className="text-gray-400 mb-6">Share this link with your customer.</p>

                    <div className="bg-dark-900 border border-white/10 rounded-xl p-4 mb-6 break-all">
                      <code className="text-primary-400 font-mono text-lg">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/pay/{createdId}
                      </code>
                    </div>

                    <button onClick={() => {
                      setCreatedId(null);
                      setCreateFormData({ amount: '', currency: 'INR', description: '', userId: '', returnUrl: '', adminNotes: '', customerName: '', customerEmail: '', customerPhone: '' });
                      setShowCreateModal(false);
                    }} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition">
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Key Modal */}
          {showGenerateKeyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !generatedKey && setShowGenerateKeyModal(false)}></div>
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
                          onClick={() => setShowGenerateKeyModal(false)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleGenerateKey}
                          disabled={!newKeyData.name || keyLoading}
                          className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-2 rounded-lg transition"
                        >
                          {keyLoading ? 'Generating...' : 'Generate Key'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Key className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">API Key Generated</h3>
                      <p className="text-gray-400 text-sm mt-2">Copy this key now. You won't be able to see it again!</p>
                    </div>

                    <div className="bg-dark-900 border border-white/10 rounded-xl p-4 mb-6 break-all">
                      <code className="text-primary-400 font-mono text-lg">{generatedKey.key}</code>
                    </div>

                    <button
                      onClick={() => {
                        setShowGenerateKeyModal(false);
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
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
