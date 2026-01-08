// Client-side only — no server secrets or database access here

"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Search,
  X,
  SlidersHorizontal,
  BookOpen,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  Timer,
  FileText,
  Trash2,
  Eye,
  AlertTriangle,
  Check,
  Square,
  CheckSquare,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { EmptyState } from '@/client/components/ui/premium';
import { useDeleteExamAttempt, useBulkDeleteExamAttempts } from "@/client/hooks";

// ============================================
// Types
// ============================================
export interface ExamAttempt {
  id: string;
  user_id: string;
  status: string;
  score: number | null;
  total_marks: number;
  percentage: number | null;
  started_at: string;
  completed_at: string | null;
  profiles: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  subjects: {
    id: string;
    name_en: string;
  } | null;
  exam_structures: {
    id: string;
    name_en: string;
  } | null;
  scheduled_exams: {
    id: string;
    name_en: string;
  } | null;
}

interface ExamAttemptsClientProps {
  exams: ExamAttempt[];
  subjects: { id: string; name_en: string }[];
  isStudent: boolean;
}

// ============================================
// Status Configuration
// ============================================
const statusConfig: Record<string, { 
  label: string; 
  icon: React.ElementType;
  color: string;
  bgColor: string;
  dotColor: string;
}> = {
  completed: { 
    label: "Completed", 
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/30",
    dotColor: "bg-green-500"
  },
  in_progress: { 
    label: "In Progress", 
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/30",
    dotColor: "bg-amber-500"
  },
  abandoned: { 
    label: "Abandoned", 
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/30",
    dotColor: "bg-red-500"
  },
};

const defaultStatus = { 
  label: "Unknown", 
  icon: FileText,
  color: "text-neutral-500",
  bgColor: "bg-neutral-100 dark:bg-neutral-800",
  dotColor: "bg-neutral-400"
};

// ============================================
// Stat Card Component
// ============================================
function StatCard({ 
  value, 
  label, 
  icon: Icon, 
  color,
  trend,
  active,
  onClick 
}: { 
  value: number | string; 
  label: string; 
  icon: React.ElementType;
  color: "blue" | "green" | "amber" | "purple" | "gray";
  trend?: { value: number; positive: boolean };
  active?: boolean;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: {
      icon: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      ring: "ring-blue-400"
    },
    green: {
      icon: "bg-green-100 dark:bg-green-900/50",
      iconColor: "text-green-600 dark:text-green-400",
      ring: "ring-green-400"
    },
    amber: {
      icon: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-400"
    },
    purple: {
      icon: "bg-purple-100 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      ring: "ring-purple-400"
    },
    gray: {
      icon: "bg-neutral-100 dark:bg-neutral-800",
      iconColor: "text-neutral-600 dark:text-neutral-400",
      ring: "ring-neutral-400"
    },
  };

  const classes = colorClasses[color];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        "group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200",
        "bg-white/70 backdrop-blur-sm dark:bg-neutral-900/70",
        onClick && "cursor-pointer",
        active 
          ? `border-transparent ring-2 ${classes.ring}` 
          : "border-neutral-200/50 hover:border-neutral-300 dark:border-neutral-700/50 dark:hover:border-neutral-600"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx("flex h-11 w-11 items-center justify-center rounded-xl", classes.icon)}>
            <Icon className={clsx("h-5 w-5", classes.iconColor)} />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
          </div>
        </div>
        {trend && (
          <div className={clsx(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            trend.positive 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value}%
          </div>
        )}
      </div>
    </button>
  );
}

