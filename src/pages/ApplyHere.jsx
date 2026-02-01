import { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import Modal from '../components/Modal'
import ApplicationForm from '../components/ApplicationForm'
import { useApplications } from '../contexts/ApplicationContext'

const API_BASE = 'http://localhost:3001'

export default function ApplyHere() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null) // For expectations modal
  const [applyingTeam, setApplyingTeam] = useState(null) // For apply modal
  const { formDefinition, addSubmission } = useApplications()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    setLoading(true)
    setError('')
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setError('Request timed out. Please check if the server is running.')
      setLoading(false)
    }, 10000) // 10 second timeout
    
    try {
      // Fetch public team data (no auth required for public page)
      const response = await fetch(`${API_BASE}/api/teams/public`)
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTeams(data.data)
      } else {
        setError(data.message || 'Failed to load teams')
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('Error fetching teams:', err)
      setError(`Failed to load teams: ${err.message}. Make sure the backend server is running on port 3001.`)
    } finally {
      setLoading(false)
    }
  }

  const openExpectationsModal = (team) => {
    setSelectedTeam(team)
  }

  const closeExpectationsModal = () => {
    setSelectedTeam(null)
  }

  const openApplyModal = (team) => {
    setApplyingTeam(team)
  }

  const closeApplyModal = () => {
    setApplyingTeam(null)
  }

  const handleApplicationSubmit = async (identity, answers) => {
    if (!applyingTeam) return

    // Add submission to context (with new signature: teamId, identity, answers)
    addSubmission(applyingTeam.id, identity, answers)

    // Show success message
    alert(`✅ Application submitted successfully to ${applyingTeam.name}!\n\nYour application has been received and will be reviewed by the team leads.`)

    // Close modal
    closeApplyModal()
  }

  // Helper function to format progress badge
  const formatProgressBadge = (progress) => {
    if (!progress || !progress.completed || !progress.total) return null
    if (progress.completed === 0 && progress.total === 0) return null
    
    const difficultyMap = {
      'Mythic': 'M',
      'Heroic': 'H',
      'Normal': 'N'
    }
    
    const difficultyLetter = difficultyMap[progress.difficulty] || 'N'
    return `${progress.completed}/${progress.total} ${difficultyLetter}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20"></div>
        <div className="text-white text-2xl animate-pulse">Loading teams...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20"></div>
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4">⚠️ {error}</div>
          <button
            onClick={fetchTeams}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="h-20"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Join Our Guild
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore our teams and find the perfect fit for your playstyle. Click on any team to learn more about their expectations.
          </p>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-400 text-xl">No teams available for recruitment at this time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const teamTheme = team.team_info?.theme || { primary: '#a855f7', accent: '#3b82f6' }
              const roleRequirements = team.team_info?.roleRequirements || []
              const isRecruiting = roleRequirements.length > 0
              const progressBadge = formatProgressBadge(team.progress)

              return (
                <div
                  key={team.id}
                  className="relative backdrop-blur-sm rounded-xl p-6 transition-all duration-300 cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${teamTheme.primary}10 0%, ${teamTheme.accent}10 100%)`,
                    border: `2px solid ${teamTheme.primary}40`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${teamTheme.primary}80`
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${teamTheme.primary}40`
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onClick={() => openExpectationsModal(team)}
                >
                  {/* Top Right Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    {/* Progress Badge */}
                    {progressBadge && (
                      <span 
                        className="text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm"
                        style={{
                          backgroundColor: `${teamTheme.accent}60`,
                          color: 'white',
                          border: `1px solid ${teamTheme.accent}80`
                        }}
                      >
                        {progressBadge}
                      </span>
                    )}
                    
                    {/* Recruiting Status Badge */}
                    {isRecruiting ? (
                      <span className="flex items-center text-xs font-semibold px-3 py-1 bg-green-600/80 text-white rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                        RECRUITING
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-semibold px-3 py-1 bg-red-600/80 text-white rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                        NOT RECRUITING
                      </span>
                    )}
                  </div>

                  {/* Team Name */}
                  <div className="mb-4 pr-28">
                    <h3 
                      className="text-2xl font-bold mb-2"
                      style={{ color: teamTheme.primary }}
                    >
                      {team.name}
                    </h3>
                    
                    {/* Team Directive */}
                    {team.team_directive && (
                      <div className="mb-2">
                        <span 
                          className="text-xs font-semibold px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${teamTheme.primary}20`,
                            color: teamTheme.primary
                          }}
                        >
                          {team.team_directive}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-gray-400 text-sm">{team.description || 'No description'}</p>
                  </div>

                  {/* Role Requirements */}
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2 text-sm">Roles Needed:</h4>
                    {isRecruiting ? (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {roleRequirements.slice(0, 8).map((req, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm p-2 rounded"
                            style={{
                              backgroundColor: `${teamTheme.primary}15`,
                              borderLeft: `3px solid ${teamTheme.primary}`
                            }}
                          >
                            <span className="text-white font-medium">{req.class}</span>
                            <span className="text-gray-400">{req.spec}</span>
                          </div>
                        ))}
                        {roleRequirements.length > 8 && (
                          <p className="text-gray-400 text-xs mt-2">
                            +{roleRequirements.length - 8} more...
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">Not currently recruiting</p>
                    )}
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openApplyModal(team)
                    }}
                    disabled={!isRecruiting}
                    className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: isRecruiting 
                        ? `linear-gradient(135deg, ${teamTheme.primary} 0%, ${teamTheme.accent} 100%)`
                        : '#374151'
                    }}
                    onMouseEnter={(e) => {
                      if (isRecruiting) {
                        e.target.style.opacity = '0.9'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isRecruiting) {
                        e.target.style.opacity = '1'
                      }
                    }}
                  >
                    {isRecruiting ? '📝 APPLY HERE' : '🔒 NOT RECRUITING'}
                  </button>

                  {/* Click for more info hint */}
                  <p className="text-center text-gray-500 text-xs mt-2">
                    Click card for team expectations
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal for Team Expectations */}
      {selectedTeam && (
        <Modal
          isOpen={!!selectedTeam}
          onClose={closeExpectationsModal}
          title={`${selectedTeam.name} - Team Expectations`}
        >
          <div 
            className="team-expectations-content text-white"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(
                selectedTeam.team_info?.expectations || '<p>No expectations set yet.</p>',
                {
                  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr', 'span', 'img'],
                  ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'data-gradient', 'data-align', 'src', 'alt', 'class', 'width', 'height'],
                  ALLOW_DATA_ATTR: true,
                  KEEP_CONTENT: true,
                }
              ) 
            }}
          />
        </Modal>
      )}

      {/* Modal for Application Form */}
      {applyingTeam && (
        <Modal
          isOpen={!!applyingTeam}
          onClose={closeApplyModal}
          title="Application Form"
        >
          <ApplicationForm
            systemFields={formDefinition.systemFields || {
              warcraftLogsUrl: { type: 'url', label: 'Warcraft Logs URL', required: false },
              region: { type: 'select', label: 'Region', options: ['US', 'EU', 'KR', 'TW'], required: false },
              realm: { type: 'text', label: 'Realm', required: false },
              characterName: { type: 'text', label: 'Character Name', required: false }
            }}
            questions={formDefinition.questions || []}
            onSubmit={handleApplicationSubmit}
            onCancel={closeApplyModal}
            teamName={applyingTeam.name}
          />
        </Modal>
      )}
    </div>
  )
}
