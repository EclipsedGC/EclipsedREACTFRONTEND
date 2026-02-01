import { useState, useEffect } from 'react'
import { rolesAPI } from '../utils/api'

export default function CommandFlowMap() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const result = await rolesAPI.getAll()
      
      if (result.success) {
        setRoles(result.data)
      } else {
        setError(result.message || 'Failed to load roles')
      }
    } catch (err) {
      setError('Failed to load command structure')
      console.error('Load roles error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group by users instead of roles
  const getUserRolesMap = () => {
    const userMap = {}
    
    roles.forEach(role => {
      if (role.assigned_users && role.assigned_users.length > 0) {
        role.assigned_users.forEach(user => {
          if (!userMap[user.id]) {
            userMap[user.id] = {
              id: user.id,
              username: user.username,
              roles: []
            }
          }
          userMap[user.id].roles.push({
            id: role.id,
            name: role.name,
            description: role.description,
            cluster_level: role.cluster_level,
            cluster_name: role.cluster_name
          })
        })
      }
    })

    return Object.values(userMap)
  }

  // Group users by cluster level
  const groupUsersByLevel = () => {
    const users = getUserRolesMap()
    const grouped = {
      'top-command': [],
      'middle-management': [],
      'recruiting-specialists': [],
      'team-leadership': []
    }

    users.forEach(user => {
      // Assign user to their highest level role
      if (user.roles.some(r => r.cluster_level === 'top-command')) {
        grouped['top-command'].push(user)
      } else if (user.roles.some(r => r.cluster_level === 'middle-management')) {
        grouped['middle-management'].push(user)
      } else if (user.roles.some(r => r.cluster_level === 'recruiting-specialists')) {
        grouped['recruiting-specialists'].push(user)
      } else if (user.roles.some(r => r.cluster_level === 'team-leadership')) {
        grouped['team-leadership'].push(user)
      }
    })

    return grouped
  }

  const UserCard = ({ user }) => (
    <button
      onClick={() => setSelectedUser(user)}
      className="group relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-500/10 hover:border-purple-400/30 rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/5 w-full text-left"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/3 group-hover:to-blue-600/3 transition-all duration-300"></div>
      
      <div className="relative z-10">
        {/* User Avatar and Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400/80 via-purple-500/80 to-blue-500/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-lg font-semibold text-white">
              {user.username[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors truncate">
              {user.username}
            </h3>
            <p className="text-xs text-purple-300/40">
              {user.roles.length} {user.roles.length === 1 ? 'role' : 'roles'}
            </p>
          </div>
        </div>

        {/* Roles List - Compact */}
        <div className="space-y-1.5">
          {user.roles.map((role) => (
            <div 
              key={role.id}
              className="text-xs text-gray-300/80 bg-white/5 rounded-md px-3 py-1.5 border border-white/5 group-hover:bg-white/8 transition-all"
            >
              {role.name}
            </div>
          ))}
        </div>

        {/* Subtle click indicator */}
        <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-purple-400/40 group-hover:text-purple-400/70 transition-colors">
          <span className="text-[10px]">View details</span>
          <span className="group-hover:translate-x-0.5 transition-transform text-[10px]">→</span>
        </div>
      </div>
    </button>
  )

  const LevelSection = ({ level, title, users }) => {
    if (!users || users.length === 0) return null

    // Special layout for recruiting specialists - horizontal display
    const isRecruitingSpecialists = level === 'recruiting-specialists'

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          <h2 className="px-6 text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>
        
        <div className={`grid gap-6 ${
          isRecruitingSpecialists 
            ? 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto' 
            : users.length === 1 
              ? 'grid-cols-1 max-w-md mx-auto' 
              : users.length === 2 
                ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {users.map(user => (
            <UserCard key={user.id} user={user} />
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

  const groupedUsers = groupUsersByLevel()
  const totalUsers = Object.values(groupedUsers).flat().length

  return (
    <div className="relative">
      {totalUsers === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-purple-300 mb-3">No Officers Assigned Yet</h3>
          <p className="text-gray-400 mb-6">
            Officers will appear here once they've been assigned to leadership roles.
          </p>
          <p className="text-sm text-gray-500">
            Guild Masters can assign roles from the Command Map Editor in the dashboard.
          </p>
        </div>
      ) : (
        <>
          {/* Command Flow Map - Organized by Users */}
          <div className="space-y-8">
            <LevelSection
              level="top-command"
              title="Top Command"
              users={groupedUsers['top-command']}
            />
            
            <LevelSection
              level="middle-management"
              title="Management"
              users={groupedUsers['middle-management']}
            />
            
            <LevelSection
              level="recruiting-specialists"
              title="Recruiting Specialists"
              users={groupedUsers['recruiting-specialists']}
            />
            
            <LevelSection
              level="team-leadership"
              title="Team Leadership"
              users={groupedUsers['team-leadership']}
            />
          </div>
        </>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {selectedUser.username[0].toUpperCase()}
                  </span>
                </div>
                <h2 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                    {selectedUser.username}
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-purple-300 mb-3">Leadership Roles</h3>
                <div className="space-y-3">
                  {selectedUser.roles.map(role => (
                    <div 
                      key={role.id}
                      className="bg-black/30 rounded-lg p-4 border border-purple-500/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                            {role.cluster_name}
                          </span>
                          <h4 className="text-lg font-semibold text-white mt-1">
                            {role.name}
                          </h4>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
