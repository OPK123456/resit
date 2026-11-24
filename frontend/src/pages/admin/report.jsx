import { useState } from 'react'
import AdminLayout from './adminlayout.jsx'
import './report.css'

// Sample report data
const reports = [
  {
    id: 'registrations',
    title: 'Registrations by Course',
    description: 'View how many students registered to resit each course.',
    columns: ['Course Code', 'Course Title', 'Registrations', 'Paid', 'Pending'],
    rows: [
      ['CS201', 'Data Structures', 3, 1, 2],
      ['MA201', 'Discrete Mathematics', 2, 1, 1],
      ['CS202', 'Database Systems', 1, 0, 1],
      ['IT301', 'Computer Networks', 1, 1, 0],
      ['BA302', 'Business Ethics', 1, 0, 1],
    ],
  },
  {
    id: 'payments',
    title: 'Payment Summary',
    description: 'View payments received according to payment method.',
    columns: ['Method', 'Payments', 'Amount (GH₵)'],
    rows: [
      ['Mobile Money', 2, '300.00'],
      ['Card', 1, '150.00'],
      ['Cash', 1, '150.00'],
      ['Bank Transfer', 0, '0.00'],
    ],
  },
  {
    id: 'eligible',
    title: 'Students Eligible to Resit',
    description: 'View students who scored below the 50% pass mark.',
    columns: ['Index Number', 'Student', 'Course', 'Score'],
    rows: [
      ['1000001', 'Ama Mensah', 'MA201', 41],
      ['1000002', 'Kwame Owusu', 'CS201', 38],
      ['1000003', 'Akosua Boateng', 'BA302', 47],
      ['1000004', 'Kofi Asante', 'MA201', 29],
    ],
  },
  {
    id: 'passfail',
    title: 'Pass and Fail by Course',
    description: 'Compare student examination performance across courses.',
    columns: ['Course', 'Sat', 'Passed', 'Failed', 'Fail Rate'],
    rows: [
      ['CS201', 120, 96, 24, '20%'],
      ['MA201', 98, 70, 28, '29%'],
      ['CS202', 85, 74, 11, '13%'],
      ['IT301', 60, 55, 5, '8%'],
    ],
  },
]

// Convert values into valid CSV cells
const csvCell = (value) => {
  return `"${String(value).replace(/"/g, '""')}"`
}

// Download report as CSV
function downloadCsv(report) {
  const csv = [report.columns, ...report.rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${report.id}-report.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

function Reports() {
  const [selectedId, setSelectedId] = useState('registrations')

  const [period, setPeriod] = useState(
    '2025/2026 First Semester Resit'
  )

  const selected = reports.find(
    (report) => report.id === selectedId
  )

  return (
    <AdminLayout>
      <div className="admin-content reports-page">

        {/* Page Header */}
        <div className="reports-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p>
              Preview, analyse and download academic and financial reports.
            </p>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="Select resit period"
          >
            <option>2025/2026 First Semester Resit</option>
            <option>2025/2026 Second Semester Resit</option>
            <option>2024/2025 Second Semester Resit</option>
          </select>
        </div>

        {/* Report Categories */}
        <div className="reports-grid">

          {reports.map((report) => (
            <div
              key={report.id}
              className={`report-card ${
                selectedId === report.id ? 'selected' : ''
              }`}
            >
              <div className="report-card-content">
                <h3>{report.title}</h3>
                <p>{report.description}</p>
              </div>

              <div className="report-card-actions">
                <button
                  type="button"
                  className="report-preview-btn"
                  onClick={() => setSelectedId(report.id)}
                >
                  Preview Report
                </button>

                <button
                  type="button"
                  className="report-download-btn"
                  onClick={() => downloadCsv(report)}
                >
                  Download CSV
                </button>
              </div>
            </div>
          ))}

        </div>

        {/* Report Preview */}
        {selected && (
          <div className="admin-panel">

            <div className="panel-heading">
              <div>
                <h3>{selected.title}</h3>
                <p>{period}</p>
              </div>

              <button
                type="button"
                className="admin-primary-button"
                onClick={() => downloadCsv(selected)}
              >
                Download Report
              </button>
            </div>

            {/* Report Table */}
            <div className="table-responsive">

              <table className="admin-table">

                <thead>
                  <tr>
                    {selected.columns.map((column) => (
                      <th key={column}>
                        {column.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {selected.rows.map((row, index) => (
                    <tr key={index}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>
                          {cellIndex === 0 ? (
                            <strong>{cell}</strong>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

            {/* Report Footer */}
            <div className="reports-footer">
              <span>
                Total records: {selected.rows.length}
              </span>

              <span>
                Report: {selected.id}
              </span>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  )
}

export default Reports