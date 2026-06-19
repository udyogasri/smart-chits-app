import { useState, useEffect, useRef } from 'react'
import { fetcher } from '../../services/api'

function MembersPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterChit, setFilterChit] = useState('')
  const [branches, setBranches] = useState([])
  const [chits, setChits] = useState([])
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    chit_id: ''
  })
  
  const timeoutRef = useRef(null)
  const messageTimeoutRef = useRef(null)

  useEffect(() => {
    fetchMembers()
    fetchBranches()
    fetchChits()
    fetchUsers()
    // Set up polling for real-time updates every 10 seconds
    const interval = setInterval(fetchMembers, 10000)
    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
    }
  }, [])

  const fetchMembers = async () => {
    try {
      const data = await fetcher('/platform-admin/members')
      setMembers(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch members:', err)
      setError('Failed to load members')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const data = await fetcher('/platform-admin/branches')
      setBranches(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch branches:', err)
    }
  }

  const fetchChits = async () => {
    try {
      const data = await fetcher('/platform-admin/chits')
      setChits(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch chits:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await fetcher('/platform-admin/users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg)
    } else {
      setSuccess(msg)
    }
    
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    
    messageTimeoutRef.current = setTimeout(() => {
      setError(null)
      setSuccess(null)
    }, 4000)
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    
    if (!formData.user_id) {
      showMessage('User is required', true)
      return
    }
    if (!formData.chit_id) {
      showMessage('Chit is required', true)
      return
    }

    try {
      setLoading(true)
      await fetcher('/platform-admin/members', {
        method: 'POST',
        body: JSON.stringify({
          user_id: parseInt(formData.user_id),
          chit_id: parseInt(formData.chit_id)
        })
      })
      showMessage('Member added successfully!')
      setFormData({ user_id: '', chit_id: '' })
      setShowForm(false)
      
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        fetchMembers()
      }, 1500)
    } catch (err) {
      console.error('Failed to add member:', err)
      showMessage(err.message || 'Failed to add member', true)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    try {
      await fetcher(`/platform-admin/members/${memberId}`, { method: 'DELETE' })
      setMembers(members.filter(m => m.id !== memberId))
      showMessage('Member removed successfully!')
    } catch (err) {
      console.error('Failed to remove member:', err)
      showMessage('Failed to remove member', true)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      (member.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesBranch = !filterBranch || member.branch_id === parseInt(filterBranch)
    const matchesChit = !filterChit || member.chit_id === parseInt(filterChit)
    return matchesSearch && matchesBranch && matchesChit
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Members Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setFormData({ user_id: '', chit_id: '' })
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Add Member Form */}
      {showForm && (
        <form onSubmit={handleAddMember} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.email})
                </option>
              ))}
            </select>
            <select
              value={formData.chit_id}
              onChange={(e) => setFormData({ ...formData, chit_id: e.target.value })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Chit</option>
              {chits.map((chit) => (
                <option key={chit.id} value={chit.id}>
                  {chit.name || `Chit ${chit.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setFormData({ user_id: '', chit_id: '' })
              }}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name || `Branch ${branch.id}`}
              </option>
            ))}
          </select>
          <select
            value={filterChit}
            onChange={(e) => setFilterChit(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Chits</option>
            {chits.map((chit) => (
              <option key={chit.id} value={chit.id}>
                {chit.name || `Chit ${chit.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && !showForm ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading members...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">No members found</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Branch</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Chit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">
                    {member.first_name || 'N/A'} {member.last_name || ''}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{member.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{member.phone_number || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {branches.find(b => b.id === member.branch_id)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {member.chit_name || `Chit ${member.chit_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      Remove
                    </button>
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

export default MembersPage
