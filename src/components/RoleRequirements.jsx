import { useState, useEffect, useRef } from 'react'
import { CLASS_SPECS, ROLE_CATEGORIES, getSpecsByCategory, createSpecKey } from '../data/classSpecs'

export default function RoleRequirements({ roleRequirements, setRoleRequirements, canEdit, theme }) {
  const isInitializing = useRef(true)
  
  // Initialize selected specs from roleRequirements prop
  const [selectedSpecs, setSelectedSpecs] = useState(() => {
    if (roleRequirements && roleRequirements.length > 0) {
      return new Set(roleRequirements.map(req => createSpecKey(req.class, req.spec)))
    }
    return new Set()
  })

  // Mark initialization complete after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitializing.current = false
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Update parent when selectedSpecs changes (but not during initialization)
  useEffect(() => {
    // Skip if we're still initializing to avoid infinite loop
    if (isInitializing.current) return

    const requirements = Array.from(selectedSpecs).map(key => {
      const [className, specName] = key.split('-')
      const classData = CLASS_SPECS.find(c => c.class === className)
      const specData = classData?.specs.find(s => s.name === specName)
      return {
        class: className,
        spec: specName,
        category: specData?.category || ''
      }
    })
    setRoleRequirements(requirements)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpecs]) // Only depend on selectedSpecs, setRoleRequirements is stable

  // Handle category toggle (select/deselect all specs in category)
  const handleCategoryToggle = (category) => {
    const specsInCategory = getSpecsByCategory(category)
    const categoryKeys = specsInCategory.map(s => createSpecKey(s.class, s.spec))
    
    // Check if all specs in category are selected
    const allSelected = categoryKeys.every(key => selectedSpecs.has(key))
    
    const newSelectedSpecs = new Set(selectedSpecs)
    
    if (allSelected) {
      // Deselect all in category
      categoryKeys.forEach(key => newSelectedSpecs.delete(key))
    } else {
      // Select all in category
      categoryKeys.forEach(key => newSelectedSpecs.add(key))
    }
    
    setSelectedSpecs(newSelectedSpecs)
  }

  // Handle individual spec toggle
  const handleSpecToggle = (className, specName) => {
    const key = createSpecKey(className, specName)
    const newSelectedSpecs = new Set(selectedSpecs)
    
    if (newSelectedSpecs.has(key)) {
      newSelectedSpecs.delete(key)
    } else {
      newSelectedSpecs.add(key)
    }
    
    setSelectedSpecs(newSelectedSpecs)
  }

  // Check if category is fully selected
  const isCategorySelected = (category) => {
    const specsInCategory = getSpecsByCategory(category)
    const categoryKeys = specsInCategory.map(s => createSpecKey(s.class, s.spec))
    return categoryKeys.every(key => selectedSpecs.has(key))
  }

  // Get count of selected specs in category
  const getCategoryCount = (category) => {
    const specsInCategory = getSpecsByCategory(category)
    const categoryKeys = specsInCategory.map(s => createSpecKey(s.class, s.spec))
    return categoryKeys.filter(key => selectedSpecs.has(key)).length
  }

  const categoryIcons = {
    [ROLE_CATEGORIES.TANK]: '🛡️',
    [ROLE_CATEGORIES.HEALER]: '💚',
    [ROLE_CATEGORIES.MELEE_DPS]: '⚔️',
    [ROLE_CATEGORIES.RANGED_DPS]: '🏹',
    [ROLE_CATEGORIES.SUPPORT_DPS]: '✨'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Role Requirements</h2>
          <p className="text-gray-400 text-sm">Select the classes and specs your team needs</p>
        </div>
        {!canEdit && (
          <span className="text-sm text-gray-400 italic">View only</span>
        )}
      </div>

      {/* Selected Count */}
      <div 
        className="p-4 rounded-lg transition-all"
        style={{
          backgroundColor: `${theme.primary}15`,
          border: `1px solid ${theme.primary}50`
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">
            {selectedSpecs.size} Specialization{selectedSpecs.size !== 1 ? 's' : ''} Selected
          </span>
          {canEdit && selectedSpecs.size > 0 && (
            <button
              onClick={() => setSelectedSpecs(new Set())}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Category Quick Select */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">🎯 Quick Select by Role</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(ROLE_CATEGORIES).map(category => {
            const isSelected = isCategorySelected(category)
            const count = getCategoryCount(category)
            const total = getSpecsByCategory(category).length
            
            return (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                disabled={!canEdit}
                className="p-4 rounded-lg border-2 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={isSelected ? {
                  backgroundColor: `${theme.primary}33`,
                  borderColor: theme.primary,
                  color: 'white'
                } : {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#9ca3af'
                }}
                onMouseEnter={(e) => {
                  if (canEdit && !isSelected) {
                    e.currentTarget.style.borderColor = `${theme.primary}50`
                  }
                }}
                onMouseLeave={(e) => {
                  if (canEdit && !isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <div className="text-3xl mb-2">{categoryIcons[category]}</div>
                <div className="font-semibold text-sm mb-1">{category}</div>
                <div className="text-xs opacity-75">{count}/{total}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Class and Spec Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">⚔️ Select by Class</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CLASS_SPECS.map(classData => (
            <div
              key={classData.class}
              className="bg-white/5 border border-gray-700/50 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{classData.icon}</span>
                <h4 
                  className="text-lg font-bold"
                  style={{ color: classData.color }}
                >
                  {classData.class}
                </h4>
              </div>
              <div className="space-y-2">
                {classData.specs.map(spec => {
                  const key = createSpecKey(classData.class, spec.name)
                  const isSelected = selectedSpecs.has(key)
                  
                  return (
                    <button
                      key={spec.name}
                      onClick={() => handleSpecToggle(classData.class, spec.name)}
                      disabled={!canEdit}
                      className="w-full flex items-center justify-between p-2 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={isSelected ? {
                        backgroundColor: `${theme.primary}20`,
                        border: `1px solid ${theme.primary}80`
                      } : {
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        if (canEdit && !isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canEdit && !isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                          style={isSelected ? {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary
                          } : {
                            backgroundColor: 'transparent',
                            borderColor: 'rgba(255,255,255,0.3)'
                          }}
                        >
                          {isSelected && (
                            <span className="text-white text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-white font-medium">{spec.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{spec.category}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-save indicator */}
      {canEdit && (
        <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm flex items-start gap-2">
            <span>💡</span>
            <span>
              Your selections are saved automatically. Select roles by clicking categories or individual specializations.
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
