import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication status and user role.
 * 
 * Usage:
 * <ProtectedRoute requiredRole="superadmin">
 *   <SuperAdminDashboard />
 * </ProtectedRoute>
 */
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!requiredRole) return true
    if (requiredRole === 'admin') {
      return role === 'admin' || role === 'platformadmin'
    }
    return role === requiredRole
  }

  if (requiredRole && !hasRequiredRole()) {
    // Redirect to appropriate dashboard based on user's role
    if (role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />
    } else if (role === 'admin' || role === 'platformadmin') {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
