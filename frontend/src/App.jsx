import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/home.jsx'
import StudentLogin from './pages/studentlogin.jsx'
import StudentRegister from './pages/studentregister.jsx'
import AdminLogin from './pages/adminlogin.jsx'

import AdminProtectedRoute from './components/AdminProtectedRoute.jsx'

import AdminDashboard from './pages/admin/dashboard.jsx'
import Students from './pages/admin/student.jsx'
import AddStudent from './pages/admin/addstudent.jsx'
import ViewStudent from './pages/admin/viewstudent.jsx'
import EditStudent from './pages/admin/editstudent.jsx'

import Courses from './pages/admin/courses.jsx'
import ResitPeriods from './pages/admin/resitperiods.jsx'
import Registrations from './pages/admin/registrations.jsx'
import Payments from './pages/admin/payments.jsx'
import Reports from './pages/admin/report.jsx'
import Results from './pages/admin/result.jsx'

import NotFound from './pages/notfound.jsx'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Administrator Pages */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/students/add" element={<AddStudent />} />
          <Route path="/admin/students/:id" element={<ViewStudent />} />
          <Route path="/admin/students/:id/edit" element={<EditStudent />} />

          <Route path="/admin/courses" element={<Courses />} />
          <Route path="/admin/resit-periods" element={<ResitPeriods />} />
          <Route path="/admin/registrations" element={<Registrations />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/results" element={<Results />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>

        {/* Page Not Found */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App