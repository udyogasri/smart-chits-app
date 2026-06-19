import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MdDashboard, MdDomain, MdSupervisorAccount, MdPeople, MdDescription, MdPayment, MdGavel, MdShowChart, MdHistory, MdSettings, MdLogout } from 'react-icons/md'

function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  // Get user full name
  const getFullName = () => {
    if (!currentUser) return 'Super Admin'
    const firstName = currentUser.first_name || currentUser.firstName || ''
    const lastName = currentUser.last_name || currentUser.lastName || ''
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (currentUser.email) {
      return currentUser.email.split('@')[0]
    }
    
    return 'Super Admin'
  }

  // Generate avatar initials
  const getAvatarInitials = () => {
    if (!currentUser) return 'SA'
    const firstName = currentUser.first_name || currentUser.firstName || ''
    const lastName = currentUser.last_name || currentUser.lastName || ''
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase()
    } else if (currentUser.email) {
      return currentUser.email.substring(0, 2).toUpperCase()
    }
    
    return 'SA'
  }

  const menuItems = [
    { name: 'Dashboard', href: '/superadmin/dashboard', icon: MdDashboard },
    { name: 'Branch Management', href: '/superadmin/branches', icon: MdDomain },
    { name: 'Admin Management', href: '/superadmin/admins', icon: MdSupervisorAccount },
    { name: 'Members', href: '/superadmin/members', icon: MdPeople },
    { name: 'Chit Groups', href: '/superadmin/chit-groups', icon: MdDescription },
    { name: 'Payments', href: '/superadmin/payments', icon: MdPayment },
    { name: 'Auctions', href: '/superadmin/auctions', icon: MdGavel },
    { name: 'Financial Summary', href: '/superadmin/financial-summary', icon: MdShowChart },
    { name: 'Audit Logs', href: '/superadmin/audit-logs', icon: MdHistory },
    { name: 'Settings', href: '/superadmin/settings', icon: MdSettings }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700">
            <Link to="/superadmin/dashboard" className="flex items-center gap-3">
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
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="text-lg w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-slate-700 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-bold text-white">
                {getAvatarInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getFullName()}</p>
                <p className="text-xs text-slate-400 truncate">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-300 rounded-lg transition-colors flex items-center gap-3"
            >
              <MdLogout className="text-lg w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navbar */}
        <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
          <div className="flex h-16 items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white text-2xl"
            >
              ☰
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Welcome back, {getFullName().split(' ')[0]}!</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-bold text-white">
                {getAvatarInitials()}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default SuperAdminLayout
