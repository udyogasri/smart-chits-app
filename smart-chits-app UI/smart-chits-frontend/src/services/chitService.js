import { fetcher } from './api'

// Get all chits
export async function getAllChits() {
  const response = await fetcher('/chits/')
  return response
}

// Create a new chit (admin only)
export async function createChit(chitData) {
  const response = await fetcher('/chits/create', {
    method: 'POST',
    body: JSON.stringify(chitData),
  })
  return response
}

// Add member to chit (admin only)
export async function addMemberToChit(userId, chitId) {
  const response = await fetcher('/chits/add-member', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, chit_id: chitId }),
  })
  return response
}

// Get chit details
export async function getChitDetails(chitId) {
  const response = await fetcher(`/chits/${chitId}`)
  return response
}

// Join a chit (normal user)
export async function joinChit(chitId) {
  const response = await fetcher(`/chits/${chitId}/join`, {
    method: 'POST',
  })
  return response
}

// Check if user is already a member of a chit
export async function checkMembership(chitId) {
  const response = await fetcher(`/chits/${chitId}/is-member`)
  return response
}

// Get user's joined chits
export async function getMyChits() {
  const response = await fetcher('/admin/my-chits')
  return response
}
