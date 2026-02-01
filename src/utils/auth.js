const API_BASE = 'http://localhost:3001'

// Login
export async function login(username, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  
  const data = await response.json()
  
  if (data.success) {
    // Store token and user info
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    return { success: true, user: data.data.user }
  }
  
  // On failure, pass through userExists, isGuildmaster, and username for recovery flow
  return { 
    success: false, 
    message: data.message,
    userExists: data.userExists,
    isGuildmaster: data.isGuildmaster,
    username: data.username
  }
}

// Logout
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Get current user
export function getCurrentUser() {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Get token
export function getToken() {
  return localStorage.getItem('token')
}

// Check if user is logged in
export function isAuthenticated() {
  return !!getToken()
}

// Permission checks (same logic as backend)
export function isGuildMaster(user) {
  return user?.rank === 'GUILD_MASTER'
}

export function isCouncilOrHigher(user) {
  return user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL'
}

export function canAccessTeam(user, teamId) {
  if (!user) return false
  
  if (user.rank === 'GUILD_MASTER' || user.rank === 'COUNCIL') {
    return true
  }
  
  if (user.rank === 'TEAM_LEAD') {
    return user.team_id === teamId
  }
  
  return false
}

export function canManageUsers(user) {
  return isGuildMaster(user)
}

/**
 * Check if current user has one of the specified ranks
 * @param {string[]} ranks - Array of ranks to check against
 * @returns {boolean}
 */
export function hasRank(ranks) {
  const user = getCurrentUser()
  if (!user) return false
  return ranks.includes(user.rank)
}
