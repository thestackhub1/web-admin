"use client";

/**
 * Class Levels Client Component - Premium SaaS Design
 * 
 * Manages academic cohorts and subject mappings.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { PageHeader, EmptyState } from '@/client/components/ui/premium';
import { 
  Layers, BookOpen, Calendar, ChevronRight, GraduationCap, Plus, Edit, Trash2,
  Search, SlidersHorizontal, X, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useClassLevels, useDeleteClassLevel, ClassLevel } from '@/client/hooks/use-class-levels';
import { useSubjects } from '@/client/hooks/use-subjects';
import { useScheduledExams } from '@/client/hooks/use-scheduled-exams';
import { PageLoader } from '@/client/components/ui/loader';
import { Button } from "@/client/components/ui/button";
import { ClassLevelModal } from "./class-level-modals";
import { clsx } from "clsx";

export function ClassLevelsClient() {
  const { data: classLevels, loading: isLoadingLevels } = useClassLevels();
  const { data: subjects } = useSubjects();
  const { data: scheduledExams } = useScheduledExams({ status: 'all' });
  const { mutate: deleteClassLevel, loading: isDeleting } = useDeleteClassLevel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassLevel, setSelectedClassLevel] = useState<ClassLevel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filters dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = () => {
    setSelectedClassLevel(null);
    setIsModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, level: ClassLevel) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClassLevel(level);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this class level?")) {
      await deleteClassLevel(id);
      window.location.reload();
    }
  };

  // Calculate stats
  const stats = useMemo(() => ({
    classLevels: classLevels?.length || 0,
    activeClassLevels: classLevels?.filter(l => l.is_active).length || 0,
    subjects: subjects?.length || 0,
    scheduledExams: scheduledExams?.length || 0,
  }), [classLevels, subjects, scheduledExams]);

  // Enhanced class levels with subject and exam counts
  const classLevelsWithDetails = useMemo(() => {
    return (classLevels || []).map((level) => {
      const levelExams = scheduledExams?.filter((exam) =>
        exam.class_level_id === level.id
      ) || [];

      const subjectCount = level.subjects?.length || 0;

      return {
        ...level,
        subjectCount,
        examCount: levelExams.length,
      };
    });
  }, [classLevels, scheduledExams]);

  // Apply filters
  const filteredClassLevels = useMemo(() => {
    let result = classLevelsWithDetails;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((level) =>
        level.name_en.toLowerCase().includes(term) ||
        (level.name_mr && level.name_mr.toLowerCase().includes(term)) ||
        level.slug.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((level) => 
        statusFilter === 'active' ? level.is_active : !level.is_active
      );
    }

    return result;
  }, [classLevelsWithDetails, searchTerm, statusFilter]);

  const hasActiveFilters = statusFilter !== 'all';

  if (isLoadingLevels) {
    return <PageLoader message="Loading class levels..." />;
  }

  // Color schemes for rotating card accents
  const colorSchemes = [
    { accent: 'bg-primary-500', line: 'bg-primary-500', hover: 'hover:border-primary-200 dark:hover:border-primary-800/50' },
    { accent: 'bg-success-500', line: 'bg-success-500', hover: 'hover:border-success-200 dark:hover:border-success-800/50' },
    { accent: 'bg-warning-500', line: 'bg-warning-500', hover: 'hover:border-warning-200 dark:hover:border-warning-800/50' },
    { accent: 'bg-insight-500', line: 'bg-insight-500', hover: 'hover:border-insight-200 dark:hover:border-insight-800/50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Class Levels"
        description="Manage academic cohorts and subject mappings"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Class Levels" }]}
        icon={Layers}
        iconColor="primary"
        action={
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Class Level
          </Button>
        }
      />

      {/* Search, Stats & Filters - Single Line */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
        {/* Search Input */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search class levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={clsx(
              "w-full h-9 pl-9 pr-8 rounded-lg text-sm",
              "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
              "placeholder:text-neutral-400 text-neutral-900 dark:text-white",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400",
              "transition-all"
            )}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

        {/* Stats Pills */}
        <div className="hidden sm:flex items-center gap-2 flex-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary-500 text-white">
              <Layers className="h-2.5 w-2.5" />
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">{stats.classLevels}</span>
            <span className="text-xs text-neutral-500">Class Levels</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-success-500 text-white">
              <GraduationCap className="h-2.5 w-2.5" />
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">{stats.activeClassLevels}</span>
            <span className="text-xs text-neutral-500">Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-insight-500 text-white">
              <BookOpen className="h-2.5 w-2.5" />
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">{stats.subjects}</span>
            <span className="text-xs text-neutral-500">Subjects</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-warning-500 text-white">
              <Calendar className="h-2.5 w-2.5" />
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">{stats.scheduledExams}</span>
            <span className="text-xs text-neutral-500">Scheduled Exams</span>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative ml-auto" ref={filterRef}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium",
              "border transition-all",
              hasActiveFilters
                ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300"
                : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white text-xs">1</span>
            )}
            <ChevronDown className={clsx("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
          </button>

          {/* Filter Dropdown Panel */}
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-56 z-20 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
              <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">Filter by Status</span>
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setStatusFilter('all'); setShowFilters(false); }}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="py-1">
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setShowFilters(false); }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors",
                      statusFilter === status
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    )}
                  >
                    <div className={clsx(
                      "h-2 w-2 rounded-full",
                      status === 'all' ? "bg-neutral-400" : status === 'active' ? "bg-success-500" : "bg-neutral-300"
                    )} />
                    <span className="flex-1 capitalize">{status === 'all' ? 'All Status' : status}</span>
                    {statusFilter === status && (
                      <div className="h-2 w-2 rounded-full bg-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Class Levels List */}
      {filteredClassLevels.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={searchTerm || hasActiveFilters ? "No matching class levels" : "No class levels found"}
          description={searchTerm || hasActiveFilters 
            ? "Try adjusting your search or filters" 
            : "Get started by creating your first class level"
          }
          action={
            !searchTerm && !hasActiveFilters ? (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Class Level
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          {filteredClassLevels.map((level, index) => {
            const colorIndex = index % colorSchemes.length;
            const colors = colorSchemes[colorIndex];

            return (
              <Link
                key={level.id}
                href={`/dashboard/class-levels/${level.slug}`}
                className={clsx(
                  "group relative flex items-center gap-4 p-4 rounded-xl",
                  "bg-white dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800",
                  "transition-all duration-200",
                  colors.hover
                )}
              >
                {/* Left accent line */}
                <div className={clsx("absolute left-0 top-3 bottom-3 w-1 rounded-full", colors.line)} />

                {/* Icon */}
                <div className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-white shrink-0",
                  colors.accent
                )}>
                  <GraduationCap className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {level.name_en}
                    </h3>
                    <div className={clsx(
                      "h-2 w-2 rounded-full shrink-0",
                      level.is_active ? "bg-success-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-neutral-300"
                    )} />
                  </div>
                  {level.name_mr && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {level.name_mr}
                    </p>
                  )}
                </div>

                {/* Stats badges */}
                <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-500 shrink-0">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <strong className="text-neutral-700 dark:text-neutral-300">{level.subjectCount}</strong>
                  </span>
                  <span className="text-neutral-200 dark:text-neutral-700">|</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <strong className="text-neutral-700 dark:text-neutral-300">{level.examCount}</strong>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleEdit(e, level as ClassLevel)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, level.id)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <ClassLevelModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        classLevel={selectedClassLevel}
      />
    </div>
  );
}

