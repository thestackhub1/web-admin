# Premium Rich Text Editor Setup Guide

## Overview

The premium Question Editor is a production-ready rich text editor built with TipTap, designed specifically for creating scholarship exam questions with support for:

- **Bilingual content** (Marathi/Devanagari + English)
- **Mathematical formulas** (LaTeX/KaTeX, inline and display mode)
- **Images** (upload/embed with Supabase Storage)
- **Tables** (insert, edit, merge/split cells)
- **Full WYSIWYG formatting** (bold, italic, underline, lists, headings, alignment, superscripts/subscripts, code blocks)
- **JSON output format** for structured database storage

## Components

### 1. `QuestionEditor` (Main Editor)
Location: `src/components/QuestionEditor.tsx`

The main editor component for creating/editing questions.

**Props:**
- `content?: any` - Initial content as TipTap JSON
- `onChange: (json: any) => void` - Callback when content changes (receives TipTap JSON)
- `placeholder?: string` - Placeholder text
- `language?: 'en' | 'mr'` - Language for font support
- `className?: string` - Additional CSS classes
- `minHeight?: string` - Minimum editor height
- `required?: boolean` - Whether field is required
- `readOnly?: boolean` - Preview mode (read-only)

**Features:**
- Bubble menu on text selection
- Comprehensive toolbar with all formatting options
- Math formula dialog with LaTeX preview
- Table editing controls
- Image upload to Supabase Storage
- Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, etc.)

### 2. `QuestionEditorRenderer` (Preview/Display)
Location: `src/components/QuestionEditorRenderer.tsx`

Read-only renderer for displaying question content.

**Props:**
- `content: any` - TipTap JSON content
- `language?: 'en' | 'mr'` - Language for font support
- `className?: string` - Additional CSS classes

### 3. `MathFormulaDialog` (Math Editor)
Location: `src/components/MathFormulaDialog.tsx`

Visual dialog for inserting LaTeX math formulas with live KaTeX preview.

### 4. `TableControls` (Table Tools)
Location: `src/components/TableControls.tsx`

Toolbar for table editing operations (add/remove rows/columns, merge/split cells).

## Installation & Dependencies

All required packages are already installed in `package.json`:

```json
{
  "@tiptap/react": "^3.14.0",
  "@tiptap/starter-kit": "^3.14.0",
  "@tiptap/extension-table": "^3.14.0",
  "@tiptap/extension-table-row": "^3.14.0",
  "@tiptap/extension-table-cell": "^3.14.0",
  "@tiptap/extension-table-header": "^3.14.0",
  "@tiptap/extension-text-align": "^3.14.0",
  "@tiptap/extension-subscript": "^3.14.0",
  "@tiptap/extension-superscript": "^3.14.0",
  "@tiptap/extension-underline": "^3.14.0",
  "@tiptap/extension-code-block": "^3.14.0",
  "@tiptap/extension-image": "^3.14.0",
  "@tiptap/extension-placeholder": "^3.14.0",
  "@tiptap/extension-bubble-menu": "^3.14.0",
  "katex": "^0.16.11",
  "react-katex": "^3.0.1"
}
```

## Database Storage

The editor outputs **TipTap JSON format**, which should be stored as a **JSON string** in the database.

### Current Schema

The `question_text` field is currently `TEXT` type. Store the JSON as a string:

```typescript
// When saving
const jsonString = JSON.stringify(tiptapJson);
await supabase.from('questions_scholarship').insert({
  question_text: jsonString, // Store as JSON string
  // ...
});
```

### Recommended: Migrate to JSONB (Optional)

For better querying and indexing, consider migrating to `JSONB`:

```sql
ALTER TABLE questions_scholarship 
ALTER COLUMN question_text TYPE JSONB 
USING question_text::JSONB;
```

## Usage Example

### Basic Usage

```tsx
import { QuestionEditor } from '@/components/QuestionEditor';
import { jsonToString, stringToJson } from '@/lib/utils/editor-utils';

function MyQuestionForm() {
  const [content, setContent] = useState(null);

  const handleSave = async () => {
    // Convert TipTap JSON to JSON string for database
    const jsonString = jsonToString(content);
    
    await createQuestion('scholarship', {
      questionText: jsonString,
      // ...
    });
  };

  return (
    <QuestionEditor
      content={content}
      onChange={setContent}
      placeholder="Enter your question..."
      language="mr"
    />
  );
}
```

### With Preview Mode

```tsx
import { QuestionEditor } from '@/components/QuestionEditor';
import { QuestionEditorRenderer } from '@/components/QuestionEditorRenderer';
import { useState } from 'react';

function QuestionFormWithPreview() {
  const [content, setContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div>
      {showPreview ? (
        <QuestionEditorRenderer content={content} language="mr" />
      ) : (
        <QuestionEditor
          content={content}
          onChange={setContent}
          language="mr"
        />
      )}
      <button onClick={() => setShowPreview(!showPreview)}>
        {showPreview ? 'Edit' : 'Preview'}
      </button>
    </div>
  );
}
```

### Loading Existing Content

```tsx
import { stringToJson } from '@/lib/utils/editor-utils';

function EditQuestion({ question }) {
  // Parse stored JSON string back to TipTap JSON
  const initialContent = stringToJson(question.question_text);

  return (
    <QuestionEditor
      content={initialContent}
      onChange={(json) => {
        // Save as JSON string
        const jsonString = JSON.stringify(json);
        // Update question...
      }}
      language={question.question_language}
    />
  );
}
```

