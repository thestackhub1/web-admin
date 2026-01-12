"use client";

/**
 * Exam Structures Client - Premium SaaS Design
 * 
 * List view for all exam structures/blueprints with smart filtering and pagination.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 * 
 * Features:
 * - Smart subject and status filters
 * - Full-text search
 * - Grid/List view toggle
 * - Client-side pagination for scalability
 * - Responsive design
 */

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Layers,
  Clock,
  HelpCircle,
  Plus,
  BookOpen,
  CheckCircle,
  FileText,
  Target,
  Award,
  GraduationCap,
  Monitor,
  Search,
  X,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from '@/client/components/ui/button';
import { PageHeader, GlassCard, Badge, EmptyState } from '@/client/components/ui/premium';
import { useExamStructures } from '@/client/hooks/use-exam-structures';
import { useSubjects } from '@/client/hooks/use-subjects';
import { usePagination } from '@/client/hooks/use-pagination';
import { PageLoader } from '@/client/components/ui/loader';

// ============================================
// Constants
// ============================================
const DEFAULT_PAGE_SIZE_GRID = 9; // 3x3 grid
const DEFAULT_PAGE_SIZE_LIST = 10;

// ============================================
// Subject Colors Config
// ============================================
const subjectColors: Record<string, { bg: string; text: string; gradient: string; border: string; icon: React.ElementType }> = {
  scholarship: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-pink-500",
    border: "border-purple-200 dark:border-purple-800",
    icon: GraduationCap,
  },
  english: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    border: "border-blue-200 dark:border-blue-800",
    icon: BookOpen,
  },
  information_technology: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    gradient: "from-green-500 to-emerald-500",
    border: "border-green-200 dark:border-green-800",
    icon: Monitor,
  },
};

// ============================================
// Pagination Controls Component
// ============================================
interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  itemLabel?: string;
}

