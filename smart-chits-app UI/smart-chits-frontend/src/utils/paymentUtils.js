/**
 * Format currency to Indian locale (INR)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get color class for status badge
 */
export const getStatusColor = (status) => {
  const colors = {
    'Paid': 'text-green-400 bg-green-900/20 border-green-600/30',
    'Pending': 'text-orange-400 bg-orange-900/20 border-orange-600/30',
    'Overdue': 'text-red-400 bg-red-900/20 border-red-600/30',
    'Upcoming': 'text-blue-400 bg-blue-900/20 border-blue-600/30',
  }
  return colors[status] || colors['Pending']
}

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Calculate days remaining until due date
 */
export const calculateDaysRemaining = (dueDate) => {
  if (!dueDate) return 0
  const today = new Date()
  const due = new Date(dueDate)
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  return diff
}

/**
 * Calculate penalty based on overdue days
 * Default: ₹200 per day
 */
export const calculatePenalty = (dueDate, penaltyPerDay = 200) => {
  if (!dueDate) return 0
  const today = new Date()
  const due = new Date(dueDate)
  const daysOverdue = Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)))
  return daysOverdue * penaltyPerDay
}

/**
 * Determine payment status based on due date
 */
export const determinePaymentStatus = (dueDate, currentStatus) => {
  if (currentStatus === 'Paid') return 'Paid'
  if (!dueDate) return currentStatus
  
  const today = new Date()
  const due = new Date(dueDate)
  
  if (today > due) return 'Overdue'
  if (today < due && (due - today) / (1000 * 60 * 60 * 24) > 7) return 'Upcoming'
  return 'Pending'
}

/**
 * Group payments by chit_id
 */
export const groupPaymentsByChit = (payments) => {
  return payments.reduce((acc, payment) => {
    if (!acc[payment.chit_id]) {
      acc[payment.chit_id] = []
    }
    acc[payment.chit_id].push(payment)
    return acc
  }, {})
}

/**
 * Calculate payment statistics
 */
export const calculatePaymentStats = (payments) => {
  return {
    paid: payments.filter(p => p.status === 'Paid').length,
    pending: payments.filter(p => p.status === 'Pending').length,
    overdue: payments.filter(p => p.status === 'Overdue').length,
    upcoming: payments.filter(p => p.status === 'Upcoming').length,
    total: payments.length,
  }
}

/**
 * Get text for remaining days
 */
export const getRemainingDaysText = (daysRemaining) => {
  if (daysRemaining < 0) {
    return `${Math.abs(daysRemaining)} days overdue`
  }
  if (daysRemaining === 0) {
    return 'Due today'
  }
  return `${daysRemaining} days remaining`
}

/**
 * Validate payment data before processing
 */
export const validatePaymentData = (paymentData) => {
  const errors = []
  
  if (!paymentData.chit_id) errors.push('Chit ID is required')
  if (!paymentData.amount || paymentData.amount <= 0) errors.push('Valid amount is required')
  if (!paymentData.paymentMethod) errors.push('Payment method is required')
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format payment response for display
 */
export const formatPaymentResponse = (payment) => {
  return {
    ...payment,
    formattedAmount: formatCurrency(payment.amount),
    formattedPenalty: formatCurrency(payment.penalty_amount || 0),
    formattedTotal: formatCurrency((payment.amount || 0) + (payment.penalty_amount || 0)),
    formattedDate: formatDate(payment.due_date),
    statusColor: getStatusColor(payment.status),
    daysRemaining: calculateDaysRemaining(payment.due_date),
  }
}
