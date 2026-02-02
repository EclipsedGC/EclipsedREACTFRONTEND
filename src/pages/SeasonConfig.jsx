import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'

export default function SeasonConfig() {
  const user = getCurrentUser()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Active config state
  const [activeConfig, setActiveConfig] = useState(null)

  // Form state
  const [tierName, setTierName] = useState('Current Tier')
  const [wclTierUrl, setWclTierUrl] = useState('')
  const [importedData, setImportedData] = useState(null)

  // Redirect if not guild master
  useEffect(() => {
    if (!user || user.rank !== 'GUILD_MASTER') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Load active config on mount
  useEffect(() => {
    loadActiveConfig()
  }, [])

  const loadActiveConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/admin/season-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const result = await response.json()

      if (result.success && result.data) {
        setActiveConfig(result.data)
      }
    } catch (err) {
      console.error('Failed to load active config:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setError('')
    setSuccess('')
    setImporting(true)

    try {
      if (!wclTierUrl.trim()) {
        setError('Please enter a Warcraft Logs tier URL')
        return
      }

      const response = await fetch('http://localhost:3001/api/admin/season-config/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ wclTierUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Import failed')
      }

      if (result.success) {
        setImportedData(result.data)
        setSuccess(`Successfully imported ${result.data.encounterNames.length} bosses from ${result.data.zoneName || `Zone ${result.data.wclZoneId}`}`)
      } else {
        setError(result.message || 'Import failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to import boss list')
    } finally {
      setImporting(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      if (!importedData) {
        setError('Please import boss list first')
        return
      }

      if (!tierName.trim()) {
        setError('Please enter a tier name')
        return
      }

      const response = await fetch('http://localhost:3001/api/admin/season-config/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tierName,
          wclTierUrl,
          wclZoneId: importedData.wclZoneId,
          encounterOrder: importedData.encounterOrder,
          encounterNames: importedData.encounterNames,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Save failed')
      }

      if (result.success) {
        setActiveConfig(result.data)
        setImportedData(null)
        setWclTierUrl('')
        setTierName('Current Tier')
        setSuccess('Season configuration saved and activated!')
        
        // Reload active config
        setTimeout(() => {
          loadActiveConfig()
        }, 1000)
      } else {
        setError(result.message || 'Save failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to save season configuration')
    } finally {
      setSaving(false)
    }
  }

  if (!user || user.rank !== 'GUILD_MASTER') {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Season Configuration
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Configure the current raid tier for player card enrichment
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-300">
            {success}
          </div>
        )}

        {/* Active Config Display */}
        {activeConfig && (
          <div className="mb-8 bg-gradient-to-br from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>✅</span>
              <span>Active Configuration</span>
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tier Name:</span>
                <span className="text-white font-semibold">{activeConfig.tierName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Zone ID:</span>
                <span className="text-white font-mono">{activeConfig.wclZoneId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Boss Count:</span>
                <span className="text-white">{activeConfig.encounterNames?.length || 0} bosses</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Updated:</span>
                <span className="text-white text-sm">{new Date(activeConfig.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Boss List */}
            {activeConfig.encounterNames && activeConfig.encounterNames.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-500/20">
                <h3 className="text-lg font-semibold text-white mb-2">Boss Order:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {activeConfig.encounterNames.map((encounter, index) => (
                    <div key={encounter.id} className="flex items-center gap-3 px-3 py-2 bg-gray-800/30 rounded-lg">
                      <span className="text-purple-400 font-mono text-sm w-6">{index + 1}.</span>
                      <span className="text-white">{encounter.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Import New Config */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Import New Tier
          </h2>
          <p className="text-gray-400 mb-4">
            Paste a Warcraft Logs tier URL to import the boss list. Accepted formats:
          </p>
          <ul className="text-gray-400 text-sm mb-4 list-disc list-inside space-y-1">
            <li>https://www.warcraftlogs.com/zone/rankings/44</li>
            <li>https://www.warcraftlogs.com/zone/statistics/44</li>
            <li>Any WCL URL with ?zone=44 parameter</li>
          </ul>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                Tier Name
              </label>
              <input
                type="text"
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
                placeholder="e.g., Current Tier, Season 1, Patch 11.0.7"
                className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                Warcraft Logs Tier URL
              </label>
              <input
                type="text"
                value={wclTierUrl}
                onChange={(e) => setWclTierUrl(e.target.value)}
                placeholder="https://www.warcraftlogs.com/zone/rankings/44"
                className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleImport}
              disabled={importing || !wclTierUrl.trim()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
            >
              {importing ? 'Importing...' : 'Import Boss List'}
            </button>
          </div>
        </div>

        {/* Import Preview */}
        {importedData && (
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>Preview</span>
            </h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Zone ID:</span>
                <span className="text-white font-mono">{importedData.wclZoneId}</span>
              </div>
              {importedData.zoneName && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Zone Name:</span>
                  <span className="text-white">{importedData.zoneName}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Boss Count:</span>
                <span className="text-white">{importedData.encounterNames.length} bosses</span>
              </div>
            </div>

            {/* Boss List Preview */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Boss Order:</h3>
              <div className="grid grid-cols-1 gap-2">
                {importedData.encounterNames.map((encounter, index) => (
                  <div key={encounter.id} className="flex items-center gap-3 px-3 py-2 bg-gray-800/30 rounded-lg">
                    <span className="text-blue-400 font-mono text-sm w-6">{index + 1}.</span>
                    <span className="text-white">{encounter.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !tierName.trim()}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
            >
              {saving ? 'Saving...' : 'Save Active Season'}
            </button>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 backdrop-blur-sm border border-gray-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">ℹ️ How It Works</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>• Find the current raid tier on Warcraft Logs and copy the URL</li>
            <li>• Paste the URL here and click "Import Boss List"</li>
            <li>• Review the boss order in the preview</li>
            <li>• Click "Save Active Season" to activate this configuration</li>
            <li>• Player cards will use this tier for "Best Boss Kill" calculations</li>
            <li>• Only one tier can be active at a time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
