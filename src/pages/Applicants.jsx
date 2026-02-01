import { getCurrentUser } from '../utils/auth'
import { Link } from 'react-router-dom'
import { useApplications } from '../contexts/ApplicationContext'
import { useState, useEffect } from 'react'
import { teamAPI } from '../utils/api'

export default function Applicants() {
  const user = getCurrentUser()
  const { getSubmissionsByTeam, submissions, formDefinition } = useApplications()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Load teams for display names
  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true)
      try {
        const result = await teamAPI.getAll()
        if (result.success) {
          setTeams(result.data)
        }
      } catch (err) {
        console.error('Failed to load teams:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTeams()
  }, [])

  // Get team name helper
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === parseInt(teamId))
    return team?.name || `Team #${teamId}`
  }
  
  // Get question label helper
  const getQuestionLabel = (questionId) => {
    const question = formDefinition.questions.find(q => q.id === questionId)
    return question?.label || questionId
  }

  // Determine page title based on user rank
  const getPageTitle = () => {
    if (user?.rank === 'TEAM_LEAD') {
      return 'Direct Applicants'
    } else if (user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL') {
      return 'Team Applicants'
    } else {
      return 'Guild Applicants'
    }
  }

  const getPageDescription = () => {
    if (user?.rank === 'TEAM_LEAD') {
      return 'Applications submitted to your team'
    } else if (user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL') {
      return 'All applications across teams'
    } else {
      return 'Guild-wide applications'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-20"></div>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Loading Applicants...</p>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {getPageTitle()}
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              {getPageDescription()}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Team Lead View - Direct Applicants (only their team) */}
        {user?.rank === 'TEAM_LEAD' && user?.team_id && (
          <>
            {getSubmissionsByTeam(user.team_id).length === 0 ? (
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-white mb-2">No Applications Yet</h2>
                <p className="text-gray-400">
                  Applications for {getTeamName(user.team_id)} will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getSubmissionsByTeam(user.team_id).map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Application #{submission.id}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="px-4 py-2 bg-purple-600/20 text-purple-300 text-sm rounded-lg">
                        New
                      </span>
                    </div>
                    
                    {/* Applicant Identity Section */}
                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                      <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                        <span>🔒</span> Applicant Identity
                      </h4>
                      {submission.identity ? (
                        <div className="space-y-2">
                          {submission.identity.warcraftLogsUrl && (
                            <div className="text-sm">
                              <span className="text-gray-400">Warcraft Logs URL:</span>
                              <a href={submission.identity.warcraftLogsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 ml-2 hover:underline">
                                {submission.identity.warcraftLogsUrl}
                              </a>
                            </div>
                          )}
                          {submission.identity.region && (
                            <div className="text-sm">
                              <span className="text-gray-400">Region:</span>
                              <span className="text-white ml-2">{submission.identity.region}</span>
                            </div>
                          )}
                          {submission.identity.realm && (
                            <div className="text-sm">
                              <span className="text-gray-400">Realm:</span>
                              <span className="text-white ml-2">{submission.identity.realm}</span>
                            </div>
                          )}
                          {submission.identity.characterName && (
                            <div className="text-sm">
                              <span className="text-gray-400">Character Name:</span>
                              <span className="text-white ml-2">{submission.identity.characterName}</span>
                            </div>
                          )}
                          {submission.formVersion && (
                            <div className="text-xs text-gray-500 mt-2">
                              Form Version: {submission.formVersion}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No identity data</p>
                      )}
                    </div>

                    {/* Custom Answers Section */}
                    <div className="space-y-3">
                      <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                        <span>📝</span> Additional Answers
                      </h4>
                      {submission.answers && Object.keys(submission.answers).length > 0 ? (
                        Object.entries(submission.answers).map(([questionId, answer]) => (
                          <div key={questionId} className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">{getQuestionLabel(questionId)}</p>
                            <p className="text-white">
                              {Array.isArray(answer) ? answer.join(', ') : answer}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">No additional answers</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Admin View - Team Applicants (Guild Master & Council - all teams) */}
        {(user?.rank === 'GUILD_MASTER' || user?.rank === 'COUNCIL') && (
          <>
            {submissions.length === 0 ? (
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-white mb-2">No Applications Yet</h2>
                <p className="text-gray-400">
                  Applications from all teams will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group submissions by team */}
                {Array.from(new Set(submissions.map(s => s.teamId))).map(teamId => {
                  const teamSubmissions = getSubmissionsByTeam(teamId)
                  return (
                    <div key={teamId} className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-500/30">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {getTeamName(teamId)[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {getTeamName(teamId)}
                            </h3>
                            <p className="text-gray-400">
                              {teamSubmissions.length} application(s)
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/teams/${teamId}`}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                        >
                          View Team Dashboard →
                        </Link>
                      </div>

                      <div className="space-y-4">
                        {teamSubmissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="bg-white/5 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white font-semibold">
                                Application #{submission.id}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
                                {new Date(submission.submittedAt).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            {/* Applicant Identity */}
                            <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 mb-2">
                              <div className="text-xs text-blue-300 font-semibold mb-1">🔒 Identity</div>
                              {submission.identity ? (
                                <div className="space-y-1">
                                  {submission.identity.warcraftLogsUrl && (
                                    <div className="text-xs">
                                      <span className="text-gray-400">Logs:</span>
                                      <a href={submission.identity.warcraftLogsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 ml-1 hover:underline truncate">
                                        {submission.identity.warcraftLogsUrl}
                                      </a>
                                    </div>
                                  )}
                                  {submission.identity.region && (
                                    <span className="text-xs text-gray-400">
                                      {submission.identity.region} | {submission.identity.realm} | {submission.identity.characterName}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 italic">No identity</span>
                              )}
                            </div>

                            {/* Custom Answers */}
                            <div className="space-y-2">
                              {submission.answers && Object.keys(submission.answers).length > 0 ? (
                                Object.entries(submission.answers).map(([questionId, answer]) => (
                                  <div key={questionId} className="text-sm">
                                    <span className="text-gray-400">{getQuestionLabel(questionId)}:</span>
                                    <span className="text-white ml-2">
                                      {Array.isArray(answer) ? answer.join(', ') : answer}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500 italic">No additional answers</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Regular User View - Guild Applicants (all users who are not Team Lead, Council, or Guild Master) */}
        {user?.rank !== 'TEAM_LEAD' && user?.rank !== 'GUILD_MASTER' && user?.rank !== 'COUNCIL' && (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-white mb-2">Feature Coming Soon</h2>
            <p className="text-gray-400">
              Guild Applicants feature is not yet available. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
