import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { MdSettings } from 'react-icons/md'

function SettingsPage() {
  const { currentUser, updateUserProfile, currentLanguage, changeLanguage, t } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organizationName: '',
    organizationType: '',
    registrationNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [preferences, setPreferences] = useState({
    language: 'English',
    timezone: 'India Standard Time (IST)',
    currency: 'Indian Rupee (₹)'
  })
  const [preferencesLoading, setPreferencesLoading] = useState(false)
  const [preferencesMessage, setPreferencesMessage] = useState('')
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    chitAnnouncements: true,
    monthlyStatements: true,
    securityAlerts: true,
    marketingEmails: false
  })
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsMessage, setNotificationsMessage] = useState('')

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.first_name || currentUser.firstName || '',
        lastName: currentUser.last_name || currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone_number || currentUser.phone || '',
        organizationName: currentUser.organizationName || '',
        organizationType: currentUser.organizationType || '',
        registrationNumber: currentUser.registrationNumber || ''
      })
      
      // Set avatar preview if user has avatar
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar)
      }
      
      // Load preferences from database if available
      if (currentUser.preferences) {
        setPreferences({
          language: currentUser.preferences.language || 'English',
          timezone: currentUser.preferences.timezone || 'India Standard Time (IST)',
          currency: currentUser.preferences.currency || 'Indian Rupee (₹)'
        })
        // Set global language
        changeLanguage(currentUser.preferences.language || 'English')
      }
      
      // Load notifications from database if available
      if (currentUser.notifications) {
        setNotifications({
          paymentReminders: currentUser.notifications.paymentReminders ?? true,
          chitAnnouncements: currentUser.notifications.chitAnnouncements ?? true,
          monthlyStatements: currentUser.notifications.monthlyStatements ?? true,
          securityAlerts: currentUser.notifications.securityAlerts ?? true,
          marketingEmails: currentUser.notifications.marketingEmails ?? false
        })
      }
    }
  }, [currentUser, changeLanguage])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handlePreferencesChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value
    })
  }

  const handlePreferencesSave = async (e) => {
    e.preventDefault()
    setPreferencesLoading(true)
    setPreferencesMessage('')

    try {
      // Update language globally
      changeLanguage(preferences.language)
      
      // Save preferences to user profile
      await updateUserProfile({ preferences })
      setPreferencesMessage('Preferences updated successfully!')
      setTimeout(() => setPreferencesMessage(''), 3000)
    } catch (error) {
      setPreferencesMessage('Failed to update preferences')
      setTimeout(() => setPreferencesMessage(''), 3000)
    } finally {
      setPreferencesLoading(false)
    }
  }

  const handleNotificationsChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    })
  }

  const handleNotificationsSave = async (e) => {
    e.preventDefault()
    setNotificationsLoading(true)
    setNotificationsMessage('')

    try {
      // Save notifications to user profile
      await updateUserProfile({ notifications })
      setNotificationsMessage('Notification preferences updated successfully!')
      setTimeout(() => setNotificationsMessage(''), 3000)
    } catch (error) {
      setNotificationsMessage('Failed to update notification preferences')
      setTimeout(() => setNotificationsMessage(''), 3000)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordMessage('')

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please fill in all password fields')
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      setPasswordLoading(false)
      return
    }

    try {
      // Verify current password
      if (currentUser?.password !== passwordData.currentPassword) {
        setPasswordError('Current password is incorrect')
        setPasswordLoading(false)
        return
      }

      // Update password
      await updateUserProfile({ password: passwordData.newPassword })
      setPasswordMessage('Password updated successfully!')
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setTimeout(() => setPasswordMessage(''), 3000)
    } catch (error) {
      setPasswordError(error.message)
      setTimeout(() => setPasswordError(''), 3000)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB')
        setTimeout(() => setError(''), 3000)
        return
      }

      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        setError('File must be JPG, GIF, or PNG')
        setTimeout(() => setError(''), 3000)
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Validation
    if (!formData.firstName.trim()) {
      setError('First name is required')
      setLoading(false)
      return
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format')
      setLoading(false)
      return
    }

    try {
      // Prepare update data with correct field names for backend
      const updateData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone.trim() || null
      }
      
      // Include avatar in the update if one was selected
      // Only include if it's a new selection (not already stored)
      if (avatarFile || (avatarPreview && avatarPreview !== currentUser?.avatar)) {
        updateData.avatar = avatarPreview
      }
      
      await updateUserProfile(updateData)
      setMessage('Profile updated successfully!')
      setAvatarFile(null)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setError(error.message || 'Failed to update profile')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: t('profile_settings'), icon: '👤' },
    { id: 'security', name: t('security'), icon: '🔒' },
    { id: 'notifications', name: t('notifications'), icon: '🔔' },
    { id: 'preferences', name: t('preferences'), icon: <MdSettings /> },
    { id: 'statements', name: t('statements'), icon: '📄' },
    { id: 'support', name: t('support'), icon: '💬' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="border-b border-slate-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Success/Error Messages */}
              {message && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <p className="text-green-300 text-sm text-center">{message}</p>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="flex items-center space-x-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {avatarPreview || currentUser?.avatar ? (
                    <img 
                      src={avatarPreview || currentUser?.avatar} 
                      alt="Avatar" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {formData.firstName && formData.lastName 
                        ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
                        : currentUser?.email?.substring(0, 2).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => document.getElementById('avatar-upload').click()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Change Avatar
                  </button>
                  <p className="text-slate-400 text-sm mt-2">JPG, GIF or PNG. Max size of 2MB</p>
                  {avatarFile && (
                    <p className="text-green-400 text-sm mt-1">Selected: {avatarFile.name}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                {currentUser?.userType === 'organization' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Organization Name</label>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Organization Type</label>
                      <select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleChange}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">Select type</option>
                        <option value="private">Private Limited</option>
                        <option value="public">Public Limited</option>
                        <option value="partnership">Partnership</option>
                        <option value="llp">LLP</option>
                        <option value="trust">Trust</option>
                        <option value="society">Society</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Registration Number</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Reset form to current user data
                    if (currentUser) {
                      setFormData({
                        firstName: currentUser.first_name || currentUser.firstName || '',
                        lastName: currentUser.last_name || currentUser.lastName || '',
                        email: currentUser.email || '',
                        phone: currentUser.phone_number || currentUser.phone || '',
                        organizationName: currentUser.organizationName || '',
                        organizationType: currentUser.organizationType || '',
                        registrationNumber: currentUser.registrationNumber || ''
                      })
                      setAvatarPreview(currentUser.avatar || null)
                      setAvatarFile(null)
                    }
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                
                {/* Password Messages */}
                {passwordMessage && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <p className="text-green-300 text-sm text-center">{passwordMessage}</p>
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-sm text-center">{passwordError}</p>
                  </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-white">Enable 2FA</p>
                    <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Notification Preferences</h3>
              
              {/* Notifications Messages */}
              {notificationsMessage && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <p className="text-green-300 text-sm text-center">{notificationsMessage}</p>
                </div>
              )}

              <form onSubmit={handleNotificationsSave} className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-700 rounded-lg cursor-pointer">
                  <span className="text-white">Payment reminders</span>
                  <input 
                    type="checkbox" 
                    checked={notifications.paymentReminders}
                    onChange={() => handleNotificationsChange('paymentReminders')}
                    className="w-4 h-4 text-indigo-600 bg-slate-600 border-slate-500 rounded" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-700 rounded-lg cursor-pointer">
                  <span className="text-white">New chit plan announcements</span>
                  <input 
                    type="checkbox" 
                    checked={notifications.chitAnnouncements}
                    onChange={() => handleNotificationsChange('chitAnnouncements')}
                    className="w-4 h-4 text-indigo-600 bg-slate-600 border-slate-500 rounded" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-700 rounded-lg cursor-pointer">
                  <span className="text-white">Monthly statements</span>
                  <input 
                    type="checkbox" 
                    checked={notifications.monthlyStatements}
                    onChange={() => handleNotificationsChange('monthlyStatements')}
                    className="w-4 h-4 text-indigo-600 bg-slate-600 border-slate-500 rounded" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-700 rounded-lg cursor-pointer">
                  <span className="text-white">Security alerts</span>
                  <input 
                    type="checkbox" 
                    checked={notifications.securityAlerts}
                    onChange={() => handleNotificationsChange('securityAlerts')}
                    className="w-4 h-4 text-indigo-600 bg-slate-600 border-slate-500 rounded" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-700 rounded-lg cursor-pointer">
                  <span className="text-white">Marketing emails</span>
                  <input 
                    type="checkbox" 
                    checked={notifications.marketingEmails}
                    onChange={() => handleNotificationsChange('marketingEmails')}
                    className="w-4 h-4 text-indigo-600 bg-slate-600 border-slate-500 rounded" 
                  />
                </label>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={notificationsLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {notificationsLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">{t('preferences')}</h3>
              
              {/* Preferences Messages */}
              {preferencesMessage && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <p className="text-green-300 text-sm text-center">{preferencesMessage}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('language')}</label>
                  <select 
                    name="language"
                    value={preferences.language}
                    onChange={handlePreferencesChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('timezone')}</label>
                  <select 
                    name="timezone"
                    value={preferences.timezone}
                    onChange={handlePreferencesChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option>India Standard Time (IST)</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('currency')}</label>
                  <select 
                    name="currency"
                    value={preferences.currency}
                    onChange={handlePreferencesChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option>Indian Rupee (₹)</option>
                    <option>US Dollar ($)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handlePreferencesSave}
                  disabled={preferencesLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {preferencesLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'statements' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Download Statements</h3>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Statement Type</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="statementType" className="text-indigo-600" defaultChecked />
                    <span className="text-slate-300">Monthly Statement</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="statementType" className="text-indigo-600" />
                    <span className="text-slate-300">Quarterly Statement</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="statementType" className="text-indigo-600" />
                    <span className="text-slate-300">Annual Statement</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="statementType" className="text-indigo-600" />
                    <span className="text-slate-300">Custom Period</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Select Period</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">From Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">To Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Format</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="format" className="text-indigo-600" defaultChecked />
                    <span className="text-slate-300">PDF</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="format" className="text-indigo-600" />
                    <span className="text-slate-300">Excel</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="format" className="text-indigo-600" />
                    <span className="text-slate-300">CSV</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors">
                  Download Statement
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors">
                  Preview
                </button>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Contact Support</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-slate-700 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="text-xl">📞</span>
                    Phone Support
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Toll Free: 1800-123-4567</p>
                    <p className="text-slate-300">Mobile: +91-98765-43210</p>
                    <p className="text-slate-400">Available: Mon-Sat, 9AM-6PM IST</p>
                  </div>
                  <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                    Call Now
                  </button>
                </div>

                <div className="bg-slate-700 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    Live Chat
                  </h4>
                  <p className="text-slate-300 text-sm mb-4">Chat with our support team for instant help</p>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors">
                    Start Chat
                  </button>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <span className="text-xl">✉️</span>
                  Email Support
                </h4>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                    <select className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white">
                      <option>General Inquiry</option>
                      <option>Payment Issue</option>
                      <option>Account Problem</option>
                      <option>Technical Issue</option>
                      <option>Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                    <textarea
                      rows="4"
                      placeholder="Describe your issue in detail..."
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                    <select className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors">
                    Send Message
                  </button>
                </form>
              </div>

              <div className="bg-slate-700 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <span className="text-xl">❓</span>
                  Help Center
                </h4>
                <p className="text-slate-300 text-sm mb-4">Find answers to common questions and browse our knowledge base</p>
                <div className="space-y-2">
                  <a href="#" className="block text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                    → Frequently Asked Questions
                  </a>
                  <a href="#" className="block text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                    → User Guides and Tutorials
                  </a>
                  <a href="#" className="block text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                    → Video Tutorials
                  </a>
                  <a href="#" className="block text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                    → System Status
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
