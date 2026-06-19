import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetcher } from '../../services/api'

function AdminMembersPage() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  // Fetch members on mount
  useEffect(() => {
    let isMounted = true

    const fetchMembers = async () => {
      try {
        console.log('Fetching members...')
        setLoading(true)
        // Increased timeout to 30s for better reliability, pagination for performance
        const data = await fetcher('/admin/members?skip=0&limit=100', { timeout: 30000 })
        if (isMounted) {
          setMembers(Array.isArray(data) ? data : [])
          setError(null)
          console.log('Members loaded:', data)
        }
      } catch (err) {
        console.error('Failed to fetch members:', err)
        if (isMounted) {
          const errorMsg =
            err?.response?.data?.detail || err?.message || 'Failed to load members'
          setError(errorMsg)
          setMembers([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const connectWebSocket = () => {
      const token = localStorage.getItem('authToken')
      if (!token || !isMounted) return

      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const urlObj = new URL(apiBase)
        const wsProto = urlObj.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProto}//${urlObj.host}/admin/ws/members?token=${encodeURIComponent(token)}`

        console.log('Connecting to members WebSocket...')
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.info('Members WebSocket connected')
          if (isMounted) {
            setError(null)
          }
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            console.log('WS message received:', message)

            if (!isMounted) return

            if (message.type === 'member_update') {
              // Handle different events
              switch (message.event) {
                case 'member_added':
                  console.log('New member added, refreshing...')
                  // Refresh members list
                  fetchMembers()
                  break
                case 'member_updated':
                  console.log('Member updated, refreshing...')
                  // Refresh members list
                  fetchMembers()
                  break
                case 'member_deleted':
                  console.log('Member deleted, refreshing...')
                  // Refresh members list
                  fetchMembers()
                  break
              }
            }
          } catch (e) {
            console.error('Invalid WS message:', e)
          }
        }

        ws.onclose = (event) => {
          console.info('Members WebSocket disconnected', event.code, event.reason)
          if (!isMounted) return

          if (event.code === 1008) {
            if (isMounted) {
              setError('WebSocket authentication failed. Please reload.')
            }
            return
          }

          // Attempt reconnect after 3 seconds
          if (isMounted) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted) {
                console.log('Attempting to reconnect WebSocket...')
                connectWebSocket()
              }
            }, 3000)
          }
        }

        ws.onerror = (event) => {
          console.error('Members WebSocket error', event)
          if (isMounted) {
            setError((prev) => prev || 'Failed to connect to real-time updates')
          }
        }

        wsRef.current = ws
      } catch (e) {
        console.error('Failed to establish WebSocket for members', e)
        if (isMounted) {
          setError((prev) => prev || 'Failed to establish WebSocket connection')
        }
      }
    }

    // Fetch members immediately
    fetchMembers()

    // Connect to WebSocket after a short delay
    const wsTimer = setTimeout(() => {
      if (isMounted) {
        connectWebSocket()
      }
    }, 500)

    // Cleanup
    return () => {
      isMounted = false
      clearTimeout(wsTimer)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        try {
          wsRef.current.close()
        } catch (e) {
          console.error('Error closing WebSocket:', e)
        }
      }
    }
  }, [])

  // Filter and sort members
  const filteredMembers = members
    .filter(
      (member) =>
        member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          )
        case 'email':
          return a.email.localeCompare(b.email)
        case 'joined':
          return (
            new Date(b.joined_at_earliest || 0) -
            new Date(a.joined_at_earliest || 0)
          )
        case 'chits':
          return (b.total_chits || 0) - (a.total_chits || 0)
        default:
          return 0
      }
    })

  // Handle form submission for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (selectedMember) {
        // Update member
        console.log('Updating member:', selectedMember.id, formData)
        await fetcher(`/admin/members/${selectedMember.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
          timeout: 10000
        })
        setError(null)
      } else {
        // Add new member
        console.log('Adding new member:', formData)
        await fetcher('/admin/members', {
          method: 'POST',
          body: JSON.stringify(formData),
          timeout: 10000
        })
        setError(null)
      }

      // Refresh members list
      const data = await fetcher('/admin/members', { timeout: 10000 })
      setMembers(Array.isArray(data) ? data : [])
      setShowAddModal(false)
      setShowEditModal(false)
      setFormData({ first_name: '', last_name: '', email: '', phone_number: '' })
      setSelectedMember(null)
    } catch (err) {
      console.error('Failed to save member:', err)
      setError(err?.response?.data?.detail || err?.message || 'Failed to save member')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit member
  const handleEdit = (member) => {
    setSelectedMember(member)
    setFormData({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone_number: member.phone_number || ''
    })
    setShowEditModal(true)
  }

  // Handle delete member
  const handleDelete = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return

    try {
      console.log('Deleting member:', memberId)
      await fetcher(`/admin/members/${memberId}`, {
        method: 'DELETE',
        timeout: 10000
      })
      setError(null)

      // Refresh members list
      const data = await fetcher('/admin/members', { timeout: 10000 })
      setMembers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to delete member:', err)
      setError(err?.response?.data?.detail || err?.message || 'Failed to delete member')
    }
  }

  // Handle open add modal
  const handleAddMember = () => {
    setSelectedMember(null)
    setFormData({ first_name: '', last_name: '', email: '', phone_number: '' })
    setShowAddModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Members</h1>
          <p className="text-slate-400 mt-1">Manage organization members and chit participation</p>
        </div>
        <button
          onClick={handleAddMember}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          disabled={loading}
        >
          + Add Member
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="joined">Sort by Joined Date</option>
            <option value="chits">Sort by Chits</option>
          </select>
        </div>
        <div className="text-sm text-slate-400">
          {filteredMembers.length} of {members.length} members
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading members...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">
            {members.length === 0 ? 'No members found' : 'No members match your search'}
          </p>
          {members.length === 0 && (
            <button
              onClick={handleAddMember}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Create First Member
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Chits</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{member.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {member.phone_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                      {member.total_chits || 0}
                      {member.active_chits > 0 && (
                        <span className="ml-1 text-purple-400">
                          ({member.active_chits} active)
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.is_active
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {member.joined_at_earliest
                      ? new Date(member.joined_at_earliest).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              {selectedMember ? 'Edit Member' : 'Add New Member'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Last name"
                />
              </div>

              {!selectedMember && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Email"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Phone number"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setFormData({ first_name: '', last_name: '', email: '', phone_number: '' })
                    setSelectedMember(null)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMembersPage
