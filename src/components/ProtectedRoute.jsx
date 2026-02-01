import { Navigate } from 'react-router-dom'
import { getCurrentUser, isAuthenticated } from '../utils/auth'

export default function ProtectedRoute({ children, requiredRank }) {
  const user = getCurrentUser()
  const loggedIn = isAuthenticated()

  // Not logged in
  if (!loggedIn) {
    return <Navigate to="/login" replace />
  }

  // Check rank if specified (can be a string or array of strings)
  if (requiredRank) {
    const allowedRanks = Array.isArray(requiredRank) ? requiredRank : [requiredRank]
    
    if (!allowedRanks.includes(user?.rank)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}
