// Client-side only — no server secrets or database access here

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Calendar, Clock, Target } from "lucide-react";
import { Loader, LoaderSpinner } from '@/client/components/ui/loader';
import { Button } from '@/client/components/ui/button';
import { TextInput } from '@/client/components/ui/input';
import { Select } from '@/client/components/ui/select';
import type { ScheduledExamWithDetails, ScheduledExamStatus } from "@/client/types/class-levels";
import { scheduledExamStatuses, scheduledExamStatusLabels } from "@/client/types/class-levels";
import { useScheduledExam, useCreateScheduledExam, useUpdateScheduledExam } from "@/client/hooks";

interface ScheduledExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  classLevelId: string;
  subjectId: string;
  exam?: ScheduledExamWithDetails | null;
  examId?: string; // Alternative: pass examId to fetch data
}

export function ScheduledExamModal({
  isOpen,
  onClose,
  classLevelId,
  subjectId,
  exam: initialExam,
  examId,
}: ScheduledExamModalProps) {
  const [exam, setExam] = useState<ScheduledExamWithDetails | null>(initialExam || null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!exam || !!examId;
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [nameEn, setNameEn] = useState(exam?.name_en || "");
  const [nameMr, setNameMr] = useState(exam?.name_mr || "");
  const [descriptionEn, setDescriptionEn] = useState(exam?.description_en || "");
  const [descriptionMr, setDescriptionMr] = useState(exam?.description_mr || "");
  const [totalMarks, setTotalMarks] = useState(exam?.total_marks || 100);
  const [durationMinutes, setDurationMinutes] = useState(exam?.duration_minutes || 90);
  const [scheduledDate, setScheduledDate] = useState(exam?.scheduled_date || "");
  const [scheduledTime, setScheduledTime] = useState(exam?.scheduled_time || "");
  const [status, setStatus] = useState<ScheduledExamStatus>(exam?.status || "draft");
  const [isActive, setIsActive] = useState(exam?.is_active ?? true);
  const [publishResults, setPublishResults] = useState(exam?.publish_results ?? false);
  const [maxAttempts, setMaxAttempts] = useState(exam?.max_attempts ?? 0);

  // Use hooks for fetching and mutations
  const { data: fetchedExam, loading: fetchLoading, execute: fetchExam } = useScheduledExam(examId || '');
  const createMutation = useCreateScheduledExam();
  const updateMutation = useUpdateScheduledExam();

  // Fetch exam data if examId is provided
  useEffect(() => {
    if (examId && !initialExam && isOpen) {
      fetchExam();
    }
  }, [examId, initialExam, isOpen, fetchExam]);

  // Update form state when exam is fetched
  useEffect(() => {
    if (fetchedExam) {
      setExam(fetchedExam as ScheduledExamWithDetails);
      setNameEn(fetchedExam.name_en || "");
      setNameMr(fetchedExam.name_mr || "");
      setDescriptionEn(fetchedExam.description_en || "");
      setDescriptionMr(fetchedExam.description_mr || "");
      setTotalMarks(fetchedExam.total_marks || 100);
      setDurationMinutes(fetchedExam.duration_minutes || 90);
      setScheduledDate(fetchedExam.scheduled_date || "");
      setScheduledTime(fetchedExam.scheduled_time || "");
      setStatus((fetchedExam.status || "draft") as ScheduledExamStatus);
      setIsActive(fetchedExam.is_active ?? true);
      setPublishResults(fetchedExam.publish_results ?? false);
      setMaxAttempts(fetchedExam.max_attempts ?? 0);
    }
  }, [fetchedExam]);

  useEffect(() => {
    setIsLoading(fetchLoading);
  }, [fetchLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim()) {
      toast.error("Please enter an exam name");
      return;
    }

    setIsSaving(true);

    const data = {
      name_en: nameEn.trim(),
      name_mr: nameMr.trim() || nameEn.trim(),
      description_en: descriptionEn.trim() || undefined,
      description_mr: descriptionMr.trim() || undefined,
      class_level_id: classLevelId,
      subject_id: subjectId,
      total_marks: totalMarks,
      duration_minutes: durationMinutes,
      scheduled_date: scheduledDate || undefined,
      scheduled_time: scheduledTime || undefined,
      status,
      is_active: isActive,
      publish_results: publishResults,
      max_attempts: maxAttempts,
    };

    try {
      const editId = exam?.id || examId;
      if (isEditing && editId) {
        const result = await updateMutation.mutate({ id: editId, ...data });
        if (result) {
          onClose();
        }
      } else {
        const result = await createMutation.mutate(data);
        if (result) {
          onClose();
        }
      }
    } catch (_error) {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {isEditing ? "Edit Scheduled Exam" : "Create New Exam"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Name (English) <span className="text-error-500">*</span>
              </label>
              <TextInput
                value={nameEn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameEn(e.target.value)}
                placeholder="e.g., Unit Test 1"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Name (Marathi)
              </label>
              <TextInput
                value={nameMr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameMr(e.target.value)}
                placeholder="e.g., घटक चाचणी १"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description (English)
              </label>
              <TextInput
                value={descriptionEn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionEn(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description (Marathi)
              </label>
              <TextInput
                value={descriptionMr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionMr(e.target.value)}
                placeholder="वैकल्पिक वर्णन"
              />
            </div>
          </div>

          {/* Marks & Duration */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Target className="mr-1 inline h-4 w-4" />
                Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)}
                min={1}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Clock className="mr-1 inline h-4 w-4" />
                Duration (minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                min={1}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Max Attempts
                <span className="ml-1 text-xs text-neutral-400">(0 = Unlimited)</span>
              </label>
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Calendar className="mr-1 inline h-4 w-4" />
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Clock className="mr-1 inline h-4 w-4" />
                Scheduled Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Status
            </label>
            <Select
              value={status}
              onChange={(value: string) => setStatus(value as ScheduledExamStatus)}
              options={scheduledExamStatuses.map((s) => ({
                value: s,
                label: scheduledExamStatusLabels[s],
              }))}
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Active</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={publishResults}
                onChange={(e) => setPublishResults(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Publish Results</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <LoaderSpinner size="sm" className="mr-2" />}
              {isEditing ? "Save Changes" : "Create Exam"}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
