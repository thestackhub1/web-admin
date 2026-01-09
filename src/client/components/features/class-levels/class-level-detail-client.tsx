"use client";

// Client-side only — no server secrets or database access here

import { useClassLevel, useClassLevelSubjects, useClassLevelScheduledExams } from '@/client/hooks/use-class-levels';
import { useSubjects } from '@/client/hooks/use-subjects';
import { useScheduledExams } from '@/client/hooks/use-scheduled-exams';
import { GlassCard, Badge, PageHeader } from '@/client/components/ui/premium';
import { Layers, BookOpen, Calendar, ChevronRight, GraduationCap, Globe, Monitor, Clock, Users, TrendingUp, Plus, CalendarCheck, ClipboardList } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassLevelSubjectEditor } from './class-level-subject-editor';
import { LoaderSpinner } from '@/client/components/ui/loader';
import { useMemo } from 'react';

// Subject styles for visual consistency
const subjectStyles: Record<string, { bg: string; text: string; icon: any }> = {
  scholarship: {
    bg: "bg-insight-50 dark:bg-insight-900/20",
    text: "text-insight-600 dark:text-insight-400",
    icon: GraduationCap,
  },
  english: {
    bg: "bg-primary-50 dark:bg-primary-900/20",
    text: "text-primary-600 dark:text-primary-400",
    icon: Globe,
  },
  information_technology: {
    bg: "bg-success-50 dark:bg-success-900/20",
    text: "text-success-600 dark:text-success-400",
    icon: Monitor,
  },
};

const defaultSubjectStyle = {
  bg: "bg-neutral-100 dark:bg-neutral-800",
  text: "text-neutral-600 dark:text-neutral-400",
  icon: BookOpen,
};

interface ClassLevelDetailClientProps {
  slug: string;
}

export function ClassLevelDetailClient({ slug }: ClassLevelDetailClientProps) {
  const { data: classLevel, loading: isLoadingClassLevel } = useClassLevel(slug);
  const { data: allSubjects, loading: isLoadingSubjects } = useSubjects();
  const { data: classLevelSubjects, loading: isLoadingClassLevelSubjects } = useClassLevelSubjects(slug);
  const { data: scheduledExams, loading: isLoadingScheduledExams } = useClassLevelScheduledExams(slug);
  const { data: allScheduledExams } = useScheduledExams({ status: 'all' });

  // Stats configuration
  const stats = useMemo(() => {
    if (!classLevel) return [];

    return [
      {
        label: "Total Students",
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
        label: "Total Attempts",
        value: classLevel.examAttemptCount || 0,
        icon: ClipboardList,
        color: "warning",
        href: `/dashboard/exams?classLevelId=${classLevel.id}`,
      },
    ];
  }, [classLevel]);

  // Get unique subjects (deduplicated) - must be before early returns
  const assignedSubjectsMap = useMemo(() => {
    const map = new Map();
    (classLevelSubjects || []).forEach((s: any) => {
      if (!map.has(s.id)) {
        map.set(s.id, s);
      }
    });
    return map;
  }, [classLevelSubjects]);

  const assignedSubjects = useMemo(() => Array.from(assignedSubjectsMap.values()), [assignedSubjectsMap]);
  const assignedSubjectIds = useMemo(() => new Set(assignedSubjects.map((s: any) => s.id)), [assignedSubjects]);

  // Process categories and their subjects - must be before early returns
  const categories = useMemo(() => (allSubjects || []).filter((s) => s.is_category && !s.parent_subject_id), [allSubjects]);
  const childSubjects = useMemo(() => (allSubjects || []).filter((s) => s.parent_subject_id), [allSubjects]);
  const standaloneSubjects = useMemo(() => (allSubjects || []).filter((s) => !s.is_category && !s.parent_subject_id), [allSubjects]);

  const categoriesWithSubjects = useMemo(() => categories.map((category: any) => ({
    ...category,
    subjects: childSubjects.filter((s: any) => s.parent_subject_id === category.id).map((subject: any) => ({
      ...subject,
      isAssigned: assignedSubjectIds.has(subject.id),
    })),
  })), [categories, childSubjects, assignedSubjectIds]);

  // Process standalone subjects
  const standaloneSubjectsWithAssignment = useMemo(() => standaloneSubjects.map((subject: any) => ({
    ...subject,
    isAssigned: assignedSubjectIds.has(subject.id),
  })), [standaloneSubjects, assignedSubjectIds]);

  // Recent exams
  const recentExams = useMemo(() => (scheduledExams || []).slice(0, 5), [scheduledExams]);

  const getSubjectStyle = (slug: string) => subjectStyles[slug] || defaultSubjectStyle;

  if (isLoadingClassLevel || isLoadingSubjects || isLoadingClassLevelSubjects || isLoadingScheduledExams) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderSpinner />
      </div>
    );
  }

  if (!classLevel) {
    notFound();
    return null; // TypeScript needs this
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={classLevel.name_en}
        description={`Manage subjects and exams for ${classLevel.name_en}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Class Levels", href: "/dashboard/class-levels" },
          { label: classLevel.name_en }
        ]}
        action={
          <Badge
            variant={classLevel.is_active ? "success" : "warning"}
            size="md"
            dot
          >
            {classLevel.is_active ? "Active" : "Inactive"}
          </Badge>
        }
      />

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = {
            primary: "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
            success: "bg-success-50 text-success-600 dark:bg-success-900/20 dark:text-success-400",
            warning: "bg-warning-50 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400",
            insight: "bg-insight-50 text-insight-600 dark:bg-insight-900/20 dark:text-insight-400",
          };

          const cardContent = (
            <GlassCard className="flex items-center gap-3 p-4 transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full">
              <div className={`rounded-xl p-2 ${colors[stat.color as keyof typeof colors]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
              </div>
            </GlassCard>
          );

          if (stat.href) {
            return (
              <Link key={index} href={stat.href} className="contents">
                {cardContent}
              </Link>
            );
          }

          return <div key={index} className="contents">{cardContent}</div>;
        })}
      </div>

      {/* Subject Management Section */}
      <ClassLevelSubjectEditor
        classLevelId={classLevel.id}
        classLevelName={classLevel.name_en}
        classLevelSlug={slug}
        assignedSubjects={assignedSubjects}
        categoriesWithSubjects={categoriesWithSubjects}
        standaloneSubjects={standaloneSubjectsWithAssignment}
      />

      {/* Recent Scheduled Exams */}
      {/* Recent Scheduled Exams */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-500" />
            Recent Scheduled Exams
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/scheduled-exams/create?classLevelId=${classLevel.id}`}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
            >
              <Plus className="h-3.5 w-3.5" />
              Schedule Exam
            </Link>
            <Link
              href={`/dashboard/scheduled-exams?classLevelId=${classLevel.id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {recentExams.length > 0 ? (
          <div className="space-y-3">
            {recentExams.map((exam: any) => (
              <Link
                key={exam.id}
                href={`/dashboard/scheduled-exams/${exam.id}`}
                className="block rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{exam.name_en}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {exam.scheduled_date ? new Date(exam.scheduled_date).toLocaleDateString() : 'No date set'}
                      {exam.subject && <span className="mx-1">•</span>}
                      {exam.subject?.name_en}
                    </p>
                  </div>
                  <Badge variant={exam.status === "published" ? "success" : "default"} size="sm">
                    {exam.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">No exams scheduled for this class yet.</p>
            <Link
              href={`/dashboard/scheduled-exams/create?classLevelId=${classLevel.id}`}
              className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              Schedule an exam
            </Link>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
