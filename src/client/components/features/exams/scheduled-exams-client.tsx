/**
 * Scheduled Exams Client - Premium SaaS Design
 * 
 * List view for all scheduled exams with filtering and views.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  Calendar,
  Clock,
  Target,
  Users,
  FileText,
  Play,
  CheckCircle,
  Archive,
  ChevronRight,
  Layers,
  Search,
  X,
  SlidersHorizontal,
  CalendarDays,
  BookOpen,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import { EmptyState, GlassCard } from '@/client/components/ui/premium';
import { useScheduledExams } from '@/client/hooks/use-scheduled-exams';
import { useClassLevels } from '@/client/hooks/use-class-levels';
import { useSubjects } from '@/client/hooks/use-subjects';
import { LoaderSpinner } from '@/client/components/ui/loader';

// ============================================
// Types
// ============================================
interface ClassLevel {
  id: string;
  name_en: string;
}

interface Subject {
  id: string;
  name_en: string;
}

interface ExamStructure {
  id: string;
  name_en: string;
  total_marks: number;
}

interface ScheduledExam {
  id: string;
  name_en: string;
  name_mr: string;
  status: string;
  scheduled_date: string | null;
  duration_minutes: number | null;
  class_level: ClassLevel | null;
  subject: Subject | null;
  exam_structure: ExamStructure | null;
  attempts_count: number;
}

// Props are now optional - component uses hooks internally
interface ScheduledExamsClientProps {
  exams?: ScheduledExam[];
  classLevels?: { id: string; name_en: string }[];
  subjects?: { id: string; name_en: string }[];
}

// ============================================
// Status Configuration
// ============================================
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  draft: {
    label: "Draft",
    color: "text-neutral-600 dark:text-neutral-400",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
    icon: FileText
  },
  scheduled: {
    label: "Scheduled",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    icon: Calendar
  },
  active: {
    label: "Active",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/30",
    icon: Play
  },
  completed: {
    label: "Completed",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/30",
    icon: CheckCircle
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/30",
    icon: Archive
  },
  published: {
    label: "Published",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    icon: Play
  },
};

const defaultStatus = {
  label: "Unknown",
  color: "text-neutral-500",
  bgColor: "bg-neutral-100 dark:bg-neutral-800",
  icon: FileText
};

// ============================================
// Filter Chip Component
// ============================================
function FilterChip({
  label,
  active,
  count,
  onClick,
  icon: Icon,
  color = "gray"
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
  icon?: React.ElementType;
  color?: string;
}) {
  const colorClasses: Record<string, { active: string; inactive: string }> = {
    gray: {
      active: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
      inactive: "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
    },
    blue: {
      active: "bg-blue-600 text-white dark:bg-blue-500",
      inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
    },
    amber: {
      active: "bg-amber-600 text-white dark:bg-amber-500",
      inactive: "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
    },
    green: {
      active: "bg-green-600 text-white dark:bg-green-500",
      inactive: "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
    },
  };

  const classes = colorClasses[color] || colorClasses.gray;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
        "border shadow-sm",
        active
          ? `${classes.active} border-transparent`
          : `${classes.inactive} border-neutral-200 dark:border-neutral-700`
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
      {count !== undefined && (
        <span className={clsx(
          "ml-1 rounded-full px-1.5 py-0.5 text-xs",
          active ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-600"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

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
  value: number;
  label: string;
  icon: React.ElementType;
  color: "gray" | "blue" | "amber" | "green";
  active?: boolean;
  onClick?: () => void;
}) {
  const colorClasses = {
    gray: {
      icon: "bg-neutral-100 dark:bg-neutral-800",
      iconColor: "text-neutral-600 dark:text-neutral-400",
      ring: "ring-neutral-400"
    },
    blue: {
      icon: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      ring: "ring-blue-400"
    },
    amber: {
      icon: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-400"
    },
    green: {
      icon: "bg-green-100 dark:bg-green-900/50",
      iconColor: "text-green-600 dark:text-green-400",
      ring: "ring-green-400"
    },
  };

  const classes = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200",
        "bg-white/70 backdrop-blur-sm dark:bg-neutral-900/70",
        active
          ? `border-transparent ring-2 ${classes.ring}`
          : "border-neutral-200/50 hover:border-neutral-300 dark:border-neutral-700/50 dark:hover:border-neutral-600"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl", classes.icon)}>
          <Icon className={clsx("h-6 w-6", classes.iconColor)} />
        </div>
        <div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        </div>
      </div>
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/0 to-white/50 opacity-0 transition-opacity group-hover:opacity-100 dark:from-neutral-900/0 dark:to-neutral-800/50" />
    </button>
  );
}

// ============================================
// Exam Card Component
// ============================================
function ExamCard({ exam }: { exam: ScheduledExam }) {
  const statusInfo = statusConfig[exam.status] || defaultStatus;
  const StatusIcon = statusInfo.icon;

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link
      href={`/dashboard/scheduled-exams/${exam.id}`}
      className="group block"
    >
      <div className={clsx(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        "bg-white dark:bg-neutral-900",
        "border-neutral-200/60 hover:border-neutral-300 dark:border-neutral-700/60 dark:hover:border-neutral-600",
        "hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50",
        "hover:-translate-y-0.5"
      )}>
        {/* Status indicator bar */}
        <div className={clsx("absolute left-0 top-0 h-full w-1", statusInfo.bgColor)} />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 pl-3">
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                {exam.name_en}
              </h3>
              <span className={clsx(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                statusInfo.bgColor, statusInfo.color
              )}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusInfo.label}
              </span>
            </div>

            {/* Meta info */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                <Layers className="h-4 w-4 text-neutral-400" />
                <span>{exam.class_level?.name_en || "No class"}</span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                <BookOpen className="h-4 w-4 text-neutral-400" />
                <span>{exam.subject?.name_en || "No subject"}</span>
              </div>
            </div>

            {/* Additional details */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              {exam.scheduled_date && (
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDate(exam.scheduled_date)}</span>
                </div>
              )}
              {exam.duration_minutes && (
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span>{exam.duration_minutes} min</span>
                </div>
              )}
              {exam.exam_structure && (
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                  <Target className="h-4 w-4" />
                  <span>{exam.exam_structure.total_marks} marks</span>
                </div>
              )}
              {exam.attempts_count > 0 && (
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                  <span>{exam.attempts_count} attempts</span>
                </div>
              )}
            </div>

            {/* Blueprint name */}
            {exam.exam_structure && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                <Sparkles className="h-3 w-3" />
                {exam.exam_structure.name_en}
              </div>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
        </div>
      </div>
    </Link>
  );
}

