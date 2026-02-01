import { Mark, mergeAttributes } from '@tiptap/core'

/**
 * Custom Tiptap extension for gradient text
 * Applies CSS gradient to text using background-clip
 */
export const GradientText = Mark.create({
  name: 'gradientText',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      gradient: {
        default: null,
        parseHTML: element => element.getAttribute('data-gradient'),
        renderHTML: attributes => {
          if (!attributes.gradient) {
            return {}
          }

          return {
            'data-gradient': attributes.gradient,
            style: `background: ${attributes.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-gradient]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setGradient: gradient => ({ commands }) => {
        return commands.setMark(this.name, { gradient })
      },
      unsetGradient: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
