// Client-side only — no server secrets or database access here

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Trash2,
  Play,
  FileText,
  Archive,
  Copy,
  Link2,
  AlertTriangle,
  X,
  Eye,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { Button } from '@/client/components/ui/button';
import { 
  useDeleteScheduledExam, 
  useUpdateScheduledExamStatus, 
  useScheduledExam,
  useCreateScheduledExam,
} from "@/client/hooks";
import type { ScheduledExamStatus } from "@/client/types/class-levels";
import { AssignStructureModal } from "./assign-structure-modal";

interface ScheduledExamActionsProps {
  examId: string;
  examName?: string;
  examNameMr?: string;
  currentStatus: ScheduledExamStatus;
  classLevelId: string;
  classLevelName?: string;
  subjectId: string;
  subjectName?: string;
  backUrl: string;
  availableStructures?: any[];
  currentStructureId?: string | null;
  variant?: "default" | "inline";
}

export function ScheduledExamActions({
  examId,
  currentStatus,
  backUrl,
  availableStructures = [],
  currentStructureId,
  variant = "default",
}: ScheduledExamActionsProps) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);

  // Use hooks for API calls
  const { data: exam } = useScheduledExam(examId);
  const { mutate: deleteExam, loading: isDeleting } = useDeleteScheduledExam();
  const { mutate: updateStatus, loading: isUpdatingStatus } = useUpdateScheduledExamStatus();
  const { mutate: createExam } = useCreateScheduledExam();

  const handleDelete = async () => {
    const result = await deleteExam({ id: examId });

    if (result) {
      // Use replace to prevent going back to deleted exam page
      router.replace(backUrl);
      router.refresh();
    }
  };

  const handleStatusChange = async (newStatus: ScheduledExamStatus) => {
    const result = await updateStatus({ id: examId, status: newStatus });

    if (result) {
      router.refresh();
    }
  };

  const handleDuplicate = async () => {
    if (!exam) {
      toast.error("Exam data not available");
      return;
    }
    
    setIsDuplicating(true);

    // Create a copy using the hook
    const result = await createExam({
      name_en: `${exam.name_en} (Copy)`,
      name_mr: `${exam.name_mr} (कॉपी)`,
      description_en: exam.description_en,
      description_mr: exam.description_mr,
      class_level_id: exam.class_level_id,
      subject_id: exam.subject_id,
      exam_structure_id: exam.exam_structure_id,
      total_marks: exam.total_marks,
      duration_minutes: exam.duration_minutes,
      scheduled_date: undefined,
      scheduled_time: undefined,
      status: 'draft',
      is_active: true,
      publish_results: false,
    });

    if (result) {
      router.push(backUrl);
    }
    setIsDuplicating(false);
  };

  // Inline variant - Simplified action buttons (right aligned)
  if (variant === "inline") {
    return (
      <>
        <div className="flex items-center gap-2">
          {/* Preview Button - Link to separate page */}
          <Link
            href={`/dashboard/scheduled-exams/${examId}/preview`}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-md active:scale-[0.98]"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>

          {/* Publish/Unpublish/Archive */}
        {currentStatus === "draft" && (
          <button
            onClick={() => handleStatusChange("published")}
            disabled={isUpdatingStatus}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-success-500 to-success-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-success-600 hover:to-success-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {isUpdatingStatus ? (
              <LoaderSpinner size="sm" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Publish
          </button>
        )}

        {currentStatus === "published" && (
          <button
            onClick={() => handleStatusChange("draft")}
            disabled={isUpdatingStatus}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 active:scale-[0.98] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50"
          >
            {isUpdatingStatus ? (
              <LoaderSpinner size="sm" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Unpublish
          </button>
        )}

        {currentStatus === "completed" && (
          <button
            onClick={() => handleStatusChange("archived")}
            disabled={isUpdatingStatus}
            className="inline-flex items-center gap-2 rounded-xl bg-warning-100 px-4 py-2.5 text-sm font-medium text-warning-700 transition-all hover:bg-warning-200 active:scale-[0.98] dark:bg-warning-900/30 dark:text-warning-400 disabled:opacity-50"
          >
            {isUpdatingStatus ? (
              <LoaderSpinner size="sm" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            Archive
          </button>
        )}

        {/* Duplicate */}
        <button
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 active:scale-[0.98] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50"
        >
          {isDuplicating ? (
            <LoaderSpinner size="sm" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Duplicate
        </button>

        {/* Delete */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-error-50 px-4 py-2.5 text-sm font-medium text-error-600 transition-all hover:bg-error-100 active:scale-[0.98] dark:bg-error-900/20 dark:text-error-400 dark:hover:bg-error-900/30"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-error-50 px-3 py-2 dark:bg-error-900/20">
            <AlertTriangle className="h-4 w-4 text-error-500" />
            <span className="text-sm font-medium text-error-600 dark:text-error-400">
              Delete?
            </span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg bg-error-600 px-3 py-1 text-xs font-semibold text-white transition-all hover:bg-error-700 active:scale-[0.98] disabled:opacity-50"
            >
              {isDeleting ? (
                <LoaderSpinner size="sm" />
              ) : (
                "Yes"
              )}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg p-1 text-error-500 transition-colors hover:bg-error-100 dark:text-error-400 dark:hover:bg-error-900/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        </div>
      </>
    );
  }

  // Default variant - Vertical layout
  return (
    <div className="space-y-3">
      {/* Assign Blueprint */}
      <Button
        variant="secondary"
        className="w-full justify-start"
        onClick={() => setShowStructureModal(true)}
      >
        <Link2 className="mr-2 h-4 w-4" />
        {currentStructureId ? "Change Blueprint" : "Assign Blueprint"}
      </Button>

      {/* Duplicate */}
      <Button
        variant="secondary"
        className="w-full justify-start"
        onClick={handleDuplicate}
        disabled={isDuplicating}
      >
        {isDuplicating ? (
          <LoaderSpinner size="sm" className="mr-2" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        Duplicate Exam
      </Button>

      {/* Status Actions */}
      <div className="border-t border-neutral-200 pt-3 dark:border-neutral-700">
        <p className="mb-2 text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400">
          Status Actions
        </p>

        {currentStatus === "draft" && (
          <Button
            variant="primary"
            className="w-full justify-start bg-success-600 hover:bg-success-700"
            onClick={() => handleStatusChange("published")}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <LoaderSpinner size="sm" className="mr-2" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Publish Exam
          </Button>
        )}

        {currentStatus === "published" && (
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={() => handleStatusChange("draft")}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <LoaderSpinner size="sm" className="mr-2" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Unpublish (Draft)
          </Button>
        )}

        {currentStatus === "completed" && (
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={() => handleStatusChange("archived")}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <LoaderSpinner size="sm" className="mr-2" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            )}
            Archive Exam
          </Button>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border-t border-neutral-200 pt-3 dark:border-neutral-700">
        <p className="mb-2 text-xs font-medium uppercase text-error-500">Danger Zone</p>

        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            className="w-full justify-start"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Exam
          </Button>
        ) : (
          <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-900/50 dark:bg-error-900/20">
            <div className="mb-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-error-500" />
              <div>
                <p className="font-medium text-error-800 dark:text-error-200">
                  Delete this exam?
                </p>
                <p className="mt-1 text-sm text-error-600 dark:text-error-300">
                  This action cannot be undone. All exam data will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? (
                  <LoaderSpinner size="sm" className="mr-2" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Confirm Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Structure Modal */}
      {showStructureModal && (
        <AssignStructureModal
          isOpen={showStructureModal}
          onClose={() => setShowStructureModal(false)}
          scheduledExamId={examId}
          structures={availableStructures}
          currentStructureId={currentStructureId}
        />
      )}
    </div>
  );
}
