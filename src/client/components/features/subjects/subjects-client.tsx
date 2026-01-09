"use client";

/**
 * Subjects Client Component - Premium SaaS Design
 * 
 * Manages curriculum hierarchy with categories and standalone subjects.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

import { PageHeader, GlassCard, Badge, EmptyState, SectionHeader } from '@/client/components/ui/premium';
import { BookOpen, FileQuestion, Layers, Plus, Folder } from "lucide-react";
import Link from "next/link";
import { Button } from '@/client/components/ui/button';
import { SubjectCard } from "./subject-card";
import { CategoryCard } from "./category-card";
import { useSubjects, useSubjectStats } from '@/client/hooks/use-subjects';
import { useSubjectChildren } from '@/client/hooks/use-subjects';
import { useChaptersBySubject } from '@/client/hooks/use-chapters';
import { useQuestions } from '@/client/hooks/use-questions';
import { PageLoader, LoaderSpinner } from '@/client/components/ui/loader';
import { useMemo } from 'react';

export function SubjectsClient() {
  const { data: allSubjects, loading: isLoadingSubjects, error: subjectsError } = useSubjects();
  const { data: stats, loading: isLoadingStats, error: statsError } = useSubjectStats();

  // Filter only top-level subjects (no parent)
  const topLevelSubjects = useMemo(() => {
    return (allSubjects || []).filter((s) => !s.parent_subject_id);
  }, [allSubjects]);

  // Separate categories and standalone subjects
  const categories = useMemo(() => {
    return topLevelSubjects.filter((s) => s.is_category);
  }, [topLevelSubjects]);

  const standaloneSubjects = useMemo(() => {
    return topLevelSubjects.filter((s) => !s.is_category);
  }, [topLevelSubjects]);

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
}

function SubjectsContent({ categories, standaloneSubjects, stats }: SubjectsContentProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Subjects & Categories"
        description="Manage curriculum hierarchy: categories contain multiple subjects, standalone subjects are independent"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subjects" }]}
        icon={BookOpen}
        iconColor="primary"
        action={
          <div className="flex gap-2">
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="border-l-4 border-l-purple-500 hover:border-l-purple-400 transition-colors">
          <div className="flex items-center gap-4">
            <div className="icon-container-insight">
              <Folder className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalCategories}</p>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Categories</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-primary-500 hover:border-l-primary-400 transition-colors">
          <div className="flex items-center gap-4">
            <div className="icon-container-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.rootSubjects}</p>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Root Subjects</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-emerald-500 hover:border-l-emerald-400 transition-colors">
          <div className="flex items-center gap-4">
            <div className="icon-container-success">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalChapters}</p>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Chapters</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-amber-500 hover:border-l-amber-400 transition-colors">
          <div className="flex items-center gap-4">
            <div className="icon-container-warning">
              <FileQuestion className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalQuestions}</p>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Questions</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            title="Categories"
            icon={Folder}
            iconColor="insight"
            count={categories.length}
          />
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <CategoryCardWithData key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      {/* Standalone Subjects Section */}
      {standaloneSubjects.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            title="Standalone Subjects"
            icon={BookOpen}
            iconColor="primary"
            count={standaloneSubjects.length}
          />
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {standaloneSubjects.map((subject) => (
              <SubjectCardWithData key={subject.id} subject={subject} />
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

function SubjectCardWithData({ subject }: { subject: SubjectsContentProps['standaloneSubjects'][0] }) {
  const { data: chapters } = useChaptersBySubject(subject.slug);
  const { data: questions } = useQuestions(subject.slug);

  const chapterCount = chapters?.length || 0;
  const questionCount = questions?.length || 0;

  return <SubjectCard subject={subject} chapterCount={chapterCount} questionCount={questionCount} />;
}

