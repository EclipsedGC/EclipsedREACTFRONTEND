import { createContext, useContext, useState, useEffect } from 'react'

const ApplicationContext = createContext()

export function useApplications() {
  const context = useContext(ApplicationContext)
  if (!context) {
    throw new Error('useApplications must be used within ApplicationProvider')
  }
  return context
}

export function ApplicationProvider({ children }) {
  // Load form definition from localStorage
  const [formDefinition, setFormDefinition] = useState(() => {
    const saved = localStorage.getItem('applicationFormDefinition')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migrate old format to new format if needed
        if (parsed.questions && !parsed.systemFields) {
          return {
            version: 1,
            systemFields: {
              warcraftLogsUrl: { type: 'url', label: 'Warcraft Logs URL', required: false },
              region: { type: 'select', label: 'Region', options: ['US', 'EU', 'KR', 'TW'], required: false },
              realm: { type: 'text', label: 'Realm', required: false },
              characterName: { type: 'text', label: 'Character Name', required: false }
            },
            questions: parsed.questions || []
          }
        }
        return parsed
      } catch (e) {
        console.error('Failed to parse saved form definition:', e)
      }
    }
    return {
      version: 1,
      systemFields: {
        warcraftLogsUrl: { type: 'url', label: 'Warcraft Logs URL', required: false },
        region: { type: 'select', label: 'Region', options: ['US', 'EU', 'KR', 'TW'], required: false },
        realm: { type: 'text', label: 'Realm', required: false },
        characterName: { type: 'text', label: 'Character Name', required: false }
      },
      questions: [
        {
          id: 'q1',
          label: 'What role are you applying for?',
          type: 'single',
          options: ['Tank', 'Healer', 'Melee DPS', 'Ranged DPS', 'Support DPS'],
          required: true
        },
        {
          id: 'q2',
          label: 'Which raid days can you attend?',
          type: 'multi',
          options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true
        },
        {
          id: 'q3',
          label: 'Tell us about your raiding experience',
          type: 'textarea',
          required: true
        }
      ]
    }
  })

  // Load submissions from localStorage
  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('applicationSubmissions')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved submissions:', e)
      }
    }
    return []
  })

  // Save form definition to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('applicationFormDefinition', JSON.stringify(formDefinition))
  }, [formDefinition])

  // Save submissions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('applicationSubmissions', JSON.stringify(submissions))
  }, [submissions])

  const updateFormDefinition = (newDefinition) => {
    // Increment version when custom questions change
    const newVersion = (formDefinition.version || 1) + 1
    setFormDefinition({
      ...newDefinition,
      version: newVersion
    })
  }

  const addSubmission = (teamId, identity, answers) => {
    const newSubmission = {
      id: Date.now().toString(),
      teamId,
      identity, // System fields data
      answers, // Custom question answers (stored by questionId)
      formVersion: formDefinition.version || 1,
      submittedAt: new Date().toISOString()
    }
    setSubmissions(prev => [...prev, newSubmission])
    return newSubmission
  }

  const getSubmissionsByTeam = (teamId) => {
    return submissions.filter(sub => sub.teamId === parseInt(teamId))
  }

  const deleteSubmission = (submissionId) => {
    setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
  }

  return (
    <ApplicationContext.Provider value={{
      formDefinition,
      updateFormDefinition,
      submissions,
      addSubmission,
      getSubmissionsByTeam,
      deleteSubmission
    }}>
      {children}
    </ApplicationContext.Provider>
  )
}
