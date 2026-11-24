import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './addstudent.css'

function EditStudent() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    indexNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    programme: '',
    level: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load existing student details
  useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem('admin_token')

      if (!token) {
        setError('Your admin session has expired. Please log in again.')
        setLoading(false)
        return
      }

      try {
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
          throw new Error(data.message || 'Unable to load student details.')
        }

        const student = data.student

        setFormData({
          indexNumber: student.index_number || '',
          firstName: student.first_name || '',
          lastName: student.last_name || '',
          email: student.email || '',
          phone: student.phone || '',
          programme: student.programme || '',
          level: student.level?.toString() || '',
        })
      } catch (err) {
        setError(err.message || 'Unable to load student details.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Update student
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const token = localStorage.getItem('admin_token')

    if (!token) {
      setError('Your admin session has expired. Please log in again.')
      return
    }

    const studentData = {
      index_number: formData.indexNumber.trim(),
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      programme: formData.programme.trim() || null,
      level: formData.level ? Number(formData.level) : null,
    }

    setSaving(true)

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/students/${id}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(studentData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : data.message

        throw new Error(
          validationErrors || 'Unable to update student.'
        )
      }

      alert('Student information updated successfully!')

      navigate('/admin/students')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="add-student-page">
        <p>Loading student information...</p>
      </div>
    )
  }

  return (
    <div className="add-student-page">

      {/* Navigation */}
      <div className="add-student-navigation">
        <button onClick={() => navigate('/admin/dashboard')}>
          Dashboard
        </button>

        <span>/</span>

        <button onClick={() => navigate('/admin/students')}>
          Students
        </button>

        <span>/</span>

        <strong>Edit Student</strong>
      </div>

      {/* Page Header */}
      <div className="add-student-header">
        <div>
          <h1>Edit Student</h1>
          <p>Update the student's information in the resit system.</p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate('/admin/students')}
        >
          Back to Students
        </button>
      </div>

      {/* Form Card */}
      <div className="add-student-form-card">

        <div className="form-card-heading">
          <h2>Student Information</h2>
          <p>Update the details below and save your changes.</p>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Index Number *</label>
              <input
                type="text"
                name="indexNumber"
                value={formData.indexNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Programme</label>
              <input
                type="text"
                name="programme"
                value={formData.programme}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="">Select Level</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
              </select>
            </div>

          </div>

          {/* Form Buttons */}
          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/admin/students')}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-student-button"
              disabled={saving}
            >
              {saving ? 'Updating Student...' : 'Update Student'}
            </button>

          </div>

        </form>
      </div>

    </div>
  )
}

export default EditStudent