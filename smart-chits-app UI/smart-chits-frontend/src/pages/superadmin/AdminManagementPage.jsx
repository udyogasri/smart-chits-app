import { useState, useEffect, useRef } from 'react'
import { fetcher } from '../../services/api'

function AdminManagementPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    branch_id: ''
  })
  const [branches, setBranches] = useState([])
  
  const timeoutRef = useRef(null)
  const messageTimeoutRef = useRef(null)

  useEffect(() => {
    fetchAdmins()
    fetchBranches()
    // Set up polling for real-time updates every 10 seconds
    const interval = setInterval(fetchAdmins, 10000)
    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
    }
  }, [])

  const fetchAdmins = async () => {
    try {
      const data = await fetcher('/platform-admin/admins')
      setAdmins(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch admins:', err)
      setError('Failed to load admins')
      setAdmins([])
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

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg)
    } else {
      setSuccess(msg)
    }
    
    // Clear previous timeout if exists
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    
    // Clear message after 4 seconds
    messageTimeoutRef.current = setTimeout(() => {
      setError(null)
      setSuccess(null)
    }, 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.first_name.trim()) {
      showMessage('First name is required', true)
      return
    }
    if (!formData.last_name.trim()) {
      showMessage('Last name is required', true)
      return
    }
    if (!formData.email.trim()) {
      showMessage('Email is required', true)
      return
    }
    if (!formData.password.trim()) {
      showMessage('Password is required', true)
      return
    }
    if (!formData.branch_id) {
      showMessage('Branch is required', true)
      return
    }

    try {
      setLoading(true)
      await fetcher('/platform-admin/admins', {
        method: 'POST',
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          branch_id: parseInt(formData.branch_id)
        })
      })
      showMessage('Admin created successfully!')
      setFormData({ first_name: '', last_name: '', email: '', password: '', branch_id: '' })
      setShowForm(false)
      
      // Fetch updated list after a short delay
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        fetchAdmins()
      }, 1500)
    } catch (err) {
      console.error('Failed to create admin:', err)
      showMessage(err.message || 'Failed to create admin', true)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin?')) return
    try {
      await fetcher(`/platform-admin/admins/${adminId}`, { method: 'DELETE' })
      setAdmins(admins.filter(a => a.id !== adminId))
      showMessage('Admin deleted successfully!')
    } catch (err) {
      console.error('Failed to delete admin:', err)
      showMessage('Failed to delete admin', true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Admin Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ first_name: '', last_name: '', email: '', password: '', branch_id: '' })
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Admin'}
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

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name || `Branch ${branch.id}`}
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
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setFormData({ first_name: '', last_name: '', email: '', password: '', branch_id: '' })
              }}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && !showForm ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admins...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">No admins found</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Branch</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">
                    {admin.first_name} {admin.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{admin.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {admin.branch_id ? (branches.find(b => b.id === admin.branch_id)?.name || `Branch ${admin.branch_id}`) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleDelete(admin.id)}
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
    </div>
  )
}

export default AdminManagementPage
