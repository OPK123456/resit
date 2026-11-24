import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './adminlayout.jsx'

function AdminDashboard() {
  const navigate = useNavigate()

  const currentYear = new Date().getFullYear()

  const [statistics, setStatistics] = useState({
    total_students: 0,
    total_courses: 0,
    total_registrations: 0,
    total_payments: 0,
  })

  const [recentRegistrations, setRecentRegistrations] = useState([])

  const [monthlyRegistrations, setMonthlyRegistrations] = useState([])

  const [selectedYear, setSelectedYear] = useState(currentYear)

  const [loading, setLoading] = useState(true)
  const [recentLoading, setRecentLoading] = useState(true)
  const [monthlyLoading, setMonthlyLoading] = useState(true)

  const [error, setError] = useState('')
  const [recentError, setRecentError] = useState('')
  const [monthlyError, setMonthlyError] = useState('')

  const [retry, setRetry] = useState(0)

  // Get administrator details.
  let admin = {}

  try {
    admin = JSON.parse(localStorage.getItem('admin_user')) || {}
  } catch (error) {
    console.error('Unable to read administrator details:', error)
  }

  const adminName = admin.name || 'Administrator'

  // Format payment amount in Ghana Cedis.
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0)
  }

  // Format registration date.
  const formatDate = (date) => {
    if (!date) return 'N/A'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A'
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate)
  }

  // Format registration status.
  const formatStatus = (status) => {
    if (!status) return 'Unknown'

    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Handle expired or invalid administrator authentication.
  const handleUnauthorized = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')

    navigate('/admin/login', { replace: true })
  }

  // Fetch dashboard statistics and recent registrations.
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setRecentLoading(true)

      setError('')
      setRecentError('')

      const token = localStorage.getItem('admin_token')

      if (!token) {
        setError('Administrator authentication is required.')
        setRecentError('Administrator authentication is required.')

        setLoading(false)
        setRecentLoading(false)

        return
      }

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      }

      // Fetch dashboard statistics.
      try {
        const response = await fetch(
          'http://localhost:8000/api/admin/dashboard',
          {
            method: 'GET',
            headers,
          }
        )

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            handleUnauthorized()
            return
          }

          throw new Error(
            data.message || 'Unable to load dashboard statistics.'
          )
        }

        setStatistics({
          total_students: Number(data.statistics?.total_students) || 0,
          total_courses: Number(data.statistics?.total_courses) || 0,
          total_registrations:
            Number(data.statistics?.total_registrations) || 0,
          total_payments: Number(data.statistics?.total_payments) || 0,
        })

      } catch (error) {
        console.error('Dashboard error:', error)

        setError(error.message || 'Could not connect to the server.')

      } finally {
        setLoading(false)
      }

      // Fetch the five most recent registrations.
      try {
        const response = await fetch(
          'http://localhost:8000/api/admin/dashboard/recent-registrations',
          {
            method: 'GET',
            headers,
          }
        )

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            handleUnauthorized()
            return
          }

          throw new Error(
            data.message || 'Unable to load recent registrations.'
          )
        }

        setRecentRegistrations(data.registrations || [])

      } catch (error) {
        console.error('Recent registrations error:', error)

        setRecentError(
          error.message || 'Could not load recent registrations.'
        )

      } finally {
        setRecentLoading(false)
      }
    }

    fetchDashboard()

  }, [navigate, retry])

  // Fetch monthly registration statistics when the selected year changes.
  useEffect(() => {
    const fetchMonthlyRegistrations = async () => {
      setMonthlyLoading(true)
      setMonthlyError('')

      const token = localStorage.getItem('admin_token')

      if (!token) {
        setMonthlyError('Administrator authentication is required.')
        setMonthlyLoading(false)
        return
      }

      try {
        const response = await fetch(
          `http://localhost:8000/api/admin/dashboard/monthly-registrations?year=${selectedYear}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            handleUnauthorized()
            return
          }

          throw new Error(
            data.message || 'Unable to load monthly registrations.'
          )
        }

        setMonthlyRegistrations(data.registrations || [])

      } catch (error) {
        console.error('Monthly registrations error:', error)

        setMonthlyError(
          error.message || 'Could not load monthly registration data.'
        )

      } finally {
        setMonthlyLoading(false)
      }
    }

    fetchMonthlyRegistrations()

  }, [selectedYear, navigate, retry])

  // Find the highest monthly registration value.
  const highestMonthlyTotal = Math.max(
    1,
    ...monthlyRegistrations.map((item) => Number(item.total) || 0)
  )

  // Dashboard statistic cards.
  const stats = [
    {
      title: 'Total Students',
      value: statistics.total_students.toLocaleString(),
      icon: '♙',
      color: 'blue',
    },
    {
      title: 'Total Courses',
      value: statistics.total_courses.toLocaleString(),
      icon: '▤',
      color: 'purple',
    },
    {
      title: 'Resit Registrations',
      value: statistics.total_registrations.toLocaleString(),
      icon: '☷',
      color: 'orange',
    },
    {
      title: 'Total Payments',
      value: formatCurrency(statistics.total_payments),
      icon: '₵',
      color: 'green',
    },
  ]

  // Available years for the chart.
  const availableYears = Array.from(
    { length: 6 },
    (_, index) => currentYear - index
  )

  return (
    <AdminLayout>
      <div className="admin-content">

        <div className="dashboard-heading">
          <div>
            <h1>Welcome back, {adminName}!</h1>

            <p>
              Monitor your school's resit registration activities.
              Here's your dashboard overview.
            </p>
          </div>

          <button
            className="admin-primary-button"
            onClick={() => navigate('/admin/students/add')}
          >
            + Add New Student
          </button>
        </div>

        {/* Dashboard loading and error messages */}
        {loading && (
          <div className="admin-panel">
            Loading dashboard statistics...
          </div>
        )}

        {error && (
          <div className="admin-panel">
            <p>{error}</p>

            <button
              className="admin-primary-button"
              onClick={() => setRetry((previous) => previous + 1)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Statistics cards */}
        <section className="admin-stats-grid">

          {stats.map((stat) => (
            <div className="admin-stat-card" key={stat.title}>

              <div className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </div>

              <div className="stat-details">
                <p>{stat.title}</p>

                <h2>
                  {loading ? 'Loading...' : stat.value}
                </h2>

                <small>
                  Live database statistics
                </small>
              </div>

            </div>
          ))}

        </section>

        <section className="admin-middle-grid">

          {/* Registration chart */}
          <div className="admin-panel">

            <div className="panel-heading">
              <div>
                <h3>Registration Overview</h3>

                <p>
                  Monthly resit registrations for {selectedYear}.
                </p>
              </div>

              <select
                value={selectedYear}
                onChange={(event) =>
                  setSelectedYear(Number(event.target.value))
                }
              >
                {availableYears.map((year) => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="chart-container">

              {monthlyLoading ? (

                <p>Loading monthly registration data...</p>

              ) : monthlyError ? (

                <div>
                  <p>{monthlyError}</p>

                  <button
                    className="admin-primary-button"
                    onClick={() => setRetry((previous) => previous + 1)}
                  >
                    Try Again
                  </button>
                </div>

              ) : (

                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <strong>Monthly Registrations</strong>

                    <span>
                      Total:{' '}
                      {monthlyRegistrations
                        .reduce(
                          (total, item) =>
                            total + (Number(item.total) || 0),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: '10px',
                      minHeight: '210px',
                      padding: '10px 5px',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    {monthlyRegistrations.map((item) => {
                      const total = Number(item.total) || 0

                      const height =
                        total === 0
                          ? 3
                          : Math.max(
                              8,
                              (total / highestMonthlyTotal) * 160
                            )

                      return (
                        <div
                          key={item.month}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            height: '200px',
                            minWidth: 0,
                          }}
                          title={`${item.month}: ${total} registrations`}
                        >
                          <small
                            style={{
                              marginBottom: '5px',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}
                          >
                            {total}
                          </small>

                          <div
                            style={{
                              width: '65%',
                              maxWidth: '35px',
                              height: `${height}px`,
                              background: '#4f46e5',
                              borderRadius: '5px 5px 0 0',
                              transition: 'height 0.3s ease',
                            }}
                          />

                          <small
                            style={{
                              marginTop: '8px',
                              fontSize: '11px',
                            }}
                          >
                            {item.month}
                          </small>
                        </div>
                      )
                    })}
                  </div>

                  {monthlyRegistrations.length === 0 && (
                    <p>No monthly registration data available.</p>
                  )}
                </>

              )}

            </div>

          </div>

          {/* Payment summary */}
          <div className="admin-panel payment-summary">

            <div className="panel-heading">
              <div>
                <h3>Payment Summary</h3>

                <p>
                  Successful payments recorded in the database.
                </p>
              </div>
            </div>

            <div className="payment-total">
              <small>Total Collected</small>

              <h2>
                {loading
                  ? 'Loading...'
                  : formatCurrency(statistics.total_payments)}
              </h2>

              <span>Verified successful payments</span>
            </div>

            <div className="payment-progress">
              <div>
                <span>Total Registrations</span>

                <strong>
                  {loading
                    ? '...'
                    : statistics.total_registrations.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="payment-progress">
              <div>
                <span>Total Students</span>

                <strong>
                  {loading
                    ? '...'
                    : statistics.total_students.toLocaleString()}
                </strong>
              </div>
            </div>

          </div>

        </section>

        {/* Recent registrations */}
        <section className="admin-panel recent-students">

          <div className="panel-heading">
            <div>
              <h3>Recent Resit Registrations</h3>

              <p>
                Latest students who registered for resit examinations.
              </p>
            </div>

            <button
              className="view-all-button"
              onClick={() => navigate('/admin/registrations')}
            >
              View All →
            </button>
          </div>

          <div className="table-responsive">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>STUDENT ID</th>
                  <th>STUDENT NAME</th>
                  <th>COURSE</th>
                  <th>REGISTRATION DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>

                {recentLoading ? (

                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      Loading recent registrations...
                    </td>
                  </tr>

                ) : recentError ? (

                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      {recentError}
                    </td>
                  </tr>

                ) : recentRegistrations.length === 0 ? (

                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No resit registrations found.
                    </td>
                  </tr>

                ) : (

                  recentRegistrations.map((registration) => {

                    const student = registration.student || {}
                    const course = registration.course || {}

                    const studentName = [
                      student.first_name,
                      student.last_name,
                    ]
                      .filter(Boolean)
                      .join(' ') || 'N/A'

                    return (
                      <tr key={registration.id}>

                        <td>
                          {student.index_number || 'N/A'}
                        </td>

                        <td>
                          {studentName}
                        </td>

                        <td>
                          {course.code || course.title || 'N/A'}
                        </td>

                        <td>
                          {formatDate(registration.created_at)}
                        </td>

                        <td>
                          <span
                            className={`status-badge status-${registration.status || 'unknown'}`}
                          >
                            {formatStatus(registration.status)}
                          </span>
                        </td>

                      </tr>
                    )
                  })

                )}

              </tbody>

            </table>

          </div>

        </section>

        <footer className="admin-footer">
          © {new Date().getFullYear()} Sunyani Technical University.
          All rights reserved.
        </footer>

      </div>
    </AdminLayout>
  )
}

export default AdminDashboard