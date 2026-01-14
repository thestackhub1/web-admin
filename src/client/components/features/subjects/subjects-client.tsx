"use client";

/**
 * Subjects Client Component - Premium SaaS Design
 * 
 * Manages curriculum hierarchy with categories and standalone subjects.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader, EmptyState, SectionHeader } from '@/client/components/ui/premium';
import { BookOpen, FileQuestion, Layers, Plus, Folder, Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from '@/client/components/ui/button';
import { SubjectCard } from "./subject-card";
import { CategoryCard } from "./category-card";
import { useSubjects, useSubjectStats } from '@/client/hooks/use-subjects';
import { useSubjectChildren } from '@/client/hooks/use-subjects';
import { useChaptersBySubject } from '@/client/hooks/use-chapters';
import { useQuestions } from '@/client/hooks/use-questions';
import { PageLoader } from '@/client/components/ui/loader';
import { useMemo, useState, useRef, useEffect } from 'react';
import { ClassLevelFilterBadge, useClassLevelFilter } from '@/client/components/ui/class-level-filter-badge';
import { useClassLevels } from '@/client/hooks/use-class-levels';
import { clsx } from 'clsx';

export function SubjectsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const classLevelId = searchParams.get('classLevelId');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const { data: allSubjects, loading: isLoadingSubjects, error: subjectsError } = useSubjects(classLevelId || undefined);
  const { data: stats, loading: isLoadingStats, error: statsError } = useSubjectStats();
  const { classLevel: activeClassLevel, hasFilter: hasClassLevelFilter } = useClassLevelFilter();
  const { data: classLevels } = useClassLevels();

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

  // Handle class level filter change
  const handleClassLevelChange = (levelId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (levelId) {
      params.set('classLevelId', levelId);
    } else {
      params.delete('classLevelId');
    }
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    setShowFilters(false);
  };

  // Filter only top-level subjects (no parent)
  const topLevelSubjects = useMemo(() => {
    return (allSubjects || []).filter((s) => !s.parent_subject_id);
  }, [allSubjects]);

  // Apply search filter
  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return topLevelSubjects;
    const term = searchTerm.toLowerCase().trim();
    return topLevelSubjects.filter((s) => 
      s.name_en.toLowerCase().includes(term) ||
      (s.name_mr && s.name_mr.toLowerCase().includes(term)) ||
      s.slug.toLowerCase().includes(term)
    );
  }, [topLevelSubjects, searchTerm]);

  // Separate categories and standalone subjects
  const categories = useMemo(() => {
    return filteredSubjects.filter((s) => s.is_category);
  }, [filteredSubjects]);

  const standaloneSubjects = useMemo(() => {
    return filteredSubjects.filter((s) => !s.is_category);
  }, [filteredSubjects]);

  if (isLoadingSubjects || isLoadingStats) {
    return <PageLoader message="Loading subjects and statistics..." />;
  }

  // Show error if API failed
  if (subjectsError || statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-danger-500 mb-2">Failed to load data</div>
        <div className="text-sm text-neutral-500">
          {subjectsError && <div>Subjects: {subjectsError}</div>}
          {statsError && <div>Stats: {statsError}</div>}
        </div>
      </div>
    );
  }

  // Map API response to component format
  const mappedStats = stats ? {
    totalCategories: stats.total_categories,
    rootSubjects: stats.root_subjects,
    totalChapters: stats.total_chapters,
    totalQuestions: stats.total_questions,
  } : {
    totalCategories: 0,
    rootSubjects: 0,
    totalChapters: 0,
    totalQuestions: 0,
  };

  return (
    <SubjectsContent
      categories={categories}
      standaloneSubjects={standaloneSubjects}
      stats={mappedStats}
      activeClassLevel={activeClassLevel}
      hasClassLevelFilter={hasClassLevelFilter}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      filterRef={filterRef}
      classLevels={classLevels || []}
      selectedClassLevelId={classLevelId || undefined}
      onClassLevelChange={handleClassLevelChange}
    />
  );
}

interface SubjectsContentProps {
  categories: Array<{
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
    description_en?: string | null;
    description_mr?: string | null;
    icon?: string | null;
    order_index: number;
    is_active: boolean;
    is_category: boolean;
    parent_subject_id?: string | null;
  }>;
  standaloneSubjects: Array<{
    id: string;
    name_en: string;
    name_mr: string | null;
    slug: string;
    description_en?: string | null;
    description_mr?: string | null;
    icon?: string | null;
    order_index: number;
    is_active: boolean;
    is_category: boolean;
    parent_subject_id?: string | null;
  }>;
  stats: {
    totalCategories: number;
    rootSubjects: number;
    totalChapters: number;
    totalQuestions: number;
  };
  activeClassLevel?: { id: string; name_en: string; slug: string } | null;
  hasClassLevelFilter: boolean;
  // Search & Filter props
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  classLevels: Array<{ id: string; name_en: string; slug: string }>;
  selectedClassLevelId?: string;
  onClassLevelChange: (levelId: string | null) => void;
}

function SubjectsContent({ 
  categories, 
  standaloneSubjects, 
  stats, 
  activeClassLevel, 
  hasClassLevelFilter,
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  filterRef,
  classLevels,
  selectedClassLevelId,
  onClassLevelChange
}: SubjectsContentProps) {
  const pageTitle = hasClassLevelFilter && activeClassLevel 
    ? `Subjects - ${activeClassLevel.name_en}` 
    : "Subjects & Categories";
  const pageDescription = hasClassLevelFilter && activeClassLevel 
    ? `Curriculum subjects for ${activeClassLevel.name_en}` 
    : "Manage curriculum hierarchy: categories contain multiple subjects, standalone subjects are independent";
  
  const breadcrumbs = useMemo(() => {
    if (hasClassLevelFilter && activeClassLevel) {
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Class Levels", href: "/dashboard/class-levels" },
        { label: activeClassLevel.name_en, href: `/dashboard/class-levels/${activeClassLevel.slug}` },
        { label: "Subjects" }
      ];
    }
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Subjects" }
    ];
  }, [hasClassLevelFilter, activeClassLevel]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        breadcrumbs={breadcrumbs}
        icon={BookOpen}
        iconColor="primary"
        action={
          <div className="flex items-center gap-2">
            <ClassLevelFilterBadge />
            <Link href="/dashboard/subjects/new?type=category">
              <Button variant="insight" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </Link>
            <Link href="/dashboard/subjects/new?type=subject">
              <Button variant="primary" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={clsx(
              "w-full h-10 pl-10 pr-10 rounded-xl text-sm",
              "bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700",
              "placeholder:text-neutral-400 text-neutral-900 dark:text-white",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400",
              "transition-all"
            )}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={onToggleFilters}
            className={clsx(
              "flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium",
              "border transition-all",
              selectedClassLevelId
                ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300"
                : "bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {selectedClassLevelId && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white text-xs">1</span>
            )}
            <ChevronDown className={clsx("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
          </button>

          {/* Filter Dropdown Panel */}
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-64 z-20 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
              <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">Filter by Class Level</span>
                  {selectedClassLevelId && (
                    <button
                      onClick={() => onClassLevelChange(null)}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-60 overflow-auto">
                {classLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => onClassLevelChange(level.id)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors",
                      selectedClassLevelId === level.id
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    )}
                  >
                    <Layers className="h-4 w-4 text-primary-500" />
                    <span className="flex-1">{level.name_en}</span>
                    {selectedClassLevelId === level.id && (
                      <div className="h-2 w-2 rounded-full bg-primary-500" />
                    )}
                  </button>
                ))}
                {classLevels.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-neutral-500">No class levels found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats - Compact horizontal strip */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-insight-500 text-white">
            <Folder className="h-3 w-3" />
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">{stats.totalCategories}</span>
          <span className="text-xs text-neutral-500">Categories</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500 text-white">
            <BookOpen className="h-3 w-3" />
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">{stats.rootSubjects}</span>
          <span className="text-xs text-neutral-500">Root Subjects</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-success-500 text-white">
            <Layers className="h-3 w-3" />
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">{stats.totalChapters}</span>
          <span className="text-xs text-neutral-500">Chapters</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-warning-500 text-white">
            <FileQuestion className="h-3 w-3" />
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">{stats.totalQuestions}</span>
          <span className="text-xs text-neutral-500">Questions</span>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <SectionHeader
            title="Categories"
            icon={Folder}
            iconColor="insight"
            count={categories.length}
          />
          <div className="grid gap-2 lg:grid-cols-2">
            {categories.map((category) => (
              <CategoryCardWithData key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      {/* Standalone Subjects Section */}
      {standaloneSubjects.length > 0 && (
        <div className="space-y-3">
          <SectionHeader
            title="Standalone Subjects"
            icon={BookOpen}
            iconColor="primary"
            count={standaloneSubjects.length}
          />
          <div className="grid gap-2 lg:grid-cols-2">
            {standaloneSubjects.map((subject, index) => (
              <SubjectCardWithData key={subject.id} subject={subject} colorIndex={index} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {categories.length === 0 && standaloneSubjects.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No Subjects Found"
          description="Get started by creating your first subject category or standalone subject."
        />
      )}
    </div>
  );
}

function CategoryCardWithData({ category }: { category: SubjectsContentProps['categories'][0] }) {
  const { data: children } = useSubjectChildren(category.id);
  const childSubjectCount = children?.length || 0;

  return <CategoryCard subject={category} childSubjectCount={childSubjectCount} />;
}

function SubjectCardWithData({ subject, colorIndex = 0 }: { subject: SubjectsContentProps['standaloneSubjects'][0]; colorIndex?: number }) {
  const { data: chapters } = useChaptersBySubject(subject.slug);
  const { data: questions } = useQuestions(subject.slug);

  const chapterCount = chapters?.length || 0;
  const questionCount = questions?.length || 0;

  return <SubjectCard subject={subject} chapterCount={chapterCount} questionCount={questionCount} colorIndex={colorIndex} />;
}

