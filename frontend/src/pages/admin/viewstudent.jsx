import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './viewstudent.css'

function ViewStudent() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('admin_token')

        const response = await fetch(
          `http://localhost:8000/api/admin/students/${id}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to retrieve student details.')
        }

        setStudent(data.student)
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id])

  if (loading) {
    return (
      <div className="view-student-page">
        <p className="view-loading">Loading student details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="view-student-page">
        <div className="view-error">{error}</div>

        <button
          className="view-back-btn"
          onClick={() => navigate('/admin/students')}
        >
          Back to Students
        </button>
      </div>
    )
  }

  if (!student) {
    return null
  }

  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim()

  return (
    <div className="view-student-page">

      <div className="view-student-header">
        <div>
          <h1>Student Details</h1>
          <p>View complete information about this student.</p>
        </div>

        <div className="view-student-actions">
          <button
            className="view-back-btn"
            onClick={() => navigate('/admin/students')}
          >
            Back to Students
          </button>

          <button
            className="view-edit-btn"
            onClick={() => navigate(`/admin/students/${id}/edit`)}
          >
            Edit Student
          </button>
        </div>
      </div>

      <div className="view-student-card">

        <div className="view-student-profile">
          <div className="view-student-avatar">
            {student.first_name?.charAt(0).toUpperCase() || 'S'}
          </div>

          <div>
            <h2>{fullName || 'Student Name'}</h2>
            <p>{student.index_number}</p>

            <span className={`student-status ${student.is_active ? 'active' : 'inactive'}`}>
              {student.is_active ? 'Active Account' : 'Inactive Account'}
            </span>
          </div>
        </div>

        <div className="view-student-section">
          <h3>Personal Information</h3>

          <div className="view-student-grid">

            <div className="view-info-item">
              <span>First Name</span>
              <strong>{student.first_name || 'Not provided'}</strong>
            </div>

            <div className="view-info-item">
              <span>Last Name</span>
              <strong>{student.last_name || 'Not provided'}</strong>
            </div>

            <div className="view-info-item">
              <span>Index Number</span>
              <strong>{student.index_number || 'Not provided'}</strong>
            </div>

            <div className="view-info-item">
              <span>Email Address</span>
              <strong>{student.email || 'Not provided'}</strong>
            </div>

            <div className="view-info-item">
              <span>Phone Number</span>
              <strong>{student.phone || 'Not provided'}</strong>
            </div>

            <div className="view-info-item">
              <span>Programme</span>
              <strong>{student.programme || 'Not provided'}</strong>
            </div>

            <div className="view-info-item">
              <span>Level</span>
              <strong>{student.level ? `Level ${student.level}` : 'Not provided'}</strong>
            </div>

            <div className="view-info-item">
              <span>Account Status</span>
              <strong>{student.is_active ? 'Active' : 'Inactive'}</strong>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default ViewStudent