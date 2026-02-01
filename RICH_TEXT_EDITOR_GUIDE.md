# 🎨 Rich Text Editor Guide

## Overview

This is a fully-featured Tiptap v2-based rich text editor with modern UI/UX, custom styling, and advanced features like gradient text, font customization, and image support.

---

## ✨ Features

### 1. **Font Customization**

#### Font Family
- **Google Fonts**: Audiowide, Orbitron, Nova Square, Calligraffitti
- **System Fonts**: Arial, Comic Sans MS
- **Implementation**: Uses Tiptap's `FontFamily` extension + `TextStyle`
- **UI**: Dropdown selector in toolbar

```javascript
// Applied via:
editor.chain().focus().setFontFamily('Orbitron, sans-serif').run()
```

#### Font Size
- **Available Sizes**: 12px to 48px in increments
- **Implementation**: Custom CSS styles + TextStyle marks
- **UI**: Dropdown selector in toolbar

```javascript
// Applied via:
editor.chain().focus().setMark('textStyle', { fontSize: '24px' }).run()
```

**How it works:**
- The font size is stored as an inline style attribute
- Custom CSS rules in `index.css` enforce the sizes
- The `TextStyle` extension allows arbitrary CSS properties

---

### 2. **Color & Gradient Text**

#### Solid Colors
- **Quick Colors**: 18 preset colors for fast selection
- **Custom Color**: Full color picker for any hex value
- **Implementation**: Tiptap's `Color` extension

```javascript
// Applied via:
editor.chain().focus().setColor('#ef4444').run()
```

#### Gradient Text ✨
This is the most advanced feature - it creates beautiful gradient text effects.

**How Gradient Text Works:**

1. **Custom Extension** (`GradientText.js`):
   ```javascript
   export const GradientText = Mark.create({
     name: 'gradientText',
     
     addAttributes() {
       return {
         gradient: {
           // Stores the gradient CSS value
           parseHTML: element => element.getAttribute('data-gradient'),
           renderHTML: attributes => ({
             'data-gradient': attributes.gradient,
             style: `
               background: ${attributes.gradient};
               -webkit-background-clip: text;
               -webkit-text-fill-color: transparent;
               background-clip: text;
             `,
           }),
         },
       }
     },
     
     addCommands() {
       return {
         setGradient: gradient => ({ commands }) => {
           return commands.setMark(this.name, { gradient })
         },
       }
     },
   })
   ```

2. **CSS Technique**:
   - Applies a `linear-gradient` as the text background
   - Uses `background-clip: text` to clip the gradient to text shape
   - Uses `-webkit-text-fill-color: transparent` to make text transparent
   - The gradient shows through the transparent text

3. **Usage**:
   ```javascript
   editor.chain().focus().setGradient(
     'linear-gradient(90deg, #a855f7 0%, #3b82f6 100%)'
   ).run()
   ```

4. **Presets**:
   - Purple to Blue
   - Pink to Orange
   - Green to Blue
   - Gold to Red
   - Rainbow (multi-stop gradient)

**Why This Works:**
- `background-clip: text` is a CSS feature that clips background to text
- When combined with transparent text, the background becomes visible as the text color
- This allows complex gradients that normal text color cannot achieve

---

### 3. **Text Formatting**

Standard rich text features:
- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I)
- **Underline** (Ctrl+U)
- **Strikethrough**

---

### 4. **Content Structure**

#### Headings
- H1, H2, H3 with custom styling
- Larger sizes, bold weights, proper spacing

#### Lists
- Bullet lists (unordered)
- Numbered lists (ordered)
- Nested list support

#### Links
- Insert via URL prompt
- Blue color with underline
- Hover effects

#### Images
- Insert via URL
- Responsive (max-width: 100%)
- Rounded corners
- Auto margin

#### Blockquotes
- Left border accent (purple)
- Italic text
- Indented

#### Horizontal Rules
- Visual separator
- Clean gray line

---

### 5. **Text Alignment**

- Left align
- Center align
- Right align

Applied to paragraphs and headings.

---

## 🎨 UI/UX Design

### Design Philosophy
- **Modern & Clean**: Inspired by Notion and modern editors
- **Dark Theme**: Matches the space-themed website
- **Icon-Based**: Clear visual indicators
- **Hover States**: Smooth transitions and visual feedback
- **Active States**: Gradient background for active tools

### Toolbar Layout

```
┌─────────────────────────────────────────────────────┐
│ Row 1: Font Family | Font Size | Color | Gradient   │
├─────────────────────────────────────────────────────┤
│ Row 2: B I U S | H1 H2 H3                          │
├─────────────────────────────────────────────────────┤
│ Row 3: Lists | Link | Image | Quote                 │
├─────────────────────────────────────────────────────┤
│ Row 4: Align Left/Center/Right | HR | Undo/Redo    │
└─────────────────────────────────────────────────────┘
```

### Color Scheme
- **Background**: Gray-900/800 with opacity
- **Borders**: Gray-700
- **Text**: Gray-300 (inactive), White (active)
- **Accent**: Purple-600 to Blue-600 gradient
- **Hover**: Gray-700 background

---

## 📦 Architecture

### File Structure

