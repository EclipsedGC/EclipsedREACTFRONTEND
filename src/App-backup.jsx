// Backup of working App.jsx
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './components/HomePage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AccountManager from './pages/AccountManager'
import Teams from './pages/Teams'
import TeamManager from './pages/TeamManager'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected Account Manager (Guild Master only) */}
          <Route path="/account-manager" element={
            <ProtectedRoute requiredRank="GUILD_MASTER">
              <AccountManager />
            </ProtectedRoute>
          } />
          
          {/* Teams List */}
          <Route path="/teams" element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          } />
          
          {/* Team Manager (permission checked server-side) */}
          <Route path="/team-manager/:teamId" element={
            <ProtectedRoute>
              <TeamManager />
            </ProtectedRoute>
          } />
          
          {/* Placeholder routes */}
          <Route path="/events" element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center">
                <div className="h-20"></div>
                <div className="text-white text-2xl">Events Page (Coming Soon)</div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/hall-of-fame" element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center">
                <div className="h-20"></div>
                <div className="text-white text-2xl">Hall of Fame (Coming Soon)</div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