// ============================================
// Exam Attempt Card
// ============================================
function ExamAttemptCard({ 
  exam, 
  isStudent,
  isSelected,
  onSelect,
  onDelete,
  isDeleting,
}: { 
  exam: ExamAttempt; 
  isStudent: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}) {
  const status = statusConfig[exam.status] || defaultStatus;
  // Use the stored percentage field for consistency
  // Fallback to calculating from score/total_marks only if percentage is not stored
  const scorePercentage = exam.percentage !== null && exam.percentage !== undefined
    ? Math.round(exam.percentage)
    : (exam.total_marks > 0 && exam.score !== null 
        ? Math.round((exam.score / exam.total_marks) * 100) 
        : null);
  const isPassing = scorePercentage !== null && scorePercentage >= 35;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "S";
  };

  const getGradient = (name: string | null) => {
    const gradients = [
      "from-blue-400 to-indigo-500",
      "from-purple-400 to-pink-500",
      "from-green-400 to-teal-500",
      "from-brand-blue-400 to-red-500",
      "from-cyan-400 to-blue-500",
    ];
    const index = (name?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className={clsx(
      "group relative overflow-hidden rounded-2xl border transition-all duration-300",
      "bg-white dark:bg-neutral-900",
      isSelected 
        ? "border-blue-400 ring-2 ring-blue-200 dark:border-blue-600 dark:ring-blue-800"
        : "border-neutral-200/60 hover:border-neutral-300 dark:border-neutral-700/60 dark:hover:border-neutral-600",
      "hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50",
      isDeleting && "opacity-50 pointer-events-none"
    )}>
      {/* Score indicator strip */}
      {exam.status === "completed" && scorePercentage !== null && (
        <div className={clsx(
          "absolute left-0 top-0 h-full w-1.5",
          isPassing ? "bg-green-500" : "bg-red-500"
        )} />
      )}

      <div className="p-5 pl-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Selection + User info */}
          <div className="flex items-center gap-4">
            {/* Selection Checkbox (admin only) */}
            {!isStudent && onSelect && (
              <button
                onClick={() => onSelect(exam.id)}
                className={clsx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-neutral-300 hover:border-blue-400 dark:border-neutral-600"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            )}

            {/* Avatar - clickable to user profile */}
            <Link 
              href={`/dashboard/users/${exam.user_id}`}
              className="shrink-0 transition-transform hover:scale-105"
            >
              {exam.profiles?.avatar_url ? (
                <img
                  src={exam.profiles.avatar_url}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
                />
              ) : (
                <div className={clsx(
                  "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white",
                  "bg-linear-to-br shadow-lg",
                  getGradient(exam.profiles?.name || null)
                )}>
                  {getInitials(exam.profiles?.name || null, exam.profiles?.email || null)}
                </div>
              )}
            </Link>

            <div className="min-w-0">
              <Link 
                href={`/dashboard/users/${exam.user_id}`}
                className="font-semibold text-neutral-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {exam.profiles?.name || exam.profiles?.email || "Student"}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <Link 
                  href={`/dashboard/subjects/${exam.subjects?.id}`}
                  className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {exam.subjects?.name_en || "Unknown Subject"}
                </Link>
                {exam.scheduled_exams?.name_en && exam.scheduled_exams?.id && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                    <Link 
                      href={`/dashboard/scheduled-exams/${exam.scheduled_exams.id}`}
                      className="text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {exam.scheduled_exams.name_en}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Score, Date, Status */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Score (if completed) */}
            {exam.status === "completed" && exam.score !== null && (
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "flex h-14 w-14 flex-col items-center justify-center rounded-xl",
                  isPassing 
                    ? "bg-green-50 dark:bg-green-900/30" 
                    : "bg-red-50 dark:bg-red-900/30"
                )}>
                  <span className={clsx(
                    "text-lg font-bold",
                    isPassing ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {scorePercentage}%
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {exam.score}/{exam.total_marks}
                  </p>
                  <p className="text-neutral-500">marks</p>
                </div>
              </div>
            )}

            {/* Duration (calculated from started_at to completed_at) */}
            {exam.completed_at && (() => {
              const startTime = new Date(exam.started_at).getTime();
              const endTime = new Date(exam.completed_at).getTime();
              const durationSeconds = Math.floor((endTime - startTime) / 1000);
              return (
                <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  <Timer className="h-4 w-4" />
                  {formatDuration(durationSeconds)}
                </div>
              );
            })()}

            {/* Date */}
            <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-4 w-4" />
              {new Date(exam.started_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>

            {/* Status Badge */}
            <div className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
              status.bgColor, status.color
            )}>
              <span className={clsx("h-2 w-2 rounded-full animate-pulse", status.dotColor)} />
              {status.label}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* View Details */}
              <Link
                href={`/dashboard/exams/${exam.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Details</span>
              </Link>

              {/* Delete (admin only) */}
              {!isStudent && onDelete && (
                <button
                  onClick={() => onDelete(exam.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-all hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  {isDeleting ? (
                    <LoaderSpinner size="sm" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Blueprint info */}
        {exam.exam_structures?.name_en && (
          <div className="mt-3 flex items-center gap-2">
            <Link 
              href={`/dashboard/exam-structures/${exam.exam_structures.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
            >
              <Target className="h-3 w-3" />
              {exam.exam_structures.name_en}
            </Link>
            <span className="text-xs text-neutral-400">
              {exam.total_marks} marks total
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export function ExamAttemptsClient({ exams, subjects, isStudent }: ExamAttemptsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | "bulk" | null>(null);

  // Use hooks for delete operations
  const { mutate: deleteExamAttempt, loading: isDeleting } = useDeleteExamAttempt();
  const { mutate: bulkDelete, loading: isBulkDeleting } = useBulkDeleteExamAttempts();

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredExams.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExams.map((e) => e.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Delete handlers
  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setDeleteTarget("bulk");
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget === "bulk") {
      const ids = Array.from(selectedIds);
      const result = await bulkDelete({ ids });
      if (result) {
        clearSelection();
        router.refresh();
      }
    } else if (deleteTarget) {
      const result = await deleteExamAttempt({ id: deleteTarget });
      if (result) {
        router.refresh();
      }
    }
    
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const completed = exams.filter((e) => e.status === "completed");
    // Use stored percentage field for consistency with API
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((acc, e) => acc + (e.percentage ?? 0), 0) / completed.length)
      : 0;
    const passRate = completed.length > 0
      ? Math.round(completed.filter((e) => (e.percentage ?? 0) >= 35).length / completed.length * 100)
      : 0;

    return {
      total: exams.length,
      completed: completed.length,
      inProgress: exams.filter((e) => e.status === "in_progress").length,
      avgScore,
      passRate,
    };
  }, [exams]);

  // Filter exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = exam.profiles?.name?.toLowerCase().includes(query);
        const matchesEmail = exam.profiles?.email?.toLowerCase().includes(query);
        const matchesSubject = exam.subjects?.name_en?.toLowerCase().includes(query);
        const matchesExam = exam.scheduled_exams?.name_en?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesSubject && !matchesExam) return false;
      }

      // Status filter
      if (statusFilter && exam.status !== statusFilter) return false;

      // Subject filter
      if (subjectFilter && exam.subjects?.id !== subjectFilter) return false;

      return true;
    });
  }, [exams, searchQuery, statusFilter, subjectFilter]);

  const activeFiltersCount = [statusFilter, subjectFilter].filter(Boolean).length;

  const clearAllFilters = () => {
    setStatusFilter(null);
    setSubjectFilter(null);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          value={stats.total}
          label="Total Attempts"
          icon={ClipboardList}
          color="blue"
          active={!statusFilter}
          onClick={() => setStatusFilter(null)}
        />
        <StatCard
          value={stats.completed}
          label="Completed"
          icon={CheckCircle2}
          color="green"
          active={statusFilter === "completed"}
          onClick={() => setStatusFilter(statusFilter === "completed" ? null : "completed")}
        />
        <StatCard
          value={stats.inProgress}
          label="In Progress"
          icon={Clock}
          color="amber"
          active={statusFilter === "in_progress"}
          onClick={() => setStatusFilter(statusFilter === "in_progress" ? null : "in_progress")}
        />
        <StatCard
          value={`${stats.avgScore}%`}
          label="Avg Score"
          icon={Target}
          color="purple"
        />
        <StatCard
          value={`${stats.passRate}%`}
          label="Pass Rate"
          icon={Award}
          color="green"
          trend={stats.passRate > 50 ? { value: stats.passRate - 50, positive: true } : undefined}
        />
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={isStudent ? "Search your exams..." : "Search by student name, subject, or exam..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={clsx(
                "w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm",
                "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900",
                "placeholder:text-neutral-400",
                "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
              showFilters || activeFiltersCount > 0
                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex flex-wrap gap-4">
                {/* Status Filter */}
                <div className="min-w-45">
                  <label className="mb-2 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Status
                  </label>
                  <select
                    value={statusFilter || ""}
                    onChange={(e) => setStatusFilter(e.target.value || null)}
                    className={clsx(
                      "w-full rounded-xl border px-3 py-2 text-sm",
                      "border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900",
                      "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    )}
                  >
                    <option value="">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                </div>

                {/* Subject Filter */}
                <div className="min-w-45">
                  <label className="mb-2 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Subject
                  </label>
                  <select
                    value={subjectFilter || ""}
                    onChange={(e) => setSubjectFilter(e.target.value || null)}
                    className={clsx(
                      "w-full rounded-xl border px-3 py-2 text-sm",
                      "border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900",
                      "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    )}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name_en}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-end">
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                    >
                      <X className="h-4 w-4" />
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Status Filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = exams.filter((e) => e.status === key).length;
            if (count === 0) return null;
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? null : key)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                  "border shadow-sm",
                  statusFilter === key
                    ? `${config.bgColor} ${config.color} border-transparent`
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
                <span className={clsx(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  statusFilter === key ? "bg-white/20" : "bg-neutral-100 dark:bg-neutral-700"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Select All Checkbox (admin only) */}
          {!isStudent && filteredExams.length > 0 && (
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              {selectedIds.size === filteredExams.length ? (
                <CheckSquare className="h-5 w-5 text-blue-600" />
              ) : selectedIds.size > 0 ? (
                <div className="h-5 w-5 rounded border-2 border-blue-600 bg-blue-600/30" />
              ) : (
                <Square className="h-5 w-5" />
              )}
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
            </button>
          )}
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing <span className="font-medium text-neutral-900 dark:text-white">{filteredExams.length}</span> of {exams.length} attempts
          </p>
        </div>

        {/* Bulk Delete Button */}
        {!isStudent && selectedIds.size > 0 && (
          <button
            onClick={handleBulkDeleteClick}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selectedIds.size} selected
          </button>
        )}
      </div>

      {/* Exams List */}
      {filteredExams.length === 0 ? (
        <EmptyState
          icon={searchQuery || activeFiltersCount > 0 ? Search : ClipboardList}
          title={searchQuery || activeFiltersCount > 0 ? "No matching attempts" : isStudent ? "No exams yet" : "No exam attempts"}
          description={
            searchQuery || activeFiltersCount > 0
              ? "Try adjusting your search or filters to find what you're looking for."
              : isStudent
              ? "Your exam history will appear here when you take exams."
              : "When students take exams, their attempts will appear here."
          }
          action={
            (searchQuery || activeFiltersCount > 0) ? (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredExams.map((exam) => (
            <ExamAttemptCard 
              key={exam.id} 
              exam={exam} 
              isStudent={isStudent}
              isSelected={selectedIds.has(exam.id)}
              onSelect={!isStudent ? toggleSelect : undefined}
              onDelete={!isStudent ? handleDeleteClick : undefined}
              isDeleting={isDeleting && (deleteTarget === exam.id || (deleteTarget === "bulk" && selectedIds.has(exam.id)))}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {deleteTarget === "bulk" ? "Delete Multiple Attempts" : "Delete Exam Attempt"}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              {deleteTarget === "bulk" 
                ? `Are you sure you want to delete ${selectedIds.size} exam attempt(s)? This will permanently remove all student answers and scores from the system.`
                : "Are you sure you want to delete this exam attempt? This will permanently remove the student's answers and score from the system."
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <LoaderSpinner size="sm" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
