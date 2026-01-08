"use client";

// Client-side only — no server secrets or database access here

import { useClassLevel, useClassLevelSubjects, useClassLevelScheduledExams } from '@/client/hooks/use-class-levels';
import { useSubjects } from '@/client/hooks/use-subjects';
import { useScheduledExams } from '@/client/hooks/use-scheduled-exams';
import { GlassCard, Badge } from '@/client/components/ui/premium';
import { Layers, BookOpen, Calendar, ChevronRight, GraduationCap, Globe, Monitor, Clock, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassLevelSubjectEditor } from './class-level-subject-editor';
import { LoaderSpinner } from '@/client/components/ui/loader';
import { useMemo } from 'react';

// Subject styles for visual consistency
const subjectStyles: Record<string, { bg: string; text: string; icon: any }> = {
  scholarship: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    icon: GraduationCap,
  },
  english: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    icon: Globe,
  },
  information_technology: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
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

  // Calculate stats (must be before early returns)
  const stats = useMemo(() => {
    if (!classLevel || !allScheduledExams) {
      return {
        scheduledExams: 0,
        publishedExams: 0,
        totalStudents: 0,
      };
    }
    const classScheduledExams = allScheduledExams.filter((exam) => exam.class_level_id === classLevel.id);
    const publishedExams = classScheduledExams.filter((exam) => exam.status === "published");
    
    return {
      scheduledExams: classScheduledExams.length,
      publishedExams: publishedExams.length,
      totalStudents: 0, // Would need a separate endpoint
    };
  }, [classLevel, allScheduledExams]);

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
      {/* Compact Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <Layers className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {classLevel.name_en}
              </h1>
              <Badge
                variant={classLevel.is_active ? "success" : "warning"}
                size="sm"
              >
                {classLevel.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/dashboard" className="hover:text-neutral-700 dark:hover:text-neutral-300">
                Dashboard
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/dashboard/class-levels" className="hover:text-neutral-700 dark:hover:text-neutral-300">
                Class Levels
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-neutral-700 dark:text-neutral-300">{classLevel.name_en}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{assignedSubjects.length}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Subjects</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{stats.scheduledExams}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Scheduled Exams</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{stats.publishedExams}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Published</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
            <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{stats.totalStudents}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Students</p>
          </div>
        </div>
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
      {recentExams.length > 0 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-500" />
              Recent Scheduled Exams
            </h2>
            <Link
              href="/dashboard/scheduled-exams"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
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
                    </p>
                  </div>
                  <Badge variant={exam.status === "published" ? "success" : "default"} size="sm">
                    {exam.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
