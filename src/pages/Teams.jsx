import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { teamAPI } from '../utils/api'
import { getCurrentUser, canAccessTeam } from '../utils/auth'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = getCurrentUser()

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await teamAPI.getAll()
      
      if (result.success) {
        setTeams(result.data)
      } else {
        setError(result.message || 'Failed to load teams')
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error('Load teams error:', err)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-20"></div>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Loading Teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                My Teams
              </span>
            </h1>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-gray-400 text-lg">
            {user?.rank === 'TEAM_LEAD' && 'Manage your assigned team'}
            {user?.rank === 'COUNCIL' && 'Manage all guild teams'}
            {user?.rank === 'GUILD_MASTER' && 'Manage all guild teams'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* User Rank Info */}
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Your access level:</p>
              <p className="text-white font-semibold text-lg">{user?.rank?.replace('_', ' ')}</p>
            </div>
            <div className="text-sm text-gray-400">
              {user?.rank === 'TEAM_LEAD' && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Limited to your assigned team
                </span>
              )}
              {(user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL') && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Full access to all teams
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-400 text-xl">No teams available</p>
            {user?.rank === 'GUILD_MASTER' && (
              <Link
                to="/account-manager"
                className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
              >
                Create a Team
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const canEdit = canAccessTeam(user, team.id)
              
              // Get team theme colors or use defaults
              const teamTheme = team.team_info?.theme || { primary: '#a855f7', accent: '#3b82f6' }
              
              // Debug: Log theme data for first render
              if (team.id === teams[0].id) {
                console.log(`Team "${team.name}" theme:`, teamTheme)
              }
              
              return (
                <div
                  key={team.id}
                  className="relative backdrop-blur-sm rounded-xl p-6 transition-all duration-300"
                  style={canEdit ? {
                    background: `linear-gradient(135deg, ${teamTheme.primary}15 0%, ${teamTheme.accent}15 100%)`,
                    border: `2px solid ${teamTheme.primary}50`
                  } : {
                    background: 'rgba(31, 41, 55, 0.2)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    opacity: 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (canEdit) {
                      e.currentTarget.style.borderColor = `${teamTheme.primary}80`
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canEdit) {
                      e.currentTarget.style.borderColor = `${teamTheme.primary}50`
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  {/* Access Indicator */}
                  <div className="absolute top-4 right-4">
                    {canEdit ? (
                      <span className="flex items-center text-xs text-green-400">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                        Can Edit
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-gray-500">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                        No Access
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{team.name}</h3>
                    <p className="text-gray-400 text-sm">{team.description || 'No description'}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Team ID:</span>
                      <span 
                        className="font-semibold"
                        style={{ color: teamTheme.primary }}
                      >
                        #{team.id}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(team.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {canEdit ? (
                    <Link
                      to={`/teams/${team.id}`}
                      className="block w-full py-2 text-white text-center rounded-lg font-semibold transition-all hover:opacity-90"
                      style={{
                        background: `linear-gradient(135deg, ${teamTheme.primary} 0%, ${teamTheme.accent} 100%)`
                      }}
                    >
                      📊 View Dashboard
                    </Link>
                  ) : (
                    <div className="w-full py-2 bg-gray-700/50 text-gray-400 text-center rounded-lg font-semibold cursor-not-allowed">
                      🔒 No Access
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
