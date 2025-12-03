import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import PaymentTable from '../../components/PaymentTable';
import api from '../../lib/api';

const AdminDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button 
              onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
              }}
              className="text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search Payment ID or Order ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="FAILED">FAILED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              <PaymentTable payments={payments} />
              <div className="mt-4 flex justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="py-1">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
