"use client";

/**
 * Exams Page Client Component
 * 
 * Wrapper component that adds PageHeader with filter support
 * and renders the ExamAttemptsClient with proper context.
 */

import { useMemo } from 'react';
import { PageHeader } from '@/client/components/ui/premium';
import { ClassLevelFilterBadge, useClassLevelFilter } from '@/client/components/ui/class-level-filter-badge';
import { ExamAttemptsClient, type ExamAttempt } from './exam-attempts-client';

interface ExamsPageClientProps {
  exams: ExamAttempt[];
  subjects: { id: string; name_en: string }[];
  isStudent: boolean;
}

export function ExamsPageClient({ exams, subjects, isStudent }: ExamsPageClientProps) {
  const { classLevel: activeClassLevel, hasFilter: hasClassLevelFilter } = useClassLevelFilter();

  // Dynamic page content based on filter and user role
  const pageTitle = useMemo(() => {
    if (isStudent) return "My Exams";
    if (hasClassLevelFilter && activeClassLevel) {
      return `Exam Attempts - ${activeClassLevel.name_en}`;
    }
    return "Exam Attempts";
  }, [isStudent, hasClassLevelFilter, activeClassLevel]);

  const pageDescription = useMemo(() => {
    if (isStudent) return "Track your exam history, scores, and progress";
    if (hasClassLevelFilter && activeClassLevel) {
      return `Student exam attempts for ${activeClassLevel.name_en}`;
    }
    return "Monitor all student exam attempts, performance, and results";
  }, [isStudent, hasClassLevelFilter, activeClassLevel]);

  const breadcrumbs = useMemo(() => {
    if (hasClassLevelFilter && activeClassLevel) {
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Class Levels", href: "/dashboard/class-levels" },
        { label: activeClassLevel.name_en, href: `/dashboard/class-levels/${activeClassLevel.slug}` },
        { label: "Exam Attempts" }
      ];
    }
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Exam Attempts" }
    ];
  }, [hasClassLevelFilter, activeClassLevel]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        breadcrumbs={breadcrumbs}
        action={<ClassLevelFilterBadge />}
      />

      <ExamAttemptsClient 
        exams={exams} 
        subjects={subjects}
        isStudent={isStudent} 
      />
    </div>
  );
}
