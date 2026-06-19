import React from 'react'

function PaymentHistory({ chit, user, onBack }) {
  if (!chit || !user) return null

  // Generate mock payment history
  const generatePaymentHistory = () => {
    const payments = []
    const startDate = new Date(chit.startDate)
    const currentDate = new Date()
    
    for (let i = 0; i < chit.duration; i++) {
      const paymentDate = new Date(startDate)
      paymentDate.setMonth(paymentDate.getMonth() + i)
      
      const isPaid = paymentDate <= currentDate
      const isLate = isPaid && paymentDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      
      payments.push({
        id: i + 1,
        installmentNumber: i + 1,
        dueDate: paymentDate.toISOString().split('T')[0],
        amount: chit.installment,
        status: isPaid ? (isLate ? 'late' : 'paid') : 'pending',
        paidDate: isPaid ? paymentDate.toISOString().split('T')[0] : '-'
      })
    }
    
    return payments
  }

  const payments = generatePaymentHistory()

  const totalPaid = payments
    .filter(p => p.status === 'paid' || p.status === 'late')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="container">
      <nav className="navbar">
        <h1>Smart Chits Management</h1>
        <div className="nav-buttons">
          <button className="btn btn-outline" onClick={onBack}>
            Back
          </button>
        </div>
      </nav>

      <div className="card">
        <button className="btn btn-outline back-btn" onClick={onBack}>
          ← Back to Chit Details
        </button>
        
        <h2 style={{ color: '#667eea', marginBottom: '10px' }}>Payment History</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Chit: {chit.name} | User: {user.name}
        </p>

        <div className="chit-details" style={{ marginBottom: '30px' }}>
          <div className="detail-item">
            <label>Total Amount</label>
            <span>₹{chit.amount.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <label>Total Paid</label>
            <span style={{ color: '#28a745' }}>₹{totalPaid.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <label>Pending</label>
            <span style={{ color: '#ffc107' }}>₹{totalPending.toLocaleString()}</span>
          </div>
        </div>

        <h3 style={{ marginBottom: '15px', color: '#333' }}>Installment Details</h3>
        
        <div className="payment-history">
          {payments.map(payment => (
            <div 
              key={payment.id} 
              className={`payment-item ${payment.status}`}
            >
              <div>
                <strong>Installment #{payment.installmentNumber}</strong>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Due Date: {payment.dueDate}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong>₹{payment.amount.toLocaleString()}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span 
                  className={`status-badge ${
                    payment.status === 'paid' ? 'status-active' : 
                    payment.status === 'late' ? 'status-pending' : 'status-pending'
                  }`}
                >
                  {payment.status.toUpperCase()}
                </span>
                {payment.paidDate !== '-' && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Paid: {payment.paidDate}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PaymentHistory
