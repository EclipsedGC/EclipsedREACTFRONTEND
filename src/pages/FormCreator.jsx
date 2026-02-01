import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import { useApplications } from '../contexts/ApplicationContext'

export default function FormCreator() {
  const user = getCurrentUser()
  const { formDefinition, updateFormDefinition } = useApplications()
  const [questions, setQuestions] = useState(formDefinition.questions || [])
  const [editingId, setEditingId] = useState(null)
  const [saved, setSaved] = useState(false)

  // System fields are fixed and cannot be edited/deleted
  const systemFields = formDefinition.systemFields || {
    warcraftLogsUrl: { type: 'url', label: 'Warcraft Logs URL', required: false },
    region: { type: 'select', label: 'Region', options: ['US', 'EU', 'KR', 'TW'], required: false },
    realm: { type: 'text', label: 'Realm', required: false },
    characterName: { type: 'text', label: 'Character Name', required: false }
  }

  const addQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: true,
      options: []
    }
    setQuestions([...questions, newQuestion])
    setEditingId(newQuestion.id)
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const moveQuestion = (index, direction) => {
    const newQuestions = [...questions]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newQuestions.length) return
    
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]]
    setQuestions(newQuestions)
  }

  const handleSave = () => {
    updateFormDefinition({ 
      systemFields,
      questions 
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const addOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`]
        }
      }
      return q
    }))
  }

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...(q.options || [])]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const deleteOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: (q.options || []).filter((_, i) => i !== optionIndex)
        }
      }
      return q
    }))
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="h-20"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              📋 Application Form Creator
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Define the application form for all teams
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Logged in as: <span className="text-purple-400 font-semibold">{user?.username}</span> ({user?.rank})
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
          <p className="text-white mb-2">
            ℹ️ This form will be used for all team applications on the public "Apply Here" page.
          </p>
          <p className="text-sm text-gray-400">
            <strong>System Fields</strong> are fixed identity fields used for applicant enrichment. 
            <strong className="ml-2">Custom Questions</strong> are flexible fields you can add, edit, or remove.
          </p>
        </div>

        {/* System Fields Section (Fixed, Non-Editable) */}
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm border border-blue-500/40 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🔒</span> Applicant Identity (System Fields)
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                These fields are always present and cannot be deleted. They identify the applicant.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-black/20 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{systemFields.warcraftLogsUrl.label}</span>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">URL | Optional</span>
              </div>
              <p className="text-sm text-gray-400">If provided, used to auto-populate character info</p>
            </div>

            <div className="bg-black/20 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{systemFields.region.label}</span>
                <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                  SELECT | Required if no Logs URL
                </span>
              </div>
              <p className="text-sm text-gray-400">Options: {systemFields.region.options.join(', ')}</p>
            </div>

            <div className="bg-black/20 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{systemFields.realm.label}</span>
                <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                  TEXT | Required if no Logs URL
                </span>
              </div>
              <p className="text-sm text-gray-400">Server name where the character resides</p>
            </div>

            <div className="bg-black/20 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{systemFields.characterName.label}</span>
                <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                  TEXT | Required if no Logs URL
                </span>
              </div>
              <p className="text-sm text-gray-400">In-game character name</p>
            </div>
          </div>

          <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-200">
              <strong>Validation Rule:</strong> Either Warcraft Logs URL OR (Region + Realm + Character Name) must be provided.
            </p>
          </div>
        </div>

        {/* Custom Questions Section */}
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📝</span> Additional Questions ({questions.length})
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Custom questions for additional applicant information. You can add, edit, remove, and reorder these.
              </p>
            </div>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              ➕ Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl">No questions yet. Add your first question!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`bg-gray-800/50 border rounded-lg p-4 transition-all ${
                    editingId === question.id
                      ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === questions.length - 1}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-400 font-semibold">#{index + 1}</span>
                        {editingId === question.id ? (
                          <input
                            type="text"
                            value={question.label}
                            onChange={(e) => updateQuestion(question.id, 'label', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Question label..."
                          />
                        ) : (
                          <span className="flex-1 text-white font-semibold">{question.label}</span>
                        )}
                      </div>

                      {editingId === question.id && (
                        <div className="space-y-3 mt-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-400 text-sm mb-1">Question Type</label>
                              <select
                                value={question.type}
                                onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="text">Text Input</option>
                                <option value="textarea">Text Area</option>
                                <option value="url">URL Input</option>
                                <option value="single">Single Select</option>
                                <option value="multi">Multi Select</option>
                              </select>

                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                                  className="form-checkbox h-5 w-5 text-purple-600"
                                />
                                <span className="text-white">Required</span>
                              </label>
                            </div>
                          </div>

                          {/* Options for single/multi select */}
                          {(question.type === 'single' || question.type === 'multi') && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-gray-400 text-sm">Options</label>
                                <button
                                  onClick={() => addOption(question.id)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-all"
                                >
                                  ➕ Add Option
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(question.options || []).map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                      className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                    <button
                                      onClick={() => deleteOption(question.id, optionIndex)}
                                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all"
                                      title="Delete option"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(editingId === question.id ? null : question.id)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
                        title={editingId === question.id ? 'Done editing' : 'Edit question'}
                      >
                        {editingId === question.id ? '✓' : '✏️'}
                      </button>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all"
                        title="Delete question"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all text-lg"
          >
            💾 Save Form Definition
          </button>
          {saved && (
            <span className="text-green-400 font-semibold flex items-center gap-2">
              <span>✓</span> Form saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
