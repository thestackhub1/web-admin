// Client-side only — no server secrets or database access here

"use client";

/**
 * Premium Rich Text Editor for Question Creation
 * 
 * Features:
 * - Bilingual content (Marathi/Devanagari + English)
 * - Mathematical formulas (LaTeX/KaTeX, inline and display)
 * - Images (upload/embed with alignment, captions)
 * - Tables (insert, edit, merge/split cells)
 * - Full WYSIWYG formatting
 * - JSON output format for database storage
 * - Premium UX with bubble/floating menus
 * 
 * Output: TipTap JSON format (structured, easy to store in DB)
 */

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CodeBlock from '@tiptap/extension-code-block';
import CharacterCount from '@tiptap/extension-character-count';
import { MathExtension } from '@/client/editors/math-extension';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Sigma,
  Table as TableIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Code2,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Quote,

} from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { clsx } from 'clsx';
import { useState, useCallback, useEffect } from 'react';
import { uploadQuestionImage } from '@/client/api/uploads';
import { toast } from 'sonner';
import { LoaderSpinner } from '@/client/components/ui/loader';
import { MathFormulaDialog } from './MathFormulaDialog';
import { TableControls } from './TableControls';

export interface QuestionEditorProps {
  /** Initial content as TipTap JSON or HTML string */
  content?: any;
  /** Callback when content changes */
  onChange: (content: any) => void;
  placeholder?: string;
  language?: 'en' | 'mr';
  className?: string;
  /** Minimum height (e.g., '300px') */
  minHeight?: string;
  required?: boolean;
  /** Whether editor is read-only (preview mode) */
  readOnly?: boolean;
  /** Output format - JSON (default) or HTML string */
  outputFormat?: 'json' | 'html';
  /** Editor variant - default (full) or compact (minimal) */
  variant?: 'default' | 'compact';
}

