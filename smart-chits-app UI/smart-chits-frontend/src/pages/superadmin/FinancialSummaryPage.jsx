import { useState, useEffect, useCallback, useRef } from 'react'
import { fetcher } from '../../services/api'

function FinancialSummaryPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetcher('/platform-admin/financial-summary')
      setSummary(data)
      setLastUpdated(new Date().toISOString())
      setError(null)
    } catch (err) {
      console.error('Failed to fetch financial summary:', err)
      // Provide more actionable error messages
      if (err && err.status === 401) {
        setError('Unauthorized. Please log in again.')
        // optional: clear token to force re-login
        // localStorage.removeItem('authToken')
      } else if (err && err.status === 403) {
        setError('Access denied. Your account lacks permissions to view this summary.')
      } else if (err && err.status === 0) {
        setError('Network error: Could not reach the API. Check backend server, CORS, or network.')
        console.warn('Network/CORS details:', err.info)
      } else if (err && err.info && err.info.detail) {
        setError(err.info.detail)
      } else {
        setError(err.message || 'Failed to load financial summary. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()

    const intervalId = setInterval(fetchSummary, 15000)
    return () => clearInterval(intervalId)
  }, [fetchSummary])

  // WebSocket for real-time updates (browser cannot set Authorization header on WS handshake,
  // so we pass token as query param and backend accepts it as fallback)
  const wsRef = useRef(null)
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    let mounted = true
    let backoff = 1000
    let reconnectAttempts = 0

    const connect = () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const urlObj = new URL(apiBase)
        const wsProto = urlObj.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProto}//${urlObj.host}/platform-admin/ws/financial-summary?token=${encodeURIComponent(token)}`

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.info('Financial summary WS connected')
          backoff = 1000
          reconnectAttempts = 0
        }

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data)
            setSummary(data)
            setLastUpdated(new Date().toISOString())
            setError(null)
          } catch (e) {
            console.error('Invalid WS message', e)
          }
        }

        ws.onclose = (ev) => {
          console.info('Financial summary WS disconnected', ev.code, ev.reason)
          // 1008 indicates policy violation / auth; don't aggressively reconnect
          if (!mounted) return
          if (ev.code === 1008) {
            setError('WebSocket authentication failed. Please reload and ensure you are logged in.')
            return
          }
          // otherwise try reconnect with backoff
          reconnectAttempts += 1
          setTimeout(() => {
            if (mounted) connect()
          }, backoff)
          backoff = Math.min(backoff * 2, 30000)
        }

        ws.onerror = (err) => {
          console.error('Financial summary WS error', err)
        }
      } catch (e) {
        console.error('Failed to establish WebSocket for financial summary', e)
      }
    }

    connect()

    return () => {
      mounted = false
      try { wsRef.current?.close() } catch (e) {}
    }
  }, [])

  const maxMonthlyAmount = Math.max(
    1,
    ...(summary?.monthlyCollections?.map((item) => item.amount) || [])
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Financial Summary</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          {lastUpdated && (
            <p className="text-sm text-slate-400">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={fetchSummary}
          className="inline-flex items-center justify-center rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {loading && !summary ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading financial summary...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-700/50 rounded-xl p-6">
              <p className="text-slate-300 text-sm">Total Collections</p>
              <p className="text-3xl font-bold text-green-300 mt-2">
                ₹{((summary?.totalCollections || 0) / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-700/50 rounded-xl p-6">
              <p className="text-slate-300 text-sm">Total Paid</p>
              <p className="text-3xl font-bold text-blue-300 mt-2">
                ₹{((summary?.totalPaid || 0) / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-700/50 rounded-xl p-6">
              <p className="text-slate-300 text-sm">Pending Dues</p>
              <p className="text-3xl font-bold text-red-300 mt-2">
                ₹{((summary?.pendingDues || 0) / 1000).toFixed(1)}K
              </p>
            </div>
          </div>

          {/* Monthly Collections */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Monthly Collections</h2>
            <div className="space-y-4">
              {summary?.monthlyCollections?.length > 0 ? (
                summary.monthlyCollections.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-slate-300">{item.month}</span>
                    <div className="flex-1 mx-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${Math.min((item.amount / maxMonthlyAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold">₹{(item.amount / 100000).toFixed(1)}L</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No monthly collection data is available yet.</p>
              )}
            </div>
          </div>

          {/* Branch Summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Branch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Collections</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Payouts</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {summary?.branchSummary?.length > 0 ? (
                  summary.branchSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-white font-medium">{item.branch}</td>
                      <td className="px-6 py-4 text-sm text-green-300">₹{(item.collections / 100000).toFixed(1)}L</td>
                      <td className="px-6 py-4 text-sm text-red-300">₹{(item.payouts / 100000).toFixed(1)}L</td>
                      <td className="px-6 py-4 text-sm text-blue-300">
                        ₹{((item.collections - item.payouts) / 100000).toFixed(1)}L
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-10 text-center text-sm text-slate-400" colSpan={4}>
                      No branch summary data is available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default FinancialSummaryPage
