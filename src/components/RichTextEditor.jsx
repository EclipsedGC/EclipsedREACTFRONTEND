import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { EditorContent } from '@tiptap/react'
import { useRichTextEditor } from '../hooks/useRichTextEditor'
import ImageToolbar from './ImageToolbar'
import ImageResizeHandles from './ImageResizeHandles'

// Font family options
const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Audiowide', value: 'Audiowide, sans-serif' },
  { label: 'Orbitron', value: 'Orbitron, sans-serif' },
  { label: 'Nova Square', value: 'Nova Square, sans-serif' },
  { label: 'Calligraffitti', value: 'Calligraffitti, cursive' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Comic Sans', value: 'Comic Sans MS, cursive' },
]

// Font size options
const FONT_SIZES = [
  '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '44px', '48px'
]

// Gradient presets
const GRADIENT_PRESETS = [
  { name: 'Purple to Blue', value: 'linear-gradient(90deg, #a855f7 0%, #3b82f6 100%)' },
  { name: 'Pink to Orange', value: 'linear-gradient(90deg, #ec4899 0%, #f97316 100%)' },
  { name: 'Green to Blue', value: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)' },
  { name: 'Gold to Red', value: 'linear-gradient(90deg, #fbbf24 0%, #ef4444 100%)' },
  { name: 'Rainbow', value: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 20%, #eab308 40%, #22c55e 60%, #3b82f6 80%, #a855f7 100%)' },
]

// Toolbar Button Component
const ToolbarButton = ({ onClick, isActive, disabled, children, title, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    type="button"
    className={`
      px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${isActive 
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' 
        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      ${className}
    `}
  >
    {children}
  </button>
)

// Font Family Selector Component with Visual Indicator
const FontFamilySelector = ({ value, options, onChange, className = '' }) => {
  const currentOption = value 
    ? options.find(opt => opt.value === value)
    : null
  
  const displayLabel = currentOption ? currentOption.label : 'Font Family'

  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`
          px-3 py-2 rounded-lg text-sm font-medium
          bg-gray-700/50 text-gray-300 border border-gray-600
          hover:bg-gray-700 hover:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-purple-500
          cursor-pointer transition-all duration-200
          appearance-none pr-8
          ${className}
        `}
        style={{ fontFamily: value || 'inherit' }}
      >
        <option value="" style={{ fontFamily: 'inherit' }}>Default Font</option>
        {options.map((opt, idx) => (
          opt.value !== '' && (
            <option 
              key={idx} 
              value={opt.value}
              style={{ fontFamily: opt.value }}
            >
              {opt.label}
            </option>
          )
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        ▼
      </div>
      {currentOption && (
        <div className="absolute -top-5 left-0 text-[10px] text-purple-400 font-semibold">
          {displayLabel}
        </div>
      )}
    </div>
  )
}

// Dropdown Component (for Font Size)
const Dropdown = ({ value, options, onChange, label, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`
      px-3 py-2 rounded-lg text-sm font-medium
      bg-gray-700/50 text-gray-300 border border-gray-600
      hover:bg-gray-700 hover:border-gray-500
      focus:outline-none focus:ring-2 focus:ring-purple-500
      cursor-pointer transition-all duration-200
      ${className}
    `}
  >
    <option value="">{label}</option>
    {options.map((opt, idx) => (
      <option key={idx} value={typeof opt === 'string' ? opt : opt.value}>
        {typeof opt === 'string' ? opt : opt.label}
      </option>
    ))}
  </select>
)

// Color Picker Component
const ColorPicker = ({ onColorSelect, currentColor }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef(null)
  const colorInputRef = useRef(null)

  const quickColors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ]

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownHeight = 350
      const spaceBelow = window.innerHeight - rect.bottom
      
      setPosition({
        top: spaceBelow < dropdownHeight && rect.top > dropdownHeight
          ? rect.top + window.scrollY - dropdownHeight - 8
          : rect.bottom + window.scrollY + 8,
        left: Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 288))
      })
    }
  }, [isOpen])

  return (
    <>
      <div ref={buttonRef}>
        <ToolbarButton
          onClick={() => setIsOpen(!isOpen)}
          isActive={isOpen}
          title="Text Color"
        >
          <div className="flex items-center gap-2">
            <span>🎨</span>
            <div 
              className="w-4 h-4 rounded border border-gray-500" 
              style={{ backgroundColor: currentColor || '#ffffff' }}
            />
          </div>
        </ToolbarButton>
      </div>

      {isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed z-[9999] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 min-w-[280px] max-h-[400px] overflow-y-auto"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-2 block">Quick Colors</label>
            <div className="grid grid-cols-6 gap-2">
              {quickColors.map((color) => (
                <button
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation()
                    onColorSelect(color)
                    setIsOpen(false)
                  }}
                  className="w-8 h-8 rounded border-2 border-gray-600 hover:border-purple-500 transition-all hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={color}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-2 block">Custom Color</label>
            <input
              ref={colorInputRef}
              type="color"
              onChange={(e) => {
                e.stopPropagation()
                onColorSelect(e.target.value)
              }}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onColorSelect(null)
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors cursor-pointer"
            type="button"
          >
            Reset Color
          </button>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

// Gradient Picker Component
const GradientPicker = ({ onGradientSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef(null)

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownHeight = 300
      const spaceBelow = window.innerHeight - rect.bottom
      
      setPosition({
        top: spaceBelow < dropdownHeight && rect.top > dropdownHeight
          ? rect.top + window.scrollY - dropdownHeight - 8
          : rect.bottom + window.scrollY + 8,
        left: Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 288))
      })
    }
  }, [isOpen])

  return (
    <>
      <div ref={buttonRef}>
        <ToolbarButton
          onClick={() => setIsOpen(!isOpen)}
          isActive={isOpen}
          title="Gradient Text"
        >
          ✨ Gradient
        </ToolbarButton>
      </div>

      {isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed z-[9999] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 min-w-[280px] max-h-[400px] overflow-y-auto"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
          <label className="text-xs text-gray-400 mb-2 block">Gradient Presets</label>
          <div className="space-y-2 mb-3">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={(e) => {
                  e.stopPropagation()
                  onGradientSelect(preset.value)
                  setIsOpen(false)
                }}
                className="w-full px-3 py-3 rounded text-sm font-semibold border border-gray-600 hover:border-purple-500 transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: preset.value,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                type="button"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onGradientSelect(null)
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors cursor-pointer"
            type="button"
          >
            Remove Gradient
          </button>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

// Main Toolbar Component
const Toolbar = ({ editor }) => {
  if (!editor) return null

  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || ''
  const currentFontSize = editor.getAttributes('textStyle').fontSize || ''
  const currentColor = editor.getAttributes('textStyle').color

  // Handle font family change
  const handleFontFamilyChange = (e) => {
    const fontFamily = e.target.value
    if (fontFamily) {
      editor.chain().focus().setFontFamily(fontFamily).run()
    } else {
      editor.chain().focus().unsetFontFamily().run()
    }
  }

  // Handle font size change
  const handleFontSizeChange = (e) => {
    const fontSize = e.target.value
    if (fontSize) {
      editor.chain().focus().setFontSize(fontSize).run()
    } else {
      editor.chain().focus().unsetFontSize().run()
    }
  }

  // Handle color change
  const handleColorChange = (color) => {
    if (color) {
      editor.chain().focus().setColor(color).run()
    } else {
      editor.chain().focus().unsetColor().run()
    }
  }

  // Handle gradient change
  const handleGradientChange = (gradient) => {
    if (gradient) {
      editor.chain().focus().setGradient(gradient).run()
    } else {
      editor.chain().focus().unsetGradient().run()
    }
  }

  // Handle image upload
  const imageInputRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageButtonClick = () => {
    imageInputRef.current?.click()
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.')
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size exceeds 5MB limit.')
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (data.success && data.data.url) {
        // Insert image into editor
        const fullUrl = `http://localhost:3001${data.data.url}`
        editor.chain().focus().setImage({ src: fullUrl }).run()
      } else {
        alert(`Failed to upload image: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
      // Reset input so same file can be uploaded again
      event.target.value = ''
    }
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-3">
      {/* Row 1: Font Controls */}
      <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-700/50">
        <FontFamilySelector
          value={currentFontFamily}
          options={FONT_FAMILIES}
          onChange={handleFontFamilyChange}
          className="min-w-[140px]"
        />
        
        <div className="relative">
          <select
            value={currentFontSize}
            onChange={handleFontSizeChange}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition-all duration-200 min-w-[100px] appearance-none pr-8"
          >
            <option value="">Font Size</option>
            {FONT_SIZES.map((size, idx) => (
              <option key={idx} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            ▼
          </div>
          {currentFontSize && (
            <div className="absolute -top-5 left-0 text-[10px] text-blue-400 font-semibold">
              {currentFontSize}
            </div>
          )}
        </div>

        <ColorPicker onColorSelect={handleColorChange} currentColor={currentColor} />
        
        <GradientPicker onGradientSelect={handleGradientChange} />
      </div>

      {/* Row 2: Text Formatting */}
      <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-700/50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>

        <div className="w-px bg-gray-700 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
      </div>

      {/* Row 3: Lists & Content */}
      <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-700/50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          • List
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          1. List
        </ToolbarButton>

        <div className="w-px bg-gray-700 mx-1"></div>

        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter link URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          isActive={editor.isActive('link')}
          title="Insert Link"
        >
          🔗 Link
        </ToolbarButton>

        <ToolbarButton
          onClick={handleImageButtonClick}
          disabled={uploadingImage}
          title="Upload Image"
        >
          {uploadingImage ? '⏳ Uploading...' : '🖼️ Image'}
        </ToolbarButton>

        {/* Hidden file input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          " Quote
        </ToolbarButton>
      </div>

      {/* Row 4: Alignment & Actions */}
      <div className="flex flex-wrap gap-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          ⬅ Left
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          ↔ Center
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          ➡ Right
        </ToolbarButton>

        <div className="w-px bg-gray-700 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ─ Rule
        </ToolbarButton>

        <div className="flex-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </ToolbarButton>
      </div>
    </div>
  )
}

// Main Editor Component
export default function RichTextEditor({ content, onChange }) {
  const editor = useRichTextEditor({ content, onChange })

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800/30 backdrop-blur-sm shadow-2xl">
      <Toolbar editor={editor} />
      <div className="bg-gray-900/40 p-4 relative">
        <EditorContent 
          editor={editor} 
          className="text-white [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:min-h-[400px]" 
        />
        {/* Floating toolbar for image controls */}
        <ImageToolbar editor={editor} />
        {/* Resize handles for selected images */}
        <ImageResizeHandles editor={editor} />
      </div>
    </div>
  )
}
