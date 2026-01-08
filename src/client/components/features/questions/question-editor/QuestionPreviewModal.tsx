// Client-side only — no server secrets or database access here

"use client";

import { Dialog, DialogBackdrop, DialogPanel, CloseButton } from "@headlessui/react";
import { IconButton } from '@/client/components/ui/icon-button';
import { X } from "lucide-react";
import { LivePreview } from "./LivePreview";

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionContent: any;
  questionLanguage: "en" | "mr";
  questionType: string;
  answerData: any;
  explanationContent?: any;
}

export function QuestionPreviewModal({
  isOpen,
  onClose,
  questionContent,
  questionLanguage,
  questionType,
  answerData,
  explanationContent,
}: QuestionPreviewModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-neutral-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
                Question Preview
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                This is how your question will appear to students
              </p>
            </div>
            <CloseButton as={IconButton}>
              <X className="h-4 w-4 stroke-neutral-950 dark:stroke-white" />
            </CloseButton>
          </div>

          {/* Preview Content */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 100px)" }}>
            <LivePreview
              questionContent={questionContent}
              questionLanguage={questionLanguage}
              questionType={questionType}
              answerData={answerData}
              explanationContent={explanationContent}
              hideHeader={true}
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

