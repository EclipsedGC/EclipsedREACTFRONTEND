import { useState } from 'react'

/**
 * Maps submission answers to their corresponding question labels
 * @param {Object} answers - Submission answers keyed by questionId
 * @param {Array} questions - Form questions array
 * @returns {Array} Array of { questionId, label, answer, type }
 */
export function mapAnswersToQuestions(answers, questions) {
  if (!answers || !questions) return []
  
  return Object.entries(answers)
    .map(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId)
      if (!question) return null
      
      // Skip if no answer provided
      if (!answer || (Array.isArray(answer) && answer.length === 0) || answer.trim?.() === '') {
        return null
      }
      
      return {
        questionId,
        label: question.label,
        answer,
        type: question.type
      }
    })
    .filter(Boolean) // Remove null entries
}

/**
 * ApplicantCard - Displays applicant information with expandable custom answers
 */
export default function ApplicantCard({ submission, formDefinition, canEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  
  const identity = submission.identity || {}
  const customAnswers = mapAnswersToQuestions(submission.answers, formDefinition?.questions || [])

  // Format answer based on type
  const formatAnswer = (answer, type) => {
    if (Array.isArray(answer)) {
      return answer.join(', ')
    }
    if (type === 'url') {
      return (
        <a 
          href={answer} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-400 hover:underline break-all"
        >
          {answer}
        </a>
      )
    }
    return answer
  }

  return (
    <div 
      className="bg-white/5 border border-purple-500/20 rounded-lg p-6 hover:bg-white/10 transition-all"
      style={{ borderColor: 'var(--team-primary)50' }}
    >
      {/* Header with submission info and delete button */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">
            Application #{submission.id}
          </h3>
          <p className="text-gray-400 text-sm">
            Submitted: {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this application?')) {
                onDelete(submission.id)
              }
            }}
            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-all text-sm"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Main Section: Applicant Identity (Always Visible) */}
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-blue-300 font-bold text-lg flex items-center gap-2">
            <span>👤</span> Applicant Identity
          </h4>
          {submission.formVersion && (
            <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
              v{submission.formVersion}
            </span>
          )}
        </div>

        {identity.characterName || identity.realm || identity.region || identity.warcraftLogsUrl ? (
          <div className="space-y-3">
            {/* Primary Identity Info */}
            {identity.characterName && (
              <div className="flex items-start gap-3">
                <div className="w-20 text-gray-400 text-sm font-semibold flex-shrink-0">Character:</div>
                <div className="text-white font-semibold text-lg">{identity.characterName}</div>
              </div>
            )}
            
            {identity.realm && (
              <div className="flex items-start gap-3">
                <div className="w-20 text-gray-400 text-sm font-semibold flex-shrink-0">Realm:</div>
                <div className="text-white">{identity.realm}</div>
              </div>
            )}
            
            {identity.region && (
              <div className="flex items-start gap-3">
                <div className="w-20 text-gray-400 text-sm font-semibold flex-shrink-0">Region:</div>
                <div className="text-white">
                  <span className="px-2 py-1 bg-blue-600/30 rounded text-sm">{identity.region}</span>
                </div>
              </div>
            )}
            
            {identity.warcraftLogsUrl && (
              <div className="flex items-start gap-3">
                <div className="w-20 text-gray-400 text-sm font-semibold flex-shrink-0">Logs:</div>
                <div className="flex-1 min-w-0">
                  <a 
                    href={identity.warcraftLogsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors break-all text-sm"
                  >
                    {identity.warcraftLogsUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm italic">No identity information provided</p>
          </div>
        )}
      </div>

      {/* Expandable Section: Custom Question Answers */}
      {customAnswers.length > 0 && (
        <div className="border border-purple-500/20 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-4 bg-purple-900/10 hover:bg-purple-900/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-purple-300 font-semibold">📝 Additional Information</span>
              <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                {customAnswers.length} {customAnswers.length === 1 ? 'answer' : 'answers'}
              </span>
            </div>
            <span className={`text-purple-300 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {expanded && (
            <div className="p-4 space-y-3 bg-black/10">
              {customAnswers.map(({ questionId, label, answer, type }) => (
                <div key={questionId} className="bg-white/5 rounded-lg p-3 border border-purple-500/10">
                  <div className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">
                    {label}
                  </div>
                  <div className="text-white text-sm">
                    {formatAnswer(answer, type)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No custom answers message */}
      {customAnswers.length === 0 && (
        <div className="text-center py-3 border border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-500 text-sm italic">No additional information provided</p>
        </div>
      )}
    </div>
  )
}
