import { useState, useEffect, useRef } from 'react'
import { login, isAuthenticated } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import { recoveryAPI } from '../utils/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showAskHelp, setShowAskHelp] = useState(false)
  const [recoveryPending, setRecoveryPending] = useState(false)
  const [lastAttemptUsername, setLastAttemptUsername] = useState('')
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)

    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.message || 'Login failed')
      
      // Track failed attempts for this username
      if (result.userExists && !result.isGuildmaster) {
        const currentUsername = result.username || username
        
        // Reset count if username changed
        if (currentUsername !== lastAttemptUsername) {
          setFailedAttempts(1)
          setLastAttemptUsername(currentUsername)
          setShowAskHelp(false)
        } else {
          const newAttempts = failedAttempts + 1
          setFailedAttempts(newAttempts)
          
          // Show "Ask for Help" after 3 failed attempts
          if (newAttempts >= 3) {
            setShowAskHelp(true)
          }
        }
      } else {
        // Username doesn't exist or is Guildmaster - don't show recovery option
        setShowAskHelp(false)
      }
    }

    setLoading(false)
  }

  const handleAskForHelp = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await recoveryAPI.createRequest(lastAttemptUsername || username)
      
      if (result.success) {
        setRecoveryPending(true)
        setShowAskHelp(false)
      } else {
        setError(result.message || 'Failed to submit recovery request')
      }
    } catch (err) {
      setError('Failed to submit recovery request. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (recoveryPending) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {/* Floating particles background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/30 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <div className="mb-6">
            <div className="text-8xl mb-4 animate-bounce">🍪</div>
            <h2 className="text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Recovery Request Sent!
              </span>
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              Your password recovery request has been submitted to the Guild Master.
            </p>
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6">
              <p className="text-amber-200 font-medium mb-2">While you wait, here's a cookie! 🍪</p>
              <p className="text-amber-300/80 text-sm">
                (It's oatmeal raisin, but we still love you)
              </p>
            </div>
            <p className="text-gray-400 text-sm">
              You'll be able to log in once the Guild Master resets your password.
            </p>
          </div>
          
          <button
            onClick={() => {
              setRecoveryPending(false)
              setFailedAttempts(0)
              setShowAskHelp(false)
              setPassword('')
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Floating particles background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/30 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-600 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl font-bold text-white">E</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="text-gray-400">Login to Eclipsed Guild Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {failedAttempts > 0 && failedAttempts < 3 && (
            <div className="bg-amber-900/20 border border-amber-500/30 text-amber-200 px-4 py-2 rounded-lg text-sm text-center">
              Failed attempts: {failedAttempts}/3
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-md group-hover:blur-lg transition-all"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
            <span className="relative z-10 text-white">
              {loading ? 'Logging in...' : 'Login'}
            </span>
          </button>
          
          {showAskHelp && (
            <button
              type="button"
              onClick={handleAskForHelp}
              disabled={loading}
              className="w-full py-3 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/30 text-amber-200 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>🍪</span>
              <span>Ask Guild Master for Help</span>
            </button>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Closed system - No public registration</p>
          <p className="mt-1">Contact Guild Master for access</p>
        </div>
      </div>
    </div>
  )
}
