import { useState, useEffect, useRef, useCallback } from 'react'
import { fetcher } from '../../services/api'

function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterAction, setFilterAction] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const wsRef = useRef(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetcher('/platform-admin/audit-logs')
      setLogs(Array.isArray(data) ? data : [])
      setLastUpdated(new Date().toISOString())
      setError(null)
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
      setError('Failed to load audit logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()

    const intervalId = setInterval(fetchLogs, 15000)
    return () => clearInterval(intervalId)
  }, [fetchLogs])

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
        const wsUrl = `${wsProto}//${urlObj.host}/platform-admin/ws/audit-logs?token=${encodeURIComponent(token)}`

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.info('Audit logs WS connected')
          backoff = 1000
          reconnectAttempts = 0
        }

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data)
            setLogs(Array.isArray(data) ? data : [])
            setLastUpdated(new Date().toISOString())
            setError(null)
          } catch (e) {
            console.error('Invalid Audit logs WS message', e)
          }
        }

        ws.onclose = (ev) => {
          console.info('Audit logs WS disconnected', ev.code, ev.reason)
          if (!mounted) return
          if (ev.code === 1008) {
            setError('WebSocket authentication failed. Please refresh or log in again.')
            return
          }
          reconnectAttempts += 1
          setTimeout(() => {
            if (mounted) connect()
          }, backoff)
          backoff = Math.min(backoff * 2, 30000)
        }

        ws.onerror = (err) => {
          console.error('Audit logs WS error', err)
        }
      } catch (e) {
        console.error('Failed to establish WebSocket for audit logs', e)
      }
    }

    connect()

    return () => {
      mounted = false
      try { wsRef.current?.close() } catch (e) {}
    }
  }, [])

  const filteredLogs = filterAction ? logs.filter(l => l.action === filterAction) : logs

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          {lastUpdated && (
            <p className="text-sm text-slate-400 mt-2">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={fetchLogs}
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

      {/* Filter */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">No audit logs found</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Resource</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{log.user_name || 'System'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      log.action === 'create' ? 'bg-green-500/20 text-green-300' :
                      log.action === 'delete' ? 'bg-red-500/20 text-red-300' :
                      log.action === 'update' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {log.action || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{log.resource || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{log.timestamp || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${log.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AuditLogsPage
