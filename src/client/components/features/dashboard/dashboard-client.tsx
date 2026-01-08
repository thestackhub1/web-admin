// Client-side only — no server secrets or database access here

"use client";

/**
 * Dashboard Client - Premium Admin Dashboard
 * 
 * Premium SaaS design inspired by Linear, Raycast, and Vercel.
 * Features bento-style cards, semantic colors, and smooth animations.
 * 
 * This component orchestrates all dashboard sub-components.
 */

import { useDashboardStats, useKpiMetrics } from '@/client/hooks/use-analytics';
import { useRecentActivity } from '@/client/hooks/use-exams';
import { LoadingComponent } from '@/client/components/ui/loader';
import {
  DashboardHero,
  DashboardStatsGrid,
  QuickActionsGrid,
  RecentActivityCard,
  UpcomingExamsCard,
  PerformanceSummaryCard,
} from './';

export function DashboardClient() {
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: kpis, loading: kpisLoading } = useKpiMetrics();
  const { data: recentActivity = [], loading: activityLoading } = useRecentActivity({ limit: 5 });
  const safeRecentActivity = recentActivity || [];

  if (statsLoading || kpisLoading || activityLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
        <LoadingComponent size="lg" message="Loading dashboard insights..." />
      </div>
    );
  }

  const statsData = stats || {
    totalUsers: 0,
    activeStudents: 0,
    totalAdmins: 0,
    totalTeachers: 0,
    totalQuestions: 0,
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    passRate: 0,
    completionRate: 0,
    activeScheduledExams: 0,
    questionsBySubject: [],
    questionsByDifficulty: [],
    questionsByType: [],
    usersByRole: [],
    classLevelStats: [],
  };

  const kpisData = kpis || {
    studentRetentionRate: 0,
    avgExamsPerStudent: 0,
    avgQuestionsAttempted: 0,
    overallPassRate: 0,
    averageCompletionRate: 0,
    averageScorePercentage: 0,
    monthlyEnrollmentGrowth: 0,
    monthlyExamGrowth: 0,
    previousPeriod: {
      totalExams: 0,
      completedExams: 0,
      averageScore: 0,
      newUsers: 0,
    },
    questionTypeBreakdown: [],
  };

  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <DashboardHero
        activeScheduledExams={statsData.activeScheduledExams}
        activeStudents={statsData.activeStudents}
        passRate={statsData.passRate}
        averageScore={statsData.averageScore}
      />

      {/* Stats Grid */}
      <DashboardStatsGrid
        totalUsers={statsData.totalUsers}
        activeStudents={statsData.activeStudents}
        totalQuestions={statsData.totalQuestions}
        questionsBySubjectCount={statsData.questionsBySubject.length}
        totalExams={statsData.totalExams}
        completedExams={statsData.completedExams}
        averageScore={statsData.averageScore}
        passRate={statsData.passRate}
        monthlyEnrollmentGrowth={kpisData.monthlyEnrollmentGrowth}
        monthlyExamGrowth={kpisData.monthlyExamGrowth}
      />

      {/* Quick Actions */}
      <QuickActionsGrid />

      {/* Two Column Layout: Recent Activity + Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivityCard activities={safeRecentActivity} />
        </div>

        {/* Summary Stats - 1 column */}
        <div className="space-y-5">
          <UpcomingExamsCard activeScheduledExams={statsData.activeScheduledExams} />
          <PerformanceSummaryCard
            averageScore={statsData.averageScore}
            passRate={statsData.passRate}
          />
        </div>
      </div>
    </div>
  );
}