// ============================================
// Main Component
// ============================================
export function ScheduledExamsClient({ exams: propsExams, classLevels: propsClassLevels, subjects: propsSubjects }: ScheduledExamsClientProps = {}) {
  // Use hooks to fetch data
  const { data: hookExams, loading: isLoadingExams } = useScheduledExams({ status: 'all' });
  const { data: hookClassLevels, loading: isLoadingClassLevels } = useClassLevels();
  const { data: hookSubjects, loading: isLoadingSubjects } = useSubjects();

  // Use props if provided (for backward compatibility), otherwise use hooks
  const exams = propsExams || (hookExams?.map((exam) => ({
    id: exam.id,
    name_en: exam.name_en,
    name_mr: exam.name_mr || '',
    status: exam.status,
    scheduled_date: exam.scheduled_date,
    duration_minutes: exam.duration_minutes,
    class_level: exam.class_levels || null,
    subject: exam.subjects || null,
    exam_structure: exam.exam_structures || null,
    attempts_count: exam.attempts_count || 0,
  })) || []);

  const classLevels = propsClassLevels || (hookClassLevels?.map((cl) => ({ id: cl.id, name_en: cl.name_en })) || []);
  const subjects = propsSubjects || (hookSubjects?.map((s) => ({ id: s.id, name_en: s.name_en })) || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [classLevelFilter, setClassLevelFilter] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);

  // All hooks and memoized values must be before early returns
  // Calculate stats
  const stats = useMemo(() => ({
    total: (exams || []).length,
    draft: (exams || []).filter((e) => e.status === "draft").length,
    scheduled: (exams || []).filter((e) => e.status === "scheduled" || e.status === "published").length,
    active: (exams || []).filter((e) => e.status === "active").length,
    completed: (exams || []).filter((e) => e.status === "completed").length,
  }), [exams]);

  // Filter exams
  const filteredExams = useMemo(() => {
    if (!exams) return [];
    return exams.filter((exam) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = exam.name_en.toLowerCase().includes(query) ||
          exam.name_mr.toLowerCase().includes(query);
        const matchesClass = exam.class_level?.name_en.toLowerCase().includes(query);
        const matchesSubject = exam.subject?.name_en.toLowerCase().includes(query);
        if (!matchesName && !matchesClass && !matchesSubject) return false;
      }

      // Status filter
      if (statusFilter) {
        if (statusFilter === "scheduled" && exam.status !== "scheduled" && exam.status !== "published") return false;
        else if (statusFilter !== "scheduled" && exam.status !== statusFilter) return false;
      }

      // Class level filter
      if (classLevelFilter && exam.class_level?.id !== classLevelFilter) return false;

      // Subject filter
      if (subjectFilter && exam.subject?.id !== subjectFilter) return false;

      return true;
    });
  }, [exams, searchQuery, statusFilter, classLevelFilter, subjectFilter]);

  const activeFiltersCount = [statusFilter, classLevelFilter, subjectFilter].filter(Boolean).length;

  const clearAllFilters = () => {
    setStatusFilter(null);
    setClassLevelFilter(null);
    setSubjectFilter(null);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          value={stats.total}
          label="Total Exams"
          icon={Calendar}
          color="gray"
          active={!statusFilter}
          onClick={() => setStatusFilter(null)}
        />
        <StatCard
          value={stats.scheduled}
          label="Scheduled"
          icon={Calendar}
          color="blue"
          active={statusFilter === "scheduled"}
          onClick={() => setStatusFilter(statusFilter === "scheduled" ? null : "scheduled")}
        />
        <StatCard
          value={stats.active}
          label="Active"
          icon={Play}
          color="amber"
          active={statusFilter === "active"}
          onClick={() => setStatusFilter(statusFilter === "active" ? null : "active")}
        />
        <StatCard
          value={stats.completed}
          label="Completed"
          icon={CheckCircle}
          color="green"
          active={statusFilter === "completed"}
          onClick={() => setStatusFilter(statusFilter === "completed" ? null : "completed")}
        />
      </div>

      {/* Search & Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search exams by name, class, or subject..."
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

          {/* Filter Toggle & View Mode */}
          <div className="flex items-center gap-2">
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

            <div className="flex rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
              <button
                onClick={() => setViewMode("list")}
                className={clsx(
                  "rounded-lg p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "rounded-lg p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex flex-wrap gap-4">
                {/* Class Level Filter */}
                <div className="min-w-50">
                  <label className="mb-2 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Class Level
                  </label>
                  <select
                    value={classLevelFilter || ""}
                    onChange={(e) => setClassLevelFilter(e.target.value || null)}
                    className={clsx(
                      "w-full rounded-xl border px-3 py-2 text-sm",
                      "border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900",
                      "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    )}
                  >
                    <option value="">All Classes</option>
                    {classLevels.map((cl) => (
                      <option key={cl.id} value={cl.id}>{cl.name_en}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Filter */}
                <div className="min-w-50">
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

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && !showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-500">Active filters:</span>
            {statusFilter && (
              <FilterChip
                label={statusConfig[statusFilter]?.label || statusFilter}
                active
                onClick={() => setStatusFilter(null)}
                icon={X}
              />
            )}
            {classLevelFilter && (
              <FilterChip
                label={classLevels.find(c => c.id === classLevelFilter)?.name_en || "Class"}
                active
                onClick={() => setClassLevelFilter(null)}
                icon={X}
              />
            )}
            {subjectFilter && (
              <FilterChip
                label={subjects.find(s => s.id === subjectFilter)?.name_en || "Subject"}
                active
                onClick={() => setSubjectFilter(null)}
                icon={X}
              />
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Showing <span className="font-medium text-neutral-900 dark:text-white">{filteredExams.length}</span> of {exams.length} exams
        </p>
      </div>

      {/* Exams List/Grid */}
      {filteredExams.length === 0 ? (
        <EmptyState
          icon={searchQuery || activeFiltersCount > 0 ? Search : Calendar}
          title={searchQuery || activeFiltersCount > 0 ? "No matching exams" : "No Scheduled Exams"}
          description={
            searchQuery || activeFiltersCount > 0
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Scheduled exams are created from Class Levels. Navigate to a class level and subject to schedule an exam."
          }
          action={
            searchQuery || activeFiltersCount > 0 ? (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            ) : (
              <Link
                href="/dashboard/class-levels"
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <Layers className="h-4 w-4" />
                Go to Class Levels
              </Link>
            )
          }
        />
      ) : (
        <div className={clsx(
          viewMode === "grid"
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-3"
        )}>
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}
