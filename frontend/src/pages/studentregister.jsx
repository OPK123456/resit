import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function StudentRegister() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    index_number: '',
    activation_code: '',
    password: '',
    password_confirmation: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8000/api/student/activate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const messages = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : data.message || 'Registration failed.'

        throw new Error(messages)
      }

      localStorage.setItem('student_token', data.token)
      localStorage.setItem('student', JSON.stringify(data.student))

      setSuccess('Your account has been activated successfully!')

      setTimeout(() => {
        navigate('/student/login')
      }, 2000)

    } catch (err) {
      setError(
        err.message || 'Unable to connect to the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <div style={styles.logoIcon}>SR</div>

          <div>
            <h2 style={styles.logoTitle}>
              RESIT<span style={{ color: '#c49a45' }}>PORTAL</span>
            </h2>
            <small>EXAMINATION MANAGEMENT SYSTEM</small>
          </div>
        </div>

        <div style={styles.heading}>
          <h1>Create Your Account</h1>
          <p>Activate your student portal account to get started.</p>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label style={styles.label}>Student Index Number</label>

          <input
            style={styles.input}
            type="text"
            name="index_number"
            placeholder="Enter your index number"
            value={formData.index_number}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Activation Code</label>

          <input
            style={styles.input}
            type="text"
            name="activation_code"
            placeholder="Enter your activation code"
            value={formData.activation_code}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Create Password</label>

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            minLength="8"
            autoComplete="new-password"
            required
          />

          <label style={styles.label}>Confirm Password</label>

          <input
            style={styles.input}
            type="password"
            name="password_confirmation"
            placeholder="Confirm your password"
            value={formData.password_confirmation}
            onChange={handleChange}
            minLength="8"
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Activating Account...' : 'Activate My Account'}
          </button>

        </form>

        <p style={styles.loginText}>
          Already have an account?{' '}
          <Link to="/student/login" style={styles.link}>
            Login here
          </Link>
        </p>

        <p style={styles.footer}>
          © 2026 Resit Portal. All rights reserved.
        </p>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f6fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px 15px',
    fontFamily: 'Arial, sans-serif',
  },

  card: {
    background: '#ffffff',
    width: '100%',
    maxWidth: '460px',
    padding: '35px',
    borderRadius: '14px',
    boxShadow: '0 8px 35px rgba(0,0,0,0.08)',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '35px',
  },

  logoIcon: {
    background: '#101d3a',
    color: '#d9ad52',
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '19px',
  },

  logoTitle: {
    margin: 0,
    color: '#101d3a',
    fontSize: '21px',
  },

  heading: {
    marginBottom: '25px',
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    marginTop: '18px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#26334b',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px',
    border: '1px solid #dce1e9',
    borderRadius: '7px',
    fontSize: '14px',
  },

  button: {
    width: '100%',
    padding: '14px',
    marginTop: '25px',
    background: '#101d3a',
    color: '#d9ad52',
    border: 'none',
    borderRadius: '7px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '7px',
    fontSize: '14px',
    marginBottom: '15px',
  },

  success: {
    background: '#dcfce7',
    color: '#166534',
    padding: '12px',
    borderRadius: '7px',
    fontSize: '14px',
    marginBottom: '15px',
  },

  loginText: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px',
  },

  link: {
    color: '#b58a35',
    fontWeight: 'bold',
    textDecoration: 'none',
  },

  footer: {
    textAlign: 'center',
    color: '#8992a2',
    fontSize: '12px',
    marginTop: '30px',
  },
}

export default StudentRegister