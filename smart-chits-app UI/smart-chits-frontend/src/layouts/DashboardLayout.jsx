import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MdDashboard, MdSearch, MdStar, MdPayment, MdHistory, MdSettings, MdLogout, MdMenu } from 'react-icons/md'

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { t, currentUser, logout } = useAuth()

  // Get user full name
  const getFullName = () => {
    if (!currentUser) return 'User'
    const firstName = currentUser.first_name || currentUser.firstName || ''
    const lastName = currentUser.last_name || currentUser.lastName || ''
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (currentUser.email) {
      return currentUser.email.split('@')[0]
    }
    
    return 'User'
  }

  // Generate avatar initials
  const getAvatarInitials = () => {
    if (!currentUser) return 'U'
    const firstName = currentUser.first_name || currentUser.firstName || ''
    const lastName = currentUser.last_name || currentUser.lastName || ''
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase()
    } else if (currentUser.email) {
      return currentUser.email.substring(0, 2).toUpperCase()
    }
    
    return 'U'
  }

  const menuItems = [
    { name: t('dashboard') || 'Dashboard', href: '/dashboard', icon: MdDashboard },
    { name: t('browseChits') || 'Browse Chits', href: '/dashboard/browse', icon: MdSearch },
    { name: t('myChits') || 'My Chits', href: '/dashboard/my-chits', icon: MdStar },
    { name: t('payments') || 'Payments', href: '/dashboard/payments', icon: MdPayment },
    { name: t('paymentHistory') || 'Payment History', href: '/dashboard/payment-history', icon: MdHistory },
    { name: t('settings') || 'Settings', href: '/dashboard/settings', icon: MdSettings }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700">
            <Link to="/dashboard" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-bold text-white">
                SC
              </span>
              <span className="text-lg font-semibold">SmartChits</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="text-lg w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-slate-700 p-3 space-y-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors w-full"
            >
              <MdLogout className="text-lg w-5 h-5" />
              {t('logout') || 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-slate-800 border-b border-slate-700 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{t('welcomeBack') || 'Welcome back,'} {getFullName()}!</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt="User Avatar" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getAvatarInitials()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
