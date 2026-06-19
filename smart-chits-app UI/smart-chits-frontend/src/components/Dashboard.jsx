import React, { useState } from 'react'

function Dashboard({ currentUser, onViewChit, onViewPayments, onLogout }) {
  // Mock data for users and their chits
  const [users] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      type: 'individual',
      chits: [
        {
          id: 101,
          name: 'Monthly Savings Chit',
          amount: 10000,
          duration: 12,
          installment: 833,
          startDate: '2024-01-01',
          status: 'active'
        },
        {
          id: 102,
          name: 'Premium Investment Chit',
          amount: 25000,
          duration: 24,
          installment: 1042,
          startDate: '2024-02-01',
          status: 'active'
        }
      ]
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      type: 'individual',
      chits: [
        {
          id: 201,
          name: 'Quick Savings Chit',
          amount: 5000,
          duration: 6,
          installment: 833,
          startDate: '2024-03-01',
          status: 'pending'
        }
      ]
    },
    {
      id: 3,
      name: 'ABC Corporation',
      email: 'abc@corp.com',
      type: 'organization',
      chits: [
        {
          id: 301,
          name: 'Business Growth Chit',
          amount: 100000,
          duration: 36,
          installment: 2778,
          startDate: '2024-01-15',
          status: 'active'
        },
        {
          id: 302,
          name: 'Employee Welfare Chit',
          amount: 50000,
          duration: 12,
          installment: 4167,
          startDate: '2024-02-15',
          status: 'active'
        }
      ]
    }
  ])

  const [selectedUser, setSelectedUser] = useState(null)

  const handleUserClick = (user) => {
    setSelectedUser(user)
  }

  const handleViewChitDetails = (chit) => {
    onViewChit(chit, selectedUser)
  }

  const handleViewPaymentHistory = (chit) => {
    onViewPayments(chit, selectedUser)
  }

  return (
    <div className="container">
      <nav className="navbar">
        <h1>Smart Chits Management</h1>
        <div className="nav-buttons">
          <span style={{ marginRight: '20px', color: '#666' }}>
            Welcome, {currentUser?.name}
          </span>
          <button className="btn btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="card">
        <h2 style={{ color: '#667eea', marginBottom: '20px' }}>User Management</h2>
        
        {!selectedUser ? (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Select a User to View Their Chits</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Chits Count</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.type === 'individual' ? 'status-active' : 'status-pending'}`}>
                        {user.type}
                      </span>
                    </td>
                    <td>{user.chits.length}</td>
                    <td>
                      <button 
                        className="btn btn-primary action-btn"
                        onClick={() => handleUserClick(user)}
                      >
                        View Chits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <button 
              className="btn btn-outline back-btn"
              onClick={() => setSelectedUser(null)}
            >
              ← Back to Users
            </button>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>
              Chits for {selectedUser.name} ({selectedUser.type})
            </h3>
            {selectedUser.chits.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Chit ID</th>
                    <th>Name</th>
                    <th>Total Amount</th>
                    <th>Duration (Months)</th>
                    <th>Monthly Installment</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.chits.map(chit => (
                    <tr key={chit.id}>
                      <td>{chit.id}</td>
                      <td>{chit.name}</td>
                      <td>₹{chit.amount.toLocaleString()}</td>
                      <td>{chit.duration}</td>
                      <td>₹{chit.installment.toLocaleString()}</td>
                      <td>{chit.startDate}</td>
                      <td>
                        <span className={`status-badge ${chit.status === 'active' ? 'status-active' : 'status-pending'}`}>
                          {chit.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-primary action-btn"
                            onClick={() => handleViewChitDetails(chit)}
                          >
                            Details
                          </button>
                          <button 
                            className="btn btn-secondary action-btn"
                            onClick={() => handleViewPaymentHistory(chit)}
                          >
                            Payments
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#666', padding: '20px' }}>No chits found for this user.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
