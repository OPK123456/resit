import { useState } from 'react'
import AdminLayout from './adminlayout.jsx'
import './registrations.css'

const money = (value) => `GH₵ ${Number(value).toFixed(2)}`

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const FIRST = '2025/2026 - First Semester Resit'

const initialRegistrations = [
  { id: 1, indexNumber: '1000001', studentName: 'Ama Mensah', courseCode: 'MA201', courseTitle: 'Discrete Mathematics', period: FIRST, date: '2026-11-12', amount: 150, status: 'Paid' },
  { id: 2, indexNumber: '1000002', studentName: 'Kwame Owusu', courseCode: 'CS201', courseTitle: 'Data Structures', period: FIRST, date: '2026-11-12', amount: 150, status: 'Paid' },
  { id: 3, indexNumber: '1000003', studentName: 'Akosua Boateng', courseCode: 'BA302', courseTitle: 'Business Ethics', period: FIRST, date: '2026-11-13', amount: 150, status: 'Pending' },
  { id: 4, indexNumber: '1000004', studentName: 'Kofi Asante', courseCode: 'MA201', courseTitle: 'Discrete Mathematics', period: FIRST, date: '2026-11-14', amount: 150, status: 'Pending' },
  { id: 5, indexNumber: '1000004', studentName: 'Kofi Asante', courseCode: 'CS202', courseTitle: 'Database Systems', period: FIRST, date: '2026-11-14', amount: 150, status: 'Pending' },
  { id: 6, indexNumber: '1000005', studentName: 'Efua Appiah', courseCode: 'CS201', courseTitle: 'Data Structures', period: FIRST, date: '2026-11-15', amount: 150, status: 'Cancelled' },
  { id: 7, indexNumber: '1000006', studentName: 'Yaw Darko', courseCode: 'IT301', courseTitle: 'Computer Networks', period: FIRST, date: '2026-11-16', amount: 150, status: 'Paid' },
  { id: 8, indexNumber: '1000007', studentName: 'Abena Sarpong', courseCode: 'CS201', courseTitle: 'Data Structures', period: FIRST, date: '2026-11-17', amount: 150, status: 'Pending' },
  { id: 9, indexNumber: '1000008', studentName: 'Nana Yeboah', courseCode: 'AC101', courseTitle: 'Principles of Accounting', period: '2024/2025 - Second Semester Resit', date: '2026-04-08', amount: 120, status: 'Paid' },
  { id: 10, indexNumber: '1000009', studentName: 'Esi Quaye', courseCode: 'BA302', courseTitle: 'Business Ethics', period: '2024/2025 - Second Semester Resit', date: '2026-04-10', amount: 120, status: 'Paid' },
]

const statusClass = {
  Paid: 'status-success',
  Pending: 'status-pending',
  Cancelled: 'reg-cancelled',
}

const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`

function Registrations() {
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [period, setPeriod] = useState('All')

  const periods = [...new Set(registrations.map((r) => r.period))]

  const filtered = registrations.filter(
    (r) =>
      (status === 'All' || r.status === status) &&
      (period === 'All' || r.period === period) &&
      `${r.indexNumber} ${r.studentName} ${r.courseCode} ${r.courseTitle}`
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  const count = (s) => registrations.filter((r) => r.status === s).length

  // Registrations per course, ignoring cancelled ones, for planning resit exams
  const perCourse = Object.values(
    registrations
      .filter((r) => r.status !== 'Cancelled' && (period === 'All' || r.period === period))
      .reduce((acc, r) => {
        acc[r.courseCode] ??= { code: r.courseCode, title: r.courseTitle, total: 0 }
        acc[r.courseCode].total += 1
        return acc
      }, {})
  ).sort((a, b) => b.total - a.total)

  const maxPerCourse = perCourse.length ? perCourse[0].total : 1

  const handleCancel = (registration) => {
    if (
      window.confirm(
        `Cancel ${registration.studentName}'s registration for ${registration.courseCode}?`
      )
    ) {
      setRegistrations(
        registrations.map((r) =>
          r.id === registration.id ? { ...r, status: 'Cancelled' } : r
        )
      )
    }
  }

  const exportCsv = () => {
    const header = ['Index number', 'Student', 'Course code', 'Course title', 'Period', 'Date', 'Amount', 'Status']
    const rows = filtered.map((r) => [
      r.indexNumber, r.studentName, r.courseCode, r.courseTitle,
      r.period, r.date, r.amount, r.status,
    ])
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'resit-registrations.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="admin-content registrations-page">
        <div className="registrations-header">
          <div>
            <h1>Registrations</h1>
            <p>Track which students registered for which resit courses.</p>
          </div>

          <button
            className="admin-primary-button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
          >
            Export to CSV
          </button>
        </div>

        <div className="registrations-stats">
          <div className="reg-stat-card">
            <span>Total Registrations</span>
            <h2>{registrations.length}</h2>
          </div>
          <div className="reg-stat-card">
            <span>Paid</span>
            <h2>{count('Paid')}</h2>
          </div>
          <div className="reg-stat-card">
            <span>Pending Payment</span>
            <h2>{count('Pending')}</h2>
          </div>
          <div className="reg-stat-card">
            <span>Cancelled</span>
            <h2>{count('Cancelled')}</h2>
          </div>
        </div>

        <div className="admin-panel">
          <div className="registrations-toolbar">
            <input
              type="text"
              placeholder="Search by index number, student or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search registrations"
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Filter by resit period">
              <option value="All">All periods</option>
              {periods.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>INDEX NUMBER</th>
                  <th>STUDENT</th>
                  <th>COURSE</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.indexNumber}</strong></td>
                      <td>{r.studentName}</td>
                      <td>
                        <strong>{r.courseCode}</strong>
                        <span className="reg-course-title"> {r.courseTitle}</span>
                      </td>
                      <td>{formatDate(r.date)}</td>
                      <td>{money(r.amount)}</td>
                      <td>
                        <span className={`status-badge ${statusClass[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="reg-cancel-btn"
                          disabled={r.status !== 'Pending'}
                          title={
                            r.status === 'Paid'
                              ? 'Paid registrations need a refund first'
                              : undefined
                          }
                          onClick={() => handleCancel(r)}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="registrations-empty">
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="registrations-footer">
            Showing {filtered.length} of {registrations.length} registrations
          </div>
        </div>

        <div className="admin-panel reg-course-panel">
          <div className="panel-heading">
            <div>
              <h3>Registrations per course</h3>
              <p>Cancelled registrations are not counted.</p>
            </div>
          </div>

          <div className="reg-course-list">
            {perCourse.length > 0 ? (
              perCourse.map((c) => (
                <div className="reg-course-row" key={c.code}>
                  <div className="reg-course-name">
                    <strong>{c.code}</strong>
                    <span>{c.title}</span>
                  </div>

                  <div className="progress-track">
                    <div style={{ width: `${(c.total / maxPerCourse) * 100}%` }}></div>
                  </div>

                  <strong className="reg-course-total">{c.total}</strong>
                </div>
              ))
            ) : (
              <p className="registrations-empty">No registrations to show.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Registrations