import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="placeholder">
      <h1>Page not found</h1>
      <p>The page you are looking for doesn't exist or has moved.</p>
      <Link to="/" className="primary-button">Back to home</Link>
    </div>
  )
}

export default NotFound