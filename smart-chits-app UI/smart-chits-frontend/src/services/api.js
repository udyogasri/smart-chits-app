const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController()
  const signal = controller.signal
  const timer = setTimeout(() => controller.abort(), timeout)

  return fetch(url, { ...options, signal })
    .finally(() => clearTimeout(timer))
}

// Generic API fetcher with authentication
export async function fetcher(endpoint, options = {}) {
  const token = getAuthToken()
  // Increased timeout from 10s to 30s for slower operations
  const timeout = options.timeout || 30000
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  }

  const url = `${API_BASE_URL}${endpoint}`
  let response
  try {
    response = await fetchWithTimeout(url, {
      headers,
      mode: 'cors',
      ...options,
    }, timeout)
  } catch (networkError) {
    // Provide richer debugging info for network/CORS failures
    console.error('Network error during fetch', {
      url,
      headers,
      options,
      networkError,
    })
    const err = new Error(networkError.name === 'AbortError' ? 'Network timeout: API request took too long' : 'Network error: Failed to reach API')
    err.info = { detail: networkError.message }
    err.status = 0
    throw err
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userAvatar')
    }

    const error = new Error('API request failed')
    error.info = await response.json().catch(() => ({ detail: response.statusText }))
    error.status = response.status
    throw error
  }

  // Return null for 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Form data fetcher for login (backend uses Form data)
export async function fetcherFormData(endpoint, formData) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = new Error('API request failed')
    error.info = await response.json().catch(() => ({ detail: response.statusText }))
    error.status = response.status
    throw error
  }

  return response.json()
}
