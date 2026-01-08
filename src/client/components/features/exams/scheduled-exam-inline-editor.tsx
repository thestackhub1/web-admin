// Client-side only — no server secrets or database access here

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Target,
  Save,
  X,
  Edit2,
  FileText,
  ExternalLink,
  Repeat,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { TextInput } from '@/client/components/ui/input';
import { Select } from '@/client/components/ui/select';
import { GlassCard } from '@/client/components/ui/premium';
import type { ScheduledExamStatus } from "@/client/types/class-levels";
import { scheduledExamStatuses, scheduledExamStatusLabels } from "@/client/types/class-levels";
import { useUpdateScheduledExam } from "@/client/hooks";

interface ExamStructureInfo {
  id: string;
  name_en: string;
  name_mr?: string | null;
  total_marks?: number;
  duration_minutes?: number;
  total_questions?: number;
  sections?: any[];
}

interface AvailableStructure {
  id: string;
  name_en: string;
  name_mr?: string | null;
  total_marks?: number;
  duration_minutes?: number;
}

interface ScheduledExamInlineEditorProps {
  exam: {
    id: string;
    name_en: string;
    name_mr?: string | null;
    description_en?: string | null;
    description_mr?: string | null;
    total_marks: number;
    duration_minutes: number;
    scheduled_date?: string | null;
    scheduled_time?: string | null;
    status: ScheduledExamStatus;
    is_active: boolean;
    publish_results: boolean;
    max_attempts?: number;
    class_level_id: string;
    subject_id: string;
  };
  examStructure?: ExamStructureInfo | null;
  availableStructures?: AvailableStructure[];
}

