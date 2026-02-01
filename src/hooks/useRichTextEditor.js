import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { GradientText } from '../extensions/GradientText'
import { FontSize } from '../extensions/FontSize'
import { ImageResize } from '../extensions/ImageResize'
import { useEffect, useRef } from 'react'

export function useRichTextEditor({ content, onChange }) {
  const isFirstRender = useRef(true)
  
  const editor = useEditor({
    extensions: [
      // Configure StarterKit WITHOUT Link (we'll add it separately with custom config)
      StarterKit.configure({
        // Disable extensions we want to configure separately
        link: false,
        underline: false,
      }),
      // Now add them with our custom configuration
      Underline.configure(),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline hover:text-blue-300',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // Text styling extensions
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      // Image support - with alignment and text wrapping
      ImageResize.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      // Custom gradient text extension
      GradientText,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  // Update content when prop changes (but not on first render)
  useEffect(() => {
    if (!editor) return

    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const currentContent = editor.getHTML()
    if (content !== undefined && content !== currentContent) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  return editor
}