export function QuestionEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  language = 'en',
  className,
  minHeight,
  readOnly = false,
  required: _required = false,
  variant = 'default',
  outputFormat = 'json',
}: QuestionEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showMathDialog, setShowMathDialog] = useState(false);

  // Determine min-height based on variant if not provided
  const effectiveMinHeight = minHeight || (variant === 'compact' ? '120px' : '300px');

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: variant === 'default' ? { levels: [1, 2, 3] } : false,
        bulletList: variant === 'default' ? undefined : false,
        orderedList: variant === 'default' ? undefined : false,
        blockquote: variant === 'default' ? undefined : false,
        codeBlock: false, // We'll add it separately if needed
        horizontalRule: variant === 'default' ? undefined : false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      // Only include Table extensions in default mode
      ...(variant === 'default' ? [
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        CodeBlock.configure({
          HTMLAttributes: {
            class: 'bg-neutral-900 text-neutral-100 rounded-lg p-4 my-4',
          },
        }),
      ] : []),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Subscript,
      Superscript,
      MathExtension,
      CharacterCount,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      // Output as JSON or HTML based on prop
      if (outputFormat === 'html') {
        onChange(editor.getHTML());
      } else {
        onChange(editor.getJSON());
      }
    },
    editorProps: {
      attributes: {
        class: clsx(
          'prose prose-sm max-w-none focus:outline-none',
          'prose-p:my-1 prose-p:leading-relaxed', // Reduced margin for compactness
          variant === 'default' && [
            'prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-bold',
            'prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:rounded-lg prose-pre:p-4',
            'prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 prose-blockquote:pl-4 prose-blockquote:italic',
          ],
          'prose-img:rounded-lg prose-img:my-2 prose-img:max-w-full',
          variant === 'compact' && 'prose-img:max-h-32', // Limit image height in compact mode
          'prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm dark:prose-code:bg-neutral-800',
          'px-4 py-3',
          language === 'mr' && 'font-[Noto_Sans_Devanagari]'
        ),
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (!editor || !content) return;

    if (outputFormat === 'html') {
      if (content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    } else {
      // JSON comparison
      if (JSON.stringify(content) !== JSON.stringify(editor.getJSON())) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor, outputFormat]);

  // Handle image upload
  const handleImageUpload = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setIsUploadingImage(true);
      try {
        const { data, error } = await uploadQuestionImage(file);
        
        if (error || !data) {
          throw new Error(error || 'Upload failed');
        }

        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        toast.success('Image uploaded');
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setIsUploadingImage(false);
      }
    };
    input.click();
  }, [editor]);

  const handleMathInsert = useCallback((latex: string, inline: boolean) => {
    if (!editor) return;
    editor.chain().focus().setMath({ latex, inline }).run();
    setShowMathDialog(false);
  }, [editor]);

  // Table operations (Only for default mode)
  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  // ... (keep other table functions) ...
  const deleteTable = useCallback(() => editor?.chain().focus().deleteTable().run(), [editor]);
  const addColumnBefore = useCallback(() => editor?.chain().focus().addColumnBefore().run(), [editor]);
  const addColumnAfter = useCallback(() => editor?.chain().focus().addColumnAfter().run(), [editor]);
  const deleteColumn = useCallback(() => editor?.chain().focus().deleteColumn().run(), [editor]);
  const addRowBefore = useCallback(() => editor?.chain().focus().addRowBefore().run(), [editor]);
  const addRowAfter = useCallback(() => editor?.chain().focus().addRowAfter().run(), [editor]);
  const deleteRow = useCallback(() => editor?.chain().focus().deleteRow().run(), [editor]);
  const mergeCells = useCallback(() => editor?.chain().focus().mergeCells().run(), [editor]);
  const splitCell = useCallback(() => editor?.chain().focus().splitCell().run(), [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderSpinner size="md" />
      </div>
    );
  }

  const isInTable = editor.isActive('table');

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Bubble Menu - Only in default mode */}
      {!readOnly && variant === 'default' && (
        <BubbleMenu editor={editor} updateDelay={100}>
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            {/* ... bubble menu items (keep as is) ... */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={clsx('h-8 w-8 p-0', editor.isActive('bold') && 'bg-neutral-100 dark:bg-neutral-700')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={clsx('h-8 w-8 p-0', editor.isActive('italic') && 'bg-neutral-100 dark:bg-neutral-700')}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Unified Editor Container */}
      <div
        className={clsx(
          'group relative flex flex-col rounded-xl border transition-all',
          'bg-white dark:bg-neutral-900',
          'border-neutral-200 dark:border-neutral-800',
          !readOnly && 'focus-within:border-primary-500/50 focus-within:ring-4 focus-within:ring-primary-500/10',
          readOnly && 'opacity-75 bg-neutral-50 dark:bg-neutral-900/50'
        )}
      >
        {/* Main Toolbar - Simplified for Compact Mode */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50/50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
            {/* Common: Bold/Italic/Underline */}
            <div className={clsx("flex items-center gap-0.5", variant === 'default' && "border-r border-neutral-200 pr-2 mr-2 dark:border-neutral-800")}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={clsx('h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100', editor.isActive('bold') && 'bg-neutral-200/60 dark:bg-neutral-800')}
                title="Bold"
              >
                <Bold className="h-4.5 w-4.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={clsx('h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100', editor.isActive('italic') && 'bg-neutral-200/60 dark:bg-neutral-800')}
                title="Italic"
              >
                <Italic className="h-4.5 w-4.5" />
              </Button>
              {variant === 'default' && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={clsx('h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100', editor.isActive('underline') && 'bg-neutral-200/60 dark:bg-neutral-800')}
                    title="Underline"
                  >
                    <UnderlineIcon className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    className={clsx('h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100', editor.isActive('subscript') && 'bg-neutral-200/60 dark:bg-neutral-800')}
                    title="Subscript"
                  >
                    <SubscriptIcon className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    className={clsx('h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100', editor.isActive('superscript') && 'bg-neutral-200/60 dark:bg-neutral-800')}
                    title="Superscript"
                  >
                    <SuperscriptIcon className="h-4.5 w-4.5" />
                  </Button>
                </>
              )}
            </div>

            {/* Default Mode Only: Headings, Lists, Alignment, Code */}
            {variant === 'default' && (
              <>
                <div className="flex items-center gap-0.5 border-r border-neutral-200 pr-2 mr-2 dark:border-neutral-800">
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive('heading', { level: 1 }) && 'bg-neutral-200/60 dark:bg-neutral-800')} title="H1"><Heading1 className="h-4.5 w-4.5" /></Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive('heading', { level: 2 }) && 'bg-neutral-200/60 dark:bg-neutral-800')} title="H2"><Heading2 className="h-4.5 w-4.5" /></Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive('heading', { level: 3 }) && 'bg-neutral-200/60 dark:bg-neutral-800')} title="H3"><Heading3 className="h-4.5 w-4.5" /></Button>
                </div>
                <div className="flex items-center gap-0.5 border-r border-neutral-200 pr-2 mr-2 dark:border-neutral-800">
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive('bulletList') && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Bullet List"><List className="h-4.5 w-4.5" /></Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive('orderedList') && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Numbered List"><ListOrdered className="h-4.5 w-4.5" /></Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive('blockquote') && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Quote"><Quote className="h-4.5 w-4.5" /></Button>
                </div>
                <div className="flex items-center gap-0.5 border-r border-neutral-200 pr-2 mr-2 dark:border-neutral-800">
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive({ textAlign: 'left' }) && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Left"><AlignLeft className="h-4.5 w-4.5" /></Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive({ textAlign: 'center' }) && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Center"><AlignCenter className="h-4.5 w-4.5" /></Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive({ textAlign: 'right' }) && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Right"><AlignRight className="h-4.5 w-4.5" /></Button>
                </div>
                <div className="flex items-center gap-0.5 border-r border-neutral-200 pr-2 mr-2 dark:border-neutral-800">
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive('code') && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Code"><Code className="h-4.5 w-4.5" /></Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={clsx('h-8 w-8 p-0 text-neutral-600', editor.isActive('codeBlock') && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Block"><Code2 className="h-4.5 w-4.5" /></Button>
                </div>
              </>
            )}

            {/* Common: Math & Image */}
            <div className={clsx("flex items-center gap-0.5", variant === 'default' && "border-r border-neutral-200 pr-2 mr-2 dark:border-neutral-800")}>
              {variant === 'compact' && <div className="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-700" />}
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowMathDialog(true)} className="h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" title="Math"><Sigma className="h-4.5 w-4.5" /></Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleImageUpload} disabled={isUploadingImage} className="h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" title="Image">{isUploadingImage ? <LoaderSpinner size="sm" /> : <ImageIcon className="h-4.5 w-4.5" />}</Button>
            </div>

            {/* Default Mode Only: Table & Undo/Redo */}
            {variant === 'default' && (
              <>
                <div className="flex items-center gap-0.5 border-r border-neutral-200 pr-2 mr-2 dark:border-neutral-800">
                  <Button type="button" variant="ghost" size="sm" onClick={insertTable} className={clsx('h-8 w-8 p-0 text-neutral-600', isInTable && 'bg-neutral-200/60 dark:bg-neutral-800')} title="Table"><TableIcon className="h-4.5 w-4.5" /></Button>
                </div>
                <div className="flex items-center gap-0.5 ml-auto">
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0 text-neutral-600 disabled:opacity-30" title="Undo"><Undo className="h-4.5 w-4.5" /></Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0 text-neutral-600 disabled:opacity-30" title="Redo"><Redo className="h-4.5 w-4.5" /></Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Table Controls - Show when in table (Default only) */}
        {!readOnly && isInTable && variant === 'default' && (
          <div className="border-b border-neutral-200 bg-neutral-50 px-2 py-1 dark:border-neutral-800 dark:bg-neutral-900">
            <TableControls
              onAddColumnBefore={addColumnBefore}
              onAddColumnAfter={addColumnAfter}
              onDeleteColumn={deleteColumn}
              onAddRowBefore={addRowBefore}
              onAddRowAfter={addRowAfter}
              onDeleteRow={deleteRow}
              onMergeCells={mergeCells}
              onSplitCell={splitCell}
              onDeleteTable={deleteTable}
            />
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: effectiveMinHeight }}>
          <EditorContent
            editor={editor}
            className={clsx(
              'prose prose-neutral max-w-none dark:prose-invert',
              'prose-p:my-1.5 prose-p:leading-relaxed',
              variant === 'default' && [
                'prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold',
                'prose-pre:bg-neutral-900 prose-pre:rounded-lg prose-pre:p-4',
              ],
              'prose-img:rounded-lg prose-img:my-4 prose-img:shadow-sm',
              'focus:outline-none',
              'px-6 py-4',
              language === 'mr' && 'font-[Noto_Sans_Devanagari]'
            )}
          />
        </div>

        {/* Footer Helper (Default only) */}
        {!readOnly && variant === 'default' && (
          <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50/30 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400">
            <span>{editor.storage.characterCount?.characters()} characters</span>
            <div className="flex gap-2">
              <span>Markdown shortcuts supported</span>
            </div>
          </div>
        )}
      </div>


      {/* Math Formula Dialog */}
      {showMathDialog && (
        <MathFormulaDialog
          onInsert={handleMathInsert}
          onClose={() => setShowMathDialog(false)}
        />
      )}
    </div>
  );
}