export function ScheduledExamInlineEditor({
  exam,
  examStructure,
  availableStructures = [],
}: ScheduledExamInlineEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStructureId, setSelectedStructureId] = useState(examStructure?.id || "");

  // Use hook for updating scheduled exam
  const { mutate: updateExam, loading: isSaving } = useUpdateScheduledExam();

  const hasExamStructure = !!examStructure;
  const structureMarks = examStructure?.total_marks;
  const structureDuration = examStructure?.duration_minutes;

  // Form state
  const [nameEn, setNameEn] = useState(exam.name_en || "");
  const [nameMr, setNameMr] = useState(exam.name_mr || "");
  const [descriptionEn, setDescriptionEn] = useState(exam.description_en || "");
  const [descriptionMr, setDescriptionMr] = useState(exam.description_mr || "");
  const [totalMarks, setTotalMarks] = useState(exam.total_marks || 100);
  const [durationMinutes, setDurationMinutes] = useState(exam.duration_minutes || 90);
  const [scheduledDate, setScheduledDate] = useState(exam.scheduled_date || "");
  const [scheduledTime, setScheduledTime] = useState(exam.scheduled_time || "");
  const [status, setStatus] = useState<ScheduledExamStatus>(exam.status || "draft");
  const [isActive, setIsActive] = useState(exam.is_active ?? true);
  const [publishResults, setPublishResults] = useState(exam.publish_results ?? false);
  const [maxAttempts, setMaxAttempts] = useState(exam.max_attempts ?? 0);

  // Reset form when exam changes
  useEffect(() => {
    setNameEn(exam.name_en || "");
    setNameMr(exam.name_mr || "");
    setDescriptionEn(exam.description_en || "");
    setDescriptionMr(exam.description_mr || "");
    setTotalMarks(exam.total_marks || 100);
    setDurationMinutes(exam.duration_minutes || 90);
    setScheduledDate(exam.scheduled_date || "");
    setScheduledTime(exam.scheduled_time || "");
    setStatus(exam.status || "draft");
    setIsActive(exam.is_active ?? true);
    setPublishResults(exam.publish_results ?? false);
    setMaxAttempts(exam.max_attempts ?? 0);
    setSelectedStructureId(examStructure?.id || "");
  }, [exam, examStructure]);

  const handleCancel = () => {
    // Reset to original values
    setNameEn(exam.name_en || "");
    setNameMr(exam.name_mr || "");
    setDescriptionEn(exam.description_en || "");
    setDescriptionMr(exam.description_mr || "");
    setTotalMarks(exam.total_marks || 100);
    setDurationMinutes(exam.duration_minutes || 90);
    setScheduledDate(exam.scheduled_date || "");
    setScheduledTime(exam.scheduled_time || "");
    setStatus(exam.status || "draft");
    setIsActive(exam.is_active ?? true);
    setPublishResults(exam.publish_results ?? false);
    setMaxAttempts(exam.max_attempts ?? 0);
    setSelectedStructureId(examStructure?.id || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!nameEn.trim()) {
      toast.error("Please enter an exam name");
      return;
    }

    const data: Record<string, unknown> = {
      name_en: nameEn.trim(),
      name_mr: nameMr.trim() || nameEn.trim(),
      description_en: descriptionEn.trim() || undefined,
      description_mr: descriptionMr.trim() || undefined,
      class_level_id: exam.class_level_id,
      subject_id: exam.subject_id,
      total_marks: totalMarks,
      duration_minutes: durationMinutes,
      scheduled_date: scheduledDate || undefined,
      scheduled_time: scheduledTime || undefined,
      status,
      is_active: isActive,
      publish_results: publishResults,
      max_attempts: maxAttempts,
    };

    // Include exam_structure_id in update if changed
    const currentStructureId = examStructure?.id || null;
    const newStructureId = selectedStructureId || null;
    
    if (newStructureId !== currentStructureId) {
      data.exam_structure_id = newStructureId;
    }

    // Update exam details using hook
    const result = await updateExam({
      id: exam.id,
      ...data,
    } as any);

    if (result) {
      setIsEditing(false);
      router.refresh();
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // View Mode
  if (!isEditing) {
    return (
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
            <FileText className="h-5 w-5 text-brand-blue-500" />
            Exam Configuration
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Edit2 className="h-4 w-4" />
            Edit Details
          </button>
        </div>

        {/* Names and Descriptions */}
        <div className="grid gap-6 sm:grid-cols-2 mb-6">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Name (English)</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{exam.name_en}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Name (Marathi)</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
              {exam.name_mr || <span className="text-neutral-400">Not set</span>}
            </p>
          </div>
          {(exam.description_en || exam.description_mr) && (
            <>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Description (English)</p>
                <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                  {exam.description_en || <span className="text-neutral-400">No description</span>}
                </p>
              </div>
              {exam.description_mr && (
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Description (Marathi)</p>
                  <p className="mt-1 text-neutral-700 dark:text-neutral-300">{exam.description_mr}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Marks & Duration */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-brand-blue-50 to-brand-purple-50 p-4 dark:border-neutral-700 dark:from-brand-blue-900/20 dark:to-brand-purple-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-brand-blue-500" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Marks</p>
            </div>
            <p className="text-2xl font-bold text-brand-blue-600 dark:text-brand-blue-400">
              {hasExamStructure ? structureMarks : exam.total_marks}
            </p>
            {hasExamStructure && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">From Blueprint</p>
            )}
          </div>
          <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-blue-50 to-cyan-50 p-4 dark:border-neutral-700 dark:from-blue-900/20 dark:to-cyan-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Duration</p>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {hasExamStructure ? structureDuration : exam.duration_minutes} <span className="text-sm font-normal">min</span>
            </p>
            {hasExamStructure && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">From Blueprint</p>
            )}
          </div>
          <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-neutral-50 to-slate-50 p-4 dark:border-neutral-700 dark:from-neutral-800/50 dark:to-neutral-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Scheduled Date</p>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {formatDate(exam.scheduled_date) || <span className="text-neutral-400">Not scheduled</span>}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-neutral-50 to-slate-50 p-4 dark:border-neutral-700 dark:from-neutral-800/50 dark:to-neutral-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-neutral-500" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Scheduled Time</p>
            </div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {exam.scheduled_time || <span className="text-neutral-400">Not set</span>}
            </p>
          </div>
        </div>

        {/* Exam Blueprint Link */}
        {examStructure && (
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Exam Blueprint</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{examStructure.name_en}</p>
                  {examStructure.name_mr && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{examStructure.name_mr}</p>
                  )}
                </div>
              </div>
              <Link
                href={`/dashboard/exam-structures/${examStructure.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                View Details
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Status & Settings */}
        <div className={`flex flex-wrap items-center gap-4 pt-4 ${!examStructure ? 'border-t border-neutral-200 dark:border-neutral-700' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Status:</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
              status === "published" 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : status === "completed"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                : status === "in_progress"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
            }`}>
              {scheduledExamStatusLabels[status]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Active:</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
              isActive 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
            }`}>
              {isActive ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Results Published:</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
              publishResults 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
            }`}>
              {publishResults ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Max Attempts:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              <Repeat className="h-3 w-3" />
              {maxAttempts === 0 ? "Unlimited" : maxAttempts}
            </span>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Edit Mode
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
          <Edit2 className="h-5 w-5 text-brand-blue-500" />
          Edit Exam Configuration
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-brand-blue-500 to-brand-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-brand-blue-600 hover:to-brand-purple-600 hover:shadow-md disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Names */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Name (English) <span className="text-red-500">*</span>
            </label>
            <TextInput
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Enter exam name"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Name (Marathi)
            </label>
            <TextInput
              value={nameMr}
              onChange={(e) => setNameMr(e.target.value)}
              placeholder="परीक्षेचे नाव"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description (English)
            </label>
            <TextInput
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description (Marathi)
            </label>
            <TextInput
              value={descriptionMr}
              onChange={(e) => setDescriptionMr(e.target.value)}
              placeholder="वैकल्पिक वर्णन"
            />
          </div>
        </div>

        {/* Marks & Duration */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Target className="h-4 w-4 text-brand-blue-500" />
              Total Marks
              {hasExamStructure && (
                <span className="text-xs text-neutral-500">(Overridden by Blueprint)</span>
              )}
            </label>
            <TextInput
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              min={1}
              disabled={hasExamStructure}
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Clock className="h-4 w-4 text-blue-500" />
              Duration (minutes)
              {hasExamStructure && (
                <span className="text-xs text-neutral-500">(Overridden by Blueprint)</span>
              )}
            </label>
            <TextInput
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={1}
              disabled={hasExamStructure}
            />
          </div>
        </div>

        {/* Max Attempts */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Repeat className="h-4 w-4 text-purple-500" />
              Max Attempts
              <span className="text-xs text-neutral-500">(0 = Unlimited)</span>
            </label>
            <TextInput
              type="number"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              min={0}
              placeholder="0 for unlimited"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Limit how many times a student can practice this exam
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Calendar className="h-4 w-4 text-neutral-500" />
              Scheduled Date
            </label>
            <TextInput
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Clock className="h-4 w-4 text-neutral-500" />
              Scheduled Time
            </label>
            <TextInput
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
        </div>

        {/* Status and Blueprint */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Status
            </label>
            <Select
              value={status}
              onChange={(value) => setStatus(value as ScheduledExamStatus)}
              options={scheduledExamStatuses.map((s) => ({
                value: s,
                label: scheduledExamStatusLabels[s],
              }))}
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <FileText className="h-4 w-4 text-green-500" />
              Exam Blueprint
            </label>
            <Select
              value={selectedStructureId}
              onChange={(value) => setSelectedStructureId(value)}
              options={[
                { value: "", label: "No Blueprint" },
                ...availableStructures.map((s) => ({
                  value: s.id,
                  label: `${s.name_en} (${s.total_marks} marks, ${s.duration_minutes} min)`,
                })),
              ]}
            />
            {selectedStructureId && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Blueprint will override marks and duration
              </p>
            )}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-neutral-300 text-brand-blue-500 focus:ring-brand-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Active</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={publishResults}
              onChange={(e) => setPublishResults(e.target.checked)}
              className="h-5 w-5 rounded border-neutral-300 text-brand-blue-500 focus:ring-brand-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Publish Results</span>
          </label>
        </div>
      </div>
    </GlassCard>
  );
}
