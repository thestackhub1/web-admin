"use client";

// Client-side only — no server secrets or database access here

import { useClassLevel, useClassLevelSubjects, useClassLevelScheduledExams } from '@/client/hooks/use-class-levels';
import { GlassCard, Badge, PageHeader, EmptyState } from '@/client/components/ui/premium';
import { Layers, BookOpen, ChevronRight, Users, CalendarCheck, ClipboardList, Calendar, Edit2, FolderOpen, FileText } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { useMemo, useCallback } from 'react';
import { Button } from '@/client/components/ui/button';

// Type for class level subjects from API
interface ClassLevelSubject {
  id: string;
  name_en: string;
  name_mr: string | null;
  slug: string;
  description_en?: string | null;
  icon?: string | null;
  is_category: boolean;
  parent_subject_id: string | null;
  order_index: number;
}

// Extended type for categories with children
interface CategoryWithChildren extends ClassLevelSubject {
  children: ClassLevelSubject[];
}

interface ClassLevelDetailClientProps {
  slug: string;
}

export function ClassLevelDetailClient({ slug }: ClassLevelDetailClientProps) {
  const { data: classLevel, loading: isLoadingClassLevel } = useClassLevel(slug);
  const { data: classLevelSubjects, loading: isLoadingSubjects } = useClassLevelSubjects(slug);
  const { data: scheduledExams, loading: isLoadingExams } = useClassLevelScheduledExams(slug);

  // Stats configuration
  const stats = useMemo(() => {
    if (!classLevel) return [];

    return [
      {
        label: "Students",
        value: classLevel.studentCount || 0,
        icon: Users,
        color: "primary",
        href: `/dashboard/users?role=student&classLevelId=${classLevel.id}`,
      },
      {
        label: "Exam Structures",
        value: classLevel.examStructureCount || 0,
        icon: Layers,
        color: "insight",
        href: `/dashboard/exam-structures?classLevelId=${classLevel.id}`,
      },
      {
        label: "Scheduled Exams",
        value: classLevel.scheduledExamCount || 0,
        icon: CalendarCheck,
        color: "success",
        href: `/dashboard/scheduled-exams?classLevelId=${classLevel.id}`,
      },
      {
        label: "Exam Attempts",
        value: classLevel.examAttemptCount || 0,
        icon: ClipboardList,
        color: "warning",
        href: `/dashboard/exams?classLevelId=${classLevel.id}`,
      },
    ];
  }, [classLevel]);

  // Assigned subjects - organize hierarchically by category
  const { categories, standaloneSubjects } = useMemo<{
    categories: CategoryWithChildren[];
    standaloneSubjects: ClassLevelSubject[];
  }>(() => {
    if (!classLevelSubjects) return { categories: [], standaloneSubjects: [] };
    
    // Create unique map to deduplicate subjects
    const map = new Map<string, ClassLevelSubject>();
    classLevelSubjects.forEach((s) => {
      if (!map.has(s.id)) map.set(s.id, s);
    });
    const allSubjects = Array.from(map.values());
    
    // Separate categories and regular subjects
    const categoryItems = allSubjects.filter((s) => s.is_category);
    const subjectItems = allSubjects.filter((s) => !s.is_category);
    
    // Group subjects under their parent categories
    const categoriesWithChildren: CategoryWithChildren[] = categoryItems
      .map((cat) => ({
        ...cat,
        children: subjectItems
          .filter((s) => s.parent_subject_id === cat.id)
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      }))
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    
    // Find standalone subjects (no parent or parent not in this class level)
    const parentIds = new Set(categoryItems.map((c) => c.id));
    const standalone = subjectItems
      .filter((s) => !s.parent_subject_id || !parentIds.has(s.parent_subject_id))
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    
    return { categories: categoriesWithChildren, standaloneSubjects: standalone };
  }, [classLevelSubjects]);

  // Helper to get dynamic icon - memoized for performance
  const getSubjectIcon = useCallback((iconName?: string | null, fallback: React.ElementType = BookOpen) => {
    if (!iconName) return fallback;
    const Icon = (LucideIcons as Record<string, React.ElementType>)[iconName];
    return Icon || fallback;
  }, []);

  // Recent exams
  const recentExams = useMemo(() => (scheduledExams || []).slice(0, 4), [scheduledExams]);

  if (isLoadingClassLevel) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderSpinner />
      </div>
    );
  }

  if (!classLevel) {
    notFound();
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={classLevel.name_en}
        description={classLevel.description_en || `Overview and statistics for ${classLevel.name_en}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Class Levels", href: "/dashboard/class-levels" },
          { label: classLevel.name_en }
        ]}
        action={
          <div className="flex items-center gap-3">
            <Badge variant={classLevel.is_active ? "success" : "warning"} size="md" dot>
              {classLevel.is_active ? "Active" : "Inactive"}
            </Badge>
            <Link href={`/dashboard/class-levels/${slug}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Grid - Clickable Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses: Record<string, string> = {
            primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
            success: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
            warning: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
            insight: "bg-insight-100 text-insight-600 dark:bg-insight-900/30 dark:text-insight-400",
          };

          return (
            <Link key={index} href={stat.href}>
              <GlassCard className="group flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                <div className={`rounded-xl p-3 ${colorClasses[stat.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </GlassCard>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Subjects - Hierarchical View */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-insight-500" />
              Assigned Subjects
            </h2>
            <Link
              href={`/dashboard/subjects?classLevelId=${classLevel.id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingSubjects ? (
            <div className="flex justify-center py-8"><LoaderSpinner /></div>
          ) : (categories.length > 0 || standaloneSubjects.length > 0) ? (
            <div className="space-y-3">
              {/* Categories with children */}
              {categories.map((category) => {
                const CategoryIcon = getSubjectIcon(category.icon, FolderOpen);
                return (
                  <div key={category.id} className="rounded-xl border border-insight-200/50 dark:border-insight-800/30 overflow-hidden">
                    {/* Category Header */}
                    <Link
                      href={`/dashboard/subjects/${category.id}?classLevelId=${classLevel.id}`}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-insight-50 to-insight-100/50 dark:from-insight-900/20 dark:to-insight-800/10 hover:from-insight-100 hover:to-insight-100/70 dark:hover:from-insight-900/30 dark:hover:to-insight-800/20 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-insight-200/60 dark:bg-insight-800/40 p-2">
                          <CategoryIcon className="h-4 w-4 text-insight-700 dark:text-insight-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-insight-900 dark:text-insight-100">{category.name_en}</p>
                          {category.name_mr && (
                            <p className="text-xs text-insight-600 dark:text-insight-400">{category.name_mr}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-insight-600 dark:text-insight-400 bg-insight-200/50 dark:bg-insight-800/30 px-2 py-0.5 rounded-full">
                          {category.children.length} subject{category.children.length !== 1 ? 's' : ''}
                        </span>
                        <ChevronRight className="h-4 w-4 text-insight-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                    
                    {/* Child Subjects */}
                    {category.children.length > 0 && (
                      <div className="bg-white dark:bg-neutral-900/50">
                        {category.children.map((subject, idx) => {
                          const SubjectIcon = getSubjectIcon(subject.icon, FileText);
                          const isLast = idx === category.children.length - 1;
                          return (
                            <Link
                              key={subject.id}
                              href={`/dashboard/subjects/${subject.id}?classLevelId=${classLevel.id}`}
                              className={`flex items-center justify-between py-2.5 px-3 pl-6 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group ${!isLast ? 'border-b border-neutral-100 dark:border-neutral-800' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Tree connector */}
                                <div className="flex items-center">
                                  <div className="w-4 h-px bg-neutral-300 dark:bg-neutral-700" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 dark:bg-primary-500 ml-0.5" />
                                </div>
                                <div className="rounded-md bg-primary-50 dark:bg-primary-900/20 p-1.5">
                                  <SubjectIcon className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{subject.name_en}</p>
                                  {subject.name_mr && (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{subject.name_mr}</p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Standalone Subjects */}
              {standaloneSubjects.length > 0 && categories.length > 0 && (
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-1 mb-2">
                    Other Subjects
                  </p>
                </div>
              )}
              {standaloneSubjects.map((subject) => {
                const SubjectIcon = getSubjectIcon(subject.icon, BookOpen);
                return (
                  <Link
                    key={subject.id}
                    href={`/dashboard/subjects/${subject.id}?classLevelId=${classLevel.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary-100 dark:bg-primary-900/30 p-2">
                        <SubjectIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{subject.name_en}</p>
                        {subject.name_mr && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{subject.name_mr}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No subjects assigned"
              description="Assign subjects to this class level"
              size="sm"
            />
          )}
        </GlassCard>

        {/* Recent Scheduled Exams */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-success-500" />
              Recent Exams
            </h2>
            <Link
              href={`/dashboard/scheduled-exams?classLevelId=${classLevel.id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingExams ? (
            <div className="flex justify-center py-8"><LoaderSpinner /></div>
          ) : recentExams.length > 0 ? (
            <div className="space-y-2">
              {recentExams.map((exam: any) => {
                // Handle both subject and subjects (API returns subjects, but normalized to subject)
                const subjectName = exam.subject?.name_en || exam.subject?.nameEn || 
                                   exam.subjects?.name_en || exam.subjects?.nameEn;
                const examName = exam.name_en || exam.nameEn || 'Untitled Exam';
                const scheduledDate = exam.scheduled_date || exam.scheduledDate;
                
                return (
                  <Link
                    key={exam.id}
                    href={`/dashboard/scheduled-exams/${exam.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">{examName}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {scheduledDate ? new Date(scheduledDate).toLocaleDateString() : 'No date set'}
                        {subjectName && ` • ${subjectName}`}
                      </p>
                    </div>
                    <Badge 
                      variant={exam.status === "published" ? "success" : exam.status === "completed" ? "default" : "warning"} 
                      size="sm"
                    >
                      {exam.status}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No exams scheduled"
              description="Schedule exams for this class"
              size="sm"
            />
          )}
        </GlassCard>
      </div>
    </div>
  );
}
