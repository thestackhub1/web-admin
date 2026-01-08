import { notFound } from "next/navigation";
import {
  getScheduledExamById,
  getScheduledExamStats,
  getAvailableStructures,
} from "@/client/services";
import { GlassCard } from '@/client/components/ui/premium';
import {
  Clock,
  Target,
  Users,
  FileText,
  Play,
  ChevronRight,
  CheckCircle,
  Layers,
  BarChart3,
  Archive,
  ArrowLeft,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ScheduledExamActions } from '@/client/components/features/exams/scheduled-exam-actions';
import { ScheduledExamInlineEditor } from '@/client/components/features/exams/scheduled-exam-inline-editor';
import { authServerApi, isAuthenticated } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!(await isAuthenticated())) {
    return {
      title: "Exam Not Found - The Stack Hub Admin",
    };
  }

  const { data: exam } = await authServerApi.get<{ name_en: string }>(
    `/api/v1/scheduled-exams/${id}`
  );

  return {
    title: exam ? `${exam.name_en} - The Stack Hub Admin` : "Exam Not Found",
  };
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  draft: {
    color: "text-neutral-600 dark:text-neutral-400",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
    icon: FileText,
  },
  published: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: Play,
  },
  in_progress: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: Clock,
  },
  completed: {
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    icon: CheckCircle,
  },
  archived: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: Archive,
  },
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
};

export default async function ScheduledExamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const exam = await getScheduledExamById(id);

  if (!exam) {
    notFound();
  }

  // Fetch stats and available structures in parallel
  const [stats, availableStructures] = await Promise.all([
    getScheduledExamStats(id),
    getAvailableStructures(exam.class_level_id, exam.subject_id),
  ]);

  const config = statusConfig[exam.status] || statusConfig.draft;
  const StatusIcon = config.icon;
  const backUrl = exam.subjects && exam.class_levels
    ? `/dashboard/scheduling/${exam.subjects.slug.replace(/_/g, "-")}/${exam.class_levels.slug}`
    : "/dashboard/class-levels";

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href={backUrl}
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {exam.name_en}
              </h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusLabels[exam.status]}
              </span>
            </div>
            {exam.name_mr && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{exam.name_mr}</p>
            )}
            <nav className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/dashboard" className="hover:text-neutral-700 dark:hover:text-neutral-300">
                Dashboard
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/dashboard/class-levels" className="hover:text-neutral-700 dark:hover:text-neutral-300">
                Class Levels
              </Link>
              {exam.class_levels && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <Link
                    href={`/dashboard/class-levels/${exam.class_levels.slug}`}
                    className="hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    {exam.class_levels.name_en}
                  </Link>
                </>
              )}
              {exam.subjects && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-neutral-700 dark:text-neutral-300">{exam.subjects.name_en}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Actions */}
        <ScheduledExamActions
          examId={exam.id}
          currentStatus={exam.status}
          classLevelId={exam.class_levels?.id || exam.class_level_id}
          subjectId={exam.subjects?.id || exam.subject_id}
          backUrl={backUrl}
          variant="inline"
        />
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {exam.exam_structures?.total_marks ?? exam.total_marks}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Marks</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {exam.exam_structures?.duration_minutes ?? exam.duration_minutes}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Minutes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-lg bg-brand-blue-50 p-2 dark:bg-brand-blue-900/20">
            <Users className="h-5 w-5 text-brand-blue-600 dark:text-brand-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{stats.totalAttempts}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Attempts</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{stats.completedAttempts}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Completed</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Inline Exam Configuration Editor */}
          <ScheduledExamInlineEditor
            exam={{
              id: exam.id,
              name_en: exam.name_en,
              name_mr: exam.name_mr,
              description_en: exam.description_en,
              description_mr: exam.description_mr,
              total_marks: exam.total_marks,
              duration_minutes: exam.duration_minutes,
              scheduled_date: exam.scheduled_date,
              scheduled_time: exam.scheduled_time,
              status: exam.status,
              is_active: exam.is_active,
              publish_results: exam.publish_results,
              max_attempts: exam.max_attempts,
              class_level_id: exam.class_level_id,
              subject_id: exam.subject_id,
            }}
            examStructure={exam.exam_structures ? {
              id: exam.exam_structures.id,
              name_en: exam.exam_structures.name_en,
              name_mr: exam.exam_structures.name_mr,
              total_marks: exam.exam_structures.total_marks,
              duration_minutes: exam.exam_structures.duration_minutes,
              total_questions: exam.exam_structures.total_questions,
              sections: exam.exam_structures.sections,
            } : null}
            availableStructures={availableStructures}
          />
        </div>

        {/* Right Column - Quick Links */}
        <div className="space-y-6">
          {/* Quick Links */}
          <GlassCard>
            <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
              Quick Links
            </h3>
            <div className="space-y-2">
              {exam.class_levels && (
                <Link
                  href={`/dashboard/class-levels/${exam.class_levels.slug}`}
                  className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                    <Layers className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {exam.class_levels.name_en}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </Link>
              )}
              {exam.exam_structures && (
                <Link
                  href={`/dashboard/exam-structures/${exam.exam_structures.id}`}
                  className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                    <FileText className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    View Blueprint
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </Link>
              )}
              <Link
                href="/dashboard/exam-structures"
                className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
                <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  All Blueprints
                </span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </Link>
            </div>
          </GlassCard>

          {/* Metadata Info */}
          <GlassCard>
            <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
              Metadata
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-neutral-500 dark:text-neutral-400">Order</dt>
                <dd className="font-medium text-neutral-900 dark:text-white">
                  {exam.order_index}
                </dd>
              </div>
              {exam.created_at && (
                <div className="flex justify-between items-center">
                  <dt className="text-neutral-500 dark:text-neutral-400">Created</dt>
                  <dd className="font-medium text-neutral-900 dark:text-white">
                    {new Date(exam.created_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {exam.updated_at && (
                <div className="flex justify-between items-center">
                  <dt className="text-neutral-500 dark:text-neutral-400">Updated</dt>
                  <dd className="font-medium text-neutral-900 dark:text-white">
                    {new Date(exam.updated_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
