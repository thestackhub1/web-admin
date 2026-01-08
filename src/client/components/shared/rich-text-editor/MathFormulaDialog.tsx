// Client-side only — no server secrets or database access here

"use client";

/**
 * Math Formula Dialog
 * Visual editor for LaTeX math formulas with live KaTeX preview
 */

import { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Button } from '@/client/components/ui/button';
import { X } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { clsx } from 'clsx';

interface MathFormulaDialogProps {
  onInsert: (latex: string, inline: boolean) => void;
  onClose: () => void;
}

// Common LaTeX templates for quick insertion
const LATEX_TEMPLATES = [
  { label: 'Fraction', latex: '\\frac{a}{b}' },
  { label: 'Square Root', latex: '\\sqrt{x}' },
  { label: 'Power', latex: 'x^{2}' },
  { label: 'Subscript', latex: 'x_{i}' },
  { label: 'Sum', latex: '\\sum_{i=1}^{n}' },
  { label: 'Integral', latex: '\\int_{a}^{b}' },
  { label: 'Greek Alpha', latex: '\\alpha' },
  { label: 'Greek Beta', latex: '\\beta' },
  { label: 'Pi', latex: '\\pi' },
  { label: 'Delta', latex: '\\Delta' },
  { label: 'Infinity', latex: '\\infty' },
  { label: 'Not Equal', latex: '\\neq' },
  { label: 'Less Equal', latex: '\\leq' },
  { label: 'Greater Equal', latex: '\\geq' },
  { label: 'Plus Minus', latex: '\\pm' },
];

export function MathFormulaDialog({ onInsert, onClose }: MathFormulaDialogProps) {
  const [latex, setLatex] = useState('');
  const [isInline, setIsInline] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Render preview
  const renderPreview = () => {
    if (!latex.trim()) {
      return (
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800">
          Preview will appear here
        </div>
      );
    }

    try {
      setPreviewError(null);
      const html = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: !isInline,
      });
      return (
        <div
          className={clsx(
            'rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800',
            isInline ? 'text-center' : 'w-full'
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      setPreviewError('Invalid LaTeX syntax');
      return (
        <div className="flex h-20 items-center justify-center rounded-lg border border-red-300 bg-red-50 text-sm text-red-600 dark:border-red-600 dark:bg-red-900/20">
          Error: Invalid LaTeX syntax
        </div>
      );
    }
  };

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert(latex.trim(), isInline);
    }
  };

  const insertTemplate = (template: string) => {
    setLatex((prev) => prev + template);
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Insert Math Formula
            </h2>
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4 p-6">
            {/* LaTeX Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                LaTeX Formula
              </label>
              <textarea
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                placeholder="Enter LaTeX formula (e.g., \\frac{a}{b} or x^2 + y^2 = r^2)"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                rows={3}
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Use LaTeX syntax. Common examples: <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">{"\\frac{a}{b}"}</code>,{' '}
                <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">{"x^{2}"}</code>,{' '}
                <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">{"\\sqrt{x}"}</code>
              </p>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Quick Insert
              </label>
              <div className="flex flex-wrap gap-2">
                {LATEX_TEMPLATES.map((template) => (
                  <Button
                    key={template.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertTemplate(template.latex)}
                    className="text-xs"
                  >
                    {template.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Preview
              </label>
              {renderPreview()}
            </div>

            {/* Inline/Display Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isInline}
                  onChange={() => setIsInline(true)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Inline</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!isInline}
                  onChange={() => setIsInline(false)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Display (Block)</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInsert}
              disabled={!latex.trim() || !!previewError}
            >
              Insert Formula
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

