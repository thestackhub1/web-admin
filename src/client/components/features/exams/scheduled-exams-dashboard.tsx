/**
 * Scheduled Exams Dashboard - Premium SaaS Design
 * 
 * Displays scheduled exams with status, details, and actions.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Clock,
  Target,
  Users,
  CheckCircle,
  Archive,
  FileText,
  Link2,
  Eye,
  ArrowRight,
  Play,
} from "lucide-react";
import { GlassCard, Badge, EmptyState } from '@/client/components/ui/premium';
import { Button } from '@/client/components/ui/button';
import type {
  ScheduledExamWithDetails,
  ScheduledExamStatus,
  ClassLevel,
} from "@/client/types/class-levels";
import type { ExamStructure } from "@/client/types/exam-structures";
import {
  scheduledExamStatusLabels,
} from "@/client/types/class-levels";
import { ScheduledExamModal } from "./scheduled-exam-modal";
import { AssignStructureModal } from "./assign-structure-modal";

interface ScheduledExamsDashboardProps {
  exams: ScheduledExamWithDetails[];
  classLevel: ClassLevel;
  subject: {
    id: string;
    name_en: string;
    name_mr: string;
    slug: string;
  };
  availableStructures?: ExamStructure[];
}

const statusIcons: Record<ScheduledExamStatus, React.ElementType> = {
  draft: FileText,
  published: Play,
  in_progress: Clock,
  completed: CheckCircle,
  archived: Archive,
};

export function ScheduledExamsDashboard({
  exams,
  classLevel,
  subject,
  availableStructures = [],
}: ScheduledExamsDashboardProps) {
  const _router = useRouter();
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ScheduledExamWithDetails | null>(null);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [assigningExamId, setAssigningExamId] = useState<string | null>(null);

  const handleAddExam = () => {
    setEditingExam(null);
    setShowExamModal(true);
  };

  const handleAssignStructure = (examId: string) => {
    setAssigningExamId(examId);
    setShowStructureModal(true);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (exams.length === 0) {
    return (
      <>
        <EmptyState
          icon={Calendar}
          title="No Scheduled Exams Yet"
          description={`Create your first exam for ${classLevel.name_en} - ${subject.name_en}`}
          action={
            <Button variant="primary" onClick={handleAddExam}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Exam
            </Button>
          }
        />

        {showExamModal && (
          <ScheduledExamModal
            isOpen={showExamModal}
            onClose={() => setShowExamModal(false)}
            classLevelId={classLevel.id}
            subjectId={subject.id}
            exam={editingExam}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {exams.length} exam{exams.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <Button variant="primary" onClick={handleAddExam}>
          <Plus className="mr-2 h-4 w-4" />
          Add Exam
        </Button>
      </div>

      {/* Exams Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam, index) => {
          const StatusIcon = statusIcons[exam.status];

          return (
            <GlassCard
              key={exam.id}
              className="relative group"
              bento
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <Link 
                  href={`/dashboard/scheduled-exams/${exam.id}`}
                  className="flex items-center gap-3 group/link"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 group-hover/link:scale-105 transition-transform">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white group-hover/link:text-primary-600 dark:group-hover/link:text-primary-400 transition-colors">
                      {exam.name_en}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{exam.name_mr}</p>
                  </div>
                </Link>
              </div>

              {/* Status & Date */}
              <div className="mt-4 flex items-center gap-3">
                <Badge
                  variant={
                    exam.status === "published"
                      ? "success"
                      : exam.status === "completed"
                        ? "purple"
                        : exam.status === "in_progress"
                          ? "info"
                          : "default"
                  }
                  dot
                >
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {scheduledExamStatusLabels[exam.status]}
                </Badge>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Target className="h-4 w-4 text-primary-500" />
                  <span>{exam.total_marks} marks</span>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <Clock className="h-4 w-4 text-warning-500" />
                  <span>{exam.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Calendar className="h-4 w-4 text-success-500" />
                  <span>{formatDate(exam.scheduled_date ?? null)}</span>
                </div>
              </div>

              {/* Exam Structure Badge */}
              <div className="mt-4">
                {exam.exam_structure ? (
                  <div className="rounded-xl bg-success-50 p-3 dark:bg-success-900/20 border border-success-200/50 dark:border-success-800/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-success-600 dark:text-success-400" />
                      <span className="text-sm font-medium text-success-700 dark:text-success-300">
                        {exam.exam_structure.name_en}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-success-600 dark:text-success-400">
                      {exam.exam_structure.sections?.length || 0} sections •{" "}
                      {exam.total_marks} marks
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAssignStructure(exam.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 p-3 text-sm text-neutral-500 transition-all hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 dark:border-neutral-700 dark:hover:border-primary-500 dark:hover:text-primary-400 dark:hover:bg-primary-900/10"
                  >
                    <Link2 className="h-4 w-4" />
                    Assign Blueprint
                  </button>
                )}
              </div>

              {/* Stats */}
              {(exam.attempt_count ?? 0) > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {exam.attempt_count} attempts
                    </span>
                  </div>
                  {exam.avg_score !== undefined && (
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Avg: {exam.avg_score}%
                    </span>
                  )}
                </div>
              )}

              {/* View Details Link */}
              <Link
                href={`/dashboard/scheduled-exams/${exam.id}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-neutral-700/80 dark:bg-neutral-800/30 dark:text-neutral-300 dark:hover:border-primary-500 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
              >
                <Eye className="h-4 w-4" />
                View Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </GlassCard>
          );
        })}
      </div>

      {/* Modals */}
      {showExamModal && (
        <ScheduledExamModal
          isOpen={showExamModal}
          onClose={() => {
            setShowExamModal(false);
            setEditingExam(null);
          }}
          classLevelId={classLevel.id}
          subjectId={subject.id}
          exam={editingExam}
        />
      )}

      {showStructureModal && assigningExamId && (
        <AssignStructureModal
          isOpen={showStructureModal}
          onClose={() => {
            setShowStructureModal(false);
            setAssigningExamId(null);
          }}
          scheduledExamId={assigningExamId}
          structures={availableStructures}
          currentStructureId={exams.find((e) => e.id === assigningExamId)?.exam_structure_id}
        />
      )}
    </div>
  );
}
