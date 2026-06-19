import { useState, useEffect, useRef } from 'react'
import { fetcher } from '../../services/api'

function AdminPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds default
  const isLoadingRef = useRef(false)
  const refreshTimerRef = useRef(null)
  const lastFetchRef = useRef(0)

  const fetchPayments = async (forceRefresh = false) => {
    // Prevent duplicate requests within 3 seconds unless force refresh is requested
    const now = Date.now()
    if (!forceRefresh && now - lastFetchRef.current < 3000) {
      return
    }

    if (isLoadingRef.current) return // Prevent overlapping requests
    
    try {
      isLoadingRef.current = true
      setLoading(true)
      const data = await fetcher('/admin/payments')
      setPayments(Array.isArray(data) ? data : [])
      setError(null)
      lastFetchRef.current = now
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      setError('Failed to load payments')
      setPayments([])
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }

  useEffect(() => {
    fetchPayments()
    
    // Only set interval if refreshInterval is not 0 (disabled)
    if (refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        fetchPayments()
      }, refreshInterval)
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [refreshInterval])

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      setIsUpdating(true)
      await fetcher(`/admin/payments/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      await fetchPayments(true) // Force refresh after update
      setSelectedPayment(null)
    } catch (err) {
      console.error('Failed to update payment:', err)
      setError('Failed to update payment')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredPayments = filterStatus ? payments.filter(p => p.status === filterStatus) : payments

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-300'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'overdue':
        return 'bg-red-500/20 text-red-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-white">Payment Tracking</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPayments(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Refresh
          </button>
          <div>
            <label className="text-sm font-medium text-slate-300 mr-2 inline-block">Auto Refresh:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
              <option value={0}>Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-white mt-2">{payments.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Paid</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{payments.filter(p => p.status === 'paid').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{payments.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Total Amount</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Status</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading payments...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">No payments found</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Chit Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Month</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{payment.member_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-white">{payment.chit_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">₹{payment.amount || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{payment.month || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{payment.date || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                        disabled={isUpdating}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Mark Payment as Paid</h3>
            <p className="text-slate-300 mb-6">
              Member: <span className="font-semibold">{selectedPayment.member_name}</span>
              <br />
              Amount: <span className="font-semibold">₹{selectedPayment.amount}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusUpdate(selectedPayment.id, 'paid')}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Confirm Paid'}
              </button>
              <button
                onClick={() => setSelectedPayment(null)}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPaymentsPage
