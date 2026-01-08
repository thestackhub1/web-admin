// Client-side only — no server secrets or database access here

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Check, FileText, Target, HelpCircle, Clock, Layers } from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { clsx } from "clsx";
import { Button } from '@/client/components/ui/button';
import { useUpdateScheduledExam } from "@/client/hooks";

interface ExamStructure {
  id: string;
  name_en: string;
  name_mr: string;
  total_marks: number;
  total_questions: number;
  duration_minutes: number;
  sections: any[];
}

interface AssignStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledExamId: string;
  structures: ExamStructure[];
  currentStructureId?: string | null;
}

export function AssignStructureModal({
  isOpen,
  onClose,
  scheduledExamId,
  structures,
  currentStructureId,
}: AssignStructureModalProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(currentStructureId || null);
  
  // Use hook for updating scheduled exam
  const { mutate: updateExam, loading: isSaving } = useUpdateScheduledExam();

  const handleAssign = async () => {
    const result = await updateExam({
      id: scheduledExamId,
      exam_structure_id: selectedId,
    });

    if (result) {
      toast.success(
        selectedId ? "Blueprint assigned successfully" : "Blueprint removed successfully"
      );
      router.refresh();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 mx-4 my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Assign Exam Blueprint
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Select a blueprint to define the exam structure
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Structure List */}
        <div className="mt-6 max-h-100 space-y-3 overflow-y-auto">
          {/* No structure option */}
          <button
            onClick={() => setSelectedId(null)}
            className={clsx(
              "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
              selectedId === null
                ? "border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/20"
                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
            )}
          >
            <div
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                selectedId === null
                  ? "bg-brand-blue-500 text-white"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
              )}
            >
              <X className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-neutral-900 dark:text-white">No Blueprint</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Remove assigned blueprint
              </p>
            </div>
            {selectedId === null && <Check className="h-5 w-5 text-brand-blue-500" />}
          </button>

          {structures.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center dark:border-neutral-700">
              <FileText className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No exam blueprints available for this class and subject.
              </p>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Create a blueprint first in the Exam Blueprints section.
              </p>
            </div>
          ) : (
            structures.map((structure) => (
              <button
                key={structure.id}
                onClick={() => setSelectedId(structure.id)}
                className={clsx(
                  "flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                  selectedId === structure.id
                    ? "border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/20"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                )}
              >
                <div
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    selectedId === structure.id
                      ? "bg-brand-blue-500 text-white"
                      : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                  )}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">{structure.name_en}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{structure.name_mr}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {structure.total_marks} marks
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" />
                      {structure.total_questions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {structure.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {structure.sections?.length || 0} sections
                    </span>
                  </div>
                </div>
                {selectedId === structure.id && (
                  <Check className="mt-1 h-5 w-5 shrink-0 text-brand-blue-500" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSaving}>
            {isSaving && <LoaderSpinner size="sm" className="mr-2" />}
            {selectedId ? "Assign Blueprint" : "Remove Blueprint"}
          </Button>
        </div>
      </div>
    </div>
  );
}
