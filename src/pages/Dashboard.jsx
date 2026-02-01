import { getCurrentUser } from '../utils/auth'
import { Link, useNavigate } from 'react-router-dom'
import { useApplications } from '../contexts/ApplicationContext'
import { useState, useEffect, useRef } from 'react'
import { teamAPI, userAPI, rolesAPI } from '../utils/api'

export default function Dashboard() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const { getSubmissionsByTeam, submissions, formDefinition } = useApplications()
  const [teams, setTeams] = useState([])
  const [profileData, setProfileData] = useState({
    bio: '',
    discordUsername: '',
    warcraftLogsUrl: ''
  })
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const hasLoadedData = useRef(false) // Prevent multiple loads

  // Load teams and profile in parallel
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    
    // Only load once
    if (hasLoadedData.current) return
    hasLoadedData.current = true
    
    const loadData = async () => {
      setLoading(true)
      try {
        // Make all API calls in parallel
        const [teamsResult, profileResult, rolesResult] = await Promise.all([
          teamAPI.getAll().catch(err => {
            console.error('Teams API error:', err)
            return { success: false, data: [] }
          }),
          userAPI.getOwnProfile().catch(err => {
            console.error('Profile API error:', err)
            return { success: false, data: {} }
          }),
          rolesAPI.getAll().catch(err => {
            console.error('Roles API error:', err)
            return { success: false, data: [] }
          })
        ])

        if (teamsResult.success) {
          setTeams(teamsResult.data)
        }

        if (profileResult.success) {
          setProfileData({
            bio: profileResult.data.bio || '',
            discordUsername: profileResult.data.discord_username || '',
            warcraftLogsUrl: profileResult.data.warcraft_logs_url || ''
          })
        }

        // Extract roles assigned to current user
        if (rolesResult.success && rolesResult.data) {
          const assignedRoles = []
          rolesResult.data.forEach(role => {
            if (role.assigned_users && role.assigned_users.some(u => u.id === user.id)) {
              assignedRoles.push({
                id: role.id,
                name: role.name,
                cluster_name: role.cluster_name
              })
            }
          })
          setUserRoles(assignedRoles)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Get team name helper
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === parseInt(teamId))
    return team?.name || `Team #${teamId}`
  }

  // Rank color gradient helper
  const getRankColor = (rank) => {
    switch (rank) {
      case 'GUILD_MASTER':
        return 'from-amber-500 to-yellow-500'
      case 'COUNCIL':
        return 'from-purple-500 to-pink-500'
      case 'TEAM_LEAD':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  // Stats data - updated based on role
  const stats = [
    {
      label: 'My Team',
      value: user?.team_id 
        ? getTeamName(user.team_id) 
        : (user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL')
          ? `${teams.length} ${teams.length === 1 ? 'Team' : 'Teams'}`
          : 'Unassigned',
      icon: '🏢',
      show: true, // Always show
    },
    {
      label: 'Guild Events',
      value: '3 Upcoming',
      icon: '📅',
      show: true, // Always show
    },
    {
      label: 'Account Manager',
      value: 'Manage Users',
      icon: '👤',
      show: user?.rank === 'GUILD_MASTER', // Only Guildmaster
    },
    {
      label: 'Command Map Editor',
      value: 'Edit Roles',
      icon: '🗺️',
      show: user?.rank === 'GUILD_MASTER', // Only Guildmaster
    },
    {
      label: 'Form Creator',
      value: 'Create Forms',
      icon: '📋',
      show: user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL', // Guildmaster and Council
    },
    {
      label: 'Direct Applicants',
      value: user?.team_id ? getSubmissionsByTeam(user.team_id).length : 0,
      icon: '📩',
      highlight: user?.rank === 'TEAM_LEAD',
      show: user?.rank === 'TEAM_LEAD' && user?.team_id, // Only Team Leads with assigned teams
    },
    {
      label: 'Team Applicants',
      value: submissions.length,
      icon: '👤',
      highlight: user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL',
      show: user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL', // Only Admins
    },
    {
      label: 'Guild Applicants',
      value: 0, // Not yet implemented
      icon: '📝',
      show: true, // All users
    }
  ].filter(stat => stat.show) // Filter to only show relevant stats

  // Recent activity (placeholder data)
  const activities = [
    { action: 'Form submitted: Application #42', time: '2 hours ago', icon: '📝' },
    { action: 'Team roster updated', time: 'Yesterday', icon: '👥' },
    { action: 'New guild event posted', time: '2 days ago', icon: '🎯' },
  ]

  if (!user) {
    navigate('/login')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-20"></div>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Welcome back, {user.username}
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Here's what's happening with your account</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* My Profile Card */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 transition-all duration-300 hover:border-purple-400/50 hover:scale-105">
            <h2 className="text-xl font-bold text-white mb-4">My Profile</h2>
            
            <div className="flex items-start gap-4 mb-4">
              {/* Left Side: Avatar, Username, and Roles */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getRankColor(user?.rank)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl font-bold text-white">
                      {user?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white font-medium text-lg">{user?.username}</p>
                </div>
                
                {/* Display assigned roles if any */}
                {userRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-[76px]">
                    {userRoles.map(role => (
                      <div 
                        key={role.id}
                        className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 leading-tight"
                        title={role.name}
                      >
                        {role.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Right Side: Discord and Bio */}
              <div className="flex-1 min-w-0">
                {profileData.discordUsername && (
                  <div className="mb-2">
                    <p className="text-purple-400 text-xs font-semibold mb-0.5">DISCORD</p>
                    <p className="text-white text-sm">{profileData.discordUsername}</p>
                  </div>
                )}
                {profileData.bio && (
                  <div>
                    <p className="text-purple-400 text-xs font-semibold mb-0.5">BIO</p>
                    <p className="text-gray-300 text-xs line-clamp-3">{profileData.bio}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between items-center pb-2 border-b border-purple-500/20">
                <span className="text-gray-400">User ID</span>
                <span className="text-white font-medium">#{user.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-purple-500/20">
                <span className="text-gray-400">Rank</span>
                <span className={`font-semibold ${
                  user.rank === 'GUILD_MASTER' ? 'text-yellow-400' :
                  user.rank === 'COUNCIL' ? 'text-purple-400' :
                  user.rank === 'TEAM_LEAD' ? 'text-blue-400' :
                  'text-gray-400'
                }`}>
                  {user.rank.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-purple-500/20">
                <span className="text-gray-400">Team ID</span>
                <span className="text-white font-medium">
                  {user.team_id ? `#${user.team_id}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-purple-500/20">
                <span className="text-gray-400">Status</span>
                <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                  {user.status}
                </span>
              </div>
            </div>

            <Link
              to="/profile/edit"
              className="w-full block text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all"
            >
              Edit Profile
            </Link>
          </div>

          {/* Stats Grid - Remaining 2 columns */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                onClick={() => {
                  // Navigate to applicants page when clicking Direct Applicants or Team Applicants
                  if (stat.label === 'Direct Applicants' || stat.label === 'Team Applicants') {
                    navigate('/applicants')
                  }
                  // Navigate to teams page when clicking My Team
                  if (stat.label === 'My Team') {
                    navigate('/teams')
                  }
                  // Navigate to account manager when clicking Account Manager
                  if (stat.label === 'Account Manager') {
                    navigate('/account-manager')
                  }
                  // Navigate to command map editor when clicking Command Map Editor
                  if (stat.label === 'Command Map Editor') {
                    navigate('/command-map-editor')
                  }
                  // Navigate to form creator when clicking Form Creator
                  if (stat.label === 'Form Creator') {
                    navigate('/form-creator')
                  }
                  // Guild Applicants is not clickable (coming soon)
                }}
                className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 transition-all duration-300 ${
                  (stat.label === 'Direct Applicants' || stat.label === 'Team Applicants' || stat.label === 'My Team' || stat.label === 'Account Manager' || stat.label === 'Command Map Editor' || stat.label === 'Form Creator')
                    ? 'hover:border-purple-400/50 hover:scale-105 cursor-pointer' 
                    : stat.label === 'Guild Applicants'
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:border-purple-400/50 hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  {stat.highlight && stat.value > 0 && (
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full animate-pulse">
                      New
                    </span>
                  )}
                  {stat.label === 'Guild Applicants' && (
                    <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
                {stat.label === 'Guild Applicants' ? (
                  <p className="text-gray-400 text-sm italic">Will be added soon</p>
                ) : (
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions - Only for Guild Master and Council */}
          {(user.rank === 'GUILD_MASTER' || user.rank === 'COUNCIL') && (
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/teams"
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-purple-500/20 hover:border-purple-400/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏢</span>
                    <span className="text-white font-medium">View Teams</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>

                <Link
                  to="/content-editor"
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-purple-500/20 hover:border-purple-400/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✍️</span>
                    <span className="text-white font-medium">Content Editor</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 ${
            user.rank === 'TEAM_LEAD' ? 'lg:col-span-2' : ''
          }`}>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-purple-500/10"
                >
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
