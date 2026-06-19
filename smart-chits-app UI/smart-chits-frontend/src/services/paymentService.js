import { fetcher } from './api'

// Get all payments
export async function getAllPayments() {
  const response = await fetcher('/payments/')
  return response
}

// Create a payment
export async function createPayment(paymentData) {
  const response = await fetcher('/payments/create', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  })
  return response
}

// Get payment by ID
export async function getPaymentById(paymentId) {
  const response = await fetcher(`/payments/${paymentId}`)
  return response
}

// Get payment history for a user
export async function getUserPaymentHistory(userId) {
  const response = await fetcher(`/payments/user/${userId}`)
  return response
}
