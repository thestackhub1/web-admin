// Client-side only — no server secrets or database access here

"use client";

import { Dialog, DialogBackdrop, DialogPanel, CloseButton } from "@headlessui/react";
import { IconButton } from '@/client/components/ui/icon-button';
import { X } from "lucide-react";
import { QuestionEditor } from '@/client/components/shared/rich-text-editor';
import { Button } from '@/client/components/ui/button';

interface McqOptionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any; // TipTap JSON
  onChange: (content: any) => void;
  optionLabel: string;
  language?: "en" | "mr";
}

export function McqOptionEditorModal({
  isOpen,
  onClose,
  content,
  onChange,
  optionLabel,
  language = "en",
}: McqOptionEditorModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Edit Option {optionLabel}
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Use the toolbar for formulas, images, tables, and formatting
              </p>
            </div>
            <CloseButton as={IconButton}>
              <X className="h-4 w-4 stroke-neutral-950 dark:stroke-white" />
            </CloseButton>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <QuestionEditor
              content={content}
              onChange={onChange}
              placeholder={`Enter option ${optionLabel} content...`}
              language={language}
              minHeight="300px"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <Button variant="outline" onClick={onClose} size="sm">
              Done
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

