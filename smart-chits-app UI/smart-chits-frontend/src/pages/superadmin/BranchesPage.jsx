import { useState, useEffect, useRef } from 'react'
import { fetcher } from '../../services/api'

function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    manager_name: ''
  })
  
  const timeoutRef = useRef(null)
  const messageTimeoutRef = useRef(null)

  useEffect(() => {
    fetchBranches()
    // Set up polling for real-time updates every 10 seconds (reduced from 5 to prevent jerk)
    const interval = setInterval(fetchBranches, 10000)
    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
    }
  }, [])

  const fetchBranches = async () => {
    try {
      const data = await fetcher('/platform-admin/branches')
      setBranches(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch branches:', err)
      setError('Failed to load branches. Please make sure the backend is running.')
      setBranches([])
    } finally {
      setLoading(false)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      showMessage('Branch name is required', true)
      return
    }
    if (!formData.code.trim()) {
      showMessage('Branch code is required', true)
      return
    }

    try {
      setLoading(true)
      if (editingId) {
        // Update existing branch
        await fetcher(`/platform-admin/branches/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        showMessage('Branch updated successfully!')
        setEditingId(null)
      } else {
        // Create new branch
        await fetcher('/platform-admin/branches', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        showMessage('Branch created successfully!')
      }
      
      setFormData({ name: '', code: '', address: '', phone: '', email: '', manager_name: '' })
      setShowForm(false)
      
      // Fetch updated list after a short delay
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        fetchBranches()
      }, 1500)
    } catch (err) {
      console.error('Failed to save branch:', err)
      showMessage(err.message || 'Failed to save branch', true)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (branch) => {
    setEditingId(branch.id)
    setFormData({
      name: branch.name || '',
      code: branch.code || '',
      address: branch.address || branch.location || '',
      phone: branch.phone || '',
      email: branch.email || '',
      manager_name: branch.manager_name || ''
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', code: '', address: '', phone: '', email: '', manager_name: '' })
  }

  const handleDelete = async (branchId) => {
    if (!confirm('Are you sure you want to delete this branch?')) return
    try {
      await fetcher(`/platform-admin/branches/${branchId}`, { method: 'DELETE' })
      setBranches(branches.filter(b => b.id !== branchId))
      showMessage('Branch deleted successfully!')
    } catch (err) {
      console.error('Failed to delete branch:', err)
      showMessage('Failed to delete branch', true)
    }
  }

  const handleDeactivate = async (branchId) => {
    try {
      await fetcher(`/platform-admin/branches/${branchId}/deactivate`, { method: 'PATCH' })
      fetchBranches()
      showMessage('Branch deactivated successfully!')
    } catch (err) {
      console.error('Failed to deactivate branch:', err)
      showMessage('Failed to deactivate branch', true)
    }
  }

  const handleActivate = async (branchId) => {
    try {
      await fetcher(`/platform-admin/branches/${branchId}/activate`, { method: 'PATCH' })
      fetchBranches()
      showMessage('Branch activated successfully!')
    } catch (err) {
      console.error('Failed to activate branch:', err)
      showMessage('Failed to activate branch', true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Branch Management</h1>
        <button
          onClick={() => {
            if (showForm && !editingId) {
              handleCancel()
            } else {
              setEditingId(null)
              setFormData({ name: '', code: '', address: '', phone: '', email: '', manager_name: '' })
              setShowForm(!showForm)
            }
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Branch'}
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

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Branch Name"
              value={formData.name}
              onChange={handleInputChange}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              name="code"
              placeholder="Branch Code"
              value={formData.code}
              onChange={handleInputChange}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              name="manager_name"
              placeholder="Manager Name"
              value={formData.manager_name}
              onChange={handleInputChange}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingId ? 'Update Branch' : 'Create Branch'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading && !showForm ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading branches...</p>
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">No branches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{branch.name || 'Branch'}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${branch.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">📝 Code: {branch.code || 'N/A'}</p>
              <p className="text-slate-400 text-sm mb-1">📍 {branch.address || branch.location || 'N/A'}</p>
              <p className="text-slate-400 text-sm mb-1">👤 {branch.manager_name || 'N/A'}</p>
              <p className="text-slate-400 text-sm mb-1">📞 {branch.phone || 'N/A'}</p>
              <p className="text-slate-400 text-sm mb-4">✉️ {branch.email || 'N/A'}</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleEdit(branch)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                {branch.is_active ? (
                  <button
                    onClick={() => handleDeactivate(branch.id)}
                    className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(branch.id)}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => handleDelete(branch.id)}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BranchesPage
