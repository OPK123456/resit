import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

function AdminProtectedRoute() {
  const [status, setStatus] = useState('checking')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('admin_token')

      if (!token) {
        setStatus('unauthorized')
        return
      }

      try {
        const response = await fetch(
          'http://localhost:8000/api/admin/me',
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')

          setStatus('unauthorized')
          return
        }

        const data = await response.json()

        localStorage.setItem(
          'admin_user',
          JSON.stringify(data.admin)
        )

        setStatus('authorized')

      } catch (error) {
        console.error('Admin verification error:', error)
        setStatus('error')
      }
    }

    verifyAdmin()
  }, [retry])

  // Show loading while Laravel verifies the token
  if (status === 'checking') {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>Verifying administrator access...</h3>
        <p>Please wait.</p>
      </div>
    )
  }

  // Redirect unauthenticated users
  if (status === 'unauthorized') {
    return <Navigate to="/admin/login" replace />
  }

  // Show an error if the backend cannot be reached
  if (status === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>Unable to verify your session.</h3>
        <p>Please check your connection and try again.</p>

        <button onClick={() => setRetry((prev) => prev + 1)}>
          Try Again
        </button>
      </div>
    )
  }

  // Allow verified administrators
  return <Outlet />
}

export default AdminProtectedRoute