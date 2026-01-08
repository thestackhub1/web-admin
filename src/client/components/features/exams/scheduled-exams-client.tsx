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
  Kanban,
} from "lucide-react";
import { EmptyState, GlassCard } from '@/client/components/ui/premium';
import { useScheduledExams } from '@/client/hooks/use-scheduled-exams';
import { useClassLevels } from '@/client/hooks/use-class-levels';
import { useSubjects } from '@/client/hooks/use-subjects';
import { LoaderSpinner } from '@/client/components/ui/loader';
import { CalendarView } from './calendar-view';
import { SmartFilterBar, useFilters, FilterPills } from '@/client/components/ui/smart-filters';
import { ScheduledExamsKanban } from './scheduled-exams-kanban';
import { FilterDialog } from './filter-dialog';
import { ScheduledExam, ClassLevel, Subject, ExamStructure } from './types';

// ============================================
// Types
// ============================================
// Types imported from ./types.ts


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
// FilterChip and StatCard components removed as they are no longer used

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
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

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
  const { filters, setFilters, updateFilter, clearFilters, removeFilter } = useFilters();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar" | "kanban">("list");
  const [showFilters, setShowFilters] = useState(false); // This state seems unused now, can be removed if not needed elsewhere

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
          (exam.name_mr?.toLowerCase().includes(query) ?? false);
        const matchesClass = exam.class_level?.name_en.toLowerCase().includes(query);
        const matchesSubject = exam.subject?.name_en.toLowerCase().includes(query);
        if (!matchesName && !matchesClass && !matchesSubject) return false;
      }

      // Status filter
      if (filters.status && exam.status !== filters.status) {
        // Special handling if we had "scheduled" vs "published" distinction, but now using direct match
        // If user selects "scheduled", we might want to show both scheduled and published
        if (filters.status === "scheduled" && (exam.status === "published" || exam.status === "scheduled")) {
          // allow
        } else if (exam.status !== filters.status) {
          return false;
        }
      }

      // Class level filter
      if (filters.classLevelId && exam.class_level?.id !== filters.classLevelId) return false;

      // Subject filter
      if (filters.subjectId && exam.subject?.id !== filters.subjectId) return false;

      return true;
    });
  }, [exams, searchQuery, filters]);

  const activeFilterCount = [filters.status, filters.classLevelId, filters.subjectId].filter(Boolean).length;

  const clearAllFilters = () => {
    clearFilters();
    setSearchQuery("");
  };

  // Prepare data for SmartFilterBar and FilterDialog
  const classLevelsList = useMemo(() => classLevels.map(cl => ({ value: cl.id, label: cl.name_en })), [classLevels]);
  const subjectsList = useMemo(() => subjects.map(s => ({ value: s.id, label: s.name_en })), [subjects]);


  return (
    <div className="space-y-6">
      {/* Compact Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Total Exams</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/20 dark:bg-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Scheduled</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/20 dark:bg-amber-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Active</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/20 dark:bg-emerald-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Completed</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
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

          {/* Actions Group: Filter Button & View Toggles */}
          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterDialogOpen(true)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all",
                activeFilterCount > 0
                  ? "border-neutral-900 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggles */}
            <div className="flex rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
              <button
                onClick={() => setViewMode("list")}
                className={clsx(
                  "rounded-lg p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
                title="List View"
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
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={clsx(
                  "rounded-lg p-2 transition-colors",
                  viewMode === "kanban"
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
                title="Kanban View"
              >
                <Kanban className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={clsx(
                  "rounded-lg p-2 transition-colors",
                  viewMode === "calendar"
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
                title="Calendar View"
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        <FilterPills
          filters={filters}
          classLevels={classLevelsList}
          subjects={subjectsList}
          onRemove={removeFilter}
          className="pt-1"
        />
      </div>

      {/* Results Count */}
      {viewMode !== 'calendar' && viewMode !== 'kanban' && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing <span className="font-medium text-neutral-900 dark:text-white">{filteredExams.length}</span> of {exams.length} exams
          </p>
        </div>
      )}

      {/* Exams View */}
      {viewMode === 'kanban' ? (
        <div className="h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduledExamsKanban exams={filteredExams} />
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CalendarView exams={filteredExams} />
        </div>
      ) : filteredExams.length === 0 ? (
        <EmptyState
          icon={searchQuery || activeFilterCount > 0 ? Search : Calendar}
          title={searchQuery || activeFilterCount > 0 ? "No matching exams" : "No Scheduled Exams"}
          description={
            searchQuery || activeFilterCount > 0
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Scheduled exams are created from Class Levels. Navigate to a class level and subject to schedule an exam."
          }
          action={
            searchQuery || activeFilterCount > 0 ? (
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
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        filters={filters}
        onChange={setFilters}
        classLevels={classLevelsList}
        subjects={subjectsList}
      />
    </div>
  );
}
