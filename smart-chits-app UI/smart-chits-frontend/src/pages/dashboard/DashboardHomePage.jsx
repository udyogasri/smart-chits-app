import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getMyChits, getAllChits } from '../../services/chitService'
import { useToast, ToastContainer } from '../../components/Toast'
import { MdSearch, MdStar, MdPayment, MdHistory, MdAssignment, MdLocalFireDepartment, MdAccessTime, MdWarning, MdAttachMoney, MdEmojiEvents, MdDoneAll, MdSchedule } from 'react-icons/md'

function DashboardHomePage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [stats, setStats] = useState({
    totalJoinedChits: 0,
    activeChits: 0,
    upcomingPayments: 0,
    pendingPayments: 0,
    totalPaidAmount: 0,
    upcomingAuctions: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [upcomingChits, setUpcomingChits] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const myChits = await getMyChits()
      const allChits = await getAllChits()
      
      // Calculate statistics
      const activeChitsCount = myChits.filter(c => c.status === 'active' || c.bidding_open).length
      
      // Mock upcoming data (would come from backend)
      const mockStats = {
        totalJoinedChits: myChits.length,
        activeChits: activeChitsCount,
        upcomingPayments: Math.floor(Math.random() * 3) + 1,
        pendingPayments: Math.floor(Math.random() * 2) + 1,
        totalPaidAmount: Math.floor(Math.random() * 100000) + 50000,
        upcomingAuctions: Math.floor(Math.random() * 2) + 1
      }
      
      setStats(mockStats)
      setUpcomingChits(allChits.slice(0, 3))
      
      // Mock recent transactions
      setRecentTransactions([
        { id: 1, type: 'payment', chit: 'Gold Chit Fund', amount: 25000, date: 'Today', status: 'completed' },
        { id: 2, type: 'join', chit: 'Silver Chit Fund', amount: null, date: 'Yesterday', status: 'completed' },
        { id: 3, type: 'bid', chit: 'Bronze Chit Fund', amount: 450000, date: '2 days ago', status: 'pending' }
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      showToast('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon, label, value, color = 'indigo' }) => {
    const colorClasses = {
      indigo: 'from-indigo-500 to-blue-500',
      green: 'from-green-500 to-emerald-500',
      orange: 'from-orange-500 to-red-500',
      purple: 'from-purple-500 to-pink-500'
    }
    
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{label}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-lg`}>
            {icon}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {currentUser?.first_name || 'User'}! 👋</h1>
        <p className="text-slate-400 mt-2">Here's your chit fund overview and quick actions</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/dashboard/browse')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MdSearch className="text-xl" />
          <span className="hidden sm:inline">Browse Chits</span>
          <span className="sm:hidden">Browse</span>
        </button>
        <button
          onClick={() => navigate('/dashboard/my-chits')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MdStar className="text-xl" />
          <span className="hidden sm:inline">My Chits</span>
          <span className="sm:hidden">My Chits</span>
        </button>
        <button
          onClick={() => navigate('/dashboard/payments')}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MdPayment className="text-xl" />
          <span className="hidden sm:inline">Pay Now</span>
          <span className="sm:hidden">Pay</span>
        </button>
        <button
          onClick={() => navigate('/dashboard/payment-history')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MdHistory className="text-xl" />
          <span className="hidden sm:inline">History</span>
          <span className="sm:hidden">History</span>
        </button>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-700 h-24 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={<MdAssignment className="text-2xl" />} label="Total Joined Chits" value={stats.totalJoinedChits} color="indigo" />
          <StatCard icon={<MdLocalFireDepartment className="text-2xl" />} label="Active Chits" value={stats.activeChits} color="green" />
          <StatCard icon={<MdAccessTime className="text-2xl" />} label="Upcoming Payments" value={stats.upcomingPayments} color="orange" />
          <StatCard icon={<MdWarning className="text-2xl" />} label="Pending Payments" value={stats.pendingPayments} color="orange" />
          <StatCard icon={<MdAttachMoney className="text-2xl" />} label="Total Paid Amount" value={`₹${(stats.totalPaidAmount / 1000).toFixed(1)}K`} color="green" />
          <StatCard icon={<MdEmojiEvents className="text-2xl" />} label="Upcoming Auctions" value={stats.upcomingAuctions} color="purple" />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-600/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {transaction.type === 'payment' && <MdPayment className="text-blue-400" />}
                      {transaction.type === 'join' && <MdDoneAll className="text-green-400" />}
                      {transaction.type === 'bid' && <MdEmojiEvents className="text-purple-400" />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{transaction.chit}</p>
                      <p className="text-slate-400 text-sm">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {transaction.amount && (
                      <p className="text-white font-bold">₹{transaction.amount.toLocaleString()}</p>
                    )}
                    <span className={`text-xs font-medium ${transaction.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {transaction.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No recent transactions</p>
          )}
        </div>

        {/* Upcoming Chits */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Chits</h2>
          {upcomingChits.length > 0 ? (
            <div className="space-y-3">
              {upcomingChits.map((chit) => (
                <div
                  key={chit.id}
                  onClick={() => navigate(`/dashboard/chits/${chit.id}`)}
                  className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-indigo-500/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <p className="text-white font-medium text-sm">{chit.name}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    ₹{chit.total_chit_amount?.toLocaleString() || 'N/A'} • {chit.total_members} members
                  </p>
                  <div className="mt-2 flex gap-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      chit.bidding_open ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/30 text-slate-400'
                    }`}>
                      {chit.bidding_open ? '🔓 Open' : '🔒 Closed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-6 text-sm">No upcoming chits</p>
          )}
          <button
            onClick={() => navigate('/dashboard/browse')}
            className="w-full mt-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            View All Chits →
          </button>
        </div>
      </div>

      {/* Notifications Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-white font-medium">Keep Your Payments On Track</p>
            <p className="text-slate-300 text-sm mt-1">
              You have {stats.pendingPayments} pending payment{stats.pendingPayments !== 1 ? 's' : ''}. 
              Make payments on time to stay eligible for auctions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHomePage
