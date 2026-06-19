import React from 'react'

function ChitDetails({ chit, user, onBack, onViewPayments }) {
  if (!chit || !user) return null

  const calculateProgress = () => {
    const startDate = new Date(chit.startDate)
    const currentDate = new Date()
    const monthsPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 30))
    const progress = Math.min((monthsPassed / chit.duration) * 100, 100)
    return progress.toFixed(0)
  }

  const calculateAmountPaid = () => {
    const startDate = new Date(chit.startDate)
    const currentDate = new Date()
    const monthsPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 30))
    const amountPaid = Math.min(monthsPassed * chit.installment, chit.amount)
    return amountPaid
  }

  const calculateRemainingAmount = () => {
    return chit.amount - calculateAmountPaid()
  }

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
          ← Back to Dashboard
        </button>
        
        <h2 style={{ color: '#667eea', marginBottom: '10px' }}>Chit Details</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          User: {user.name} ({user.type})
        </p>

        <div className="chit-details">
          <div className="detail-item">
            <label>Chit ID</label>
            <span>#{chit.id}</span>
          </div>
          <div className="detail-item">
            <label>Chit Name</label>
            <span>{chit.name}</span>
          </div>
          <div className="detail-item">
            <label>Total Amount</label>
            <span>₹{chit.amount.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <label>Duration</label>
            <span>{chit.duration} Months</span>
          </div>
          <div className="detail-item">
            <label>Monthly Installment</label>
            <span>₹{chit.installment.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <label>Start Date</label>
            <span>{chit.startDate}</span>
          </div>
          <div className="detail-item">
            <label>Status</label>
            <span className={`status-badge ${chit.status === 'active' ? 'status-active' : 'status-pending'}`}>
              {chit.status.toUpperCase()}
            </span>
          </div>
          <div className="detail-item">
            <label>Progress</label>
            <span>{calculateProgress()}%</span>
          </div>
          <div className="detail-item">
            <label>Amount Paid</label>
            <span>₹{calculateAmountPaid().toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <label>Remaining Amount</label>
            <span>₹{calculateRemainingAmount().toLocaleString()}</span>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <button 
            className="btn btn-primary"
            onClick={onViewPayments}
            style={{ width: '200px' }}
          >
            View Payment History
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChitDetails
