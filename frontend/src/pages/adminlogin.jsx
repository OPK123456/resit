import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8000/api/admin/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Invalid email or password.'
        )
      }

      // Save administrator authentication details
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.admin))

      // Redirect to administrator dashboard
      navigate('/admin/dashboard')

    } catch (err) {
      setError(
        err.message || 'Unable to connect to the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-header">
        <Link to="/" className="login-brand">
          <div className="login-brand-icon">SR</div>
          <div>
            <h2>Resit<span>Portal</span></h2>
            <small>Examination management system</small>
          </div>
        </Link>

        <Link to="/" className="back-home">← Back to home</Link>
      </div>

      <div className="login-container">
        <div className="login-welcome">
          <p className="login-label">Administrator portal</p>
          <h1>Administrator sign in</h1>
          <p>
            Manage student records, import results, set resit periods and
            verify payments.
          </p>

          <div className="login-benefits">
            <div>✓ Manage student records</div>
            <div>✓ Configure resit periods</div>
            <div>✓ Verify payments and monitor registrations</div>
          </div>
        </div>

        <div className="login-card admin-card">
          <div className="login-card-heading">
            <div className="login-user-icon">A</div>
            <h2>Administrator sign in</h2>
            <p>Enter your staff credentials to continue.</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <div className="login-form-group">
              <label htmlFor="email">Email address</label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="adminPassword">Password</label>

              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="adminPassword"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      <div className="login-footer">
        © {new Date().getFullYear()} School Resit Registration System.
        All rights reserved.
      </div>
    </div>
  )
}

export default AdminLogin