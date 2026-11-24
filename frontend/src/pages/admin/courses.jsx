import { useState, useEffect, useCallback } from 'react'
import AdminLayout from './adminlayout.jsx'
import './courses.css'

const API_URL = 'http://localhost:8000/api/admin/courses'

const emptyForm = {
  code: '',
  title: '',
  level: '100',
  semester: '1',
  credit_hours: '3',
}

function Courses() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('All')

  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const [form, setForm] = useState(emptyForm)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  })

  // Get administrator token.
  const getToken = () => {
    return localStorage.getItem('admin_token')
  }

  // Load courses from Laravel.
  const loadCourses = useCallback(async (page = 1) => {
    const token = getToken()

    if (!token) {
      setError('Your administrator session has expired. Please log in again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}?page=${page}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load courses.')
      }

      setCourses(data.data || [])

      setPagination({
        currentPage: data.current_page || 1,
        lastPage: data.last_page || 1,
        total: data.total || 0,
      })

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load courses when the page opens.
  useEffect(() => {
    loadCourses(1)
  }, [loadCourses])

  // Filter courses.
  const filteredCourses = courses.filter((course) => {
    const matchesLevel =
      level === 'All' || String(course.level) === level

    const matchesSearch =
      `${course.code} ${course.title}`
        .toLowerCase()
        .includes(search.toLowerCase())

    return matchesLevel && matchesSearch
  })

  // Calculate credits on the currently loaded page.
  const totalCredits = courses.reduce(
    (sum, course) => sum + Number(course.credit_hours || 0),
    0
  )

  // Open form for adding a course.
  const openAddForm = () => {
    setEditingCourse(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  // Open form for editing a course.
  const openEditForm = (course) => {
    setEditingCourse(course)

    setForm({
      code: course.code || '',
      title: course.title || '',
      level: String(course.level || '100'),
      semester: String(course.semester || '1'),
      credit_hours: String(course.credit_hours || '3'),
    })

    setError('')
    setSuccess('')
    setShowForm(true)
  }

  // Handle form input.
  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Save new or updated course.
  const handleSubmit = async (event) => {
    event.preventDefault()

    const token = getToken()

    if (!token) {
      setError('Your administrator session has expired.')
      return
    }

    const courseCode = form.code.trim().toUpperCase()

    if (!courseCode || !form.title.trim()) {
      setError('Please enter the course code and title.')
      return
    }

    const payload = {
      code: courseCode,
      title: form.title.trim(),
      level: Number(form.level),
      semester: Number(form.semester),
      credit_hours: Number(form.credit_hours),
    }

    setSaving(true)
    setError('')

    try {
      const isEditing = Boolean(editingCourse)

      const response = await fetch(
        isEditing
          ? `${API_URL}/${editingCourse.id}`
          : API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : data.message

        throw new Error(
          validationErrors || 'Unable to save course.'
        )
      }

      setShowForm(false)
      setForm(emptyForm)
      setEditingCourse(null)

      setSuccess(
        isEditing
          ? 'Course updated successfully.'
          : 'Course added successfully.'
      )

      await loadCourses(pagination.currentPage)

    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // Delete course.
  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${course.code} - ${course.title}?`
    )

    if (!confirmed) return

    const token = getToken()

    if (!token) {
      setError('Your administrator session has expired.')
      return
    }

    setDeleting(course.id)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/${course.id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to delete course.'
        )
      }

      setSuccess('Course deleted successfully.')

      const nextPage =
        courses.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage

      await loadCourses(nextPage)

    } catch (err) {
      setError(err.message || 'Unable to delete course.')
    } finally {
      setDeleting(null)
    }
  }

  // Change pagination page.
  const changePage = (page) => {
    if (page < 1 || page > pagination.lastPage) return

    loadCourses(page)
  }

  return (
    <AdminLayout>
      <div className="admin-content courses-page">

        {/* Page Header */}
        <div className="courses-header">
          <div>
            <h1>Courses Management</h1>
            <p>
              Manage courses available for student resit registration.
            </p>
          </div>

          <button
            className="admin-primary-button"
            onClick={openAddForm}
          >
            + Add Course
          </button>
        </div>

        {/* Notifications */}
        {error && !showForm && (
          <div className="course-alert course-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="course-alert course-alert-success">
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="courses-stats">

          <div className="course-stat-card">
            <span>Total Courses</span>
            <h2>{pagination.total}</h2>
          </div>

          <div className="course-stat-card">
            <span>Credit Hours (Loaded Page)</span>
            <h2>{totalCredits}</h2>
          </div>

          <div className="course-stat-card">
            <span>Current Page</span>
            <h2>
              {pagination.currentPage} / {pagination.lastPage}
            </h2>
          </div>

        </div>

        {/* Courses Table */}
        <div className="admin-panel courses-table-card">

          <div className="courses-toolbar">

            <input
              type="text"
              placeholder="Search by course code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search courses"
            />

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              aria-label="Filter by level"
            >
              <option value="All">All levels</option>
              <option value="100">Level 100</option>
              <option value="200">Level 200</option>
              <option value="300">Level 300</option>
              <option value="400">Level 400</option>
            </select>

          </div>

          <div className="table-responsive">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>CODE</th>
                  <th>COURSE TITLE</th>
                  <th>LEVEL</th>
                  <th>SEMESTER</th>
                  <th>CREDITS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan="6" className="courses-empty">
                      Loading courses...
                    </td>
                  </tr>

                ) : filteredCourses.length > 0 ? (

                  filteredCourses.map((course) => (
                    <tr key={course.id}>

                      <td>
                        <strong>{course.code}</strong>
                      </td>

                      <td>{course.title}</td>

                      <td>
                        {course.level
                          ? `Level ${course.level}`
                          : '—'}
                      </td>

                      <td>
                        {course.semester
                          ? `Semester ${course.semester}`
                          : '—'}
                      </td>

                      <td>{course.credit_hours}</td>

                      <td className="course-action-buttons">

                        <button
                          className="course-edit-btn"
                          onClick={() => openEditForm(course)}
                        >
                          Edit
                        </button>

                        <button
                          className="course-delete-btn"
                          onClick={() => handleDelete(course)}
                          disabled={deleting === course.id}
                        >
                          {deleting === course.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>

                      </td>

                    </tr>
                  ))

                ) : (

                  <tr>
                    <td colSpan="6" className="courses-empty">
                      {search || level !== 'All'
                        ? 'No courses match your search.'
                        : 'No courses have been added yet.'}
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* Table Footer */}
          <div className="courses-footer">

            <span>
              Showing {filteredCourses.length} of {pagination.total} courses
            </span>

            <div className="course-pagination">

              <button
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={
                  loading || pagination.currentPage <= 1
                }
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

      {/* Add / Edit Course Modal */}
      {showForm && (

        <div
          className="course-modal-overlay"
          onClick={() => setShowForm(false)}
        >

          <div
            className="course-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-modal-title"
            onClick={(e) => e.stopPropagation()}
          >

            <h2 id="course-modal-title">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>

            <p className="course-modal-description">
              Enter the course information below.
            </p>

            <form onSubmit={handleSubmit}>

              <div className="course-form-row">

                <label>
                  Course Code

                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. CS301"
                    maxLength="50"
                    required
                  />
                </label>

                <label>
                  Credit Hours

                  <input
                    name="credit_hours"
                    type="number"
                    min="1"
                    max="255"
                    value={form.credit_hours}
                    onChange={handleChange}
                    required
                  />
                </label>

              </div>

              <label>
                Course Title

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Operating Systems"
                  maxLength="255"
                  required
                />
              </label>

              <div className="course-form-row">

                <label>
                  Level

                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                  >
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                  </select>
                </label>

                <label>
                  Semester

                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </label>

              </div>

              <div className="course-fee-notice">
                Resit fees are configured separately for each resit period.
                They are not managed under Courses.
              </div>

              {error && (
                <p className="course-form-error">
                  {error}
                </p>
              )}

              <div className="course-modal-actions">

                <button
                  type="button"
                  className="course-cancel-btn"
                  onClick={() => {
                    setShowForm(false)
                    setError('')
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingCourse
                      ? 'Update Course'
                      : 'Save Course'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </AdminLayout>
  )
}

export default Courses