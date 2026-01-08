// Client-side only — no server secrets or database access here

"use client";

import { Dialog, DialogBackdrop, DialogPanel, CloseButton } from "@headlessui/react";
import { IconButton } from '@/client/components/ui/icon-button';
import { X } from "lucide-react";
import { QuestionForm } from '@/client/components/features/questions/question-form';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectSlug: string;
  initialData?: any;
  onSuccess: () => void;
}

export function QuestionModal({
  isOpen,
  onClose,
  subjectSlug,
  initialData,
  onSuccess,
}: QuestionModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-neutral-950/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              {initialData ? "Edit Question" : "Add New Question"}
            </h2>
            <CloseButton as={IconButton}>
              <X className="h-4 w-4 stroke-neutral-950 dark:stroke-white" />
            </CloseButton>
          </div>
          <QuestionForm
            subjectSlug={subjectSlug}
            initialData={initialData}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
