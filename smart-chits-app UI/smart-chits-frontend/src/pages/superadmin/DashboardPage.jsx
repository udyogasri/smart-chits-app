import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetcher } from '../../services/api'
import { MdAttachMoney, MdWarning, MdEmojiEvents } from 'react-icons/md'

function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalAdmins: 0,
    totalMembers: 0,
    totalChitGroups: 0,
    activeChits: 0,
    monthlyCollection: 0,
    pendingPayments: 0,
    upcomingAuctions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isLoadingRef = useRef(false)

  const fetchStats = async () => {
    if (isLoadingRef.current) return // Prevent overlapping requests
    
    try {
      isLoadingRef.current = true
      setLoading(true)
      setError(null)
      
      const data = await fetcher('/platform-admin/statistics')
      if (data) {
        setStats({
          totalBranches: data.totalBranches || 0,
          totalAdmins: data.totalAdmins || 0,
          totalMembers: data.totalMembers || 0,
          totalChitGroups: data.totalChitGroups || 0,
          activeChits: data.activeChits || 0,
          monthlyCollection: data.monthlyCollection || 0,
          pendingPayments: data.pendingPayments || 0,
          upcomingAuctions: data.upcomingAuctions || 0
        })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }

  useEffect(() => {
    fetchStats()
    
    const intervalId = setInterval(() => {
      fetchStats()
    }, 10000) // Refresh every 10 seconds
    
    return () => clearInterval(intervalId)
  }, [])

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  )

  if (loading && stats.totalChitGroups === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-300 mt-2">Welcome to SmartChits Super Admin Dashboard</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Branches"
          value={stats?.totalBranches || 0}
          icon="🏢"
          color="from-blue-900/40 to-blue-800/40"
        />
        <StatCard
          title="Total Admins"
          value={stats?.totalAdmins || 0}
          icon="👥"
          color="from-purple-900/40 to-purple-800/40"
        />
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon="👤"
          color="from-indigo-900/40 to-indigo-800/40"
        />
        <StatCard
          title="Chit Groups"
          value={stats?.totalChitGroups || 0}
          icon="📋"
          color="from-pink-900/40 to-pink-800/40"
        />
        <StatCard
          title="Active Chits"
          value={stats?.activeChits || 0}
          icon="💫"
          color="from-green-900/40 to-green-800/40"
        />
        <StatCard
          title="Monthly Collection"
          value={`₹${(stats?.monthlyCollection || 0) / 100000 > 0 ? (stats?.monthlyCollection / 100000).toFixed(1) : 0}L`}
          icon={<MdAttachMoney />}
          color="from-yellow-900/40 to-yellow-800/40"
        />
        <StatCard
          title="Pending Payments"
          value={`₹${(stats?.pendingPayments || 0) / 1000 > 0 ? (stats?.pendingPayments / 1000).toFixed(1) : 0}K`}
          icon={<MdWarning />}
          color="from-red-900/40 to-red-800/40"
        />
        <StatCard
          title="Upcoming Auctions"
          value={stats?.upcomingAuctions || 0}
          icon={<MdEmojiEvents />}
          color="from-orange-900/40 to-orange-800/40"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/superadmin/branches')}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Create New Branch
            </button>
            <button 
              onClick={() => navigate('/superadmin/admins')}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Create New Admin
            </button>
            <button 
              onClick={() => navigate('/superadmin/audit-logs')}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              View All Reports
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">API Server</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Database</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Payment Gateway</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400">Operational</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/superadmin/chit-groups')}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors text-left"
        >
          <h3 className="text-lg font-bold text-white mb-2">Manage Chit Groups</h3>
          <p className="text-slate-400 text-sm">View and manage all chit groups across branches</p>
        </button>
        <button
          onClick={() => navigate('/superadmin/payments')}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors text-left"
        >
          <h3 className="text-lg font-bold text-white mb-2">Manage Payments</h3>
          <p className="text-slate-400 text-sm">Track and manage all system payments</p>
        </button>
        <button
          onClick={() => navigate('/superadmin/auctions')}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors text-left"
        >
          <h3 className="text-lg font-bold text-white mb-2">Manage Auctions</h3>
          <p className="text-slate-400 text-sm">View and manage upcoming auctions</p>
        </button>
      </div>
    </div>
  )
}

export default SuperAdminDashboardPage
