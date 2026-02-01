import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Floating toolbar that appears above selected images
 */
export default function ImageToolbar({ editor }) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const toolbarRef = useRef(null)
  const [isDestroyed, setIsDestroyed] = useState(false)

  useEffect(() => {
    if (!editor) return

    const updateToolbar = () => {
      try {
        // Check if editor is still valid and mounted
        if (!editor || !editor.view || editor.isDestroyed) {
          setShowToolbar(false)
          return
        }

        // Check if view.dom is accessible (will throw if not mounted)
        try {
          if (!editor.view.dom) {
            setShowToolbar(false)
            return
          }
        } catch {
          setShowToolbar(false)
          return
        }

        const { state, view } = editor
        const { selection } = state
        const { from } = selection

        // Check if current selection is an image
        const node = state.doc.nodeAt(from)
        const isImage = node && node.type.name === 'imageResize'

        if (isImage) {
          // Get the DOM node for the image
          const domNode = view.nodeDOM(from)
          
          if (domNode && domNode instanceof HTMLElement) {
            const imageElement = domNode.querySelector('img') || domNode
            const rect = imageElement.getBoundingClientRect()
            const editorRect = view.dom.getBoundingClientRect()

            // Position toolbar above the image, centered
            const toolbarWidth = 460 // Approximate width
            const toolbarHeight = 120 // Approximate height (includes hint text + alignment buttons)
            
            let top = rect.top - editorRect.top - toolbarHeight - 8 // 8px above image
            let left = rect.left - editorRect.left + (rect.width / 2) - (toolbarWidth / 2)
            
            // Keep toolbar within editor bounds horizontally
            const editorWidth = editorRect.width
            const padding = 10
            if (left < padding) left = padding
            if (left + toolbarWidth > editorWidth - padding) {
              left = editorWidth - toolbarWidth - padding
            }
            
            // If not enough space above, show below
            if (top < padding) {
              top = rect.bottom - editorRect.top + 8
            }
            
            setPosition({ top, left })
            setShowToolbar(true)
          }
        } else {
          setShowToolbar(false)
        }
      } catch (error) {
        // Silently handle expected errors during unmounting
        setShowToolbar(false)
      }
    }

    // Update on selection change
    editor.on('selectionUpdate', updateToolbar)
    editor.on('update', updateToolbar)

    // Initial update
    updateToolbar()

    return () => {
      setIsDestroyed(true)
      setShowToolbar(false)
      try {
        editor.off('selectionUpdate', updateToolbar)
        editor.off('update', updateToolbar)
      } catch (e) {
        // Editor might already be destroyed
      }
    }
  }, [editor])

  // Early return AFTER all hooks
  if (!showToolbar || !editor || isDestroyed) return null

  // Check if the portal container exists before rendering
  const portalContainer = editor.view?.dom?.parentElement
  if (!portalContainer || !document.body.contains(portalContainer)) return null

  let currentAlign = 'center'
  try {
    currentAlign = editor.getAttributes('imageResize').dataAlign || 'center'
  } catch (e) {
    return null
  }

  const handleAlignLeft = () => {
    editor.chain().focus().setImageAlign('left').run()
  }

  const handleAlignCenter = () => {
    editor.chain().focus().setImageAlign('center').run()
  }

  const handleAlignRight = () => {
    editor.chain().focus().setImageAlign('right').run()
  }

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run()
  }

  const AlignButton = ({ align, icon, label, onClick, title }) => (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap
        ${currentAlign === align 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:scale-105'
        }
      `}
      title={title || label}
      type="button"
    >
      <span className="flex items-center gap-1.5">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-semibold">{label}</span>
      </span>
    </button>
  )

  return createPortal(
    <div
      ref={toolbarRef}
      className="absolute z-[9999] pointer-events-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {/* Hint text with alignment info */}
        <div className="text-xs text-gray-400 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-700/50">
          {currentAlign === 'inline' 
            ? '💡 Inline (place images side by side)' 
            : currentAlign === 'left'
            ? '💡 Left (text wraps right)'
            : currentAlign === 'right'
            ? '💡 Right (text wraps left)'
            : '💡 Center (full width)'}
        </div>
        
        {/* Main toolbar */}
        <div className="bg-gray-900/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl shadow-2xl p-3 flex flex-col gap-2 animate-fade-in">
          {/* Row 1: Alignment buttons */}
          <div className="flex items-center gap-2 justify-center">
            {/* Alignment Buttons */}
            <AlignButton
              align="left"
              icon="⬅️"
              label="Left"
              title="Float left - text wraps on right"
              onClick={handleAlignLeft}
            />
            <AlignButton
              align="center"
              icon="↔️"
              label="Center"
              title="Center image - no text wrapping"
              onClick={handleAlignCenter}
            />
            <AlignButton
              align="right"
              icon="➡️"
              label="Right"
              title="Float right - text wraps on left"
              onClick={handleAlignRight}
            />
            <AlignButton
              align="inline"
              icon="⬜"
              label="Inline"
              title="Inline - place multiple images side by side"
              onClick={() => editor.chain().focus().setImageAlign('inline').run()}
            />

            {/* Divider */}
            <div className="w-px h-8 bg-gray-600 mx-1"></div>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 whitespace-nowrap"
              title="Delete Image"
              type="button"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-base">🗑️</span>
                <span className="text-xs font-semibold">Delete</span>
              </span>
            </button>
          </div>

          {/* Row 2: Quick resize hint */}
          <div className="flex items-center justify-center gap-2 border-t border-gray-700/50 pt-3">
            <span className="text-xs text-gray-400">
              💡 <strong>Drag corner handles</strong> to resize
            </span>
          </div>

          {/* Arrow pointing to image */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-purple-500/50"></div>
        </div>
      </div>
    </div>,
    portalContainer
  )
}
