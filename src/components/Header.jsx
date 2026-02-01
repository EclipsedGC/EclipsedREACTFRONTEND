import { useState, useMemo, useCallback, memo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCurrentUser, logout, isAuthenticated } from '../utils/auth'

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = getCurrentUser()
  const isLoggedIn = isAuthenticated()

  // Determine if a nav item is active based on current path
  const isNavActive = useCallback((path) => {
    return location.pathname === path
  }, [location.pathname])

  // Memoize public nav items so they don't recreate on every render
  const publicNavItems = useMemo(() => [
    { id: 'about', label: 'About Us', path: '/about' },
    { id: 'apply', label: 'Apply Here', path: '/apply' },
    { id: 'merch', label: 'Merch', path: '/merch' },
  ], [])

  const handleLogout = useCallback(() => {
    logout()
    setShowProfileMenu(false)
    navigate('/login')
  }, [navigate])

  // Memoize rank color to avoid recalculation
  const rankColor = useMemo(() => {
    switch (user?.rank) {
      case 'GUILD_MASTER':
        return 'from-yellow-400 to-orange-400'
      case 'COUNCIL':
        return 'from-purple-400 to-pink-400'
      case 'TEAM_LEAD':
        return 'from-blue-400 to-cyan-400'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }, [user?.rank])

  const handleProfileMenuToggle = useCallback(() => {
    setShowProfileMenu(prev => !prev)
  }, [])

  const closeProfileMenu = useCallback(() => {
    setShowProfileMenu(false)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/30">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 h-20">
          {/* Logo Button */}
          <Link
            to="/"
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">E</span>
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Eclipsed
            </span>
          </Link>

          {/* Navigation Buttons */}
          <nav className="flex items-center gap-3">
            {publicNavItems.map((item) => {
              const isActive = isNavActive(item.path)
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    relative px-5 py-2.5 rounded-lg font-medium transition-all duration-300
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-sm"></div>
                  )}
                  <div
                    className={`
                      absolute inset-0 rounded-lg transition-all duration-300
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                          : 'bg-white/5 hover:bg-white/10'
                      }
                    `}
                  ></div>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              )
            })}

            {/* Login Button or Profile Icon */}
            {!isLoggedIn ? (
              <Link
                to="/login"
                className={`
                  relative px-5 py-2.5 rounded-lg font-medium transition-all duration-300
                  ${
                    isNavActive('/login')
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }
                `}
              >
                {isNavActive('/login') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-sm"></div>
                )}
                <div
                  className={`
                    absolute inset-0 rounded-lg transition-all duration-300
                    ${
                      isNavActive('/login')
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                        : 'bg-white/5 hover:bg-white/10'
                    }
                  `}
                ></div>
                <span className="relative z-10">Login</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={handleProfileMenuToggle}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-300"
                >
                  {/* Profile Icon */}
                  <div className="relative">
                    <div className={`w-10 h-10 bg-gradient-to-br ${rankColor} rounded-full flex items-center justify-center`}>
                      <span className="text-lg font-bold text-white">
                        {user?.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                  </div>
                  
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className={`text-xs bg-gradient-to-r ${rankColor} bg-clip-text text-transparent font-semibold`}>
                      {user?.rank?.replace('_', ' ')}
                    </p>
                  </div>

                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-lg shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-purple-500/20">
                      <p className="text-white font-medium">{user?.username}</p>
                      <p className="text-sm text-gray-400">{user?.rank?.replace('_', ' ')}</p>
                      {user?.team_id && (
                        <p className="text-xs text-purple-400 mt-1">Team ID: {user.team_id}</p>
                      )}
                    </div>

                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        onClick={closeProfileMenu}
                        className="block px-4 py-2 text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                      >
                        📊 Dashboard
                      </Link>
                      
                      <Link
                        to="/profile/edit"
                        onClick={closeProfileMenu}
                        className="block px-4 py-2 text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                      >
                        ✏️ Edit Profile
                      </Link>
                      
                      {user?.rank === 'GUILD_MASTER' && (
                        <Link
                          to="/account-manager"
                          onClick={closeProfileMenu}
                          className="block px-4 py-2 text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                        >
                          👥 Account Manager
                        </Link>
                      )}
                      
                      <Link
                        to="/teams"
                        onClick={closeProfileMenu}
                        className="block px-4 py-2 text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                      >
                        🏆 My Teams
                      </Link>
                    </div>

                    <div className="py-2 border-t border-purple-500/20">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default memo(Header)