function PaginationControls({
  page,
  pageSize,
  totalPages,
  totalItems,
  hasNextPage,
  hasPreviousPage,
  goToPage,
  nextPage,
  previousPage,
  itemLabel = "structures",
}: PaginationControlsProps) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
      <p className="text-sm text-neutral-500">
        Showing{" "}
        <span className="font-medium text-neutral-900 dark:text-white">
          {Math.min((page - 1) * pageSize + 1, totalItems)}
        </span>{" "}
        to{" "}
        <span className="font-medium text-neutral-900 dark:text-white">
          {Math.min(page * pageSize, totalItems)}
        </span>{" "}
        of{" "}
        <span className="font-medium text-neutral-900 dark:text-white">
          {totalItems}
        </span>{" "}
        {itemLabel}
      </p>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={previousPage}
          disabled={!hasPreviousPage}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl p-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={clsx(
                "h-8 w-8 text-sm font-medium rounded-lg transition-all",
                page === pageNum
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              {pageNum}
            </button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={!hasNextPage}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export function ExamStructuresClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Parse URL params
  const subjectFilter = searchParams.get('subject');
  const statusFilter = searchParams.get('status');
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch data with auto-execute
  const { data: structures, loading: isLoadingStructures } = useExamStructures();
  const { data: subjects, loading: isLoadingSubjects } = useSubjects();

  // Build URL with params helper
  const buildUrl = useCallback((params: { subject?: string | null; status?: string | null }) => {
    const newParams = new URLSearchParams();
    
    const newSubject = params.subject !== undefined ? params.subject : subjectFilter;
    const newStatus = params.status !== undefined ? params.status : statusFilter;
    
    if (newSubject && newSubject !== 'all') newParams.set('subject', newSubject);
    if (newStatus && newStatus !== 'all') newParams.set('status', newStatus);
    
    return newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
  }, [pathname, subjectFilter, statusFilter]);

  // Enhance structures with subject information
  const structuresWithSubjects = useMemo(() => {
    if (!structures || !subjects) return [];
    
    return structures.map((structure) => {
      const subject = subjects.find((s) => s.id === structure.subject_id);
      return {
        ...structure,
        subjects: subject ? { name_en: subject.name_en, slug: subject.slug } : undefined,
      };
    });
  }, [structures, subjects]);

  // Filter structures
  const filteredStructures = useMemo(() => {
    let filtered = structuresWithSubjects;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => 
        s.name_en.toLowerCase().includes(query) ||
        (s.name_mr?.toLowerCase().includes(query) ?? false) ||
        (s.subjects?.name_en.toLowerCase().includes(query) ?? false)
      );
    }

    // Subject filter
    if (subjectFilter && subjectFilter !== "all") {
      filtered = filtered.filter((s) => s.subjects?.slug === subjectFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((s) => s.is_active);
    } else if (statusFilter === "draft") {
      filtered = filtered.filter((s) => !s.is_active);
    }

    return filtered;
  }, [structuresWithSubjects, searchQuery, subjectFilter, statusFilter]);

  // Pagination - page size depends on view mode
  const pageSize = viewMode === "grid" ? DEFAULT_PAGE_SIZE_GRID : DEFAULT_PAGE_SIZE_LIST;
  
  const {
    page,
    totalPages,
    totalItems,
    paginatedItems,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    resetPage,
  } = usePagination(filteredStructures, { initialPageSize: pageSize });

  // Reset to first page when filters change
  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
    resetPage();
  }, [resetPage]);

  // Calculate stats
  const stats = useMemo(() => {
    const all = structuresWithSubjects;
    return {
      total: all.length,
      active: all.filter((s) => s.is_active).length,
      draft: all.filter((s) => !s.is_active).length,
      totalQuestions: all.reduce((acc, s) => acc + (s.total_questions || 0), 0),
      totalMarks: all.reduce((acc, s) => {
        const sections = s.sections || [];
        return acc + sections.reduce((sum: number, sec: { total_marks?: number }) => sum + (sec.total_marks || 0), 0);
      }, 0),
    };
  }, [structuresWithSubjects]);

  // Subject stats for filter pills
  const subjectStats = useMemo(() => {
    const stats: Record<string, number> = {};
    structuresWithSubjects.forEach((s) => {
      const slug = s.subjects?.slug || 'unknown';
      stats[slug] = (stats[slug] || 0) + 1;
    });
    return stats;
  }, [structuresWithSubjects]);

  // Active filter count
  const activeFilterCount = [subjectFilter, statusFilter].filter(Boolean).length;

  // Clear all filters and reset pagination
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    resetPage();
    router.push(pathname);
  }, [router, pathname, resetPage]);

  // Handle search change with pagination reset
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    resetPage();
  }, [resetPage]);

  // Loading state
  if (isLoadingStructures || isLoadingSubjects) {
    return <PageLoader message="Loading exam structures..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Exam Structures"
        description="Define exam blueprints with sections and rules"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exam Structures" }
        ]}
        action={
          <Link href="/dashboard/exam-structures/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Structure
            </Button>
          </Link>
        }
      />

      {/* Compact Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Total Blueprints</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-success-100 bg-success-50/50 p-3 dark:border-success-900/20 dark:bg-success-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-success-600 dark:text-success-400">Active</p>
              <p className="text-lg font-bold text-success-700 dark:text-success-300">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 dark:border-purple-900/20 dark:bg-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Questions</p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{stats.totalQuestions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/20 dark:bg-amber-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Total Marks</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats.totalMarks}</p>
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
              placeholder="Search blueprints by name or subject..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={clsx(
                "w-full h-11 rounded-xl border pl-10 pr-4 text-sm",
                "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900",
                "placeholder:text-neutral-400",
                "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
              <button
                onClick={() => handleViewModeChange("grid")}
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
                onClick={() => handleViewModeChange("list")}
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
            </div>
          </div>
        </div>

        {/* Smart Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Subject:</span>
            <button
              onClick={() => router.push(buildUrl({ subject: null }))}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                !subjectFilter || subjectFilter === 'all'
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              )}
            >
              All
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold dark:bg-black/20">
                {structuresWithSubjects.length}
              </span>
            </button>
            {subjects?.filter(s => !s.is_category || s.slug === 'scholarship').map((subject) => {
              const count = subjectStats[subject.slug] || 0;
              const colors = subjectColors[subject.slug] || subjectColors.scholarship;
              const SubjectIcon = colors.icon;
              const isActive = subjectFilter === subject.slug;
              
              return (
                <button
                  key={subject.id}
                  onClick={() => router.push(buildUrl({ subject: subject.slug }))}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? `bg-linear-to-r ${colors.gradient} text-white shadow-lg`
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  <SubjectIcon className="h-3.5 w-3.5" />
                  {subject.name_en}
                  <span className={clsx(
                    "rounded-full px-1.5 py-0.5 text-xs font-bold",
                    isActive ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-700"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden h-6 w-px bg-neutral-200 dark:bg-neutral-700 sm:block" />

          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Status:</span>
            <button
              onClick={() => router.push(buildUrl({ status: null }))}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                !statusFilter
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              )}
            >
              All
            </button>
            <button
              onClick={() => router.push(buildUrl({ status: 'active' }))}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                statusFilter === 'active'
                  ? "bg-success-600 text-white shadow-lg shadow-success-600/25"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              Active
              <span className={clsx(
                "rounded-full px-1.5 py-0.5 text-xs font-bold",
                statusFilter === 'active' ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-700"
              )}>
                {stats.active}
              </span>
            </button>
            <button
              onClick={() => router.push(buildUrl({ status: 'draft' }))}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                statusFilter === 'draft'
                  ? "bg-neutral-600 text-white shadow-lg"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              Draft
              <span className={clsx(
                "rounded-full px-1.5 py-0.5 text-xs font-bold",
                statusFilter === 'draft' ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-700"
              )}>
                {stats.draft}
              </span>
            </button>
          </div>

          {/* Clear Filters */}
          {(activeFilterCount > 0 || searchQuery) && (
            <>
              <div className="hidden h-6 w-px bg-neutral-200 dark:bg-neutral-700 sm:block" />
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results Count & Pagination Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {totalItems > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-neutral-900 dark:text-white">
                {Math.min((page - 1) * pageSize + 1, totalItems)}
              </span>
              {" "}to{" "}
              <span className="font-medium text-neutral-900 dark:text-white">
                {Math.min(page * pageSize, totalItems)}
              </span>
              {" "}of{" "}
              <span className="font-medium text-neutral-900 dark:text-white">{totalItems}</span>
              {" "}structures
              {totalItems !== structuresWithSubjects.length && (
                <span className="text-neutral-400"> (filtered from {structuresWithSubjects.length})</span>
              )}
            </>
          ) : (
            <>No structures found</>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-neutral-400">
            Page {page} of {totalPages}
          </p>
        )}
      </div>

      {/* Structures Grid/List */}
      {totalItems === 0 ? (
        <GlassCard>
          <EmptyState
            icon={searchQuery || activeFilterCount > 0 ? Search : Layers}
            title={searchQuery || activeFilterCount > 0 ? "No matching structures" : "No exam structures"}
            description={
              searchQuery || activeFilterCount > 0
                ? "Try adjusting your search or filters to find what you're looking for"
                : "Create exam blueprints to define how exams are structured"
            }
            action={
              searchQuery || activeFilterCount > 0 ? (
                <Button variant="secondary" onClick={clearAllFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              ) : (
                <Link href="/dashboard/exam-structures/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Structure
                  </Button>
                </Link>
              )
            }
          />
        </GlassCard>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Subject</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">Duration</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">Questions</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">Marks</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {paginatedItems.map((structure) => {
                  const colors = subjectColors[structure.subjects?.slug || ''] || subjectColors.scholarship;
                  const sections = structure.sections || [];
                  const totalSectionMarks = sections.reduce((acc: number, s: { total_marks?: number }) => acc + (s.total_marks || 0), 0);
                
                return (
                  <tr key={structure.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{structure.name_en}</p>
                        <p className="text-sm text-neutral-500">{structure.name_mr}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {structure.subjects && (
                        <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", colors.bg, colors.text)}>
                          <colors.icon className="h-3 w-3" />
                          {structure.subjects.name_en}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{structure.duration_minutes} min</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{structure.total_questions}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{totalSectionMarks || structure.total_marks}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={structure.is_active ? "success" : "default"} dot size="sm">
                        {structure.is_active ? "Active" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/dashboard/exam-structures/${structure.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls for List View */}
        {totalPages > 1 && (
          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalItems={totalItems}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            goToPage={goToPage}
            nextPage={nextPage}
            previousPage={previousPage}
            itemLabel="blueprints"
          />
        )}
      </div>
      ) : (
        /* Grid View */
        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {paginatedItems.map((structure) => {
              const colors = subjectColors[structure.subjects?.slug || ''] || subjectColors.scholarship;
              const sections = structure.sections || [];
              const totalSectionMarks = sections.reduce((acc: number, s: { total_marks?: number }) => acc + (s.total_marks || 0), 0);

              return (
                <GlassCard key={structure.id} hover className="group relative flex flex-col overflow-hidden">
                  {/* Gradient Accent */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${colors.gradient}`} />

                  <div className="flex items-start justify-between pt-1">
                    <div>
                      <Badge variant={structure.is_active ? "success" : "default"} dot size="sm">
                        {structure.is_active ? "Active" : "Draft"}
                      </Badge>
                      <h3 className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">
                        {structure.name_en}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{structure.name_mr}</p>
                    </div>
                    <div className={clsx("rounded-xl p-2.5 transition-transform group-hover:scale-110", colors.bg, colors.text)}>
                      <colors.icon className="h-6 w-6" />
                    </div>
                  </div>

                {structure.subjects && (
                  <span className={clsx("mt-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium", colors.bg, colors.text)}>
                    {structure.subjects.name_en}
                  </span>
                )}

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
                    <Clock className="mx-auto h-4 w-4 text-blue-500" />
                    <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                      {structure.duration_minutes}
                    </p>
                    <p className="text-xs text-neutral-500">mins</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
                    <HelpCircle className="mx-auto h-4 w-4 text-purple-500" />
                    <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                      {structure.total_questions}
                    </p>
                    <p className="text-xs text-neutral-500">questions</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
                    <Target className="mx-auto h-4 w-4 text-amber-500" />
                    <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                      {totalSectionMarks || structure.total_marks || "-"}
                    </p>
                    <p className="text-xs text-neutral-500">marks</p>
                  </div>
                </div>

                {sections.length > 0 && (
                  <div className="mt-4 border-t border-neutral-200/50 pt-4 dark:border-neutral-700/50">
                    <p className="mb-2 text-xs font-medium tracking-wider text-neutral-500 uppercase">
                      Sections ({sections.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sections.slice(0, 3).map((section: { name_en?: string; name?: string }, i: number) => (
                        <span
                          key={i}
                          className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        >
                          {section.name_en || section.name || `Section ${i + 1}`}
                        </span>
                      ))}
                      {sections.length > 3 && (
                        <span className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                          +{sections.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Action */}
                <div className="mt-auto border-t border-neutral-200/50 pt-4 dark:border-neutral-700/50">
                  <Link
                    href={`/dashboard/exam-structures/${structure.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 hover:shadow-md dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    Edit Structure
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
        
        {/* Pagination Controls for Grid View */}
        {totalPages > 1 && (
          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalItems={totalItems}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            goToPage={goToPage}
            nextPage={nextPage}
            previousPage={previousPage}
            itemLabel="blueprints"
          />
        )}
      </div>
      )}
    </div>
  );
}

