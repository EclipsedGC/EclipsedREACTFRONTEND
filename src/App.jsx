import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './components/HomePage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AccountManager from './pages/AccountManager'
import ContentEditor from './pages/ContentEditor'
import FormCreator from './pages/FormCreator'
import ProfileEdit from './pages/ProfileEdit'
import Teams from './pages/Teams'
import TeamDashboard from './pages/TeamDashboard'
import Applicants from './pages/Applicants'
import AboutUs from './pages/AboutUs'
import ApplyHere from './pages/ApplyHere'
import CommandMapEditorPage from './pages/CommandMapEditorPage'
import ProtectedRoute from './components/ProtectedRoute'
import { ApplicationProvider } from './contexts/ApplicationContext'

function App() {
  return (
    <BrowserRouter>
      <ApplicationProvider>
        <div className="app-container">
          <Header />
        
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Public About Us Page */}
          <Route path="/about" element={<AboutUs />} />
          
          {/* Public Apply Here Page */}
          <Route path="/apply" element={<ApplyHere />} />
          
          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected Applicants Page */}
          <Route path="/applicants" element={
            <ProtectedRoute>
              <Applicants />
            </ProtectedRoute>
          } />
          
          {/* Protected Account Manager (Guild Master only) */}
          <Route path="/account-manager" element={
            <ProtectedRoute requiredRank="GUILD_MASTER">
              <AccountManager />
            </ProtectedRoute>
          } />
          
          {/* Protected Command Map Editor (Guild Master only) */}
          <Route path="/command-map-editor" element={
            <ProtectedRoute requiredRank="GUILD_MASTER">
              <CommandMapEditorPage />
            </ProtectedRoute>
          } />
          
          {/* Protected Content Editor (Guild Master & Council only) */}
          <Route path="/content-editor" element={
            <ProtectedRoute requiredRank={["GUILD_MASTER", "COUNCIL"]}>
              <ContentEditor />
            </ProtectedRoute>
          } />
          
          {/* Protected Profile Edit (All authenticated users) */}
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          } />
          
          {/* Teams List */}
          <Route path="/teams" element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          } />
          
          {/* Team Dashboard (individual team view with tabs) */}
          <Route path="/teams/:teamId" element={
            <ProtectedRoute>
              <TeamDashboard />
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
          
          <Route path="/form-creator" element={
            <ProtectedRoute requiredRank={["GUILD_MASTER", "COUNCIL"]}>
              <FormCreator />
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
      </ApplicationProvider>
    </BrowserRouter>
  )
}

export default App
