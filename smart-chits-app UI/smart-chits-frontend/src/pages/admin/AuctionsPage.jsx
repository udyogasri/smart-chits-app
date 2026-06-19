import { useState, useEffect, useRef } from 'react'
import { fetcher } from '../../services/api'

function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAuction, setEditingAuction] = useState(null)
  const [formData, setFormData] = useState({
    auction_number: '',
    chit_group_id: '',
    auction_month: '',
    auction_date: '',
    total_pool_amount: '',
    foreman_commission_percent: '5',
    max_bid_limit: '',
    duration_minutes: '10',
    branch_id: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingAuction, setViewingAuction] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds default
  const [chitGroups, setChitGroups] = useState([])

  const isLoadingRef = useRef(false)
  const refreshTimerRef = useRef(null)
  const lastFetchRef = useRef(0)

  // Fetch auctions from backend
  const fetchAuctions = async (forceRefresh = false) => {
    // Prevent duplicate requests within 3 seconds unless force refresh is requested
    const now = Date.now()
    if (!forceRefresh && now - lastFetchRef.current < 3000) {
      return
    }

    if (isLoadingRef.current) return

    try {
      isLoadingRef.current = true
      setLoading(true)
      const data = await fetcher('/admin/auctions')
      setAuctions(Array.isArray(data) ? data : [])
      setError(null)
      lastFetchRef.current = now
    } catch (err) {
      console.error('Failed to fetch auctions:', err)
      setError(`Failed to load auctions: ${err.message || 'Unknown error'}`)
      setAuctions([])
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }

  // Fetch chit groups for dropdown
  const fetchChitGroups = async () => {
    try {
      const data = await fetcher('/admin/chits')
      setChitGroups(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch chit groups:', err)
    }
  }

  // Initial load and auto-refresh setup
  useEffect(() => {
    fetchAuctions()
    fetchChitGroups()

    // Only set interval if refreshInterval is not 0 (disabled)
    if (refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        fetchAuctions()
      }, refreshInterval)
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [refreshInterval])

  // Success message auto-dismiss
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const openEditModal = (auction) => {
    setFormData({
      auction_number: (auction.auction_number || '').toString(),
      chit_group_id: (auction.chit_group_id || '').toString(),
      auction_month: (auction.auction_month || '').toString(),
      auction_date: auction.auction_date || '',
      total_pool_amount: (auction.total_pool_amount || '').toString(),
      foreman_commission_percent: (auction.foreman_commission_percent || '5').toString(),
      max_bid_limit: (auction.max_bid_limit || '').toString(),
      duration_minutes: (auction.duration_minutes || '10').toString(),
      branch_id: (auction.branch_id || '').toString(),
    })
    setEditingAuction(auction)
    setShowCreateModal(true)
  }

  const openViewModal = (auction) => {
    setViewingAuction(auction)
    setShowViewModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        chit_group_id: parseInt(formData.chit_group_id),
        auction_month: parseInt(formData.auction_month),
        auction_date: formData.auction_date,
        total_pool_amount: parseFloat(formData.total_pool_amount),
        foreman_commission_percent: parseFloat(formData.foreman_commission_percent),
        max_bid_limit: parseFloat(formData.max_bid_limit),
        duration_minutes: parseInt(formData.duration_minutes),
        branch_id: formData.branch_id ? parseInt(formData.branch_id) : null,
      }

      if (editingAuction) {
        // Update existing auction
        await fetcher(`/admin/auctions/${editingAuction.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setSuccessMessage('Auction updated successfully')
      } else {
        // Create new auction
        await fetcher('/admin/auctions', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setSuccessMessage('Auction created successfully')
      }

      setShowCreateModal(false)
      setEditingAuction(null)
      setFormData({
        auction_number: '',
        chit_group_id: '',
        auction_month: '',
        auction_date: '',
        total_pool_amount: '',
        foreman_commission_percent: '5',
        max_bid_limit: '',
        duration_minutes: '10',
        branch_id: '',
      })
      await fetchAuctions(true)
    } catch (err) {
      console.error('Form submission error:', err)
      setError(`Failed to save auction: ${err.message || 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAuction = async (auction) => {
    if (!window.confirm(`Are you sure you want to delete auction ${auction.auction_number}?`)) {
      return
    }

    setDeletingId(auction.id)
    try {
      await fetcher(`/admin/auctions/${auction.id}`, {
        method: 'DELETE',
      })
      setSuccessMessage('Auction deleted successfully')
      await fetchAuctions(true)
    } catch (err) {
      console.error('Delete error:', err)
      if (err.status === 404) {
        setError('Auction not found')
      } else if (err.status === 403) {
        setError('You do not have permission to delete this auction')
      } else {
        setError(`Failed to delete auction: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-500/20 text-green-300'
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-300'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-white">Auctions Management</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowCreateModal(true)
              setEditingAuction(null)
              setFormData({
                auction_number: '',
                chit_group_id: '',
                auction_month: '',
                auction_date: '',
                total_pool_amount: '',
                foreman_commission_percent: '5',
                max_bid_limit: '',
                duration_minutes: '10',
                branch_id: '',
              })
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            Create Auction
          </button>
          <button
            onClick={() => fetchAuctions(true)}
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

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading auctions...</p>
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">No auctions found</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Auction Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Month</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Pool Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Winning Bid</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {auctions.map((auction) => (
                <tr key={auction.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">{auction.auction_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">Month {auction.auction_month}</td>
                  <td className="px-6 py-4 text-sm text-white">₹{auction.total_pool_amount}</td>
                  <td className="px-6 py-4 text-sm text-white">{auction.winning_bid_amount || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}>
                      {auction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{formatDate(auction.auction_date)}</td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      type="button"
                      onClick={() => openViewModal(auction)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      View
                    </button>
                    {auction.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => openEditModal(auction)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {auction.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAuction(auction)}
                        disabled={deletingId === auction.id}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingId === auction.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">{editingAuction ? 'Edit Auction' : 'Create New Auction'}</h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Chit Group</label>
                  <select
                    name="chit_group_id"
                    value={formData.chit_group_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Chit Group</option>
                    {chitGroups.map((chit) => (
                      <option key={chit.id} value={chit.id}>
                        {chit.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Auction Month</label>
                  <input
                    type="number"
                    name="auction_month"
                    value={formData.auction_month}
                    onChange={handleInputChange}
                    min="1"
                    max="36"
                    required
                    placeholder="1-36"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Auction Date</label>
                  <input
                    type="date"
                    name="auction_date"
                    value={formData.auction_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Total Pool Amount</label>
                  <input
                    type="number"
                    name="total_pool_amount"
                    value={formData.total_pool_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    placeholder="₹"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Bid Limit</label>
                  <input
                    type="number"
                    name="max_bid_limit"
                    value={formData.max_bid_limit}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    placeholder="₹"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Foreman Commission %</label>
                  <input
                    type="number"
                    name="foreman_commission_percent"
                    value={formData.foreman_commission_percent}
                    onChange={handleInputChange}
                    step="0.1"
                    placeholder="5"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="10"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Branch ID</label>
                  <input
                    type="number"
                    name="branch_id"
                    value={formData.branch_id}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {submitting ? (editingAuction ? 'Updating...' : 'Creating...') : editingAuction ? 'Update Auction' : 'Create Auction'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAuction(null)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingAuction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Auction Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">Auction Number</p>
                  <p className="text-white">{viewingAuction.auction_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingAuction.status)}`}>
                    {viewingAuction.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Month</p>
                  <p className="text-white">Month {viewingAuction.auction_month}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Date</p>
                  <p className="text-white">{formatDate(viewingAuction.auction_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Pool Amount</p>
                  <p className="text-white">₹{viewingAuction.total_pool_amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Winning Bid Amount</p>
                  <p className="text-white">{viewingAuction.winning_bid_amount || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Max Bid Limit</p>
                  <p className="text-white">₹{viewingAuction.max_bid_limit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Commission %</p>
                  <p className="text-white">{viewingAuction.foreman_commission_percent}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Duration</p>
                  <p className="text-white">{viewingAuction.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Winner Prize</p>
                  <p className="text-white">₹{viewingAuction.winner_prize_amount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Dividend Per Member</p>
                  <p className="text-white">₹{viewingAuction.dividend_per_member || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Started At</p>
                  <p className="text-white">{formatDate(viewingAuction.started_at)}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAuctionsPage
