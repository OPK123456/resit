import { useLocation, useNavigate } from 'react-router-dom'
import './dashboard.css'
import './adminlayout.css'

const menuItems = [
  { name: 'Dashboard', icon: '▦', path: '/admin/dashboard' },
  { name: 'Students', icon: '♙', path: '/admin/students' },
  { name: 'Courses', icon: '▤', path: '/admin/courses' },
  { name: 'Results', icon: '▥', path: '/admin/results' },
  { name: 'Resit Periods', icon: '◷', path: '/admin/resit-periods' },
  { name: 'Registrations', icon: '☷', path: '/admin/registrations' },
  { name: 'Payments', icon: '₵', path: '/admin/payments' },
  { name: 'Reports', icon: '▧', path: '/admin/reports' },
]

function AdminLayout({ children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const current = menuItems.find(
    (item) => pathname.startsWith(item.path)
  )

  // Get logged-in administrator details
  let admin = {}

  try {
    admin = JSON.parse(localStorage.getItem('admin_user')) || {}
  } catch (error) {
    console.error('Unable to read administrator details:', error)
  }

  const adminName = admin.name || 'Administrator'
  const adminEmail = admin.email || 'Admin Account'
  const adminInitials = adminName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  // Administrator logout
  const handleLogout = async () => {
    const token = localStorage.getItem('admin_token')

    try {
      if (token) {
        await fetch('http://localhost:8000/api/admin/logout', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')

      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">

        <div className="admin-brand">
          <div className="admin-brand-icon">ST</div>
          <div>
            <h2>STU <span>PORTAL</span></h2>
            <small>Administration System</small>
          </div>
        </div>

        {/* Administrator Profile */}
        <div className="admin-profile">
          <div className="admin-avatar">{adminInitials}</div>
          <div>
            <h4>{adminName}</h4>
            <small>System Manager</small>
          </div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="admin-navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`admin-nav-link ${
                current === item ? 'active' : ''
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <button
            className="admin-nav-link logout-link"
            onClick={handleLogout}
          >
            <span className="nav-icon">↪</span>
            Logout
          </button>

          <div className="sidebar-footer">
            <p>Sunyani Technical University</p>
            <small>Resit Registration System</small>
          </div>

        </div>
      </aside>

      <main className="admin-main">

        <header className="admin-topbar">
          <div>
            <h2>{current ? current.name : 'Admin'}</h2>
            <p>Welcome back! Here's what's happening today.</p>
          </div>

          <div className="admin-top-actions">

            <button
              className="notification-button"
              aria-label="Notifications"
            >
              ♧
              <span></span>
            </button>

            {/* Top Administrator Profile */}
            <div className="top-admin-profile">
              <div className="admin-avatar small-avatar">
                {adminInitials}
              </div>

              <div>
                <strong>{adminName}</strong>
                <small>{adminEmail}</small>
              </div>
            </div>

          </div>
        </header>

        {children}

      </main>
    </div>
  )
}

export default AdminLayout