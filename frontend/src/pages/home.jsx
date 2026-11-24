import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Course registration',
    text: 'View your eligible failed courses and pick the resit examinations you want to register for.',
  },
  {
    title: 'Secure payments',
    text: 'Pay your resit fees and track the status of each payment.',
  },
  {
    title: 'Digital receipts',
    text: 'Download a receipt as soon as your payment is confirmed.',
  },
  {
    title: 'Registration history',
    text: 'Look back at previous registrations and payments.',
  },
]

function Home() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="brand">
            <div className="brand-icon">SR</div>
            <div>
              <h2>Resit<span>Portal</span></h2>
              <small>Examination management system</small>
            </div>
          </Link>

          <nav className="nav-links" aria-label="Main">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#portals">Portals</a>
          </nav>

          <a href="#portals" className="nav-button">Get started</a>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-container">
            <div className="hero-content">
              <p className="welcome-label">Welcome to the resit portal</p>

              <h1>Register for your resit exams in minutes.</h1>

              <p className="hero-lead">
                Register for resit examinations, pay online and keep your
                registration records in one secure place.
              </p>

              <div className="hero-buttons">
                <a href="#portals" className="primary-button">Open the portal</a>
                <a href="#about" className="secondary-button">Learn more</a>
              </div>

              <p className="hero-note">
                <span aria-hidden="true">✓</span> Secure registration, easy payments, reliable records.
              </p>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="visual-card">
                <div className="visual-header">
                  <div>
                    <small>Student dashboard</small>
                    <h3>Academic overview</h3>
                  </div>
                  <div className="dashboard-icon">▦</div>
                </div>

                <div className="visual-welcome">
                  <div className="student-avatar">S</div>
                  <div>
                    <h4>Welcome, student</h4>
                    <p>Manage your resit registration</p>
                  </div>
                </div>

                <div className="dashboard-stats">
                  <div className="stat-card">
                    <span>Eligible courses</span>
                    <strong>03</strong>
                  </div>
                  <div className="stat-card">
                    <span>Registrations</span>
                    <strong>02</strong>
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-dot" />
                  <div>
                    <strong>Registration open</strong>
                    <p>Check available resit examinations</p>
                  </div>
                </div>
              </div>

              <div className="floating-card">
                <div className="floating-icon">✓</div>
                <div>
                  <strong>Easy registration</strong>
                  <p>Register from anywhere</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-container">
            <div className="section-heading">
              <h2>Everything you need in one place</h2>
              <p>
                The School Resit Registration System brings course selection,
                payment and receipts together, so you don't have to queue at
                the exams office.
              </p>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-container">
            <div className="section-heading">
              <h2>What you can do</h2>
            </div>

            <div className="features-grid">
              {features.map((f) => (
                <div className="feature-card" key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="portal-section" id="portals">
          <div className="section-container">
            <div className="section-heading">
              <h2>Choose your portal</h2>
              <p>Sign in with the account that matches your role.</p>
            </div>

            <div className="portal-grid">
              <div className="portal-card">
                <div className="portal-icon">S</div>
                <h3>Student portal</h3>
                <p>
                  View eligible resit courses, register for examinations, make
                  payments and download receipts.
                </p>
                <Link to="/student/login" className="portal-button">Student login</Link>
              </div>

              <div className="portal-card admin-portal">
                <div className="portal-icon">A</div>
                <h3>Administrator portal</h3>
                <p>
                  Manage student records, import results, set resit periods,
                  verify payments and monitor registrations.
                </p>
                <Link to="/admin/login" className="portal-button">Administrator login</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>Resit<span>Portal</span></h3>
            <p>Making examination registration easier.</p>
          </div>
          <p className="copyright">
            © {new Date().getFullYear()} School Resit Registration System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home