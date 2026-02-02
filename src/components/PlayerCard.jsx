/**
 * PlayerCard Component
 * 
 * Displays enriched player data from Warcraft Logs
 */

import { useState, useEffect } from 'react'

// WoW Class colors for visual flair
const CLASS_COLORS = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  'Druid': '#FF7C0A',
  'Evoker': '#33937F',
  'Hunter': '#AAD372',
  'Mage': '#3FC7EB',
  'Monk': '#00FF98',
  'Paladin': '#F48CBA',
  'Priest': '#FFFFFF',
  'Rogue': '#FFF468',
  'Shaman': '#0070DD',
  'Warlock': '#8788EE',
  'Warrior': '#C69B6D',
}

// Difficulty colors
const DIFFICULTY_COLORS = {
  'Mythic': '#a335ee',
  'Heroic': '#0070dd',
  'Normal': '#1eff00',
}

/**
 * Format character name to Title Case
 */
function formatCharacterName(name) {
  if (!name) return ''
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

/**
 * Format realm to readable format (dashes to spaces, Title Case)
 */
function formatRealm(realm) {
  if (!realm) return ''
  return realm
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Get class icon URL (using Wowhead CDN)
 */
function getClassIcon(className) {
  if (!className) return null
  const classMap = {
    'Death Knight': 'death-knight',
    'Demon Hunter': 'demon-hunter',
    'Druid': 'druid',
    'Evoker': 'evoker',
    'Hunter': 'hunter',
    'Mage': 'mage',
    'Monk': 'monk',
    'Paladin': 'paladin',
    'Priest': 'priest',
    'Rogue': 'rogue',
    'Shaman': 'shaman',
    'Warlock': 'warlock',
    'Warrior': 'warrior',
  }
  const slug = classMap[className]
  if (!slug) return null
  return `https://wow.zamimg.com/images/wow/icons/large/classicon_${slug}.jpg`
}

/**
 * Get character avatar URL (using Blizzard render service)
 */
function getCharacterAvatar(region, realm, characterName) {
  // Fallback to a placeholder for now
  // In production, you'd integrate with Blizzard API
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(characterName)}&size=128&background=random`
}

export default function PlayerCard({ warcraftLogsUrl, applicationId }) {
  const [playerData, setPlayerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!warcraftLogsUrl) {
      setLoading(false)
      setError('No Warcraft Logs URL provided')
      return
    }

    let isMounted = true

    async function fetchPlayerData(forceRefresh = false) {
      try {
        console.log('Fetching player data for URL:', warcraftLogsUrl, 'forceRefresh:', forceRefresh)
        
        const response = await fetch('http://localhost:3001/api/enrich-player-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            warcraftLogsUrl,
            seasonKey: 'latest',
            forceRefresh,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Backend error response:', errorData)
          throw new Error(errorData.message || `Failed to fetch player data: ${response.status}`)
        }

        const result = await response.json()
        console.log('Enrichment result:', result)

        if (!result.success) {
          throw new Error(result.message || 'Failed to enrich player card')
        }

        if (isMounted) {
          setPlayerData(result.data)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching player data:', err)
        if (isMounted) {
          setError(err.message || 'Could not load player data')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPlayerData()

    return () => {
      isMounted = false
    }
  }, [warcraftLogsUrl])

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !playerData) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="text-red-400 text-2xl">⚠️</div>
          <div>
            <p className="text-red-300 font-semibold">Could not load player data</p>
            <p className="text-red-400/70 text-sm">{error || 'No data available'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Extract data
  const {
    characterName,
    realm,
    region,
    classSpec,
    mostPlayedSpec,
    bestKillLatestSeason,
    fetchStatus,
  } = playerData

  // Parse class from classSpec
  const playerClass = classSpec ? classSpec.split(' ').slice(0, -1).join(' ') : null
  const classColor = playerClass ? CLASS_COLORS[playerClass] : '#FFFFFF'
  const classIcon = getClassIcon(playerClass)
  const avatar = getCharacterAvatar(region, realm, characterName)

  // Format display names
  const displayName = formatCharacterName(characterName)
  const displayRealm = formatRealm(realm)

  // Manual refresh handler
  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:3001/api/enrich-player-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          warcraftLogsUrl,
          seasonKey: 'latest',
          forceRefresh: true, // Force bypass cache
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to refresh: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setPlayerData(result.data)
      } else {
        throw new Error(result.message || 'Failed to refresh player card')
      }
    } catch (err) {
      console.error('Error refreshing player data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border rounded-xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
      style={{ borderColor: `${classColor}40` }}
    >
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${classColor}, transparent)` }}
      ></div>

      <div className="relative z-10">
        {/* Header: Avatar + Name + Realm */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar & Class Icon */}
          <div className="relative flex-shrink-0">
            <img
              src={avatar}
              alt={displayName}
              className="w-16 h-16 rounded-full border-2"
              style={{ borderColor: classColor }}
            />
            {classIcon && (
              <img
                src={classIcon}
                alt={playerClass}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-900"
              />
            )}
          </div>

          {/* Character Info */}
          <div className="flex-1 min-w-0">
            <a
              href={warcraftLogsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold hover:underline transition-all inline-flex items-center gap-2 group/link"
              style={{ color: classColor }}
            >
              {displayName}
              <svg className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
              </svg>
            </a>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <span>{displayRealm}</span>
              <span className="text-gray-600">•</span>
              <span className="uppercase text-xs font-semibold" style={{ color: classColor }}>
                {region}
              </span>
            </div>
            {classSpec && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border" style={{ borderColor: `${classColor}30` }}>
                <span className="text-white font-semibold text-sm">{classSpec}</span>
              </div>
            )}
          </div>

          {/* Status Badge & Refresh Button */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {fetchStatus && (
              <>
                {fetchStatus === 'complete' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-xs font-semibold">
                    ✓ Fresh
                  </span>
                )}
                {fetchStatus === 'partial' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-xs font-semibold">
                    ⚠ Partial
                  </span>
                )}
                {fetchStatus === 'failed' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-xs font-semibold">
                    ✗ Failed
                  </span>
                )}
              </>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/refresh"
              title="Refresh player data"
            >
              <svg 
                className={`w-4 h-4 text-gray-400 group-hover/refresh:text-blue-400 transition-colors ${loading ? 'animate-spin' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Best Kill Section */}
        {bestKillLatestSeason && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Best Kill (Current Tier)
                </div>
                <div className="text-white font-bold text-lg">
                  {bestKillLatestSeason.bossName}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ 
                      backgroundColor: `${DIFFICULTY_COLORS[bestKillLatestSeason.difficulty] || '#666'}30`,
                      color: DIFFICULTY_COLORS[bestKillLatestSeason.difficulty] || '#FFF'
                    }}
                  >
                    {bestKillLatestSeason.difficulty}
                  </span>
                  <span className="text-gray-500 text-xs">
                    Boss {bestKillLatestSeason.orderIndex + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No kill data fallback */}
        {!bestKillLatestSeason && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
              Best Kill (Current Tier)
            </div>
            <div className="text-gray-500 text-sm italic">
              None this tier
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
