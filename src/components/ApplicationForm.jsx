import { useState } from 'react'

/**
 * Dynamically renders an application form based on system fields + custom questions
 */
export default function ApplicationForm({ systemFields, questions, onSubmit, onCancel, teamName }) {
  const [identity, setIdentity] = useState({})
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleIdentityChange = (fieldName, value) => {
    setIdentity(prev => ({
      ...prev,
      [fieldName]: value
    }))
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    // Clear error for this field
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const handleMultiSelectChange = (questionId, option, checked) => {
    setAnswers(prev => {
      const currentValues = prev[questionId] || []
      if (checked) {
        return { ...prev, [questionId]: [...currentValues, option] }
      } else {
        return { ...prev, [questionId]: currentValues.filter(v => v !== option) }
      }
    })
    // Clear error for this field
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    
    // Validate system fields: Either warcraftLogsUrl OR (region + realm + characterName)
    const hasLogsUrl = identity.warcraftLogsUrl && identity.warcraftLogsUrl.trim() !== ''
    const hasManualInfo = identity.region && identity.realm && identity.characterName
    
    if (!hasLogsUrl && !hasManualInfo) {
      if (!identity.warcraftLogsUrl || identity.warcraftLogsUrl.trim() === '') {
        newErrors.warcraftLogsUrl = 'Required if Region/Realm/Character Name not provided'
      }
      if (!identity.region) {
        newErrors.region = 'Required if Warcraft Logs URL not provided'
      }
      if (!identity.realm || identity.realm.trim() === '') {
        newErrors.realm = 'Required if Warcraft Logs URL not provided'
      }
      if (!identity.characterName || identity.characterName.trim() === '') {
        newErrors.characterName = 'Required if Warcraft Logs URL not provided'
      }
    }
    
    // Validate custom questions
    questions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id]
        if (!answer || (Array.isArray(answer) && answer.length === 0) || answer.trim?.() === '') {
          newErrors[question.id] = 'This field is required'
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(identity, answers)
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question) => {
    const hasError = errors[question.id]

    switch (question.type) {
      case 'text':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-white font-semibold mb-3">
              {question.label}
              {question.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              className={`w-full px-5 py-4 bg-gray-900/50 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                hasError
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-purple-500/30 focus:ring-purple-500/50 focus:border-purple-500 hover:border-purple-500/50'
              }`}
              placeholder="Enter your answer..."
            />
            {hasError && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors[question.id]}
              </p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-white font-semibold mb-3">
              {question.label}
              {question.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              rows="4"
              className={`w-full px-5 py-4 bg-gray-900/50 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                hasError
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-purple-500/30 focus:ring-purple-500/50 focus:border-purple-500 hover:border-purple-500/50'
              }`}
              placeholder="Enter your answer..."
            />
            {hasError && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors[question.id]}
              </p>
            )}
          </div>
        )

      case 'url':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-white font-semibold mb-3">
              {question.label}
              {question.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="url"
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              className={`w-full px-5 py-4 bg-gray-900/50 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                hasError
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-purple-500/30 focus:ring-purple-500/50 focus:border-purple-500 hover:border-purple-500/50'
              }`}
              placeholder="https://..."
            />
            {hasError && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors[question.id]}
              </p>
            )}
          </div>
        )

      case 'single':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-white font-semibold mb-3">
              {question.label}
              {question.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-3">
              {question.options?.map(option => {
                const isSelected = answers[question.id] === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange(question.id, option)}
                    className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
                      isSelected
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-gray-900/30 border-purple-500/30 text-gray-300 hover:border-purple-500/50 hover:bg-gray-900/50'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {hasError && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors[question.id]}
              </p>
            )}
          </div>
        )

      case 'multi':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-white font-semibold mb-3">
              {question.label}
              {question.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {question.options?.map(option => {
                const isChecked = (answers[question.id] || []).includes(option)
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                      isChecked
                        ? 'bg-purple-600/20 border-purple-500 shadow-md'
                        : 'bg-gray-900/30 border-purple-500/20 hover:border-purple-500/40 hover:bg-gray-900/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleMultiSelectChange(question.id, option, e.target.checked)}
                      className="form-checkbox h-5 w-5 text-purple-600 bg-gray-800 border-purple-500/30 rounded focus:ring-purple-500/50"
                    />
                    <span className={`font-medium ${isChecked ? 'text-white' : 'text-gray-300'}`}>
                      {option}
                    </span>
                  </label>
                )
              })}
            </div>
            {hasError && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors[question.id]}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
          <span className="text-3xl">📝</span>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Apply to {teamName}
        </h3>
        <p className="text-gray-400 text-sm">Please fill out all required fields to submit your application.</p>
      </div>

      {/* System Fields Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-xl">
              <span className="text-xl">🔒</span>
            </div>
            <h4 className="text-2xl font-bold text-blue-300">Applicant Identity</h4>
          </div>
          <p className="text-sm text-gray-400 mb-6 pl-13">
            Provide either your <strong className="text-blue-300">Warcraft Logs URL</strong> OR your <strong className="text-blue-300">Region + Realm + Character Name</strong>.
          </p>

          {/* Warcraft Logs URL */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🔗</span>
              Warcraft Logs URL
              {!identity.region && !identity.realm && !identity.characterName && (
                <span className="text-red-400 ml-1">*</span>
              )}
            </label>
            <div className="relative">
              <input
                type="url"
                value={identity.warcraftLogsUrl || ''}
                onChange={(e) => handleIdentityChange('warcraftLogsUrl', e.target.value)}
                className={`w-full px-5 py-4 bg-gray-900/50 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.warcraftLogsUrl
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                    : 'border-blue-500/30 focus:ring-blue-500/50 focus:border-blue-500 hover:border-blue-500/50'
                }`}
                placeholder="https://www.warcraftlogs.com/..."
              />
            </div>
            {errors.warcraftLogsUrl && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.warcraftLogsUrl}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            <span className="text-gray-400 text-sm font-semibold px-3 py-1 bg-gray-800/50 rounded-full">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          </div>

          {/* Region */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🌍</span>
              Region
              {!identity.warcraftLogsUrl && <span className="text-red-400 ml-1">*</span>}
            </label>
            <select
              value={identity.region || ''}
              onChange={(e) => handleIdentityChange('region', e.target.value)}
              className={`w-full px-5 py-4 bg-gray-900/50 backdrop-blur-sm border-2 rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.region
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-blue-500/30 focus:ring-blue-500/50 focus:border-blue-500 hover:border-blue-500/50'
              }`}
            >
              <option value="" className="bg-gray-900">Select a region...</option>
              {systemFields.region.options.map(option => (
                <option key={option} value={option} className="bg-gray-900">{option}</option>
              ))}
            </select>
            {errors.region && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.region}
              </p>
            )}
          </div>

          {/* Realm */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🏰</span>
              Realm
              {!identity.warcraftLogsUrl && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={identity.realm || ''}
              onChange={(e) => handleIdentityChange('realm', e.target.value)}
              className={`w-full px-5 py-4 bg-gray-900/50 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.realm
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-blue-500/30 focus:ring-blue-500/50 focus:border-blue-500 hover:border-blue-500/50'
              }`}
              placeholder="e.g., Area 52, Illidan, etc."
            />
            {errors.realm && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.realm}
              </p>
            )}
          </div>

          {/* Character Name */}
          <div className="mb-0">
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">⚔️</span>
              Character Name
              {!identity.warcraftLogsUrl && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={identity.characterName || ''}
              onChange={(e) => handleIdentityChange('characterName', e.target.value)}
              className={`w-full px-5 py-4 bg-gray-900/50 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.characterName
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-blue-500/30 focus:ring-blue-500/50 focus:border-blue-500 hover:border-blue-500/50'
              }`}
              placeholder="Your in-game character name"
            />
            {errors.characterName && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.characterName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Custom Questions Section */}
      {questions.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-xl">
                <span className="text-xl">📝</span>
              </div>
              <h4 className="text-2xl font-bold text-purple-300">Additional Questions</h4>
            </div>
            {questions.map(question => renderQuestion(question))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 relative overflow-hidden group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <span>📤</span>
                Submit Application
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
