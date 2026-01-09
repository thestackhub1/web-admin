"use client";

// Client-side only — no server secrets or database access here

import { useClassLevel, useClassLevelSubjects, useClassLevelScheduledExams } from '@/client/hooks/use-class-levels';
import { GlassCard, Badge, PageHeader, EmptyState } from '@/client/components/ui/premium';
import { Layers, BookOpen, ChevronRight, Users, CalendarCheck, ClipboardList, Calendar, Edit2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { useMemo } from 'react';
import { Button } from '@/client/components/ui/button';

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

  // Assigned subjects
  const assignedSubjects = useMemo(() => {
    if (!classLevelSubjects) return [];
    const map = new Map();
    classLevelSubjects.forEach((s: any) => {
      if (!map.has(s.id)) map.set(s.id, s);
    });
    return Array.from(map.values());
  }, [classLevelSubjects]);

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
        {/* Assigned Subjects */}
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
          ) : assignedSubjects.length > 0 ? (
            <div className="space-y-2">
              {assignedSubjects.slice(0, 5).map((subject: any) => (
                <Link
                  key={subject.id}
                  href={`/dashboard/subjects/${subject.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-insight-100 dark:bg-insight-900/30 p-2">
                      <BookOpen className="h-4 w-4 text-insight-600 dark:text-insight-400" />
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
              ))}
              {assignedSubjects.length > 5 && (
                <p className="text-sm text-neutral-500 text-center pt-2">
                  +{assignedSubjects.length - 5} more subjects
                </p>
              )}
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
