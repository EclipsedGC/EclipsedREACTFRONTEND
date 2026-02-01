import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Resize handles that appear on selected images
 */
export default function ImageResizeHandles({ editor }) {
  const [showHandles, setShowHandles] = useState(false)
  const [imagePosition, setImagePosition] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [activeHandle, setActiveHandle] = useState(null)
  const dragStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const [isDestroyed, setIsDestroyed] = useState(false)

  useEffect(() => {
    if (!editor) return

    const updateHandles = () => {
      try {
        // Check if editor is still valid and mounted
        if (!editor || !editor.view || editor.isDestroyed) {
          setShowHandles(false)
          return
        }

        // Check if view.dom is accessible (will throw if not mounted)
        try {
          if (!editor.view.dom) {
            setShowHandles(false)
            return
          }
        } catch {
          setShowHandles(false)
          return
        }

        const { state, view } = editor
        const { selection } = state
        const { from } = selection

        // Check if current selection is an image
        const node = state.doc.nodeAt(from)
        const isImage = node && node.type.name === 'imageResize'

        if (isImage) {
          const domNode = view.nodeDOM(from)
          
          if (domNode && domNode instanceof HTMLElement) {
            const imageElement = domNode.querySelector('img') || domNode
            const rect = imageElement.getBoundingClientRect()
            const editorRect = view.dom.getBoundingClientRect()

            setImagePosition({
              top: rect.top - editorRect.top,
              left: rect.left - editorRect.left,
              width: rect.width,
              height: rect.height,
            })
            setShowHandles(true)
          }
        } else {
          setShowHandles(false)
        }
      } catch (error) {
        // Silently handle expected errors during unmounting
        setShowHandles(false)
      }
    }

    editor.on('selectionUpdate', updateHandles)
    editor.on('update', updateHandles)
    updateHandles()

    return () => {
      setIsDestroyed(true)
      setShowHandles(false)
      try {
        editor.off('selectionUpdate', updateHandles)
        editor.off('update', updateHandles)
      } catch (e) {
        // Editor might already be destroyed
      }
    }
  }, [editor])

  const handleMouseDown = (e, handle) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    setActiveHandle(handle)
    
    // Disable text selection and set resize cursor during drag
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
    document.body.style.cursor = e.target.style.cursor || 'nwse-resize'
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: imagePosition.width,
      height: imagePosition.height,
    }
  }

  useEffect(() => {
    if (!isDragging || !editor) return

    let rafId = null
    let imgElement = null
    let finalWidth = null
    
    try {
      // Check if editor is still valid
      if (!editor.view || !editor.view.dom || editor.isDestroyed) {
        setIsDragging(false)
        return
      }

      // Get the image element once at the start
      const { state, view } = editor
      const { selection } = state
      const { from } = selection
      const node = state.doc.nodeAt(from)
      
      if (node && node.type.name === 'imageResize') {
        const domNode = view.nodeDOM(from)
        if (domNode && domNode instanceof HTMLElement) {
          imgElement = domNode.tagName === 'IMG' ? domNode : domNode.querySelector('img')
        }
      }
    } catch (error) {
      // Silently handle expected errors during unmounting
      setIsDragging(false)
      return
    }

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y
      
      let newWidth = dragStartRef.current.width
      let newHeight = dragStartRef.current.height
      
      // Calculate new dimensions based on which handle is being dragged
      switch (activeHandle) {
        case 'nw': // Top-left
          newWidth = dragStartRef.current.width - deltaX
          break
        case 'ne': // Top-right
          newWidth = dragStartRef.current.width + deltaX
          break
        case 'sw': // Bottom-left
          newWidth = dragStartRef.current.width - deltaX
          break
        case 'se': // Bottom-right
          newWidth = dragStartRef.current.width + deltaX
          break
      }

      // Maintain aspect ratio
      const aspectRatio = dragStartRef.current.width / dragStartRef.current.height
      newHeight = newWidth / aspectRatio

      // Enforce minimum size
      const minSize = 50
      if (newWidth < minSize) {
        newWidth = minSize
        newHeight = minSize / aspectRatio
      }

      const roundedWidth = Math.round(newWidth)
      const roundedHeight = Math.round(newHeight)
      
      finalWidth = roundedWidth

      // Cancel previous animation frame if exists
      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      // Update DOM directly for smooth visual feedback (no editor update during drag)
      rafId = requestAnimationFrame(() => {
        if (imgElement instanceof HTMLImageElement) {
          imgElement.style.width = `${roundedWidth}px`
          imgElement.style.height = 'auto'
          imgElement.style.maxWidth = 'none'
        }
        
        // Update local state for handle positions
        setImagePosition(prev => ({
          ...prev,
          width: roundedWidth,
          height: roundedHeight,
        }))
      })
    }

    const handleMouseUp = () => {
      // Cancel any pending animation frame
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      
      // Re-enable text selection and reset cursor
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      document.body.style.cursor = ''
      
      // Now commit the final width to the editor (only once!)
      if (finalWidth && imgElement instanceof HTMLImageElement) {
        try {
          if (editor && !editor.isDestroyed && editor.view && editor.view.dom) {
            editor.chain().focus().setImageWidth(`${finalWidth}px`).run()
          }
        } catch (error) {
          // Silently handle expected errors during unmounting
        }
      }
      
      setIsDragging(false)
      setActiveHandle(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, activeHandle, editor])

  if (!showHandles || !editor || isDestroyed) return null

  // Check if the portal container exists before rendering
  const portalContainer = editor.view?.dom?.parentElement
  if (!portalContainer || !document.body.contains(portalContainer)) return null

  const handleSize = 12
  const handleOffset = -handleSize / 2

  const handles = [
    { id: 'nw', top: handleOffset, left: handleOffset, cursor: 'nw-resize' },
    { id: 'ne', top: handleOffset, right: handleOffset, cursor: 'ne-resize' },
    { id: 'sw', bottom: handleOffset, left: handleOffset, cursor: 'sw-resize' },
    { id: 'se', bottom: handleOffset, right: handleOffset, cursor: 'se-resize' },
  ]

  return createPortal(
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${imagePosition.top}px`,
        left: `${imagePosition.left}px`,
        width: `${imagePosition.width}px`,
        height: `${imagePosition.height}px`,
      }}
    >
      {/* Selection border */}
      <div className="absolute inset-0 border-2 border-purple-500 rounded pointer-events-none" />
      
      {/* Size display */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded font-semibold pointer-events-none whitespace-nowrap">
        {Math.round(imagePosition.width)} × {Math.round(imagePosition.height)}px
      </div>

      {/* Resize handles */}
      {handles.map((handle) => (
        <div
          key={handle.id}
          className="absolute pointer-events-auto"
          style={{
            top: handle.top !== undefined ? `${handle.top}px` : undefined,
            bottom: handle.bottom !== undefined ? `${handle.bottom}px` : undefined,
            left: handle.left !== undefined ? `${handle.left}px` : undefined,
            right: handle.right !== undefined ? `${handle.right}px` : undefined,
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            cursor: handle.cursor,
          }}
          onMouseDown={(e) => handleMouseDown(e, handle.id)}
        >
          <div className="w-full h-full bg-white border-2 border-purple-600 rounded-full shadow-lg hover:scale-125 transition-transform" />
        </div>
      ))}
    </div>,
    portalContainer
  )
}
