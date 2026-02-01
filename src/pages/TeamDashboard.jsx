import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCurrentUser, hasRank } from '../utils/auth'
import { teamAPI } from '../utils/api'
import RichTextEditor from '../components/RichTextEditor'
import TeamCustomizer from '../components/TeamCustomizer'
import RoleRequirements from '../components/RoleRequirements'
import ApplicantCard from '../components/ApplicantCard'
import { useApplications } from '../contexts/ApplicationContext'

export default function TeamDashboard() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('roster')
  const [teamData, setTeamData] = useState(null)
  const [teamExpectations, setTeamExpectations] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Progress tracking state
  const [progressCompleted, setProgressCompleted] = useState(0)
  const [progressTotal, setProgressTotal] = useState(9)
  const [progressDifficulty, setProgressDifficulty] = useState('Normal')
  const [teamDirective, setTeamDirective] = useState('AOTC')
  const [saving, setSaving] = useState(false)
  
  // Track if this is the initial load to prevent auto-save on mount
  const isInitialLoad = useRef(true)
  
  // Theme customization state
  const [theme, setTheme] = useState({
    primary: '#a855f7', // Default purple
    accent: '#3b82f6'   // Default blue
  })
  
  // Role requirements state
  const [roleRequirements, setRoleRequirements] = useState([])
  
  // Expectations saving state
  const [savingExpectations, setSavingExpectations] = useState(false)
  const [expectationsSuccess, setExpectationsSuccess] = useState('')
  
  // Application submissions
  const { getSubmissionsByTeam, deleteSubmission, formDefinition } = useApplications()

  // Get user once and memoize to prevent re-renders
  const user = useMemo(() => getCurrentUser(), [])

  // Check if user can edit - ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS
  const canEdit = useMemo(() => {
    if (!user) return false
    return hasRank(['GUILD_MASTER', 'COUNCIL']) || 
           (user.rank === 'TEAM_LEAD' && user.team_id === parseInt(teamId))
  }, [teamId]) // user is memoized, only teamId can change

  // Fetch real team data from backend
  useEffect(() => {
    // Reset initial load flag when switching teams
    isInitialLoad.current = true
    
    const fetchTeamData = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Check permission first - Team Leads can only access their assigned team
        const currentUser = getCurrentUser()
        if (!currentUser) {
          navigate('/login')
          return
        }

        if (currentUser.rank === 'TEAM_LEAD' && currentUser.team_id !== parseInt(teamId)) {
          alert('You do not have access to this team')
          navigate('/teams')
          return
        }
        
        // Fetch team data from backend
        const result = await teamAPI.getById(teamId)
        
        if (result.success && result.data) {
          setTeamData(result.data)
          
          // Load team expectations from backend
          if (result.data.team_info && result.data.team_info.expectations) {
            setTeamExpectations(result.data.team_info.expectations)
          } else {
            setTeamExpectations('<p>Welcome to the team! Add your expectations here...</p>')
          }
          
          // Load progress data from backend
          if (result.data.progress) {
            setProgressCompleted(result.data.progress.completed || 0)
            setProgressTotal(result.data.progress.total || 9)
            setProgressDifficulty(result.data.progress.difficulty || 'Normal')
          } else {
            setProgressCompleted(0)
            setProgressTotal(9)
            setProgressDifficulty('Normal')
          }
          
          // Load team directive
          setTeamDirective(result.data.team_directive || 'AOTC')
          
          // Load theme data from backend
          if (result.data.team_info && result.data.team_info.theme) {
            setTheme({
              primary: result.data.team_info.theme.primary || '#a855f7',
              accent: result.data.team_info.theme.accent || '#3b82f6'
            })
          }
          
          // Load role requirements from backend
          if (result.data.team_info && result.data.team_info.roleRequirements) {
            setRoleRequirements(result.data.team_info.roleRequirements)
          }
          
          // Mark initial load as complete after a short delay
          // This ensures state updates have settled before enabling auto-save
          setTimeout(() => {
            isInitialLoad.current = false
          }, 100)
        } else {
          setError(result.message || 'Failed to load team data')
          setTimeout(() => navigate('/teams'), 2000)
        }
      } catch (err) {
        console.error('Error fetching team data:', err)
        setError('Failed to load team. Redirecting...')
        setTimeout(() => navigate('/teams'), 2000)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTeamData()
    // Only depend on teamId - navigate is stable, and we get user inside the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

  // Auto-save progress whenever it changes (but not on initial load)
  useEffect(() => {
    // Skip auto-save on initial load or if data isn't loaded yet
    if (isInitialLoad.current || loading || !teamData) return

    const saveProgress = async () => {
      setSaving(true)
      try {
        const progressData = {
          completed: progressCompleted,
          total: progressTotal,
          difficulty: progressDifficulty
        }

        const result = await teamAPI.update(teamId, { 
          progress: progressData,
          team_directive: teamDirective 
        })
        
        if (result.success) {
          console.log('✅ Progress and directive saved successfully:', progressData, teamDirective)
        } else {
          console.error('❌ Failed to save progress:', result.message)
        }
      } catch (err) {
        console.error('❌ Failed to save progress:', err)
      } finally {
        setSaving(false)
      }
    }

    // Debounce auto-save by 500ms to avoid too many API calls
    const timeoutId = setTimeout(saveProgress, 500)
    return () => clearTimeout(timeoutId)
  }, [progressCompleted, progressTotal, progressDifficulty, teamDirective, teamId, loading, teamData])

  // Auto-save theme whenever it changes (but not on initial load)
  useEffect(() => {
    // Skip auto-save on initial load or if data isn't loaded yet
    if (isInitialLoad.current || loading || !teamData) return

    const saveTheme = async () => {
      try {
        const teamInfo = teamData.team_info || {}
        const updatedTeamInfo = {
          ...teamInfo,
          theme: {
            primary: theme.primary,
            accent: theme.accent
          }
        }

        const result = await teamAPI.update(teamId, { team_info: updatedTeamInfo })
        
        if (result.success) {
          console.log('✅ Theme saved successfully:', theme)
        } else {
          console.error('❌ Failed to save theme:', result.message)
        }
      } catch (err) {
        console.error('❌ Failed to save theme:', err)
      }
    }

    // Debounce auto-save by 500ms to avoid too many API calls
    const timeoutId = setTimeout(saveTheme, 500)
    return () => clearTimeout(timeoutId)
  }, [theme, teamId, loading, teamData])

  // Auto-save role requirements whenever they change (but not on initial load)
  useEffect(() => {
    // Skip auto-save on initial load or if data isn't loaded yet
    if (isInitialLoad.current || loading || !teamData) return

    const saveRoleRequirements = async () => {
      try {
        const teamInfo = teamData.team_info || {}
        const updatedTeamInfo = {
          ...teamInfo,
          roleRequirements: roleRequirements
        }

        const result = await teamAPI.update(teamId, { team_info: updatedTeamInfo })
        
        if (result.success) {
          console.log('✅ Role requirements saved successfully:', roleRequirements)
        } else {
          console.error('❌ Failed to save role requirements:', result.message)
        }
      } catch (err) {
        console.error('❌ Failed to save role requirements:', err)
      }
    }

    // Debounce auto-save by 500ms to avoid too many API calls
    const timeoutId = setTimeout(saveRoleRequirements, 500)
    return () => clearTimeout(timeoutId)
  }, [roleRequirements, teamId, loading, teamData])

  // NOW we can have conditional returns after all hooks are called
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20"></div>
        <div className="text-white text-2xl animate-pulse">Loading team...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20"></div>
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4">⚠️ {error}</div>
          <Link
            to="/teams"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            ← Back to My Teams
          </Link>
        </div>
      </div>
    )
  }

  if (!teamData) {
    return null
  }

  // Save team expectations
  const handleSaveExpectations = async () => {
    setSavingExpectations(true)
    setExpectationsSuccess('')

    try {
      const updatedTeamInfo = { ...teamData.team_info, expectations: teamExpectations }
      const result = await teamAPI.update(teamId, { team_info: updatedTeamInfo })
      
      if (result.success) {
        console.log('✅ Team expectations saved successfully')
        setExpectationsSuccess('Saved successfully!')
        // Update local team data
        setTeamData({ ...teamData, team_info: updatedTeamInfo })
        // Clear success message after 3 seconds
        setTimeout(() => setExpectationsSuccess(''), 3000)
      } else {
        console.error('❌ Failed to save expectations:', result.message)
        alert('Failed to save expectations: ' + result.message)
      }
    } catch (err) {
      console.error('❌ Error saving expectations:', err)
      alert('Error saving expectations. Please try again.')
    } finally {
      setSavingExpectations(false)
    }
  }

  // Determine user's role display
  const getUserRole = () => {
    if (!user) return 'Member'
    if (user.rank === 'GUILD_MASTER') return 'Guild Master'
    if (user.rank === 'COUNCIL') return 'Council'
    if (user.rank === 'TEAM_LEAD') return 'Team Lead'
    return 'Member'
  }

  const tabs = [
    { id: 'roster', label: 'Team Roster', icon: '👥' },
    { id: 'requirements', label: 'Role Requirements', icon: '📋' },
    { id: 'expectations', label: 'Team Expectations', icon: '📝' },
    { id: 'applicants', label: 'Direct Applicants', icon: '📨' },
    { id: 'customizer', label: 'Team Customizer', icon: '🎨' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="h-20"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <span>←</span>
          <span>Back to My Teams</span>
        </Link>

        {/* Header */}
        <div 
          className="backdrop-blur-sm rounded-xl p-8 mb-8 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.accent}15 100%)`,
            border: `1px solid ${theme.primary}50`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {teamData.name}
              </h1>
              <p className="text-gray-400 text-lg mb-4">{teamData.description || 'No description'}</p>
              <div className="flex items-center gap-4">
                <span 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: `${theme.primary}33`,
                    borderWidth: '1px',
                    borderColor: `${theme.primary}80`,
                    color: theme.primary
                  }}
                >
                  <span className="text-lg">⭐</span>
                  <span>{getUserRole()}</span>
                </span>
                {canEdit && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
                    <span>✓</span>
                    <span>Edit Access</span>
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm mb-1">Team ID</div>
              <div className="text-white text-2xl font-bold">#{teamData.id}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300"
          style={{ border: `1px solid ${theme.primary}50` }}
        >
          {/* Tab Headers */}
          <div 
            className="flex overflow-x-auto transition-all duration-300"
            style={{ borderBottom: `1px solid ${theme.primary}50` }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap"
                style={activeTab === tab.id ? {
                  backgroundColor: `${theme.primary}33`,
                  color: 'white',
                  borderBottom: `2px solid ${theme.primary}`
                } : {
                  color: '#9ca3af'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#9ca3af'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Team Roster Tab */}
            {activeTab === 'roster' && (
              <div className="space-y-4">
                {/* Progress Tracker */}
                <div 
                  className="backdrop-blur-sm rounded-xl p-6 mb-6 transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.accent}15 100%)`,
                    border: `1px solid ${theme.primary}50`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-white font-semibold text-lg">Completed:</span>
                      
                      {/* Completed Dropdown */}
                      <select
                        value={progressCompleted}
                        onChange={(e) => setProgressCompleted(parseInt(e.target.value))}
                        disabled={!canEdit}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{
                          borderWidth: '1px',
                          borderColor: `${theme.primary}80`
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = `0 0 0 2px ${theme.primary}40`
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      
                      <span className="text-white font-bold text-xl">/</span>
                      
                      {/* Total Dropdown */}
                      <select
                        value={progressTotal}
                        onChange={(e) => setProgressTotal(parseInt(e.target.value))}
                        disabled={!canEdit}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{
                          borderWidth: '1px',
                          borderColor: `${theme.primary}80`
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = `0 0 0 2px ${theme.primary}40`
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      
                      {/* Difficulty Dropdown */}
                      <select
                        value={progressDifficulty}
                        onChange={(e) => setProgressDifficulty(e.target.value)}
                        disabled={!canEdit}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{
                          borderWidth: '1px',
                          borderColor: `${theme.primary}80`
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = `0 0 0 2px ${theme.primary}40`
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Heroic">Heroic</option>
                        <option value="Mythic">Mythic</option>
                      </select>
                    </div>
                    
                    {/* Team Directive Section */}
                    <div className="flex items-center gap-4">
                      <span className="text-white font-semibold text-lg">Team Directive:</span>
                      
                      {/* Team Directive Dropdown */}
                      <select
                        value={teamDirective}
                        onChange={(e) => setTeamDirective(e.target.value)}
                        disabled={!canEdit}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{
                          borderWidth: '1px',
                          borderColor: `${theme.primary}80`
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = `0 0 0 2px ${theme.primary}40`
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        <option value="Mythic CE">Mythic CE</option>
                        <option value="Mythic Progression">Mythic Progression</option>
                        <option value="AOTC / Light Mythic">AOTC / Light Mythic</option>
                        <option value="AOTC">AOTC</option>
                        <option value="Learning / Casual">Learning / Casual</option>
                      </select>
                    </div>
                    
                    {/* Saving Indicator */}
                    <div className="flex items-center gap-2">
                      {saving && (
                        <span 
                          className="text-sm flex items-center gap-2 transition-all"
                          style={{ color: theme.primary }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: theme.primary }}
                          ></div>
                          Saving...
                        </span>
                      )}
                      {!saving && !canEdit && (
                        <span className="text-sm text-gray-400 italic">View only</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Two-column layout: Main Roster (2/3) + Trial Roster (1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Roster - 2/3 width on desktop */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>👥</span>
                        <span>Roster</span>
                      </h2>
                      {canEdit && (
                        <button
                          disabled
                          className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg font-semibold cursor-not-allowed opacity-50 text-sm"
                        >
                          + Add Member
                        </button>
                      )}
                    </div>
                    
                    <div 
                      className="backdrop-blur-sm border rounded-xl p-8 text-center transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.accent}10 100%)`,
                        borderColor: `${theme.primary}40`
                      }}
                    >
                      <div className="text-5xl mb-3">⚔️</div>
                      <h3 className="text-lg font-semibold text-white mb-2">Main Roster</h3>
                      <p className="text-gray-400 text-sm">Core team members will appear here</p>
                      <p className="text-gray-500 text-xs mt-1">Full member management coming soon</p>
                    </div>
                  </div>

                  {/* Trial Roster - 1/3 width on desktop */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>🎯</span>
                        <span>Trials</span>
                      </h2>
                      {canEdit && (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg font-semibold cursor-not-allowed opacity-50 text-xs"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    
                    <div 
                      className="backdrop-blur-sm border rounded-xl p-6 text-center transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}10 0%, ${theme.primary}10 100%)`,
                        borderColor: `${theme.accent}40`
                      }}
                    >
                      <div className="text-4xl mb-3">🌱</div>
                      <h3 className="text-base font-semibold text-white mb-2">Trial Members</h3>
                      <p className="text-gray-400 text-xs">Probationary members will appear here</p>
                      <p className="text-gray-500 text-xs mt-1">Management coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Role Requirements Tab */}
            {activeTab === 'requirements' && (
              <RoleRequirements 
                roleRequirements={roleRequirements} 
                setRoleRequirements={setRoleRequirements} 
                canEdit={canEdit}
                theme={theme}
              />
            )}

            {/* Team Expectations Tab */}
            {activeTab === 'expectations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Team Expectations</h2>
                  {!canEdit && (
                    <span className="text-sm text-gray-400 italic">View only</span>
                  )}
                </div>

                {canEdit ? (
                  <div>
                    <p className="text-gray-400 text-sm mb-4">
                      Define your team's expectations, rules, and guidelines below.
                    </p>
                    <RichTextEditor 
                      content={teamExpectations} 
                      onChange={setTeamExpectations} 
                    />
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={handleSaveExpectations}
                        disabled={savingExpectations}
                        className="px-6 py-3 text-white rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: `linear-gradient(135deg, var(--team-primary) 0%, var(--team-accent) 100%)`
                        }}
                      >
                        {savingExpectations ? '💾 Saving...' : '💾 Save Expectations'}
                      </button>
                      <button
                        onClick={() => setTeamExpectations('<p>Welcome to the team! Add your expectations here...</p>')}
                        disabled={savingExpectations}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reset
                      </button>
                      {expectationsSuccess && (
                        <span className="text-green-400 text-sm font-semibold flex items-center gap-2">
                          <span>✓</span> {expectationsSuccess}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6" style={{ borderColor: 'var(--team-primary)50' }}>
                    <div 
                      className="team-expectations-content text-white"
                      dangerouslySetInnerHTML={{ __html: teamExpectations }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Direct Applicants Tab */}
            {activeTab === 'applicants' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Direct Applicants</h2>
                  <span className="text-gray-400 text-sm">
                    {getSubmissionsByTeam(teamId).length} application(s)
                  </span>
                </div>

                {getSubmissionsByTeam(teamId).length === 0 ? (
                  <div className="text-center py-16 bg-white/5 border border-purple-500/20 rounded-lg" style={{ borderColor: 'var(--team-primary)50' }}>
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-400 text-xl mb-2">No applications yet</p>
                    <p className="text-gray-500 text-sm">Applications submitted through the "Apply Here" page will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getSubmissionsByTeam(teamId).map((submission) => (
                      <ApplicantCard
                        key={submission.id}
                        submission={submission}
                        formDefinition={formDefinition}
                        canEdit={canEdit}
                        onDelete={deleteSubmission}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Team Customizer Tab */}
            {activeTab === 'customizer' && (
              <TeamCustomizer theme={theme} setTheme={setTheme} canEdit={canEdit} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
