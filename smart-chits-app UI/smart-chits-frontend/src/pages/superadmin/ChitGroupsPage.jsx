import { useState, useEffect, useRef } from 'react'
import { fetcher } from '../../services/api'

function ChitGroupsPage() {
  const [chits, setChits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    total_members: '',
    chit_fund: '',
    installment_amount: '',
    installment_frequency: '1',
    total_months: '',
    description: ''
  })
  
  const timeoutRef = useRef(null)
  const messageTimeoutRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  useEffect(() => {
    fetchChits()
    // Set up polling for real-time updates every 30 seconds
    // Clear any existing interval first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    pollingIntervalRef.current = setInterval(fetchChits, 30000)
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
    }
  }, [])

  const fetchChits = async () => {
    try {
      const data = await fetcher('/platform-admin/chits')
      setChits(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch chits:', err)
      setError('Failed to load chit groups')
      setChits([])
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
    
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    
    messageTimeoutRef.current = setTimeout(() => {
      setError(null)
      setSuccess(null)
    }, 4000)
  }

  const handleAddChit = async (e) => {
    e.preventDefault()
    
    if (!formData.name) {
      showMessage('Chit name is required', true)
      return
    }
    if (!formData.chit_fund) {
      showMessage('Chit fund is required', true)
      return
    }
    if (!formData.installment_amount) {
      showMessage('Installment amount is required', true)
      return
    }
    if (!formData.total_months) {
      showMessage('Total months is required', true)
      return
    }

    try {
      setLoading(true)
      if (editingId) {
        // Update existing chit
        await fetcher(`/platform-admin/chits/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name,
            duration: parseInt(formData.total_months),
            monthly_amount: parseFloat(formData.installment_amount),
            chit_fund: parseFloat(formData.chit_fund),
            installment_amount: parseFloat(formData.installment_amount),
            installment_frequency: parseInt(formData.installment_frequency),
            total_months: parseInt(formData.total_months),
            total_members: parseInt(formData.total_members) || 0,
            description: formData.description
          })
        })
        showMessage('Chit group updated successfully!')
      } else {
        // Create new chit
        await fetcher('/platform-admin/chits', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            duration: parseInt(formData.total_months),
            monthly_amount: parseFloat(formData.installment_amount),
            chit_fund: parseFloat(formData.chit_fund),
            installment_amount: parseFloat(formData.installment_amount),
            installment_frequency: parseInt(formData.installment_frequency),
            total_months: parseInt(formData.total_months),
            total_members: parseInt(formData.total_members) || 0,
            description: formData.description
          })
        })
        showMessage('Chit group created successfully!')
      }
      
      setFormData({
        name: '',
        total_members: '',
        chit_fund: '',
        installment_amount: '',
        installment_frequency: '1',
        total_months: '',
        description: ''
      })
      setShowForm(false)
      setEditingId(null)
      
      // Delay re-fetch slightly to ensure database update
      timeoutRef.current = setTimeout(() => {
        fetchChits()
      }, 1500)
    } catch (err) {
      showMessage('Failed to save chit group', true)
    } finally {
      setLoading(false)
    }
  }

  const handleEditChit = (chit) => {
    setEditingId(chit.id)
    setFormData({
      name: chit.name,
      total_members: chit.total_members || '',
      chit_fund: chit.chit_fund,
      installment_amount: chit.installment_amount,
      installment_frequency: chit.installment_frequency,
      total_months: chit.total_months,
      description: chit.description || ''
    })
    setShowForm(true)
  }

  const handleDeleteChit = async (chit) => {
    if (window.confirm(`Are you sure you want to delete "${chit.name}"?`)) {
      try {
        setLoading(true)
        await fetcher(`/platform-admin/chits/${chit.id}`, {
          method: 'DELETE'
        })
        showMessage('Chit group deleted successfully!')
        timeoutRef.current = setTimeout(() => {
          fetchChits()
        }, 1500)
      } catch (err) {
        console.error('Delete error:', err)
        let errorMessage = 'Failed to delete chit group'
        if (err.status === 401) {
          errorMessage = 'Authentication failed. Please login again.'
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to delete this chit group.'
        } else if (err.status === 404) {
          errorMessage = 'Chit group not found.'
        } else if (err.detail) {
          errorMessage = err.detail
        }
        showMessage(errorMessage, true)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancelEdit = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      total_members: '',
      chit_fund: '',
      installment_amount: '',
      installment_frequency: '1',
      total_months: '',
      description: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Chit Groups</h1>
        </div>
        <button
          onClick={() => {
            if (showForm && !editingId) {
              setShowForm(false)
            } else {
              setShowForm(true)
              setEditingId(null)
              setFormData({
                name: '',
                chit_fund: '',
                installment_amount: '',
                installment_frequency: '1',
                total_months: '',
                description: ''
              })
            }
          }}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          + Add Chit Group
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Edit Chit Group' : 'Create New Chit Group'}
          </h2>
          <form onSubmit={handleAddChit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Chit Group Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter chit group name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Chit Fund (₹) *
                </label>
                <input
                  type="number"
                  value={formData.chit_fund}
                  onChange={(e) => setFormData({ ...formData, chit_fund: e.target.value })}
                  placeholder="Enter chit fund amount"
                  step="0.01"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Members
                </label>
                <input
                  type="number"
                  value={formData.total_members}
                  onChange={(e) => setFormData({ ...formData, total_members: e.target.value })}
                  placeholder="Enter total members"
                  min="0"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Installment Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.installment_amount}
                  onChange={(e) => setFormData({ ...formData, installment_amount: e.target.value })}
                  placeholder="Enter installment amount"
                  step="0.01"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Months *
                </label>
                <input
                  type="number"
                  value={formData.total_months}
                  onChange={(e) => setFormData({ ...formData, total_months: e.target.value })}
                  placeholder="Enter total months"
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Installment Frequency (Months)
                </label>
                <input
                  type="number"
                  value={formData.installment_frequency}
                  onChange={(e) => setFormData({ ...formData, installment_frequency: e.target.value })}
                  placeholder="Enter frequency"
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description (optional)"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                {editingId ? 'Update Chit Group' : 'Create Chit Group'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading chit groups...</p>
        </div>
      ) : chits.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">No chit groups found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chits.map((chit) => (
            <div key={chit.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-3">{chit.name}</h3>
              
              <div className="space-y-2 text-sm mb-4">
                <p className="text-slate-400">
                  💰 <span className="text-white font-medium">Chit Fund:</span> ₹{chit.chit_fund?.toLocaleString() || '0'}
                </p>
                <p className="text-slate-400">
                  💵 <span className="text-white font-medium">Installment:</span> ₹{chit.installment_amount?.toLocaleString() || '0'}
                </p>
                <p className="text-slate-400">
                  � <span className="text-white font-medium">Total Members:</span> {chit.total_members || 0}
                </p>
                <p className="text-slate-400">
                  📅 <span className="text-white font-medium">Duration:</span> {chit.total_months} months
                </p>
                <p className="text-slate-400">
                  ⏱️ <span className="text-white font-medium">Frequency:</span> Every {chit.installment_frequency} month(s)
                </p>
                <p className="text-slate-400">
                  👥 <span className="text-white font-medium">Active Members:</span> {chit.member_count || 0}
                </p>
                {chit.description && (
                  <p className="text-slate-400">
                    📝 <span className="text-white font-medium">Note:</span> {chit.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <button
                  onClick={() => handleEditChit(chit)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteChit(chit)}
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

export default ChitGroupsPage
