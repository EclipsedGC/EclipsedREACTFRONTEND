import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Custom Image extension with inline support and text wrapping
 */
export const ImageResize = Node.create({
  name: 'imageResize',

  inline: true,
  group: 'inline',
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => {
          if (!attributes.src) return {}
          return { src: attributes.src }
        },
      },
      alt: {
        default: null,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => {
          if (!attributes.alt) return {}
          return { alt: attributes.alt }
        },
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) return {}
          return { title: attributes.title }
        },
      },
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('width') || element.style.width
          return width || null
        },
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { 
            width: attributes.width,
          }
        },
      },
      // Image alignment/float for text wrapping
      dataAlign: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => {
          return { 'data-align': attributes.dataAlign }
        },
      },
    }
  },

  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
      setImageAlign: (align) => ({ commands }) => {
        return commands.updateAttributes(this.name, { dataAlign: align })
      },
      setImageWidth: (width) => ({ commands }) => {
        return commands.updateAttributes(this.name, { width })
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // Ensure width is applied as inline style if set
    const attrs = { ...HTMLAttributes, draggable: 'false' }
    if (attrs.width) {
      attrs.style = `width: ${attrs.width}; height: auto;`
    }
    return ['img', mergeAttributes(attrs)]
  },
  
  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const img = document.createElement('img')
      
      // Set all attributes
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'width') {
          img.setAttribute(key, value)
        }
      })
      
      // Always apply width as inline style for immediate effect
      if (node.attrs.width) {
        img.style.width = node.attrs.width
        img.style.height = 'auto'
        img.style.maxWidth = 'none'
        img.setAttribute('width', node.attrs.width)
      }
      
      img.draggable = false
      
      return {
        dom: img,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'imageResize') return false
          
          // Update width when changed
          if (updatedNode.attrs.width) {
            img.style.width = updatedNode.attrs.width
            img.style.height = 'auto'
            img.style.maxWidth = 'none'
            img.setAttribute('width', updatedNode.attrs.width)
          }
          
          return true
        },
      }
    }
  },
})
