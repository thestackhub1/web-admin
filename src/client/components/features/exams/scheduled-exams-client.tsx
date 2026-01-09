/**
 * Scheduled Exams Client - Premium SaaS Design
 * 
 * List view for all scheduled exams with filtering and views.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { clsx } from "clsx";
import {
  Calendar,
  Play,
  CheckCircle,
  Search,
  X,
  SlidersHorizontal,
  CalendarDays,
  LayoutGrid,
  List,
  Kanban,
  Plus,
} from "lucide-react";
import { EmptyState } from '@/client/components/ui/premium';
import { Button } from '@/client/components/ui/button';
import { PageLoader, LoadingComponent } from '@/client/components/ui/loader';
import { useScheduledExams } from '@/client/hooks/use-scheduled-exams';
import { useClassLevels } from '@/client/hooks/use-class-levels';
import { useSubjects } from '@/client/hooks/use-subjects';
import { CalendarView } from './calendar-view';
import { useFilters, FilterPills } from '@/client/components/ui/smart-filters';
import { ScheduledExamsKanban } from './scheduled-exams-kanban';
import { ScheduledExamsListView } from './scheduled-exams-list-view';
import { ScheduledExamsGridView } from './scheduled-exams-grid-view';
import { FilterDialog } from './filter-dialog';
import { CreateScheduledExamModal } from './create-scheduled-exam-modal';
import type { ScheduledExam } from './types';

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
// Main Component
// ============================================
export function ScheduledExamsClient({ exams: propsExams, classLevels: propsClassLevels, subjects: propsSubjects }: ScheduledExamsClientProps = {}) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Use hooks to fetch data
  const { data: hookExams, execute: refetchExams, loading: examsLoading } = useScheduledExams({ status: 'all' });
  const { data: hookClassLevels, loading: clLoading } = useClassLevels();
  const { data: hookSubjects, loading: sLoading } = useSubjects();

  const isInitialLoading = (examsLoading && (!hookExams || hookExams.length === 0)) ||
    (clLoading && (!hookClassLevels || hookClassLevels.length === 0)) ||
    (sLoading && (!hookSubjects || hookSubjects.length === 0));

  // Callback for when a new exam is created
  const handleExamCreated = useCallback(() => {
    refetchExams();
  }, [refetchExams]);

  // Use props if provided (for backward compatibility), otherwise use hooks
  const exams = useMemo(() => propsExams || (hookExams?.map((exam) => ({
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
  })) || []), [propsExams, hookExams]);

  const classLevels = useMemo(() => propsClassLevels || (hookClassLevels?.map((cl) => ({ id: cl.id, name_en: cl.name_en })) || []), [propsClassLevels, hookClassLevels]);
  const subjects = useMemo(() => propsSubjects || (hookSubjects?.map((s) => ({ id: s.id, name_en: s.name_en })) || []), [propsSubjects, hookSubjects]);

  const [searchQuery, setSearchQuery] = useState("");
  const { filters, setFilters, clearFilters, removeFilter } = useFilters();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar" | "kanban">("list");

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


  if (isInitialLoading) {
    return <PageLoader message="Loading scheduled exams..." />;
  }

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
        <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3 dark:border-primary-900/20 dark:bg-primary-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary-600 dark:text-primary-400">Scheduled</p>
              <p className="text-lg font-bold text-primary-700 dark:text-primary-300">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-warning-100 bg-warning-50/50 p-3 dark:border-warning-900/20 dark:bg-warning-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-warning-600 dark:text-warning-400">Active</p>
              <p className="text-lg font-bold text-warning-700 dark:text-warning-300">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-success-100 bg-success-50/50 p-3 dark:border-success-900/20 dark:bg-success-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-success-600 dark:text-success-400">Completed</p>
              <p className="text-lg font-bold text-success-700 dark:text-success-300">{stats.completed}</p>
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
                "w-full h-11 rounded-xl border pl-10 pr-4 text-sm",
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

          {/* Actions Group: Schedule Exam Button, Filter Button & View Toggles */}
          <div className="flex items-center gap-3">
            {/* Schedule Exam Button */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden sm:flex"
            >
              <Plus className="h-4 w-4" />
              Schedule Exam
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="sm:hidden p-2"
              title="Schedule Exam"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterDialogOpen(true)}
              className={clsx(
                "flex items-center gap-2 h-11 px-4 rounded-xl border transition-all",
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
              : "Create your first scheduled exam by selecting a class level, subject, and optionally an exam blueprint."
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
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <Plus className="h-4 w-4" />
                Schedule Exam
              </button>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduledExamsGridView exams={filteredExams} pageSize={9} />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduledExamsListView exams={filteredExams} pageSize={10} />
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
      <CreateScheduledExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleExamCreated}
      />
    </div>
  );
}
