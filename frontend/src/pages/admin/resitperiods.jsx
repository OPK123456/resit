import { useState } from 'react'
import AdminLayout from './adminlayout.jsx'
import './resitperiods.css'

const todayString = () => new Date().toISOString().slice(0, 10)

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const money = (value) => `GH₵ ${Number(value).toFixed(2)}`

// Closed once the end date has passed. Otherwise it follows the on/off switch and the dates.
const getStatus = (period) => {
  const today = todayString()
  if (period.endDate < today) return 'Closed'
  if (!period.isActive) return 'Inactive'
  if (period.startDate > today) return 'Upcoming'
  return 'Open'
}

const statusClass = {
  Open: 'status-success',
  Upcoming: 'period-upcoming',
  Inactive: 'status-pending',
  Closed: 'period-closed',
}

const initialPeriods = [
  {
    id: 1,
    name: 'First Semester Resit',
    academicYear: '2025/2026',
    semester: '1',
    startDate: '2026-11-10',
    endDate: '2026-12-05',
    feePerCourse: 150,
    isActive: true,
  },
  {
    id: 2,
    name: 'Second Semester Resit',
    academicYear: '2025/2026',
    semester: '2',
    startDate: '2027-01-15',
    endDate: '2027-02-10',
    feePerCourse: 150,
    isActive: false,
  },
  {
    id: 3,
    name: 'Second Semester Resit',
    academicYear: '2024/2025',
    semester: '2',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    feePerCourse: 120,
    isActive: false,
  },
]

const emptyForm = {
  name: '',
  academicYear: '',
  semester: '1',
  startDate: '',
  endDate: '',
  feePerCourse: '',
}

function ResitPeriods() {
  const [periods, setPeriods] = useState(initialPeriods)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const withStatus = periods.map((p) => ({ ...p, status: getStatus(p) }))
  const openCount = withStatus.filter((p) => p.status === 'Open').length
  const upcomingCount = withStatus.filter((p) => p.status === 'Upcoming').length

  const openForm = () => {
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const handleChange = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value })

  const handleSubmit = (event) => {
    event.preventDefault()

    if (form.endDate < form.startDate) {
      setError('The end date must be on or after the start date.')
      return
    }

    setPeriods([
      {
        id: Date.now(),
        name: form.name.trim(),
        academicYear: form.academicYear.trim(),
        semester: form.semester,
        startDate: form.startDate,
        endDate: form.endDate,
        feePerCourse: Number(form.feePerCourse),
        isActive: false,
      },
      ...periods,
    ])
    setShowForm(false)
  }

  // Only one period can be switched on at a time, so students always see one clear period.
  const toggleActive = (period) => {
    setPeriods(
      periods.map((p) => {
        if (p.id === period.id) return { ...p, isActive: !p.isActive }
        return period.isActive ? p : { ...p, isActive: false }
      })
    )
  }

  const handleDelete = (period) => {
    if (window.confirm(`Delete "${period.name}" (${period.academicYear})?`)) {
      setPeriods(periods.filter((p) => p.id !== period.id))
    }
  }

  return (
    <AdminLayout>
      <div className="admin-content periods-page">
        <div className="periods-header">
          <div>
            <h1>Resit Periods</h1>
            <p>Set when students can register for resit examinations.</p>
          </div>

          <button className="admin-primary-button" onClick={openForm}>
            + New Period
          </button>
        </div>

        <div className="periods-stats">
          <div className="period-stat-card">
            <span>Total Periods</span>
            <h2>{periods.length}</h2>
          </div>
          <div className="period-stat-card">
            <span>Open Now</span>
            <h2>{openCount}</h2>
          </div>
          <div className="period-stat-card">
            <span>Upcoming</span>
            <h2>{upcomingCount}</h2>
          </div>
        </div>

        <div className="admin-panel">
          <div className="table-responsive periods-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PERIOD</th>
                  <th>ACADEMIC YEAR</th>
                  <th>SEM</th>
                  <th>START</th>
                  <th>END</th>
                  <th>FEE PER COURSE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {withStatus.length > 0 ? (
                  withStatus.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.academicYear}</td>
                      <td>{p.semester}</td>
                      <td>{formatDate(p.startDate)}</td>
                      <td>{formatDate(p.endDate)}</td>
                      <td>{money(p.feePerCourse)}</td>
                      <td>
                        <span className={`status-badge ${statusClass[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="period-actions">
                        <button
                          className="period-toggle-btn"
                          disabled={p.status === 'Closed'}
                          onClick={() => toggleActive(p)}
                        >
                          {p.isActive ? 'Switch off' : 'Switch on'}
                        </button>
                        <button
                          className="period-delete-btn"
                          onClick={() => handleDelete(p)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="periods-empty">
                      No resit periods yet. Click "New Period" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="period-modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="period-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="period-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="period-modal-title">New Resit Period</h2>

            <form onSubmit={handleSubmit}>
              <label>
                Period name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. First Semester Resit"
                  required
                />
              </label>

              <div className="period-form-row">
                <label>
                  Academic year
                  <input
                    name="academicYear"
                    value={form.academicYear}
                    onChange={handleChange}
                    placeholder="e.g. 2026/2027"
                    required
                  />
                </label>

                <label>
                  Semester
                  <select name="semester" value={form.semester} onChange={handleChange}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </label>
              </div>

              <div className="period-form-row">
                <label>
                  Start date
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  End date
                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label>
                Fee per course (GH₵)
                <input
                  name="feePerCourse"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.feePerCourse}
                  onChange={handleChange}
                  placeholder="e.g. 150"
                  required
                />
              </label>

              {error && <p className="period-form-error">{error}</p>}

              <div className="period-modal-actions">
                <button
                  type="button"
                  className="period-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-primary-button">
                  Save period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default ResitPeriods