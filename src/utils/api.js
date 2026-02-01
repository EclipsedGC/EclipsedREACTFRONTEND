const API_BASE = 'http://localhost:3001'

// Helper to make authenticated requests
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  })
  
  const data = await response.json()
  
  // Handle 401 Unauthorized (token expired or invalid)
  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  
  return { ...data, status: response.status }
}

// User API
export const userAPI = {
  getAll: () => fetchWithAuth('/api/users'),
  
  getById: (id) => fetchWithAuth(`/api/users/${id}`),
  
  create: (userData) => fetchWithAuth('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  update: (id, userData) => fetchWithAuth(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData)
  }),
  
  // Guild Master password reset (no current password required)
  changePassword: (id, password) => fetchWithAuth(`/api/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ password })
  }),
  
  delete: (id) => fetchWithAuth(`/api/users/${id}`, {
    method: 'DELETE'
  }),
  
  // Self-service profile management
  getOwnProfile: () => fetchWithAuth('/api/users/profile'),
  
  updateOwnProfile: (profileData) => fetchWithAuth('/api/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData)
  }),
  
  // Self-service password change (requires current password)
  changeOwnPassword: (currentPassword, newPassword) => fetchWithAuth('/api/users/profile/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword })
  })
}

// Team API
export const teamAPI = {
  getAll: () => fetchWithAuth('/api/teams'),
  
  getById: (id) => fetchWithAuth(`/api/teams/${id}`),
  
  create: (teamData) => fetchWithAuth('/api/teams', {
    method: 'POST',
    body: JSON.stringify(teamData)
  }),
  
  update: (id, teamData) => fetchWithAuth(`/api/teams/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(teamData)
  }),
  
  delete: (id) => fetchWithAuth(`/api/teams/${id}`, {
    method: 'DELETE'
  })
}

// Password Recovery API
export const recoveryAPI = {
  // Create a recovery request (no auth required)
  createRequest: async (username) => {
    const response = await fetch(`${API_BASE}/api/auth/recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
    return await response.json()
  },
  
  // Get pending recovery requests (Guildmaster only)
  getPendingRequests: () => fetchWithAuth('/api/auth/recovery'),
  
  // Resolve a recovery request (Guildmaster only)
  resolveRequest: (id) => fetchWithAuth(`/api/auth/recovery/${id}`, {
    method: 'PATCH'
  })
}

// Guild Roles API
export const rolesAPI = {
  // Get all roles with assignments (PUBLIC)
  getAll: async () => {
    const url = `${API_BASE}/api/roles`
    console.log('Fetching roles from:', url)
    const response = await fetch(url)
    console.log('Roles API response status:', response.status)
    console.log('Roles API response headers:', response.headers.get('content-type'))
    const text = await response.text()
    console.log('Roles API response text (first 500 chars):', text.substring(0, 500))
    try {
      const data = JSON.parse(text)
      return data
    } catch (e) {
      console.error('Failed to parse roles response:', e)
      return { success: false, message: 'Failed to parse response' }
    }
  },
  
  // Seed initial roles (development only)
  seed: () => fetchWithAuth('/api/roles/seed', {
    method: 'POST'
  }),
  
  // Create a new role (Guildmaster only)
  create: (roleData) => fetchWithAuth('/api/roles', {
    method: 'POST',
    body: JSON.stringify(roleData)
  }),
  
  // Update a role (Guildmaster only)
  update: (id, roleData) => fetchWithAuth(`/api/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(roleData)
  }),
  
  // Delete a role (Guildmaster only)
  delete: (id) => fetchWithAuth(`/api/roles/${id}`, {
    method: 'DELETE'
  }),
  
  // Assign a user to a role (Guildmaster only)
  assignUser: (roleId, userId) => fetchWithAuth('/api/roles/assignments', {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId, user_id: userId })
  }),
  
  // Remove a user from a role (Guildmaster only)
  removeUser: (roleId, userId) => fetchWithAuth('/api/roles/assignments', {
    method: 'DELETE',
    body: JSON.stringify({ role_id: roleId, user_id: userId })
  })
}

