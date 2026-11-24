import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './addstudent.css'

function AddStudent() {
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

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

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
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      programme: formData.programme.trim(),
      level: Number(formData.level),
    }

    setSaving(true)

    try {
      const response = await fetch(
        'http://localhost:8000/api/admin/students',
        {
          method: 'POST',
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
          validationErrors || 'Unable to save student.'
        )
      }

      alert('Student registered successfully!')

      navigate('/admin/students')

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
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

        <strong>Add New Student</strong>
      </div>

      {/* Page Header */}
      <div className="add-student-header">
        <div>
          <h1>Add New Student</h1>
          <p>Register a new student into the school resit system.</p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate('/admin/students')}
        >
          ← Back to Students
        </button>
      </div>

      {/* Student Form */}
      <div className="student-form-card">

        <div className="form-heading">
          <h2>Student Information</h2>
          <p>Fields marked with * are required.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #ef4444',
              color: '#b91c1c',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Student Index Number *</label>
              <input
                type="text"
                name="indexNumber"
                placeholder="e.g. STU/2024/001"
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
                placeholder="Enter first name"
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
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 0240000000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Programme *</label>
              <input
                type="text"
                name="programme"
                placeholder="e.g. Computer Science"
                value={formData.programme}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
              >
                <option value="">Select Level</option>
                <option value="100">Level 100</option>
                <option value="200">Level 200</option>
                <option value="300">Level 300</option>
                <option value="400">Level 400</option>
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
              {saving ? 'Saving Student...' : 'Save Student'}
            </button>

          </div>

        </form>
      </div>

    </div>
  )
}

export default AddStudent