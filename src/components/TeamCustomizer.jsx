import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'

// Predefined color scheme presets
const COLOR_PRESETS = [
  {
    name: 'Purple Haze',
    primary: '#a855f7',
    accent: '#3b82f6',
    icon: '💜'
  },
  {
    name: 'Crimson Flame',
    primary: '#ef4444',
    accent: '#f97316',
    icon: '🔥'
  },
  {
    name: 'Ocean Wave',
    primary: '#0ea5e9',
    accent: '#06b6d4',
    icon: '🌊'
  },
  {
    name: 'Emerald Forest',
    primary: '#10b981',
    accent: '#22c55e',
    icon: '🌲'
  },
  {
    name: 'Golden Sun',
    primary: '#f59e0b',
    accent: '#eab308',
    icon: '☀️'
  },
  {
    name: 'Pink Blossom',
    primary: '#ec4899',
    accent: '#f472b6',
    icon: '🌸'
  },
  {
    name: 'Midnight',
    primary: '#6366f1',
    accent: '#8b5cf6',
    icon: '🌙'
  },
  {
    name: 'Lime Zest',
    primary: '#84cc16',
    accent: '#a3e635',
    icon: '🍋'
  }
]

export default function TeamCustomizer({ theme, setTheme, canEdit }) {
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false)
  const [showAccentPicker, setShowAccentPicker] = useState(false)

  const handlePresetSelect = (preset) => {
    setTheme({
      primary: preset.primary,
      accent: preset.accent
    })
  }

  const handlePrimaryChange = (color) => {
    setTheme(prev => ({ ...prev, primary: color }))
  }

  const handleAccentChange = (color) => {
    setTheme(prev => ({ ...prev, accent: color }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Customizer</h2>
          <p className="text-gray-400 text-sm">Customize your team's color scheme</p>
        </div>
        {!canEdit && (
          <span className="text-sm text-gray-400 italic">View only</span>
        )}
      </div>

      {/* Color Presets */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">🎨 Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              disabled={!canEdit}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${theme.primary === preset.primary && theme.accent === preset.accent
                  ? 'border-white scale-105 shadow-lg'
                  : 'border-gray-700 hover:border-gray-500'
                }
                ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
              `}
              style={{
                background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.accent} 100%)`
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{preset.icon}</span>
                <span className="text-white text-sm font-semibold text-center drop-shadow-lg">
                  {preset.name}
                </span>
              </div>
              {theme.primary === preset.primary && theme.accent === preset.accent && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Pickers */}
      <div className="bg-white/5 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🎨 Custom Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Primary Color
            </label>
            <div className="space-y-3">
              <button
                onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                disabled={!canEdit}
                className="w-full flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-lg"
                  style={{ backgroundColor: theme.primary }}
                />
                <div className="flex-1 text-left">
                  <div className="text-white font-mono text-sm">{theme.primary.toUpperCase()}</div>
                  <div className="text-gray-400 text-xs">Click to customize</div>
                </div>
              </button>
              {showPrimaryPicker && canEdit && (
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <HexColorPicker color={theme.primary} onChange={handlePrimaryChange} />
                  <button
                    onClick={() => setShowPrimaryPicker(false)}
                    className="mt-3 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Accent Color
            </label>
            <div className="space-y-3">
              <button
                onClick={() => setShowAccentPicker(!showAccentPicker)}
                disabled={!canEdit}
                className="w-full flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-lg"
                  style={{ backgroundColor: theme.accent }}
                />
                <div className="flex-1 text-left">
                  <div className="text-white font-mono text-sm">{theme.accent.toUpperCase()}</div>
                  <div className="text-gray-400 text-xs">Click to customize</div>
                </div>
              </button>
              {showAccentPicker && canEdit && (
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <HexColorPicker color={theme.accent} onChange={handleAccentChange} />
                  <button
                    onClick={() => setShowAccentPicker(false)}
                    className="mt-3 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white/5 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">👁️ Preview</h3>
        <div className="space-y-3">
          {/* Header Preview */}
          <div
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderColor: theme.primary
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
                }}
              />
              <div>
                <div className="text-white font-bold">Team Header</div>
                <div className="text-gray-400 text-sm">With custom accent</div>
              </div>
            </div>
          </div>

          {/* Button Preview */}
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: theme.primary }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: theme.accent }}
            >
              Accent Button
            </button>
          </div>

          {/* Tab Preview */}
          <div className="flex gap-2">
            <div
              className="px-4 py-2 rounded-t-lg font-semibold text-white border-b-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderBottomColor: theme.primary
              }}
            >
              Active Tab
            </div>
            <div className="px-4 py-2 rounded-t-lg font-semibold text-gray-400">
              Inactive Tab
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-300 text-sm flex items-start gap-2">
          <span>💡</span>
          <span>
            <strong>Note:</strong> Theme changes will be applied to this team's dashboard, 
            including headers, tabs, buttons, and highlights. Changes are saved automatically.
          </span>
        </p>
      </div>
    </div>
  )
}
