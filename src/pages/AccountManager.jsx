import { useState, useEffect } from 'react'
import { userAPI, teamAPI, recoveryAPI } from '../utils/api'
import { getCurrentUser } from '../utils/auth'

export default function AccountManager() {
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [editingUser, setEditingUser] = useState(null) // For inline user editing
  const [editingUserUsername, setEditingUserUsername] = useState('')
  const [editingUserNewPassword, setEditingUserNewPassword] = useState('')
  const [editingUserConfirmPassword, setEditingUserConfirmPassword] = useState('')
  const [showUsernameEdit, setShowUsernameEdit] = useState(false)
  const [showPasswordEdit, setShowPasswordEdit] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const currentUser = getCurrentUser()
  
  // Recovery requests state
  const [recoveryRequests, setRecoveryRequests] = useState([])
  const [showRecoveryDropdown, setShowRecoveryDropdown] = useState(false)

  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    rank: 'TEAM_LEAD',
    teamId: ''
  })

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    loadData()
    loadRecoveryRequests()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [usersResult, teamsResult] = await Promise.all([
        userAPI.getAll(),
        teamAPI.getAll()
      ])
      
      if (usersResult.success) {
        setUsers(usersResult.data)
      } else {
        setError(`Failed to load users: ${usersResult.message}`)
      }
      
      if (teamsResult.success) {
        setTeams(teamsResult.data)
      } else {
        setError(`Failed to load teams: ${teamsResult.message}`)
      }
    } catch (err) {
      setError(`Error loading data: ${err.message}. Check console for details.`)
      console.error('Load data error:', err)
    }
    
    setLoading(false)
  }

  const loadRecoveryRequests = async () => {
    try {
      const result = await recoveryAPI.getPendingRequests()
      if (result.success) {
        setRecoveryRequests(result.data || [])
      }
    } catch (err) {
      console.error('Failed to load recovery requests:', err)
    }
  }

  const handleResolveRecovery = async (requestId) => {
    try {
      const result = await recoveryAPI.resolveRequest(requestId)
      if (result.success) {
        setSuccess('Recovery request resolved!')
        setTimeout(() => setSuccess(''), 3000)
        loadRecoveryRequests() // Refresh the list
      } else {
        setError(result.message || 'Failed to resolve recovery request')
      }
    } catch (err) {
      setError('Failed to resolve recovery request')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const userData = {
      username: newUser.username,
      password: newUser.password,
      rank: newUser.rank,
    }

    if (newUser.rank === 'TEAM_LEAD' && newUser.teamId) {
      userData.teamId = parseInt(newUser.teamId)
    }

    const result = await userAPI.create(userData)

    if (result.success) {
      setSuccess(`User "${newUser.username}" created successfully!`)
      setNewUser({ username: '', password: '', rank: 'TEAM_LEAD', teamId: '' })
      setShowCreateUser(false)
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to create user')
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const result = await teamAPI.create(newTeam)

    if (result.success) {
      setSuccess(`Team "${newTeam.name}" created successfully!`)
      setNewTeam({ name: '', description: '' })
      setShowCreateTeam(false)
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to create team')
    }
  }

  const handleEditTeam = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const result = await teamAPI.update(editingTeam.id, {
      name: editingTeam.name,
      description: editingTeam.description
    })

    if (result.success) {
      setSuccess(`Team "${editingTeam.name}" updated successfully!`)
      setEditingTeam(null)
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to update team')
    }
  }

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!confirm(`Are you sure you want to delete team "${teamName}"?\n\nThis will unassign any Team Leads from this team.`)) return

    const result = await teamAPI.delete(teamId)
    if (result.success) {
      setSuccess(`Team "${teamName}" deleted successfully!`)
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to delete team')
    }
  }

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return

    const result = await userAPI.delete(userId)
    if (result.success) {
      setSuccess(`User "${username}" deleted successfully!`)
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to delete user')
    }
  }

  // User editing handlers
  const handleEditUser = (user) => {
    setEditingUser(user)
    setEditingUserUsername(user.username)
    setEditingUserNewPassword('')
    setEditingUserConfirmPassword('')
    setShowUsernameEdit(false)
    setShowPasswordEdit(false)
    setError('')
    setSuccess('')
  }

  const handleCancelEditUser = () => {
    setEditingUser(null)
    setEditingUserUsername('')
    setEditingUserNewPassword('')
    setEditingUserConfirmPassword('')
    setShowUsernameEdit(false)
    setShowPasswordEdit(false)
    setError('')
  }

  const handleSaveUsername = async () => {
    setError('')
    setSuccess('')

    if (editingUserUsername.trim() === editingUser.username) {
      setError('No changes to save')
      return
    }

    if (editingUserUsername.trim().length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    const confirmed = confirm(`Are you sure you want to change username from "${editingUser.username}" to "${editingUserUsername.trim()}"?`)
    if (!confirmed) return

    const result = await userAPI.update(editingUser.id, { username: editingUserUsername.trim() })
    
    if (result.success) {
      setSuccess(`Username updated to "${editingUserUsername.trim()}" successfully!`)
      setShowUsernameEdit(false)
      setEditingUserUsername(editingUserUsername.trim())
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to update username')
    }
  }

  const handleSavePassword = async () => {
    setError('')
    setSuccess('')

    if (!editingUserNewPassword || !editingUserConfirmPassword) {
      setError('Both password fields are required')
      return
    }

    if (editingUserNewPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (editingUserNewPassword !== editingUserConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    const confirmed = confirm(`Are you sure you want to reset the password for user "${editingUser.username}"?\n\nThis action cannot be undone.`)
    if (!confirmed) return

    const result = await userAPI.changePassword(editingUser.id, editingUserNewPassword)
    
    if (result.success) {
      setSuccess(`Password reset successfully for "${editingUser.username}"!`)
      setShowPasswordEdit(false)
      setEditingUserNewPassword('')
      setEditingUserConfirmPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to reset password')
    }
  }

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 'GUILD_MASTER':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 'COUNCIL':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'TEAM_LEAD':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-white text-2xl mb-4">Loading Account Manager...</div>
        <div className="text-gray-400 text-sm">
          If this takes too long, check the browser console (F12) for errors
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header with Cookie Notification */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Account Manager
              </span>
            </h1>
            <p className="text-gray-400 text-lg">Manage users and teams (Guild Master only)</p>
          </div>
          
          {/* Cookie Notification Icon */}
          <div className="relative">
            <button
              onClick={() => setShowRecoveryDropdown(!showRecoveryDropdown)}
              className="relative p-3 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/30 rounded-lg transition-all"
            >
              <span className="text-3xl">🍪</span>
              {recoveryRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {recoveryRequests.length}
                </span>
              )}
            </button>
            
            {/* Recovery Requests Dropdown */}
            {showRecoveryDropdown && (
              <div className="absolute right-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-xl border border-amber-500/30 rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-amber-500/20 bg-amber-900/20">
                  <h3 className="text-amber-200 font-bold text-lg flex items-center gap-2">
                    <span>🍪</span>
                    <span>Password Recovery Requests</span>
                  </h3>
                </div>
                
                {recoveryRequests.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <p className="text-4xl mb-2">✨</p>
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {recoveryRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border-b border-amber-500/10 hover:bg-amber-900/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-semibold text-lg">{request.username}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(request.created_at).toLocaleDateString()} at{' '}
                              {new Date(request.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-amber-600/20 text-amber-300 text-xs rounded-full">
                            Pending
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              // Find the user and start editing their password
                              const targetUser = users.find(u => u.username === request.username)
                              if (targetUser) {
                                setEditingUser(targetUser.id)
                                setShowPasswordEdit(true)
                                setShowUsernameEdit(false)
                                setShowRecoveryDropdown(false)
                                setEditingUserNewPassword('')
                                setEditingUserConfirmPassword('')
                                // Scroll to user in list
                                setTimeout(() => {
                                  const userElement = document.getElementById(`user-${targetUser.id}`)
                                  if (userElement) {
                                    userElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                  }
                                }, 100)
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleResolveRecovery(request.id)}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Create User Form */}
        {showCreateUser && (
          <div className="mb-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Rank</label>
                <select
                  value={newUser.rank}
                  onChange={(e) => setNewUser({ ...newUser, rank: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="GUILD_MASTER">Guild Master</option>
                  <option value="COUNCIL">Council</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                </select>
              </div>
              {newUser.rank === 'TEAM_LEAD' && (
                <div>
                  <label className="block text-gray-300 mb-2">Assign Team</label>
                  <select
                    value={newUser.teamId}
                    onChange={(e) => setNewUser({ ...newUser, teamId: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 cursor-pointer"
                    required
                  >
                    <option value="">Select a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Team Form */}
        {showCreateTeam && (
          <div className="mb-8 bg-gradient-to-br from-green-900/20 to-teal-900/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-green-500/30 text-white rounded-lg focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-green-500/30 text-white rounded-lg focus:outline-none focus:border-green-500 h-24"
                  placeholder="Optional team description..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users List */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Users ({users.length})</h2>
            
            {/* Create User Button - Centered */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowCreateUser(!showCreateUser)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
              >
                ➕ Create User
              </button>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  id={`user-${user.id}`}
                  className={`p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors ${
                    editingUser === user.id ? 'border-2 border-purple-500' : ''
                  }`}
                >
                  {editingUser && editingUser.id === user.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      {/* User Header */}
                      <div className="flex items-center space-x-4 pb-3 border-b border-purple-500/20">
                        <div className={`w-10 h-10 ${getRankBadgeColor(user.rank)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold">
                            {user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-sm text-gray-400">{user.rank.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {/* Change Username Section */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <button
                          onClick={() => setShowUsernameEdit(!showUsernameEdit)}
                          className="w-full flex items-center justify-between text-left mb-2"
                        >
                          <span className="text-white font-semibold">Change Username</span>
                          <span className="text-purple-400">{showUsernameEdit ? '−' : '+'}</span>
                        </button>

                        {showUsernameEdit && (
                          <div className="space-y-3 mt-3 border-t border-purple-500/20 pt-3">
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">New Username</label>
                              <input
                                type="text"
                                value={editingUserUsername}
                                onChange={(e) => setEditingUserUsername(e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500"
                                placeholder="Enter new username"
                                minLength={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveUsername}
                                className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold transition-all"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUserUsername(user.username)
                                  setShowUsernameEdit(false)
                                  setError('')
                                }}
                                className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-all"
                              >
                                Discard
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Change Password Section */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <button
                          onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                          className="w-full flex items-center justify-between text-left mb-2"
                        >
                          <span className="text-white font-semibold">Change Password</span>
                          <span className="text-purple-400">{showPasswordEdit ? '−' : '+'}</span>
                        </button>

                        {showPasswordEdit && (
                          <div className="space-y-3 mt-3 border-t border-purple-500/20 pt-3">
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">New Password</label>
                              <input
                                type="password"
                                value={editingUserNewPassword}
                                onChange={(e) => setEditingUserNewPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500"
                                placeholder="Enter new password"
                                minLength={6}
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Confirm Password</label>
                              <input
                                type="password"
                                value={editingUserConfirmPassword}
                                onChange={(e) => setEditingUserConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500"
                                placeholder="Confirm new password"
                                minLength={6}
                              />
                              {editingUserConfirmPassword && editingUserNewPassword !== editingUserConfirmPassword && (
                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSavePassword}
                                disabled={!editingUserNewPassword || !editingUserConfirmPassword || editingUserNewPassword !== editingUserConfirmPassword}
                                className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUserNewPassword('')
                                  setEditingUserConfirmPassword('')
                                  setShowPasswordEdit(false)
                                  setError('')
                                }}
                                className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-all"
                              >
                                Discard
                              </button>
                            </div>
                            <p className="text-gray-500 text-xs">
                              ⚠️ No current password required for admin reset
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Close Edit Button */}
                      <button
                        onClick={handleCancelEditUser}
                        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                      >
                        Close Edit Mode
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${getRankBadgeColor(user.rank)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold">
                            {user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-sm text-gray-400">{user.rank.replace('_', ' ')}</p>
                          {user.team_id && (
                            <p className="text-xs text-purple-400">Team ID: {user.team_id}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 rounded text-sm transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 rounded text-sm transition-all"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Teams List */}
          <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Teams ({teams.length})</h2>
            
            {/* Create Team Button - Centered */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowCreateTeam(!showCreateTeam)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
              >
                ➕ Create Team
              </button>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {editingTeam && editingTeam.id === team.id ? (
                    // Edit Mode
                    <form onSubmit={handleEditTeam} className="space-y-3">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Team Name</label>
                        <input
                          type="text"
                          required
                          value={editingTeam.name}
                          onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-green-500/30 text-white rounded-lg focus:outline-none focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Description</label>
                        <textarea
                          value={editingTeam.description || ''}
                          onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-green-500/30 text-white rounded-lg focus:outline-none focus:border-green-500"
                          rows="2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTeam(null)}
                          className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium text-lg">{team.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{team.description || 'No description'}</p>
                        <p className="text-xs text-teal-400 mt-2">Team ID: {team.id}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingTeam(team)}
                          className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 rounded text-sm transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 rounded text-sm transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
