import React, { useState } from 'react'

function Signup({ onSignup, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'individual',
    organizationName: '',
    phone: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    // Simulate signup - in real app, this would call an API
    const user = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      type: formData.userType,
      organizationName: formData.organizationName,
      phone: formData.phone
    }
    onSignup(user)
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
        <h2 style={{ color: '#667eea', marginBottom: '30px', textAlign: 'center' }}>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="userType"
                  value="individual"
                  checked={formData.userType === 'individual'}
                  onChange={handleChange}
                />
                Individual
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="userType"
                  value="organization"
                  checked={formData.userType === 'organization'}
                  onChange={handleChange}
                />
                Organization
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>{formData.userType === 'individual' ? 'Full Name' : 'Organization Name'}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={formData.userType === 'individual' ? 'Enter your full name' : 'Enter organization name'}
              required
            />
          </div>
          {formData.userType === 'organization' && (
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Enter contact person name"
              />
            </div>
          )}
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
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
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
              placeholder="Create a password"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign Up
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Already have an account?{' '}
          <span 
            style={{ color: '#667eea', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => onBack()}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default Signup
