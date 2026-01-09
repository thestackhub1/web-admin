import { notFound } from "next/navigation";
import {
  getScheduledExamById,
  getScheduledExamStats,
  getAvailableStructures,
} from "@/client/services";
import { PageHeader, GlassCard } from '@/client/components/ui/premium';
import {
  Clock,
  Target,
  Users,
  FileText,
  Play,
  CheckCircle,
  Layers,
  BarChart3,
  Archive,
  ChevronRight,
  Link as LinkIcon
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ScheduledExamActions } from '@/client/components/features/exams/scheduled-exam-actions';
import { ScheduledExamInlineEditor } from '@/client/components/features/exams/scheduled-exam-inline-editor';
import { authServerApi, isAuthenticated } from "@/lib/api";
import { cn } from "@/client/utils";

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
    color: "text-success-600 dark:text-success-400",
    bgColor: "bg-success-100 dark:bg-success-900/30",
    icon: Play,
  },
  in_progress: {
    color: "text-primary-600 dark:text-primary-400",
    bgColor: "bg-primary-100 dark:bg-primary-900/30",
    icon: Clock,
  },
  completed: {
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    icon: CheckCircle,
  },
  archived: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Premium Header */}
      <PageHeader
        title={exam.name_en}
        description={exam.name_mr || "Manage exam settings and blueprint"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Scheduled Exams", href: "/dashboard/scheduled-exams" },
          { label: exam.name_en },
        ]}
        className="mb-4"
        action={
          <ScheduledExamActions
            examId={exam.id}
            currentStatus={exam.status}
            classLevelId={exam.class_levels?.id || exam.class_level_id}
            subjectId={exam.subjects?.id || exam.subject_id}
            backUrl={backUrl}
            variant="inline"
          />
        }
      />

      {/* Status Badges - Moved below header */}
      <div className="flex flex-wrap items-center gap-3 -mt-2 mb-8 pl-1">
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
          config.bgColor,
          config.color
        )}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusLabels[exam.status]}
        </span>
        {exam.subjects && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {exam.subjects.name_en}
          </span>
        )}
        {exam.class_levels && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {exam.class_levels.name_en}
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Marks", value: exam.exam_structures?.total_marks ?? exam.total_marks, icon: Target, variant: "brand" },
          { label: "Duration", value: `${exam.exam_structures?.duration_minutes ?? exam.duration_minutes} min`, icon: Clock, variant: "purple" },
          { label: "Total Attempts", value: stats.totalAttempts, icon: Users, variant: "warning" },
          { label: "Completed", value: stats.completedAttempts, icon: CheckCircle, variant: "success" },
        ].map((stat, i) => (
          <GlassCard key={i} className="relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                stat.variant === "brand" && "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
                stat.variant === "purple" && "bg-insight-50 text-insight-600 dark:bg-insight-900/20 dark:text-insight-400",
                stat.variant === "warning" && "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
                stat.variant === "success" && "bg-success-50 text-success-600 dark:bg-success-900/20 dark:text-success-400"
              )}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
            {/* Background Blob */}
            <div className={cn(
              "absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 blur-2xl",
              stat.variant === "brand" && "bg-primary-500",
              stat.variant === "purple" && "bg-insight-500",
              stat.variant === "warning" && "bg-amber-500",
              stat.variant === "success" && "bg-success-500"
            )} />
          </GlassCard>
        ))}
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
              name_en: (exam.exam_structures as any).name_en || (exam.exam_structures as any).nameEn,
              name_mr: (exam.exam_structures as any).name_mr || (exam.exam_structures as any).nameMr,
              total_marks: (exam.exam_structures as any).total_marks || (exam.exam_structures as any).totalMarks,
              duration_minutes: (exam.exam_structures as any).duration_minutes || (exam.exam_structures as any).durationMinutes,
              total_questions: (exam.exam_structures as any).total_questions || (exam.exam_structures as any).totalQuestions,
              sections: exam.exam_structures.sections,
            } : null}
            availableStructures={availableStructures}
          />
        </div>

        {/* Right Column - Quick Links */}
        <div className="space-y-6">
          {/* Quick Links */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="h-4 w-4 text-primary-500" />
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Quick Links
              </h3>
            </div>
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
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-neutral-500" />
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Metadata
              </h3>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <dt className="text-neutral-500 dark:text-neutral-400">Order</dt>
                <dd className="font-medium text-neutral-900 dark:text-white">
                  {exam.order_index}
                </dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <dt className="text-neutral-500 dark:text-neutral-400">Attempts</dt>
                <dd className="font-medium text-neutral-900 dark:text-white">
                  {exam.max_attempts === 0 ? "Unlimited" : exam.max_attempts}
                </dd>
              </div>
              {exam.created_at && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <dt className="text-neutral-500 dark:text-neutral-400">Created</dt>
                  <dd className="font-medium text-neutral-900 dark:text-white">
                    {new Date(exam.created_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {exam.updated_at && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
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
