import { useState } from 'react'
import { Link } from 'react-router-dom'

function StudentLogin() {
  const [showPassword, setShowPassword] = useState(false)

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
          <p className="login-label">Student portal</p>
          <h1>Welcome back</h1>
          <p>
            Sign in to manage your resit registration, payments and receipts.
          </p>

          <div className="login-benefits">
            <div>✓ View your eligible resit courses</div>
            <div>✓ Register for examinations online</div>
            <div>✓ Track payments and download receipts</div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-heading">
            <div className="login-user-icon">S</div>
            <h2>Student sign in</h2>
            <p>Enter your student details to continue.</p>
          </div>

          <form onSubmit={(event) => event.preventDefault()}>
            <div className="login-form-group">
              <label htmlFor="indexNumber">Student index number</label>
              <input
                type="text"
                id="indexNumber"
                name="indexNumber"
                placeholder="Enter your index number"
                autoComplete="username"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            <div className="login-options">
              <label className="remember-option">
                <input type="checkbox" name="remember" />
                Remember me
              </label>
              <a href="mailto:support@example.com">Forgot password?</a>
            </div>

            <button type="submit" className="login-submit">Sign in</button>
          </form>

          <div className="login-card-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/student/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="login-footer">
        © {new Date().getFullYear()} School Resit Registration System. All rights reserved.
      </div>
    </div>
  )
}

export default StudentLogin