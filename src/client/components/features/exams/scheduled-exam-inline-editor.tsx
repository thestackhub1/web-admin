"use strict";
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
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { TextInput } from '@/client/components/ui/input';
import { Select } from '@/client/components/ui/select';
import { GlassCard, Badge } from '@/client/components/ui/premium';
import { Button } from '@/client/components/ui/button';
import type { ScheduledExamStatus } from "@/client/types/class-levels";
import { useUpdateScheduledExam } from "@/client/hooks";
import { cn } from "@/client/utils";

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
  const structureMarks = (examStructure as any)?.totalMarks ?? (examStructure as any)?.total_marks;
  const structureDuration = (examStructure as any)?.durationMinutes ?? (examStructure as any)?.duration_minutes;

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
    if (!isEditing) {
      setNameEn(exam.name_en || "");
      setNameMr(exam.name_mr || "");
      setDescriptionEn(exam.description_en || "");
      setDescriptionMr(exam.description_mr || "");
      setTotalMarks(exam.total_marks || structureMarks || 100);
      setDurationMinutes(exam.duration_minutes || structureDuration || 90);
      setScheduledDate(exam.scheduled_date || "");
      setScheduledTime(exam.scheduled_time || "");
      setStatus(exam.status || "draft");
      setIsActive(exam.is_active ?? true);
      setPublishResults(exam.publish_results ?? false);
      setMaxAttempts(exam.max_attempts ?? 0);
      setSelectedStructureId(examStructure?.id || "");
    }
  }, [exam, examStructure, isEditing, structureMarks, structureDuration]);

  const handleCancel = () => {
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

    const currentStructureId = examStructure?.id || null;
    const newStructureId = selectedStructureId || null;

    if (newStructureId !== currentStructureId) {
      data.exam_structure_id = newStructureId;
    }

    const result = await updateExam({
      id: exam.id,
      ...data,
    } as any);

    if (result) {
      setIsEditing(false);
      router.refresh();
      toast.success("Exam updated successfully");
    }
  };

  // View Mode
  if (!isEditing) {
    return (
      <GlassCard className="space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" />
            Description & Configuration
          </h3>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-3.5 w-3.5" />
            Edit Details
          </Button>
        </div>

        {/* Content Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* English */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">English Identity</span>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">{exam.name_en}</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {exam.description_en || <i className="opacity-50">No description provided.</i>}
              </p>
            </div>
          </div>

          {/* Marathi */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-500">Marathi Identity</span>
              <span className="text-xs">🇮🇳</span>
            </div>
            <div className="p-4 rounded-xl bg-primary-50/30 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-900/20 text-right">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">{exam.name_mr || "---"}</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {exam.description_mr || <i className="opacity-50">No Marathi description.</i>}
              </p>
            </div>
          </div>
        </div>

        {/* Timing & Scheduling */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            Schedule & Timing
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-primary-500 transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500">Scheduled Date</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {exam.scheduled_date ? new Date(exam.scheduled_date).toLocaleDateString(undefined, {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    }) : "Not Scheduled"}
                  </p>
                </div>
              </div>
            </div>

            <div className="group flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-primary-500 transition-colors">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500">Scheduled Time</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {exam.scheduled_time || "Not Set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blueprint Section */}
        {examStructure && (
          <div className="rounded-xl overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-900/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 center rounded-lg bg-white dark:bg-emerald-900/40 text-emerald-600 shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Active Blueprint</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">{examStructure.name_en}</p>
                </div>
              </div>
              <Link href={`/dashboard/exam-structures/${examStructure.id}`}>
                <Button size="sm" variant="ghost" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40 gap-1">
                  View Logic <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </GlassCard>
    );
  }

  // Edit Mode - Premium Form
  return (
    <GlassCard className="p-0! overflow-hidden border-primary-200 dark:border-primary-800 shadow-xl">
      <div className="px-6 py-4 bg-primary-50/50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 center rounded-xl bg-white dark:bg-primary-900 text-primary-600 shadow-sm">
            <Edit2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Configuration</h3>
            <p className="text-xs font-medium text-neutral-500">Update exam details and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <LoaderSpinner className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-8">

        {/* Identity */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold uppercase text-neutral-500">English Details</span>
            </div>
            <TextInput label="Exam Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Unit Test 1" />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">Description (EN)</label>
              <textarea
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                rows={3}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-bold uppercase text-neutral-500">Marathi Details</span>
              <span className="h-2 w-2 rounded-full bg-primary-500" />
            </div>
            <TextInput label="Exam Name (MR)" value={nameMr} onChange={(e) => setNameMr(e.target.value)} placeholder="उदा. घटक चाचणी १" className="text-right" />
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-neutral-500">Description (MR)</label>
              <textarea
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-right placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                rows={3}
                value={descriptionMr}
                onChange={(e) => setDescriptionMr(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Technical Specifications</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextInput
              label="Total Marks"
              type="number"
              value={hasExamStructure ? structureMarks : totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              disabled={hasExamStructure}
              helperText={hasExamStructure ? "Locked by blueprint" : undefined}
            />
            <TextInput
              label="Duration (Min)"
              type="number"
              value={hasExamStructure ? structureDuration : durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              disabled={hasExamStructure}
              helperText={hasExamStructure ? "Locked by blueprint" : undefined}
            />
            <TextInput
              label="Scheduled Date"
              type="date"
              value={scheduledDate ? scheduledDate.split('T')[0] : ""}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
            <TextInput
              label="Scheduled Time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
        </div>

        {/* Blueprint & Status */}
        <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-neutral-500">Exam Blueprint</label>
            <Select
              value={selectedStructureId}
              onChange={setSelectedStructureId}
              options={[
                { label: "No Blueprint (Manual Config)", value: "" },
                ...(availableStructures || []).map(s => ({ label: s.name_en, value: s.id }))
              ]}
            />
            <p className="mt-2 text-xs text-neutral-500">
              Selecting a blueprint will auto-configure marks, duration, and section logic.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className={cn(
                "cursor-pointer rounded-xl border p-3 transition-all hover:bg-neutral-50",
                status === 'published' ? "border-success-500 bg-success-50/50" : "border-neutral-200"
              )}
              onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("h-2 w-2 rounded-full", status === 'published' ? "bg-success-500" : "bg-neutral-300")} />
                <span className="text-sm font-bold">Publish Exam</span>
              </div>
              <p className="text-xs text-neutral-500">Make visible to students</p>
            </div>

            <div
              className={cn(
                "cursor-pointer rounded-xl border p-3 transition-all hover:bg-neutral-50",
                publishResults ? "border-purple-500 bg-purple-50/50" : "border-neutral-200"
              )}
              onClick={() => setPublishResults(!publishResults)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("h-2 w-2 rounded-full", publishResults ? "bg-purple-500" : "bg-neutral-300")} />
                <span className="text-sm font-bold">Publish Results</span>
              </div>
              <p className="text-xs text-neutral-500">Visible after completion</p>
            </div>
          </div>
        </div>

      </div>
    </GlassCard>
  );
}
