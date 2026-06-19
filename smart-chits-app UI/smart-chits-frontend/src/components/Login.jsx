import React, { useState } from 'react'

function Login({ onLogin, onBack }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate login - in real app, this would call an API
    const user = {
      id: 1,
      name: 'John Doe',
      email: formData.email,
      type: 'individual'
    }
    onLogin(user)
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
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ color: '#667eea', marginBottom: '30px', textAlign: 'center' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Login
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Don't have an account?{' '}
          <span 
            style={{ color: '#667eea', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => onBack()}
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
