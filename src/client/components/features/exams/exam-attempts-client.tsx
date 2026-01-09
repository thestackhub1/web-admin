// Client-side only — no server secrets or database access here

"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  SlidersHorizontal,
  Target,
  Award,
  AlertTriangle,
  Square,
  CheckSquare,
  LayoutGrid,
  LayoutList,
  Trash2,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { EmptyState } from '@/client/components/ui/premium';
import { useDeleteExamAttempt, useBulkDeleteExamAttempts } from "@/client/hooks";
import { ExamAttemptsListView } from "./exam-attempts-list-view";
import { ExamAttemptsGridView } from "./exam-attempts-grid-view";

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
    class_levels?: {
      id: string;
      name_en: string;
      slug: string;
    } | null;
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
    color: "text-success-600 dark:text-success-400",
    bgColor: "bg-success-50 dark:bg-success-900/30",
    dotColor: "bg-success-500"
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-warning-600 dark:text-warning-400",
    bgColor: "bg-warning-50 dark:bg-warning-900/30",
    dotColor: "bg-warning-500"
  },
  abandoned: {
    label: "Abandoned",
    icon: AlertCircle,
    color: "text-error-600 dark:text-error-400",
    bgColor: "bg-error-50 dark:bg-error-900/30",
    dotColor: "bg-error-500"
  },
};

const defaultStatus = {
  label: "Unknown",
  icon: ClipboardList,
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
  active,
  onClick
}: {
  value: number | string;
  label: string;
  icon: React.ElementType;
  color: "primary" | "success" | "warning" | "insight" | "neutral";
  active?: boolean;
  onClick?: () => void;
}) {
  const colorClasses = {
    primary: {
      icon: "bg-primary-100 dark:bg-primary-900/50",
      iconColor: "text-primary-600 dark:text-primary-400",
      ring: "ring-primary-400"
    },
    success: {
      icon: "bg-success-100 dark:bg-success-900/50",
      iconColor: "text-success-600 dark:text-success-400",
      ring: "ring-success-400"
    },
    warning: {
      icon: "bg-warning-100 dark:bg-warning-900/50",
      iconColor: "text-warning-600 dark:text-warning-400",
      ring: "ring-warning-400"
    },
    insight: {
      icon: "bg-insight-100 dark:bg-insight-900/50",
      iconColor: "text-insight-600 dark:text-insight-400",
      ring: "ring-insight-400"
    },
    neutral: {
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
      </div>
    </button>
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

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

  const searchParams = useSearchParams();
  const classLevelId = searchParams.get('classLevelId');

  // Filter exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Class Level filter (from URL)
      if (classLevelId && exam.scheduled_exams?.class_levels?.id !== classLevelId) {
        return false;
      }

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
  }, [exams, searchQuery, statusFilter, subjectFilter, classLevelId]);

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
          color="primary"
          active={!statusFilter}
          onClick={() => setStatusFilter(null)}
        />
        <StatCard
          value={stats.completed}
          label="Completed"
          icon={CheckCircle2}
          color="success"
          active={statusFilter === "completed"}
          onClick={() => setStatusFilter(statusFilter === "completed" ? null : "completed")}
        />
        <StatCard
          value={stats.inProgress}
          label="In Progress"
          icon={Clock}
          color="warning"
          active={statusFilter === "in_progress"}
          onClick={() => setStatusFilter(statusFilter === "in_progress" ? null : "in_progress")}
        />
        <StatCard
          value={`${stats.avgScore}%`}
          label="Avg Score"
          icon={Target}
          color="insight"
        />
        <StatCard
          value={`${stats.passRate}%`}
          label="Pass Rate"
          icon={Award}
          color="success"
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
                "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
                ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-400"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Toggle */}
          <div className="flex rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                viewMode === "list"
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                viewMode === "grid"
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

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

      {/* Filter Dialog */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/50">
                  <SlidersHorizontal className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Filter Attempts
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Narrow down exam attempts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Status
                </label>
                <select
                  value={statusFilter || ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className={clsx(
                    "w-full rounded-xl border px-4 py-2.5 text-sm",
                    "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800",
                    "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  )}
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Subject
                </label>
                <select
                  value={subjectFilter || ""}
                  onChange={(e) => setSubjectFilter(e.target.value || null)}
                  className={clsx(
                    "w-full rounded-xl border px-4 py-2.5 text-sm",
                    "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800",
                    "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  )}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name_en}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              {activeFiltersCount > 0 ? (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-error-600 hover:text-error-700 dark:text-error-400"
                >
                  <X className="h-4 w-4" />
                  Clear all filters
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700"
              >
                Apply Filters
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <CheckSquare className="h-5 w-5 text-primary-600" />
              ) : selectedIds.size > 0 ? (
                <div className="h-5 w-5 rounded border-2 border-primary-600 bg-primary-600/30" />
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
            className="inline-flex items-center gap-2 rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-error-700 shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selectedIds.size} selected
          </button>
        )}
      </div>

      {/* Exams Content */}
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
      ) : viewMode === "grid" ? (
        <ExamAttemptsGridView
          exams={filteredExams}
          isLoading={false}
          pageSize={12}
          isStudent={isStudent}
          selectedIds={selectedIds}
          onSelect={!isStudent ? toggleSelect : undefined}
          onDelete={!isStudent ? handleDeleteClick : undefined}
          deletingId={isDeleting ? (deleteTarget === "bulk" ? undefined : deleteTarget ?? undefined) : undefined}
        />
      ) : (
        <ExamAttemptsListView
          exams={filteredExams}
          isLoading={false}
          pageSize={15}
          isStudent={isStudent}
          selectedIds={selectedIds}
          onSelect={!isStudent ? toggleSelect : undefined}
          onDelete={!isStudent ? handleDeleteClick : undefined}
          deletingId={isDeleting ? (deleteTarget === "bulk" ? undefined : deleteTarget ?? undefined) : undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
                <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400" />
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
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-error-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-error-700 disabled:opacity-50"
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
