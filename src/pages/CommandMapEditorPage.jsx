import { getCurrentUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import CommandMapEditor from '../components/CommandMapEditor'

export default function CommandMapEditorPage() {
  const user = getCurrentUser()
  const navigate = useNavigate()

  // Only Guild Master can access
  if (!user || user.rank !== 'GUILD_MASTER') {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <CommandMapEditor />
      </div>
    </div>
  )
}
