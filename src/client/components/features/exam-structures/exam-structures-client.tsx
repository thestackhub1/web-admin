"use client";

// Client-side only — no server secrets or database access here

import { useSearchParams } from "next/navigation";
import { PageHeader, GlassCard, Badge, EmptyState } from '@/client/components/ui/premium';
import { Layers, Clock, HelpCircle, Plus, BookOpen, CheckCircle, FileText, Target, Award, GraduationCap, Monitor } from "lucide-react";
import Link from "next/link";
import { Button } from '@/client/components/ui/button';
import { useExamStructures } from '@/client/hooks/use-exam-structures';
import { useSubjects } from '@/client/hooks/use-subjects';
import { PageLoader, LoaderSpinner } from '@/client/components/ui/loader';
import { useMemo } from 'react';

const subjectColors: Record<string, { bg: string; text: string; gradient: string; icon: React.ElementType }> = {
  scholarship: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-pink-500",
    icon: GraduationCap,
  },
  english: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    icon: BookOpen,
  },
  information_technology: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
    gradient: "from-green-500 to-emerald-500",
    icon: Monitor,
  },
};

export function ExamStructuresClient() {
  const searchParams = useSearchParams();
  const subjectFilter = searchParams.get('subject');
  const statusFilter = searchParams.get('status');

  const { data: structures, loading: isLoadingStructures } = useExamStructures();
  const { data: subjects, loading: isLoadingSubjects } = useSubjects();

  // All hooks and memoized values must be before early returns
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

  // Filter structures based on search params
  /* eslint-disable react-hooks/exhaustive-deps */
  const filteredStructures = useMemo(() => {
    let filtered = structuresWithSubjects;

    // Filter by class level (from URL)
    const classLevelId = searchParams.get('classLevelId');
    if (classLevelId) {
      filtered = filtered.filter((s: any) => s.class_level_id === classLevelId);
    }

    if (subjectFilter && subjectFilter !== "all") {
      filtered = filtered.filter((s: any) => s.subjects?.slug === subjectFilter);
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((s: any) => s.is_active);
    } else if (statusFilter === "draft") {
      filtered = filtered.filter((s: any) => !s.is_active);
    }

    return filtered;
  }, [structuresWithSubjects, subjectFilter, statusFilter, searchParams]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Calculate stats
  const stats = useMemo(() => {
    const totalStructures = structuresWithSubjects.length;
    const activeStructures = structuresWithSubjects.filter((s: any) => s.is_active).length;
    const totalQuestions = structuresWithSubjects.reduce((acc: number, s: any) => acc + (s.total_questions || 0), 0);
    const totalMarks = structuresWithSubjects.reduce((acc: number, s: any) => {
      const sections = s.sections || [];
      return acc + sections.reduce((sum: number, sec: any) => sum + (sec.total_marks || 0), 0);
    }, 0);

    return { totalStructures, activeStructures, totalQuestions, totalMarks };
  }, [structuresWithSubjects]);

  // Early return after all hooks
  if (isLoadingStructures || isLoadingSubjects) {
    return <PageLoader message="Loading exam structures..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Structures"
        description="Define exam blueprints with sections and rules"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exam Structures" }]}
        action={
          <Link href="/dashboard/exam-structures/new">
            <Button className="flex items-center gap-2 bg-linear-to-r from-primary-600 to-insight-600 hover:from-primary-700 hover:to-insight-700 text-white shadow-lg shadow-primary-500/25 border-0">
              <Plus className="h-4 w-4" />
              Create Structure
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="flex items-center gap-4" hover>
          <div className="rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 p-3 text-white shadow-lg shadow-blue-500/25">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalStructures}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Blueprints</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hover>
          <div className="rounded-xl bg-linear-to-br from-green-500 to-emerald-600 p-3 text-white shadow-lg shadow-green-500/25">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.activeStructures}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Active</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hover>
          <div className="rounded-xl bg-linear-to-br from-purple-500 to-pink-600 p-3 text-white shadow-lg shadow-purple-500/25">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalQuestions}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Questions</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hover>
          <div className="rounded-xl bg-linear-to-br from-amber-500 to-amber-600 p-3 text-white shadow-lg shadow-amber-500/25">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalMarks}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Marks</p>
          </div>
        </GlassCard>
      </div>

      {/* Smart Filters */}
      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Subject Filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Subject
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/exam-structures"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${!subjectFilter || subjectFilter === "all"
                  ? "bg-linear-to-r from-primary-500 to-insight-500 text-white shadow-lg shadow-primary-500/25"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
              >
                <BookOpen className="h-4 w-4" />
                All Subjects
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                  {structuresWithSubjects.length}
                </span>
              </Link>
              {subjects?.map((subject: any) => {
                const count = structuresWithSubjects.filter((s: any) => s.subjects?.slug === subject.slug).length;
                const colors = subjectColors[subject.slug] || subjectColors.scholarship;
                return (
                  <Link
                    key={subject.id}
                    href={`/dashboard/exam-structures?subject=${subject.slug}${statusFilter ? `&status=${statusFilter}` : ""}`}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${subjectFilter === subject.slug
                      ? `bg-linear-to-r ${colors.gradient} text-white shadow-lg`
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      }`}
                  >
                    <colors.icon className="h-4 w-4" />
                    {subject.name_en}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${subjectFilter === subject.slug
                      ? "bg-white/20 text-white"
                      : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                      }`}>
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-10 w-px bg-neutral-200 dark:bg-neutral-700 lg:block" />

          {/* Status Filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Status
            </p>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/exam-structures${subjectFilter ? `?subject=${subjectFilter}` : ""}`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${!statusFilter
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
              >
                All
              </Link>
              <Link
                href={`/dashboard/exam-structures?${subjectFilter ? `subject=${subjectFilter}&` : ""}status=active`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${statusFilter === "active"
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                Active
              </Link>
              <Link
                href={`/dashboard/exam-structures?${subjectFilter ? `subject=${subjectFilter}&` : ""}status=draft`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${statusFilter === "draft"
                  ? "bg-neutral-600 text-white shadow-lg"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                Draft
              </Link>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(subjectFilter || statusFilter) && (
          <div className="flex items-center gap-2 border-t border-neutral-200/50 pt-4 dark:border-neutral-700/50">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Showing:</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              {filteredStructures.length} structure{filteredStructures.length !== 1 ? "s" : ""}
            </span>
            {(subjectFilter || statusFilter) && (
              <Link
                href="/dashboard/exam-structures"
                className="ml-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Clear filters
              </Link>
            )}
          </div>
        )}
      </GlassCard>

      {/* Structures Grid */}
      {filteredStructures.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Layers}
            title={subjectFilter || statusFilter ? "No matching structures" : "No exam structures"}
            description={
              subjectFilter || statusFilter
                ? "Try adjusting your filters to find what you're looking for"
                : "Create exam blueprints to define how exams are structured"
            }
            action={
              subjectFilter || statusFilter ? (
                <Link href="/dashboard/exam-structures">
                  <Button variant="secondary">Clear Filters</Button>
                </Link>
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
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStructures.map((structure: any) => {
            const colors = subjectColors[structure.subjects?.slug] || subjectColors.scholarship;
            const sections = structure.sections || [];
            const totalSectionMarks = sections.reduce((acc: number, s: any) => acc + (s.total_marks || 0), 0);

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
                  <div className={`rounded-xl ${colors.bg} p-2.5 ${colors.text} transition-transform group-hover:scale-110`}>
                    <colors.icon className="h-6 w-6" />
                  </div>
                </div>

                {structure.subjects && (
                  <span
                    className={`mt-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
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
                      {sections.slice(0, 3).map((section: any, i: number) => (
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
      )}
    </div>
  );
}

