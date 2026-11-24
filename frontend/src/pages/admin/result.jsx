import { useState } from 'react'
import './result.css'

function Results() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('All Levels')
  const [showImport, setShowImport] = useState(false)

  const [results] = useState([
    {
      id: 1,
      indexNumber: 'STU/2024/001',
      name: 'John Mensah',
      course: 'Database Management',
      courseCode: 'ICT 203',
      score: 42,
      grade: 'F',
      status: 'Failed',
    },
    {
      id: 2,
      indexNumber: 'STU/2024/002',
      name: 'Mary Asante',
      course: 'Web Development',
      courseCode: 'ICT 205',
      score: 68,
      grade: 'B',
      status: 'Passed',
    },
    {
      id: 3,
      indexNumber: 'STU/2024/003',
      name: 'Peter Owusu',
      course: 'Computer Networking',
      courseCode: 'ICT 207',
      score: 35,
      grade: 'F',
      status: 'Failed',
    },
  ])

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.indexNumber.toLowerCase().includes(search.toLowerCase()) ||
      result.name.toLowerCase().includes(search.toLowerCase()) ||
      result.course.toLowerCase().includes(search.toLowerCase())

    return matchesSearch
  })

  const failedCount = results.filter(
    (result) => result.score < 50
  ).length

  const passedCount = results.filter(
    (result) => result.score >= 50
  ).length

  return (
    <div className="results-page">

      {/* Page Header */}
      <div className="results-header">
        <div>
          <h1>Student Results</h1>
          <p>Manage student examination results and performance.</p>
        </div>

        <button
          className="admin-primary-button"
          onClick={() => setShowImport(true)}
        >
          + Import Results
        </button>
      </div>

      {/* Statistics */}
      <div className="results-stats">

        <div className="result-stat-card">
          <span>Total Results</span>
          <h2>{results.length}</h2>
        </div>

        <div className="result-stat-card">
          <span>Passed Students</span>
          <h2>{passedCount}</h2>
        </div>

        <div className="result-stat-card">
          <span>Failed Students</span>
          <h2>{failedCount}</h2>
        </div>

      </div>

      {/* Results Table */}
      <div className="result-table-card">

        <div className="results-toolbar">
          <input
            type="text"
            placeholder="Search by student number, name or course..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option>All Levels</option>
            <option>100</option>
            <option>200</option>
            <option>300</option>
            <option>400</option>
          </select>
        </div>

        <div className="result-table-wrapper">
          <table className="result-table">
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Course Code</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.indexNumber}</td>
                    <td>{result.name}</td>
                    <td>{result.course}</td>
                    <td>{result.courseCode}</td>
                    <td>{result.score}%</td>
                    <td>{result.grade}</td>
                    <td>
                      <span
                        className={
                          result.status === 'Passed'
                            ? 'result-status passed'
                            : 'result-status failed'
                        }
                      >
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="results-empty">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="results-footer">
          Showing {filteredResults.length} of {results.length} results
        </div>

      </div>

      {/* Import Results Dialog */}
      {showImport && (
        <div className="result-modal-overlay">
          <div className="result-modal">

            <h2>Import Student Results</h2>

            <p className="result-modal-note">
              Upload a CSV file containing student examination results.
              Results below 50% will be classified as failed.
            </p>

            <form onSubmit={(event) => event.preventDefault()}>

              <label>
                Academic Year
                <select required defaultValue="">
                  <option value="" disabled>Select academic year</option>
                  <option>2025/2026</option>
                  <option>2026/2027</option>
                </select>
              </label>

              <label>
                Semester
                <select required defaultValue="">
                  <option value="" disabled>Select semester</option>
                  <option>First Semester</option>
                  <option>Second Semester</option>
                </select>
              </label>

              <label>
                Results CSV File
                <input type="file" accept=".csv" required />
              </label>

              <p className="result-modal-note">
                The CSV file should contain student number, course code
                and score.
              </p>

              <div className="result-modal-actions">
                <button
                  type="button"
                  className="result-cancel-btn"
                  onClick={() => setShowImport(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  Import Results
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Results