## Image Upload

Images are automatically uploaded to Supabase Storage bucket `question-assets` in the `question-images/` folder.

**Requirements:**
- Supabase Storage bucket named `question-assets` must exist
- Bucket must have public read access
- Maximum file size: 5MB

**Configuration:**
The upload handler is in `QuestionEditor.tsx`. To customize:

```tsx
// In QuestionEditor.tsx, handleImageUpload function
const filePath = `question-images/${fileName}`;
const { data, error } = await supabase.storage
  .from('question-assets')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
```

## Math Formulas

### Inserting Math

1. Click the **Σ (Sigma)** button in the toolbar
2. Enter LaTeX formula in the dialog
3. Choose inline or display mode
4. Preview updates in real-time
5. Click "Insert Formula"

### LaTeX Examples

- Fraction: `\frac{a}{b}`
- Square root: `\sqrt{x}`
- Power: `x^{2}`
- Subscript: `x_{i}`
- Sum: `\sum_{i=1}^{n}`
- Integral: `\int_{a}^{b}`
- Greek letters: `\alpha`, `\beta`, `\pi`, `\Delta`
- Operators: `\neq`, `\leq`, `\geq`, `\pm`

### Quick Insert Templates

The math dialog includes quick-insert buttons for common formulas.

## Tables

### Inserting Tables

1. Click the **Table** icon in the toolbar
2. A 3x3 table with header row is inserted

### Table Operations

When the cursor is in a table, the **Table Controls** toolbar appears:

- **Add Column Before/After** - Insert new columns
- **Delete Column** - Remove current column
- **Add Row Before/After** - Insert new rows
- **Delete Row** - Remove current row
- **Merge Cells** - Combine selected cells
- **Split Cell** - Split merged cell
- **Delete Table** - Remove entire table

## Keyboard Shortcuts

- `Ctrl+B` / `Cmd+B` - Bold
- `Ctrl+I` / `Cmd+I` - Italic
- `Ctrl+U` / `Cmd+U` - Underline
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Ctrl+Shift+X` - Code block

## Styling & Customization

### Font Support for Devanagari

The editor automatically applies `Noto Sans Devanagari` font when `language="mr"`:

```tsx
<QuestionEditor language="mr" />
```

### Custom Styling

The editor uses Tailwind CSS classes. To customize:

1. Override classes via `className` prop
2. Modify prose classes in `editorProps.attributes.class`
3. Customize toolbar in the component

### Dark Mode

The editor automatically supports dark mode via Tailwind's `dark:` classes.

## Integration with Existing Forms

### Replace ToggleableRichEditor

Replace:
```tsx
<ToggleableRichEditor
  value={questionText}
  onChange={setQuestionText}
  language={questionLanguage}
/>
```

With:
```tsx
import { QuestionEditor } from '@/components/QuestionEditor';
import { jsonToString, stringToJson } from '@/lib/utils/editor-utils';

const [questionContent, setQuestionContent] = useState(
  stringToJson(questionText) // If questionText is HTML, convert first
);

<QuestionEditor
  content={questionContent}
  onChange={setQuestionContent}
  language={questionLanguage}
/>

// When saving:
const jsonString = jsonToString(questionContent);
// Save jsonString to database
```

## Migration from HTML

If you have existing questions stored as HTML, use the conversion utility:

```typescript
import { htmlToJson } from '@/lib/utils/editor-utils';

// For migration script
const htmlContent = question.question_text; // HTML string
const jsonContent = htmlToJson(htmlContent); // Convert to TipTap JSON
const jsonString = JSON.stringify(jsonContent); // Store as JSON string
```

**Note:** The basic `htmlToJson` function only strips HTML tags. For full HTML parsing, use TipTap's HTML parser:

```typescript
import { generateHTML } from '@tiptap/html';
import { generateJSON } from '@tiptap/html';

const json = generateJSON(htmlString, extensions);
```

## Troubleshooting

### Images Not Uploading

1. Check Supabase Storage bucket exists: `question-assets`
2. Verify bucket has public read access
3. Check file size (max 5MB)
4. Verify Supabase client is configured correctly

### Math Formulas Not Rendering

1. Ensure `katex` CSS is imported: `import 'katex/dist/katex.min.css'`
2. Check LaTeX syntax is valid
3. Verify `MathExtension` is included in editor extensions

### Devanagari Text Not Displaying

1. Ensure `language="mr"` prop is set
2. Verify `Noto Sans Devanagari` font is loaded (should be in global CSS)
3. Check browser font support

### JSON Parsing Errors

Use the `stringToJson` utility which handles:
- Invalid JSON (falls back to plain text)
- Null/undefined values
- Backward compatibility with HTML content

## Performance

- Editor is lazy-loaded (only renders when needed)
- Images are optimized with Supabase CDN
- KaTeX rendering is cached
- Table operations are efficient

## Accessibility

- ARIA labels on all toolbar buttons
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Next Steps

1. **Replace existing editors** with `QuestionEditor` in question forms
2. **Migrate existing HTML content** to JSON format (optional)
3. **Consider JSONB migration** for better querying (optional)
4. **Add custom extensions** if needed (e.g., audio embed, hints)

## Support

For issues or questions:
- Check TipTap documentation: https://tiptap.dev
- KaTeX documentation: https://katex.org
- Review component code in `src/components/QuestionEditor.tsx`


