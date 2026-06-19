import { useState, useEffect, useRef, useCallback } from 'react'
import { fetcher } from '../../services/api'

function AdminChitGroupsPage() {
  const [chitGroups, setChitGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingChit, setViewingChit] = useState(null)
  const [editingChit, setEditingChit] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    total_members: '',
    chit_fund: '',
    installment_amount: '',
    total_months: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const refreshTimerRef = useRef(null)
  const lastFetchRef = useRef(0)

  // Fetch chit groups with caching to prevent rapid requests
  const fetchChitGroups = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    // Prevent multiple requests within 3 seconds
    if (!forceRefresh && now - lastFetchRef.current < 3000) {
      return
    }

    try {
      setLoading(true)
      console.log('📡 Fetching chit groups from /admin/chits...')
      const data = await fetcher('/admin/chits?skip=0&limit=100')
      console.log('✅ Successfully fetched chit groups:', data?.length || 0, 'groups')
      setChitGroups(Array.isArray(data) ? data : [])
      setError(null)
      lastFetchRef.current = now
    } catch (err) {
      console.error('❌ Failed to fetch chit groups:', err)
      
      // Detailed error logging for debugging
      if (err.info?.detail) {
        console.error('API Error Detail:', err.info.detail)
      }
      if (err.status) {
        console.error('HTTP Status:', err.status)
      }
      
      // Better error messages
      let errorMessage = 'Failed to load chit groups'
      if (err.status === 403) {
        errorMessage = `Permission Denied: ${err.info?.detail || 'Access denied to chit groups'}`
      } else if (err.status === 401) {
        errorMessage = 'Authentication required. Please login again.'
      } else if (err.status === 0) {
        errorMessage = 'Network error: Cannot reach API server'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Setup real-time data refresh
  useEffect(() => {
    // Initial fetch
    fetchChitGroups(true)

    // Setup auto-refresh interval
    refreshTimerRef.current = setInterval(() => {
      fetchChitGroups()
    }, refreshInterval)

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [refreshInterval, fetchChitGroups])

  const resetForm = () => {
    setFormData({
      name: '',
      total_members: '',
      chit_fund: '',
      installment_amount: '',
      total_months: '',
      description: ''
    })
    setEditingChit(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (chit) => {
    console.log('📝 Opening edit modal for chit:', chit.name, chit)
    setFormData({
      name: chit.name || '',
      total_members: (chit.total_members || '').toString(),
      chit_fund: (chit.chit_fund || '').toString(),
      installment_amount: (chit.installment_amount || '').toString(),
      total_months: (chit.total_months || '').toString(),
      description: chit.description || ''
    })
    setEditingChit(chit)
    setShowCreateModal(true)
    console.log('✅ Edit modal opened')
  }

  const openViewModal = (chit) => {
    console.log('👁️ Opening view modal for chit:', chit.name, chit)
    setViewingChit(chit)
    setShowViewModal(true)
    console.log('✅ View modal opened')
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setViewingChit(null)
  }

  const closeModal = () => {
    setShowCreateModal(false)
    resetForm()
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Chit group name is required')
      return false
    }
    if (!formData.total_members || parseInt(formData.total_members) <= 0) {
      setError('Total members must be greater than 0')
      return false
    }
    if (!formData.chit_fund || parseInt(formData.chit_fund) <= 0) {
      setError('Chit fund amount must be greater than 0')
      return false
    }
    if (!formData.installment_amount || parseInt(formData.installment_amount) <= 0) {
      setError('Installment amount must be greater than 0')
      return false
    }
    if (!formData.total_months || parseInt(formData.total_months) <= 0) {
      setError('Duration must be greater than 0 months')
      return false
    }
    return true
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setError(null)

    console.log('📝 Form submitted. Editing chit:', editingChit ? editingChit.name : 'NEW')

    if (!validateForm()) {
      console.log('❌ Form validation failed')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        name: formData.name,
        total_members: parseInt(formData.total_members),
        chit_fund: parseInt(formData.chit_fund),
        installment_amount: parseInt(formData.installment_amount),
        total_months: parseInt(formData.total_months),
        description: formData.description,
        monthly_amount: parseInt(formData.installment_amount),
        duration: parseInt(formData.total_months),
        total_chit_amount: parseInt(formData.chit_fund) * parseInt(formData.total_members)
      }

      if (editingChit) {
        // Try to update the chit group using PATCH
        try {
          console.log(`📤 Updating chit group ${editingChit.id}...`, payload)
          const response = await fetcher(`/admin/chits/${editingChit.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload)
          })
          console.log('✅ PATCH Update successful:', response)
          setSuccessMessage(`✓ Chit group "${response.name || formData.name}" updated successfully`)
        } catch (patchError) {
          console.log('⚠️ PATCH failed, trying DELETE + POST fallback...')
          // If PATCH not supported, delete and recreate
          if (patchError.status === 405 || patchError.status === 404) {
            try {
              console.log('🗑️ Deleting old chit...')
              await fetcher(`/admin/chits/${editingChit.id}`, {
                method: 'DELETE'
              })
              console.log('📤 Creating new chit...')
              const newResponse = await fetcher('/admin/chits', {
                method: 'POST',
                body: JSON.stringify(payload)
              })
              console.log('✅ DELETE + POST successful:', newResponse)
              setSuccessMessage(`✓ Chit group "${newResponse.name}" updated successfully (recreated)`)
            } catch (deleteRecreateError) {
              console.error('❌ DELETE + POST failed:', deleteRecreateError)
              throw new Error('Failed to update via delete and recreate')
            }
          } else {
            throw patchError
          }
        }
      } else {
        // Create new chit
        console.log('📤 Creating new chit group...', payload)
        const response = await fetcher('/admin/chits', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        console.log('✅ Create successful:', response)
        setSuccessMessage(`✓ Chit group "${response.name}" created successfully`)
      }

      closeModal()
      setTimeout(() => {
        console.log('🔄 Refreshing data after form submission...')
        fetchChitGroups(true)
        setSuccessMessage(null)
      }, 1000)
    } catch (err) {
      console.error('❌ Failed to save chit group:', err)
      setError(err.info?.detail || 'Failed to save chit group')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteChit = async (group) => {
    console.log('🗑️🔴 DELETE INITIATED for group:', group.name, group.id)
    
    if (!window.confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      console.log('❌ Delete cancelled by user')
      return
    }

    console.log('✅ Delete confirmed, sending to API...')

    try {
      setDeletingId(group.id)
      console.log(`🗑️ Deleting chit group ${group.id}...`)
      
      const response = await fetcher(`/admin/chits/${group.id}`, {
        method: 'DELETE'
      })
      
      console.log('✅ Delete API call successful:', response)
      setSuccessMessage(`✓ Chit group "${group.name}" deleted successfully`)
      setError(null)
      
      setTimeout(() => {
        console.log('🔄 Refreshing data after delete...')
        fetchChitGroups(true)
        setSuccessMessage(null)
      }, 500)
    } catch (err) {
      console.error('❌ Failed to delete chit group:', err)
      
      // Better error messaging
      let errorMessage = 'Failed to delete chit group'
      if (err.info?.detail) {
        errorMessage = err.info.detail
      } else if (err.status === 404) {
        errorMessage = 'Chit group not found'
      } else if (err.status === 403) {
        errorMessage = 'You do not have permission to delete this chit group'
      }
      
      console.error('Error message:', errorMessage)
      setError(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh clicked')
    await fetchChitGroups(true)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Chit Groups</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and monitor all chit group funds</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('🔄 Refresh button clicked')
              handleRefresh()
            }}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            Refresh
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('➕ Create button clicked')
              openCreateModal()
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Create Group
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 flex items-center gap-3">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 flex items-center gap-3">
          <span>✕</span>
          <span>{error}</span>
        </div>
      )}

      {/* Refresh Interval Control */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <label className="text-sm text-slate-300">
          Auto-refresh interval:
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="ml-2 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
          >
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
            <option value={0}>Disabled</option>
          </select>
        </label>
      </div>

      {/* Content */}
      {loading && chitGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading chit groups...</p>
        </div>
      ) : chitGroups.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg mb-4">No chit groups found</p>
          <button
            onClick={openCreateModal}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Create First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chitGroups.map((group) => (
            <div
              key={group.id}
              className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">{group.name}</h3>
                {group.description && (
                  <p className="text-slate-400 text-xs line-clamp-2">{group.description}</p>
                )}
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  group.member_count >= group.total_members
                    ? 'bg-green-500/20 text-green-300'
                    : group.member_count > 0
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {group.member_count >= group.total_members
                    ? '✓ Full'
                    : group.member_count > 0
                    ? `${group.member_count}/${group.total_members} Members`
                    : 'No Members'}
                </span>
              </div>

              {/* Details Grid */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Members:</span>
                  <span className="text-white font-semibold">{group.total_members}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Members:</span>
                  <span className="text-white font-semibold">{group.member_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chit Fund:</span>
                  <span className="text-white font-semibold">₹{(group.chit_fund || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Installment:</span>
                  <span className="text-white font-semibold">₹{(group.installment_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white font-semibold">{group.total_months} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Month:</span>
                  <span className="text-white font-semibold">{group.current_month || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bidding:</span>
                  <span className={`font-semibold ${group.bidding_open ? 'text-green-400' : 'text-red-400'}`}>
                    {group.bidding_open ? '🔓 Open' : '🔒 Closed'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🔵 Edit button clicked for group:', group.name)
                    openEditModal(group)
                  }}
                  disabled={submitting || deletingId === group.id}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>✏️</span>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🔴 Delete button clicked for group:', group.name)
                    handleDeleteChit(group)
                  }}
                  disabled={submitting || deletingId === group.id}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {deletingId === group.id ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Delete</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('👁️ View button clicked for group:', group.name)
                    openViewModal(group)
                  }}
                  disabled={submitting || deletingId === group.id}
                  className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="View group details and members"
                >
                  <span>👁️</span>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingChit ? 'Edit Chit Group' : 'Create New Chit Group'}
            </h2>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Gold Chit Fund"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Total Members */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Members *
                </label>
                <input
                  type="number"
                  name="total_members"
                  value={formData.total_members}
                  onChange={handleFormChange}
                  placeholder="e.g., 20"
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Chit Fund */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Chit Fund Amount (₹) *
                </label>
                <input
                  type="number"
                  name="chit_fund"
                  value={formData.chit_fund}
                  onChange={handleFormChange}
                  placeholder="e.g., 100000"
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Installment Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Monthly Installment (₹) *
                </label>
                <input
                  type="number"
                  name="installment_amount"
                  value={formData.installment_amount}
                  onChange={handleFormChange}
                  placeholder="e.g., 5000"
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  name="total_months"
                  value={formData.total_months}
                  onChange={handleFormChange}
                  placeholder="e.g., 20"
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Add any additional details about this chit group..."
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      {editingChit ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingChit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{viewingChit.name}</h2>
              <button
                onClick={closeViewModal}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                viewingChit.member_count >= viewingChit.total_members
                  ? 'bg-green-500/20 text-green-300'
                  : viewingChit.member_count > 0
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {viewingChit.member_count >= viewingChit.total_members
                  ? '✓ Full'
                  : viewingChit.member_count > 0
                  ? `${viewingChit.member_count}/${viewingChit.total_members} Members`
                  : 'No Members'}
              </span>
            </div>

            {/* Description */}
            {viewingChit.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
                <p className="text-slate-400">{viewingChit.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Chit Fund Amount</p>
                <p className="text-2xl font-bold text-white">₹{(viewingChit.chit_fund || 0).toLocaleString()}</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Monthly Installment</p>
                <p className="text-2xl font-bold text-white">₹{(viewingChit.installment_amount || 0).toLocaleString()}</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Total Members</p>
                <p className="text-2xl font-bold text-white">{viewingChit.total_members}</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Active Members</p>
                <p className="text-2xl font-bold text-white">{viewingChit.member_count || 0}</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Duration</p>
                <p className="text-2xl font-bold text-white">{viewingChit.total_months} months</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Current Month</p>
                <p className="text-2xl font-bold text-white">{viewingChit.current_month || 'N/A'}</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700 col-span-1">
                <p className="text-slate-400 text-sm mb-1">Bidding Status</p>
                <p className={`text-lg font-bold ${viewingChit.bidding_open ? 'text-green-400' : 'text-red-400'}`}>
                  {viewingChit.bidding_open ? '🔓 Open' : '🔒 Closed'}
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700 col-span-1">
                <p className="text-slate-400 text-sm mb-1">Installment Frequency</p>
                <p className="text-lg font-bold text-white">{viewingChit.installment_frequency || 'Monthly'}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-700 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Chit Amount:</span>
                  <span className="text-white font-semibold">₹{(viewingChit.total_members * viewingChit.chit_fund).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Members Needed:</span>
                  <span className="text-white font-semibold">{viewingChit.total_members - (viewingChit.member_count || 0)} more</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Membership Percentage:</span>
                  <span className="text-white font-semibold">{Math.round(((viewingChit.member_count || 0) / viewingChit.total_members) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white font-semibold">{new Date(viewingChit.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => openEditModal(viewingChit)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>✏️</span>
                Edit Group
              </button>
              <button
                onClick={closeViewModal}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminChitGroupsPage
