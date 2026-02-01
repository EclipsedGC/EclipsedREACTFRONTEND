import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import RichTextEditor from '../components/RichTextEditor'
import { getCurrentUser } from '../utils/auth'

const API_BASE = 'http://localhost:3001'

export default function ContentEditor() {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const user = getCurrentUser()

  // Fetch current content
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${API_BASE}/api/content/about-us`)
        const data = await response.json()
        
        if (data.success) {
          setTitle(data.data.title)
          setContent(data.data.content)
        } else {
          setError(data.message || 'Failed to load content')
        }
      } catch (err) {
        console.error('Fetch content error:', err)
        setError('Failed to load content')
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    
    try {
      const response = await fetch(`${API_BASE}/api/content/about-us`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('✅ Content saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to save content')
      }
    } catch (err) {
      console.error('Save content error:', err)
      setError('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        <div className="h-20"></div>
        Loading editor...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="h-20"></div>
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Content Editor
          </h1>
          <p className="text-gray-400">Edit the "About Us" page content</p>
          <p className="text-sm text-gray-500 mt-1">
            Logged in as: <span className="text-purple-400 font-semibold">{user?.username}</span> ({user?.rank})
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
            {success}
          </div>
        )}

        <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Page Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter page title..."
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Page Content</label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <Link
              to="/about"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              👁️ Preview Public Page
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">📝 Editor Tips:</h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Use the toolbar to format text, add headings, lists, and links</li>
            <li>Changes are saved to the database and appear instantly on the public page</li>
            <li>Only Guild Master and Council members can access this editor</li>
            <li>Content is sanitized to prevent security issues</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
