import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './student.css'

function Students() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [search, setSearch] = useState('')
  const [students, setStudents] = useState([])

  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  })

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [uploading, setUploading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState('')

  const [activatingStudent, setActivatingStudent] = useState(null)

  // Load students from Laravel API.
  const loadStudents = useCallback(async (page = 1) => {
    const token = localStorage.getItem('admin_token')

    if (!token) {
      setPageError('Your admin session has expired. Please log in again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setPageError('')

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/students?page=${page}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to load student records.'
        )
      }

      const studentRecords = data.students?.data || []

      setStudents(
        studentRecords.map((student) => ({
          id: student.id,
          indexNumber: student.index_number,
          name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          email: student.email || '—',
          programme: student.programme || '—',
          level: student.level || '—',
          status: student.is_active ? 'Active' : 'Inactive',
          activated: Boolean(student.activated_at),
        }))
      )

      setStatistics({
        total: data.statistics?.total || 0,
        active: data.statistics?.active || 0,
        inactive: data.statistics?.inactive || 0,
      })

      setPagination({
        currentPage: data.students?.current_page || 1,
        lastPage: data.students?.last_page || 1,
        total: data.students?.total || 0,
      })

    } catch (error) {
      setPageError(error.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load students when the page opens.
  useEffect(() => {
    loadStudents(1)
  }, [loadStudents])

  // Search students on the current page.
  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.indexNumber} ${student.programme} ${student.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Open file picker.
  const openFilePicker = () => {
    setImportError('')
    setImportResult(null)
    fileInputRef.current?.click()
  }

  // Upload student file.
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    event.target.value = ''

    const allowedExtensions = ['csv', 'xlsx', 'xls']
    const extension = file.name.split('.').pop().toLowerCase()

    if (!allowedExtensions.includes(extension)) {
      setImportError('Please select a CSV, XLSX or XLS file.')
      return
    }

    const token = localStorage.getItem('admin_token')

    if (!token) {
      setImportError('Your admin session has expired. Please log in again.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setImportError('')
    setImportResult(null)

    try {
      const response = await fetch(
        'http://localhost:8000/api/admin/students/import',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : data.message

        throw new Error(
          validationErrors || 'Student import failed.'
        )
      }

      setImportResult(data)

      // Refresh student records after importing.
      await loadStudents(1)

    } catch (error) {
      setImportError(
        error.message || 'Unable to upload the student file.'
      )
    } finally {
      setUploading(false)
    }
  }

  // Change page.
  const changePage = (page) => {
    if (page < 1 || page > pagination.lastPage) return

    loadStudents(page)
  }

  // Generate or send student activation code.
  const handleActivationCode = async (student, method) => {
    const actionText = method === 'manual'
      ? 'generate an activation code for'
      : 'send an activation code to'

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${student.name}?`
    )

    if (!confirmed) return

    const token = localStorage.getItem('admin_token')

    if (!token) {
      alert('Your admin session has expired. Please log in again.')
      return
    }

    setActivatingStudent(student.id)

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/students/${student.id}/activation-code`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            method,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to process the activation request.'
        )
      }

      if (method === 'manual') {
        alert(
          `ACTIVATION CODE GENERATED\n\n` +
          `Student: ${student.name}\n` +
          `Index Number: ${student.indexNumber}\n\n` +
          `Activation Code: ${data.activation_code}\n\n` +
          `Expires: ${data.expires_at}\n\n` +
          `Give this code to the student so they can activate their account.`
        )
      } else {
        alert(
          data.message ||
          `Activation code successfully sent to ${student.email}.`
        )
      }

      await loadStudents(pagination.currentPage)

    } catch (error) {
      alert(error.message || 'Unable to process activation request.')
    } finally {
      setActivatingStudent(null)
    }
  }

  return (
    <div className="students-page">

      {/* Page Header */}
      <div className="students-header">

        <div>
          <h1>Students Management</h1>
          <p>View and manage student records.</p>
        </div>

        <div className="students-actions">

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <button
            className="import-btn"
            onClick={openFilePicker}
            disabled={uploading}
          >
            {uploading ? 'Importing...' : 'Import Students'}
          </button>

          <button
            className="add-student-btn"
            onClick={() => navigate('/admin/students/add')}
          >
            + Add New Student
          </button>

        </div>

      </div>

      {/* Import Results */}
      {importResult && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            padding: '18px',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ color: '#047857', marginTop: 0 }}>
            Import Completed Successfully
          </h3>

          <p>{importResult.message}</p>

          <p>
            <strong>Imported:</strong> {importResult.imported}
          </p>

          <p>
            <strong>Skipped:</strong> {importResult.skipped}
          </p>

          {importResult.errors?.length > 0 && (
            <div>
              <strong>Import warnings:</strong>

              <ul>
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Import Error */}
      {importError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            color: '#b91c1c',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          {importError}
        </div>
      )}

      {/* Database Error */}
      {pageError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            color: '#b91c1c',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          {pageError}
        </div>
      )}

      {/* Statistics */}
      <div className="students-stats">

        <div className="student-stat-card">
          <span>Total Students</span>
          <h2>{statistics.total.toLocaleString()}</h2>
        </div>

        <div className="student-stat-card">
          <span>Active Students</span>
          <h2>{statistics.active.toLocaleString()}</h2>
        </div>

        <div className="student-stat-card">
          <span>Inactive Students</span>
          <h2>{statistics.inactive.toLocaleString()}</h2>
        </div>

      </div>

      {/* Students Table */}
      <div className="students-table-card">

        <div className="students-table-heading">

          <div>
            <h2>All Students</h2>
            <p>Manage student information and accounts.</p>
          </div>

          <input
            type="text"
            placeholder="Search by name, index number or programme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="students-table-wrapper">

          <table className="students-table">

            <thead>
              <tr>
                <th>Index Number</th>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Programme</th>
                <th>Level</th>
                <th>Account Status</th>
                <th>Activation Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="8" className="no-students">
                    Loading student records...
                  </td>
                </tr>

              ) : filteredStudents.length > 0 ? (

                filteredStudents.map((student) => (
                  <tr key={student.id}>

                    <td>{student.indexNumber}</td>

                    <td>{student.name}</td>

                    <td>{student.email}</td>

                    <td>{student.programme}</td>

                    <td>{student.level}</td>

                    {/* Account Status */}
                    <td>
                      <span
                        className={`student-status ${
                          student.status === 'Active'
                            ? 'active'
                            : 'inactive'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    {/* Activation Status */}
                    <td>
                      <span
                        className={`student-status ${
                          student.activated
                            ? 'active'
                            : 'inactive'
                        }`}
                      >
                        {student.activated
                          ? 'Activated'
                          : 'Not Activated'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="student-action-buttons">

                      <button
                        className="view-student-btn"
                        onClick={() =>
                          navigate(`/admin/students/${student.id}`)
                        }
                      >
                        View
                      </button>

                      <button
                        className="edit-student-btn"
                        onClick={() =>
                          navigate(`/admin/students/${student.id}/edit`)
                        }
                      >
                        Edit
                      </button>

                      {!student.activated && student.status === 'Active' && (
                        <>
                          <button
                            className="activation-manual-btn"
                            onClick={() =>
                              handleActivationCode(student, 'manual')
                            }
                            disabled={activatingStudent === student.id}
                          >
                            {activatingStudent === student.id
                              ? 'Processing...'
                              : 'Generate Code'}
                          </button>

                          <button
                            className="activation-email-btn"
                            onClick={() =>
                              handleActivationCode(student, 'email')
                            }
                            disabled={
                              activatingStudent === student.id ||
                              student.email === '—'
                            }
                          >
                            Send Email
                          </button>
                        </>
                      )}

                      {student.activated && (
                        <span className="activation-complete">
                          Account Activated
                        </span>
                      )}

                    </td>

                  </tr>
                ))

              ) : (

                <tr>
                  <td colSpan="8" className="no-students">
                    {search
                      ? 'No students match your search.'
                      : 'No students found in the database.'}
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* Table Footer */}
        <div className="students-table-footer">

          <span>
            Showing {filteredStudents.length} of {pagination.total} students
          </span>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            <button
              onClick={() => changePage(pagination.currentPage - 1)}
              disabled={loading || pagination.currentPage <= 1}
            >
              Previous
            </button>

            <span>
              Page {pagination.currentPage} of {pagination.lastPage}
            </span>

            <button
              onClick={() => changePage(pagination.currentPage + 1)}
              disabled={
                loading ||
                pagination.currentPage >= pagination.lastPage
              }
            >
              Next
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Students