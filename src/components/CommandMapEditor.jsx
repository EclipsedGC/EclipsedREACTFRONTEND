import { useState, useEffect } from 'react'
import { rolesAPI, userAPI } from '../utils/api'
import { getCurrentUser } from '../utils/auth'

export default function CommandMapEditor() {
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])

  const currentUser = getCurrentUser()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rolesResult, usersResult] = await Promise.all([
        rolesAPI.getAll(),
        userAPI.getAll()
      ])

      if (rolesResult.success) {
        setRoles(rolesResult.data)
      }
      if (usersResult.success) {
        setUsers(usersResult.data)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('Load data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (roleId, updates) => {
    try {
      const result = await rolesAPI.update(roleId, updates)
      if (result.success) {
        await loadData()
        setEditingRole(null)
      } else {
        alert(result.message || 'Failed to update role')
      }
    } catch (err) {
      alert('Failed to update role')
      console.error('Update role error:', err)
    }
  }

  const handleAssignUser = async (roleId, userId) => {
    try {
      const result = await rolesAPI.assignUser(roleId, userId)
      if (result.success) {
        await loadData()
      } else {
        alert(result.message || 'Failed to assign user')
      }
    } catch (err) {
      alert('Failed to assign user')
      console.error('Assign user error:', err)
    }
  }

  const handleRemoveUser = async (roleId, userId) => {
    if (!confirm('Remove this user from the role?')) return

    try {
      const result = await rolesAPI.removeUser(roleId, userId)
      if (result.success) {
        await loadData()
      } else {
        alert(result.message || 'Failed to remove user')
      }
    } catch (err) {
      alert('Failed to remove user')
      console.error('Remove user error:', err)
    }
  }

  const handleSeedRoles = async () => {
    if (!confirm('This will reset all roles to default values. Continue?')) return

    try {
      const result = await rolesAPI.seed()
      if (result.success) {
        await loadData()
        alert('Roles seeded successfully')
      } else {
        alert(result.message || 'Failed to seed roles')
      }
    } catch (err) {
      alert('Failed to seed roles')
      console.error('Seed roles error:', err)
    }
  }

  // Group roles by cluster level
  const groupedRoles = {
    'top-command': [],
    'middle-management': [],
    'recruiting-specialists': [],
    'team-leadership': []
  }

  roles.forEach(role => {
    if (groupedRoles[role.cluster_level]) {
      groupedRoles[role.cluster_level].push(role)
    }
  })

  const RoleCard = ({ role }) => {
    const isEditing = editingRole?.id === role.id
    const [name, setName] = useState(role.name)
    const [description, setDescription] = useState(role.description)

    // Update local state when role changes or when entering edit mode
    useEffect(() => {
      setName(role.name)
      setDescription(role.description)
    }, [role.name, role.description, isEditing])

    return (
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="Role name"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="Role description"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateRole(role.id, { name, description })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-purple-300">{role.name}</h4>
              <button
                onClick={() => setEditingRole(role)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                ✏️ Edit
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-3">{role.description || 'No description'}</p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400">Assigned Users:</span>
                <button
                  onClick={() => setShowAssignModal(role)}
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
                >
                  + Assign
                </button>
              </div>

              {role.assigned_users && role.assigned_users.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {role.assigned_users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-200 rounded border border-purple-500/30 text-xs"
                    >
                      <span>{user.username}</span>
                      <button
                        onClick={() => handleRemoveUser(role.id, user.id)}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No users assigned</p>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  const LevelSection = ({ level, title }) => {
    const levelRoles = groupedRoles[level]
    if (!levelRoles || levelRoles.length === 0) return null

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {title}
          </span>
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {levelRoles.map(role => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Command Map Editor
          </span>
        </h2>
        <button
          onClick={handleSeedRoles}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm"
        >
          🔄 Reset to Default Roles
        </button>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-lg text-sm">
        <p className="font-semibold mb-1">📝 Instructions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click "Edit" on any role to modify its name or description</li>
          <li>Click "+ Assign" to add users to a role</li>
          <li>Click "×" next to a username to remove them from a role</li>
          <li>Changes are visible immediately on the public "Meet Our Officers" page</li>
        </ul>
      </div>

      {/* Role Sections */}
      <LevelSection level="top-command" title="Top Command Roles" />
      <LevelSection level="middle-management" title="Management Roles" />
      <LevelSection level="recruiting-specialists" title="Recruitment Specialists" />
      <LevelSection level="team-leadership" title="Team Leadership" />

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-purple-300">
                Assign User to {showAssignModal.name}
              </h3>
              <button
                onClick={() => setShowAssignModal(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map(user => {
                const isAssigned = showAssignModal.assigned_users?.some(u => u.id === user.id)
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (!isAssigned) {
                        handleAssignUser(showAssignModal.id, user.id)
                        setShowAssignModal(null)
                      }
                    }}
                    disabled={isAssigned}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isAssigned
                        ? 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 hover:border-purple-500/50 text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{user.username}</div>
                        <div className="text-xs text-gray-400">{user.rank}</div>
                      </div>
                      {isAssigned && <span className="text-xs text-green-400">✓ Assigned</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setShowAssignModal(null)}
              className="mt-6 w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