```
src/
├── components/
│   └── RichTextEditor.jsx         # Main editor component
├── hooks/
│   └── useRichTextEditor.js       # Editor hook with extensions
├── extensions/
│   └── GradientText.js            # Custom gradient text extension
└── index.css                       # Global styles + editor styles
```

### Component Hierarchy

```
RichTextEditor
  ├── Toolbar
  │   ├── Dropdown (Font Family)
  │   ├── Dropdown (Font Size)
  │   ├── ColorPicker
  │   ├── GradientPicker
  │   └── ToolbarButton (x20+)
  └── EditorContent (Tiptap)
```

---

## 🔧 Technical Details

### Extensions Used

```javascript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      link: false,      // We configure this separately
      underline: false, // We configure this separately
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-blue-400 underline' },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,           // Required for Color and FontFamily
    Color,               // Solid colors
    FontFamily.configure({
      types: ['textStyle'],
    }),
    Image.configure({
      inline: true,
      HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
    }),
    GradientText,        // Custom gradient extension
  ],
})
```

### State Management

- **Editor State**: Managed by Tiptap's `useEditor` hook
- **Dropdown State**: Local state with `useState`
- **Color Picker State**: Local state with toggle logic
- **Content Sync**: Bidirectional sync between prop and editor

### Custom Hooks

**`useRichTextEditor`**:
- Initializes editor with all extensions
- Handles content synchronization
- Prevents re-initialization on prop changes
- Returns editor instance

---

## 🚀 Usage Example

```jsx
import RichTextEditor from './components/RichTextEditor'

function MyComponent() {
  const [content, setContent] = useState('<p>Hello world!</p>')
  
  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
    />
  )
}
```

The editor automatically:
- ✅ Loads existing content
- ✅ Updates content on change
- ✅ Saves HTML output
- ✅ Handles all formatting internally

---

## 🎯 Advanced Customization

### Adding New Font Families

1. Add to Google Fonts link in `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" />
   ```

2. Add to `FONT_FAMILIES` array in `RichTextEditor.jsx`:
   ```javascript
   { label: 'Your Font', value: 'Your Font, fallback' }
   ```

### Adding New Gradient Presets

Add to `GRADIENT_PRESETS` array:
```javascript
{
  name: 'Custom Name',
  value: 'linear-gradient(90deg, #color1 0%, #color2 100%)'
}
```

### Customizing Toolbar

All buttons are in the `Toolbar` component. You can:
- Reorder buttons by moving JSX
- Add new buttons using `<ToolbarButton>`
- Remove features by deleting button sections
- Add dividers with `<div className="w-px bg-gray-700 mx-1"></div>`

---

## 📝 Content Storage

### Output Format

The editor outputs **HTML strings**:

```html
<p>
  <span style="font-family: Orbitron, sans-serif; font-size: 24px;">
    Space Heading
  </span>
</p>
<p>
  <span data-gradient="linear-gradient(90deg, #a855f7 0%, #3b82f6 100%)" 
        style="background: linear-gradient(...); -webkit-background-clip: text; ...">
    Gradient Text
  </span>
</p>
```

### Sanitization

Content is sanitized on the **public page** using DOMPurify:
```javascript
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(htmlContent)
```

This ensures:
- No `<script>` tags
- No inline event handlers
- No dangerous HTML
- Safe rendering

---

## 🛡️ Security

### Server-Side
- Only GUILD_MASTER and COUNCIL can save content
- Permission checks on API routes
- Content stored in database securely

### Client-Side
- Content sanitized before public display
- No direct HTML injection
- Editor access controlled by rank

---

## 🐛 Troubleshooting

### Fonts Not Loading
**Issue**: Custom fonts not appearing  
**Fix**: Check Google Fonts link in `index.html` and ensure font names match exactly

### Gradient Text Not Working
**Issue**: Gradient appears as solid color  
**Fix**: Ensure CSS in `index.css` includes:
```css
.ProseMirror span[data-gradient] {
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}
```

### Font Size Not Changing
**Issue**: Selected font size doesn't apply  
**Fix**: Check that `index.css` has font-size rules for `.ProseMirror [style*="font-size: XXpx"]`

### Editor Re-initializing on Every Render
**Issue**: Editor resets frequently  
**Fix**: Ensure `useRichTextEditor` uses `useRef` to track first render and prevent content resets

---

## 📚 Resources

- [Tiptap Documentation](https://tiptap.dev/)
- [Custom Extensions Guide](https://tiptap.dev/guide/custom-extensions)
- [CSS background-clip](https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip)
- [React Hooks](https://react.dev/reference/react)

---

## 🎉 Summary

This rich text editor provides:
- ✅ 6+ font families with easy expansion
- ✅ 12 font sizes (12px-48px)
- ✅ Solid color picker with 18+ presets
- ✅ Gradient text with 5 presets
- ✅ Image insertion via URL
- ✅ Full text formatting (bold, italic, underline, etc.)
- ✅ Headings, lists, links, quotes
- ✅ Text alignment
- ✅ Undo/redo
- ✅ Modern, Notion-inspired UI
- ✅ Production-ready, readable code

The gradient text feature is the standout - it uses CSS `background-clip` to apply complex gradients to text, something not possible with regular `color` properties. This creates eye-catching, professional text effects perfect for your space-themed guild website!
