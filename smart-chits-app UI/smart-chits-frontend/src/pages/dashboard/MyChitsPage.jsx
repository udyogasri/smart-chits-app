import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getMyChits } from '../../services/chitService'
import { useToast, ToastContainer } from '../../components/Toast'

function MyChitsPage() {
  const navigate = useNavigate()
  const { t } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [myChits, setMyChits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchMyChits = async () => {
      try {
        console.log('Fetching my chits...')
        const data = await getMyChits()
        console.log('My chits data received:', data)
        setMyChits(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch my chits:', error)
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          info: error.info
        })
        const errorMsg = error.info?.detail || error.message || 'Failed to fetch your chits'
        showToast(errorMsg, 'error')
        setError(errorMsg)
        // Set empty array as fallback
        setMyChits([])
      } finally {
        setLoading(false)
      }
    }

    fetchMyChits()
  }, [])

  const filteredChits = myChits.filter(chit => {
    const chitStatus = chit.status || (chit.bidding_open ? 'active' : 'inactive')
    const matchesFilter = filterStatus === 'all' || chitStatus === filterStatus
    return matchesFilter
  })

  const getPaymentStatus = (status) => {
    const statusMap = {
      'paid': { color: 'bg-green-100 text-green-800', label: 'Paid' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'overdue': { color: 'bg-red-100 text-red-800', label: 'Overdue' },
      'partial': { color: 'bg-orange-100 text-orange-800', label: 'Partial' }
    }
    return statusMap[status] || statusMap['pending']
  }

  const getAuctionStatus = (bidding_open) => {
    if (bidding_open) {
      return { color: 'bg-blue-100 text-blue-800', label: 'Bidding Open' }
    }
    return { color: 'bg-slate-100 text-slate-800', label: 'Closed' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewDetails = (chitId) => {
    navigate(`/dashboard/chits/${chitId}`)
  }

  const handleViewPaymentHistory = (chitId) => {
    navigate(`/dashboard/payment-history/${chitId}`)
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Chits</h1>
        <p className="text-slate-400 mt-2">View and manage your joined chit groups</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          {myChits.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400">Total Chits Joined</p>
                <p className="text-2xl font-bold text-white mt-1">{myChits.length}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400">Active Chits</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {myChits.filter(c => c.bidding_open).length}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400">Total Dividends Earned</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  ₹{myChits.reduce((sum, c) => sum + (c.total_dividend_earned || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Filter */}
          {myChits.length > 0 && (
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          {/* Chits List */}
          {filteredChits.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {filteredChits.map((chit) => (
                <div key={chit.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-indigo-600 transition-colors">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <h3 className="text-lg font-bold text-white">{chit.name}</h3>
                    <p className="text-sm text-indigo-100 mt-1">{chit.description}</p>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-4 space-y-4">
                    {/* Chit Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Chit Amount</p>
                        <p className="text-lg font-semibold text-white mt-1">
                          ₹{(chit.chit_fund || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Monthly Installment</p>
                        <p className="text-lg font-semibold text-white mt-1">
                          ₹{(chit.installment_amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Duration</p>
                        <p className="text-lg font-semibold text-white mt-1">
                          {chit.duration || chit.total_months} months
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Current Month</p>
                        <p className="text-lg font-semibold text-white mt-1">{chit.current_month || 1}</p>
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Members</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-white">
                          {chit.current_members}/{chit.total_members} joined
                        </p>
                        <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{
                              width: `${(chit.current_members / chit.total_members) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Joined Date</p>
                      <p className="text-sm text-white mt-1">{formatDate(chit.joined_at)}</p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        getAuctionStatus(chit.bidding_open).color
                      }`}>
                        {getAuctionStatus(chit.bidding_open).label}
                      </span>
                      
                      {chit.already_won_auction && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          ✓ Won Auction
                        </span>
                      )}

                      {chit.total_dividend_earned > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          ₹{chit.total_dividend_earned.toLocaleString()} Earned
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-slate-700">
                      <button 
                        onClick={() => handleViewDetails(chit.id)}
                        className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleViewPaymentHistory(chit.id)}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-white font-medium transition-colors"
                      >
                        Payment History
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">
                {loading ? 'Loading...' : myChits.length === 0 ? '📭 No chits joined yet' : ''}
              </div>
              <p className="text-slate-500 text-sm mb-6">
                {!loading && myChits.length === 0 && 'Browse available chits and join one to start your chit fund journey'}
              </p>
              {!loading && myChits.length === 0 && (
                <a
                  href="/dashboard"
                  className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Chits
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MyChitsPage
