import { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'

const API_BASE = 'http://localhost:3001'

export default function AboutUs() {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('About Us')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      setError('')
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setError('Request timed out. Please check if the server is running.')
        setLoading(false)
      }, 10000) // 10 second timeout
      
      try {
        const response = await fetch(`${API_BASE}/api/content/about-us`)
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          setTitle(data.data.title)
          // Sanitize HTML but preserve all inline styles and attributes needed for formatting
          const sanitized = DOMPurify.sanitize(data.data.content, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr', 'span', 'img'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'data-gradient', 'data-align', 'src', 'alt', 'class', 'width', 'height'],
            ALLOW_DATA_ATTR: true,
            KEEP_CONTENT: true,
          })
          setContent(sanitized)
        } else {
          setError(data.message || 'Failed to load content')
        }
      } catch (err) {
        clearTimeout(timeoutId)
        console.error('Fetch content error:', err)
        setError(`Failed to load content: ${err.message}. Make sure the backend server is running on port 3001.`)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        <div className="h-20"></div>
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-2xl">
        <div className="h-20"></div>
        <div className="text-center">
          <p className="mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="h-20"></div>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Content */}
        <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
          <div
            className="about-us-content text-white"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Content managed by Eclipsed Guild Leadership</p>
        </div>
      </div>
    </div>
  )
}
