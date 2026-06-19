import { fetcher, fetcherFormData } from './api'

function parseJwt(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch (error) {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true
  return Math.floor(Date.now() / 1000) >= payload.exp
}

export function clearAuthStorage() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userAvatar')
}

// Login user
export async function login(email, password) {
  const response = await fetcher('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: email,
      password: password
    }),
  })
  
  // Store token in localStorage
  if (response.access_token) {
    localStorage.setItem('authToken', response.access_token)
  }
  
  return response
}

// Register user
export async function register(userData) {
  if (userData.userType === 'organization') {
    // Use organization registration endpoint
    const backendData = {
      // Admin User Details
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone_number: userData.phone,
      password: userData.password,
      confirm_password: userData.confirmPassword,
      
      // Organization Details
      organization_name: userData.organizationName,
      organization_type: userData.organizationType,
      registration_number: userData.registrationNumber,
      company_email: userData.companyEmail,
      company_phone_number: userData.companyPhone,
      description: userData.description || null
    }

    const response = await fetcher('/organizations/register', {
      method: 'POST',
      body: JSON.stringify(backendData),
    })
    
    return response
  } else {
    // Use regular user registration endpoint
    const backendData = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone_number: userData.phone,
      password: userData.password
    }

    const response = await fetcher('/users/register', {
      method: 'POST',
      body: JSON.stringify(backendData),
    })
    
    return response
  }
}

// Get current user profile
export async function getCurrentUser() {
  const response = await fetcher('/users/me')
  return response
}

// Logout user
export function logout() {
  clearAuthStorage()
}

// Check if user is authenticated
export function isAuthenticated() {
  const token = localStorage.getItem('authToken')
  return !!token && !isTokenExpired(token)
}

// Get stored token
export function getToken() {
  return localStorage.getItem('authToken')
}

// Update user settings
export async function updateUserSettings(settingsData) {
  const response = await fetcher('/users/me/settings', {
    method: 'PATCH',
    body: JSON.stringify(settingsData),
  })
  
  return response
}
