import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetcher } from '../../services/api'
import { MdAttachMoney, MdWarning, MdEmojiEvents } from 'react-icons/md'

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalChitGroups: 0,
    activeChits: 0,
    monthlyCollection: 0,
    pendingPayments: 0,
    upcomingAuctions: 0,
  })
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let wsRef = null

    const fetchStats = async () => {
      try {
        console.log('Fetching admin stats...')
        const data = await fetcher('/admin/stats', {
          timeout: 10000,
        })
        console.log('Admin stats fetched successfully:', data)
        if (isMounted) {
          setStats(data)
          setError(null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        const errorMsg = err?.response?.data?.detail || err?.message || 'Unable to load dashboard data. Please check your connection.'
        if (isMounted) {
          setError(errorMsg)
          setLoading(false)
        }
      }
    }

    const fetchActivity = async () => {
      try {
        console.log('Fetching recent activity...')
        const data = await fetcher('/admin/activity?limit=10', {
          timeout: 10000,
        })
        console.log('Recent activity fetched successfully:', data)
        if (isMounted) {
          setActivity(data || [])
          setActivityLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch activity:', err)
        if (isMounted) {
          setActivity([])
          setActivityLoading(false)
        }
      }
    }

    const connectWebSocket = () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.warn('No auth token found')
        if (isMounted) {
          setError('Authentication token not found. Please log in again.')
          setLoading(false)
        }
        return
      }

      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        console.log('Connecting to WebSocket with API base:', apiBase)
        const urlObj = new URL(apiBase)
        const wsProto = urlObj.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProto}//${urlObj.host}/admin/ws/stats?token=${encodeURIComponent(token)}`
        console.log('WebSocket URL:', wsUrl)
        
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.info('Admin stats WS connected')
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('WS message received:', data)
            if (isMounted) {
              setStats(data)
              setError(null)
            }
          } catch (e) {
            console.error('Invalid WS message', e)
          }
        }

        ws.onclose = (event) => {
          console.info('Admin stats WS disconnected', event.code, event.reason)
          if (!isMounted) return
          
          if (event.code === 1008) {
            if (isMounted) {
              setError('WebSocket authentication failed. Please reload and ensure you are logged in.')
            }
            return
          }
          
          // Attempt reconnect after 3 seconds
          if (isMounted) {
            setTimeout(() => {
              if (isMounted) connectWebSocket()
            }, 3000)
          }
        }

        ws.onerror = (event) => {
          console.error('Admin stats WS error', event)
          if (isMounted) {
            // Only set error if we don't already have one
            setError((prev) => prev || 'Failed to connect to real-time updates')
          }
        }

        wsRef = ws
      } catch (e) {
        console.error('Failed to establish WebSocket for admin stats', e)
        if (isMounted) {
          setError((prev) => prev || 'Failed to establish WebSocket connection')
        }
      }
    }

    // Fetch stats and activity immediately
    console.log('Admin dashboard mounted, fetching stats and activity...')
    fetchStats()
    fetchActivity()
    
    // Connect to WebSocket after a short delay
    const wsTimer = setTimeout(() => {
      if (isMounted) {
        console.log('Attempting WebSocket connection...')
        connectWebSocket()
      }
    }, 100)

    // Cleanup function
    return () => {
      console.log('Admin dashboard unmounting...')
      isMounted = false
      clearTimeout(wsTimer)
      if (wsRef) {
        try {
          wsRef.close()
          console.log('WebSocket closed')
        } catch (e) {
          console.error('Error closing WebSocket:', e)
        }
      }
    }
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

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-300 mt-2">
          {loading ? 'Loading dashboard...' : 'Branch Administration Dashboard'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          value={`₹${(stats?.monthlyCollection || 0) / 100000}L`}
          icon={<MdAttachMoney />}
          color="from-yellow-900/40 to-yellow-800/40"
        />
        <StatCard
          title="Pending Payments"
          value={`₹${(stats?.pendingPayments || 0) / 1000}K`}
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
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/admin/members')}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Add New Member
            </button>
            <button 
              onClick={() => navigate('/admin/chit-groups')}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Create Chit Group
            </button>
            <button 
              onClick={() => navigate('/admin/payments')}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              View Reports
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-3 text-sm">
              <p className="text-slate-400 text-center py-4">Loading activity...</p>
            </div>
          ) : activity.length === 0 ? (
            <div className="space-y-3 text-sm">
              <p className="text-slate-400 text-center py-4">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 text-sm max-h-64 overflow-y-auto pr-2 scrollbar-custom">
              {activity.map((log, idx) => (
                <div key={log.id || idx} className="flex items-start justify-between border-b border-slate-700/50 pb-2 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-slate-300">
                      <span className="font-medium">{log.action}</span>
                      {log.resource && <span className="text-slate-400"> • {log.resource}</span>}
                    </p>
                    {log.detail && <p className="text-xs text-slate-400 mt-1">{log.detail}</p>}
                    {log.user_name && <p className="text-xs text-slate-500 mt-1">by {log.user_name}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {log.success ? (
                      <span className="text-green-400 text-xs">✓</span>
                    ) : (
                      <span className="text-red-400 text-xs">✗</span>
                    )}
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
