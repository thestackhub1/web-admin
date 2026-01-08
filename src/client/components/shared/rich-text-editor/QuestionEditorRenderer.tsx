// Client-side only — no server secrets or database access here

"use client";

/**
 * Question Editor Renderer
 * Renders TipTap JSON content in read-only mode (for preview/display)
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
import { MathExtension } from '@/client/editors/math-extension';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { LoaderSpinner } from '@/client/components/ui/loader';

export interface QuestionEditorRendererProps {
  /** Content as TipTap JSON */
  content: any;
  language?: 'en' | 'mr';
  className?: string;
}

export function QuestionEditorRenderer({
  content,
  language = 'en',
  className,
}: QuestionEditorRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false, // Read-only
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Subscript,
      Superscript,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-neutral-900 text-neutral-100 rounded-lg p-4 my-4',
        },
      }),
      MathExtension,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: clsx(
          'prose prose-sm max-w-none',
          'prose-p:my-2 prose-p:leading-relaxed',
          'prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-bold',
          'prose-img:rounded-lg prose-img:my-4 prose-img:max-w-full',
          'prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm dark:prose-code:bg-neutral-800',
          'prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:rounded-lg prose-pre:p-4',
          'prose-ul:my-2 prose-ol:my-2',
          'prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 prose-blockquote:pl-4 prose-blockquote:italic',
          'px-4 py-3',
          language === 'mr' && 'font-[Noto_Sans_Devanagari]'
        ),
      },
    },
  });

  // Sync content changes
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderSpinner size="md" />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
        className
      )}
    >
      <EditorContent
        editor={editor}
        className={clsx(
          'prose prose-sm max-w-none',
          language === 'mr' && 'font-[Noto_Sans_Devanagari]'
        )}
      />
    </div>
  );
}

