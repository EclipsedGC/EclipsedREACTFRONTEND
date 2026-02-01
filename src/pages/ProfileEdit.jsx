import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import { userAPI } from '../utils/api'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const hasLoadedProfile = useRef(false) // Prevent multiple loads
  
  // Personal information state
  const [warcraftLogsUrl, setWarcraftLogsUrl] = useState('')
  const [originalWarcraftLogsUrl, setOriginalWarcraftLogsUrl] = useState('')
  const [bio, setBio] = useState('')
  const [originalBio, setOriginalBio] = useState('')
  const [discordUsername, setDiscordUsername] = useState('')
  const [originalDiscordUsername, setOriginalDiscordUsername] = useState('')
  const [savingField, setSavingField] = useState('') // Track which field is saving
  
  // Username section state
  const [showUsernameEdit, setShowUsernameEdit] = useState(false)
  const [username, setUsername] = useState(currentUser?.username || '')
  const [originalUsername, setOriginalUsername] = useState(currentUser?.username || '')
  
  // Password section state
  const [showPasswordEdit, setShowPasswordEdit] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState('') // Specific error for current password field
  
  // UI state
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    
    // Only load profile data once
    if (hasLoadedProfile.current) return
    hasLoadedProfile.current = true
    
    // Fetch fresh profile data
    const loadProfile = async () => {
      try {
        const result = await userAPI.getOwnProfile()
        if (result.success) {
          setWarcraftLogsUrl(result.data.warcraft_logs_url || '')
          setOriginalWarcraftLogsUrl(result.data.warcraft_logs_url || '')
          setBio(result.data.bio || '')
          setOriginalBio(result.data.bio || '')
          setDiscordUsername(result.data.discord_username || '')
          setOriginalDiscordUsername(result.data.discord_username || '')
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }
    
    loadProfile()
  }, [currentUser, navigate])

  // Personal information handlers
  const handleSaveWarcraftLogs = async () => {
    setError('')
    setSuccess('')
    setSavingField('warcraftLogs')
    
    const result = await userAPI.updateOwnProfile({ warcraftLogsUrl: warcraftLogsUrl.trim() })
    setSavingField('')
    
    if (result.success) {
      setSuccess('✅ Warcraft Logs URL updated!')
      setOriginalWarcraftLogsUrl(warcraftLogsUrl.trim())
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to update Warcraft Logs URL')
    }
  }

  const handleSaveBio = async () => {
    setError('')
    setSuccess('')
    
    if (bio.length > 120) {
      setError('Bio must be 120 characters or less')
      return
    }
    
    setSavingField('bio')
    const result = await userAPI.updateOwnProfile({ bio: bio.trim() })
    setSavingField('')
    
    if (result.success) {
      setSuccess('✅ Bio updated!')
      setOriginalBio(bio.trim())
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to update bio')
    }
  }

  const handleSaveDiscord = async () => {
    setError('')
    setSuccess('')
    setSavingField('discord')
    
    const result = await userAPI.updateOwnProfile({ discordUsername: discordUsername.trim() })
    setSavingField('')
    
    if (result.success) {
      setSuccess('✅ Discord username updated!')
      setOriginalDiscordUsername(discordUsername.trim())
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to update Discord username')
    }
  }

  // Username handlers
  const handleUsernameToggle = () => {
    if (showUsernameEdit) {
      // Reset to original
      setUsername(originalUsername)
    }
    setShowUsernameEdit(!showUsernameEdit)
    setError('')
    setSuccess('')
  }

  const handleUsernameDiscard = () => {
    setUsername(originalUsername)
    setShowUsernameEdit(false)
    setError('')
  }

  const handleUsernameSave = async () => {
    setError('')
    setSuccess('')
    
    if (username.trim() === originalUsername) {
      setError('No changes to save')
      return
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    setSaving(true)
    const result = await userAPI.updateOwnProfile({ username: username.trim() })
    setSaving(false)

    if (result.success) {
      setSuccess('✅ Username updated successfully!')
      setOriginalUsername(username.trim())
      setShowUsernameEdit(false)
      
      // Update localStorage user
      const updatedUser = { ...currentUser, username: username.trim() }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message || 'Failed to update username')
    }
  }

  // Password handlers
  const handlePasswordToggle = () => {
    if (showPasswordEdit) {
      // Clear fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPasswordError('')
    }
    setShowPasswordEdit(!showPasswordEdit)
    setError('')
    setSuccess('')
  }

  const handlePasswordDiscard = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setCurrentPasswordError('')
    setShowPasswordEdit(false)
    setError('')
  }

  const handlePasswordSave = async () => {
    setError('')
    setSuccess('')
    setCurrentPasswordError('')

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setSaving(true)
    const result = await userAPI.changeOwnPassword(currentPassword, newPassword)
    setSaving(false)

    if (result.success) {
      setSuccess('✅ Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordEdit(false)
      setTimeout(() => setSuccess(''), 3000)
    } else {
      // Check if it's a current password error (status 400 instead of 401)
      if (result.status === 400 && result.message?.toLowerCase().includes('password')) {
        setCurrentPasswordError(result.message)
      } else {
        setError(result.message || 'Failed to change password')
      }
    }
  }

  const hasUsernameChanges = username.trim() !== originalUsername
  const hasPasswordChanges = currentPassword || newPassword || confirmPassword

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Edit Profile
              </span>
            </h1>
            <p className="text-gray-400 text-sm">
              Manage your account settings
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all"
          >
            ← Back
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Personal Information Section */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5 mb-4">
          <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
          
          <div className="space-y-4">
            {/* Warcraft Logs URL */}
            <div>
              <label className="block text-gray-300 text-sm mb-1.5">Warcraft Logs URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={warcraftLogsUrl}
                  onChange={(e) => setWarcraftLogsUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  placeholder="https://www.warcraftlogs.com/..."
                />
                <button
                  onClick={handleSaveWarcraftLogs}
                  disabled={warcraftLogsUrl.trim() === originalWarcraftLogsUrl || savingField === 'warcraftLogs'}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {savingField === 'warcraftLogs' ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-gray-300 text-sm mb-1.5">
                Bio 
                <span className="text-gray-500 text-xs ml-2">
                  ({bio.length}/120)
                </span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={120}
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm resize-none"
                placeholder="Tell us about yourself..."
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-gray-500 text-xs">
                  Max. 120 characters
                </p>
                <button
                  onClick={handleSaveBio}
                  disabled={bio.trim() === originalBio || savingField === 'bio' || bio.length > 120}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingField === 'bio' ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Discord Username */}
            <div>
              <label className="block text-gray-300 text-sm mb-1.5">Discord Username</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  placeholder="username#0000"
                />
                <button
                  onClick={handleSaveDiscord}
                  disabled={discordUsername.trim() === originalDiscordUsername || savingField === 'discord'}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {savingField === 'discord' ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Change Username Module */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5">
            <button
              onClick={handleUsernameToggle}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-0.5">Change Username</h2>
                <p className="text-gray-400 text-xs">
                  Current: <span className="text-purple-400 font-medium">{originalUsername}</span>
                </p>
              </div>
              <div className="text-2xl text-purple-400">
                {showUsernameEdit ? '−' : '+'}
              </div>
            </button>

            {showUsernameEdit && (
              <div className="mt-4 space-y-3 border-t border-purple-500/20 pt-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1.5">New Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    placeholder="Enter new username"
                    minLength={3}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Min. 3 characters
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleUsernameSave}
                    disabled={!hasUsernameChanges || saving}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleUsernameDiscard}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Module */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5">
            <button
              onClick={handlePasswordToggle}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-0.5">Change Password</h2>
                <p className="text-gray-400 text-xs">
                  Update your account password
                </p>
              </div>
              <div className="text-2xl text-purple-400">
                {showPasswordEdit ? '−' : '+'}
              </div>
            </button>

            {showPasswordEdit && (
              <div className="mt-4 space-y-3 border-t border-purple-500/20 pt-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      setCurrentPasswordError('') // Clear error when user types
                    }}
                    className={`w-full px-3 py-2 bg-white/5 border ${
                      currentPasswordError ? 'border-red-500' : 'border-purple-500/30'
                    } text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm`}
                    placeholder="Enter current password"
                  />
                  {currentPasswordError && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      {currentPasswordError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    placeholder="Enter new password"
                    minLength={6}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Min. 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handlePasswordSave}
                    disabled={!hasPasswordChanges || saving || (newPassword !== confirmPassword)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handlePasswordDiscard}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            Profile Security
          </h3>
          <ul className="text-gray-400 text-xs space-y-0.5">
            <li>• Your password is encrypted and never stored in plain text</li>
            <li>• You must provide your current password to set a new one</li>
            <li>• Choose a strong password with at least 6 characters</li>
            <li>• Your username must be unique across all users</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
