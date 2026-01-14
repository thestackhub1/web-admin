// Client-side only — no server secrets or database access here

"use client";

/**
 * Dashboard Client - Premium Admin Dashboard
 * 
 * Premium SaaS design inspired by Linear, Raycast, and Vercel.
 * Features bento-style cards, semantic colors, and smooth animations.
 */

import {
  Badge,
  SectionHeader,
} from '@/client/components/ui/premium';
import {
  BentoStatCard,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from '@/client/components/ui';
import {
  Users,
  FileQuestion,
  ClipboardList,
  Plus,
  Clock,
  Calendar,
  BookOpen,
  GraduationCap,
  Layers,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/client/utils";
import { useDashboardStats, useKpiMetrics } from '@/client/hooks/use-analytics';
import { useRecentActivity } from '@/client/hooks/use-exams';
import { LoaderSpinner } from '@/client/components/ui/loader';

// Helper function to format relative time
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DashboardClient() {
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: kpis, loading: kpisLoading } = useKpiMetrics();
  const { data: recentActivity = [], loading: activityLoading } = useRecentActivity({ limit: 5 });
  const safeRecentActivity = recentActivity || [];

  if (statsLoading || kpisLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderSpinner />
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
      {/* Hero / Greeting Section - Premium Glass Card */}
      <FadeIn delay={0}>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 via-primary-700 to-insight-700 p-8 lg:p-10">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-insight-400 blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/90 border border-white/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>The Stack Hub Admin Portal</span>
              </motion.div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Welcome Back
              </h1>
              
              <p className="text-white/80 text-base lg:text-lg max-w-lg">
                You have <span className="font-semibold text-white">{statsData.activeScheduledExams} active exams</span> running and <span className="font-semibold text-success-300">{statsData.activeStudents} students</span> engaged today.
              </p>
            </div>
            
            {/* Quick Stats Mini Cards */}
            <div className="flex gap-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 min-w-[120px]">
                <Activity className="h-5 w-5 text-success-300 mb-2" />
                <p className="text-2xl font-bold text-white">{statsData.passRate}%</p>
                <p className="text-xs text-white/70">Pass Rate</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 min-w-[120px]">
                <TrendingUp className="h-5 w-5 text-warning-300 mb-2" />
                <p className="text-2xl font-bold text-white">{statsData.averageScore}%</p>
                <p className="text-xs text-white/70">Avg Score</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Stats Bento Grid */}
      <section>
        <SectionHeader 
          title="System Overview" 
          icon={Target} 
          iconColor="primary"
        />
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
          <StaggerItem className="h-full">
            <Link href="/dashboard/users" className="block h-full">
              <BentoStatCard
                title="Total Users"
                value={statsData.totalUsers}
                icon={Users}
                semantic="primary"
                subtitle={`${statsData.activeStudents} active students`}
                change={kpisData.monthlyEnrollmentGrowth >= 0 ? Number(kpisData.monthlyEnrollmentGrowth.toFixed(1)) : undefined}
              />
            </Link>
          </StaggerItem>
          <StaggerItem className="h-full">
            <Link href="/dashboard/questions" className="block h-full">
              <BentoStatCard
                title="Question Bank"
                value={statsData.totalQuestions}
                icon={FileQuestion}
                semantic="insight"
                subtitle={`${statsData.questionsBySubject.length} subjects`}
              />
            </Link>
          </StaggerItem>
          <StaggerItem className="h-full">
            <Link href="/dashboard/exams" className="block h-full">
              <BentoStatCard
                title="Exams Conducted"
                value={statsData.totalExams}
                icon={ClipboardList}
                semantic="success"
                subtitle={`${statsData.completedExams} completed`}
                change={kpisData.monthlyExamGrowth >= 0 ? Number(kpisData.monthlyExamGrowth.toFixed(1)) : undefined}
              />
            </Link>
          </StaggerItem>
          <StaggerItem className="h-full">
            <Link href="/dashboard/analytics" className="block h-full">
              <BentoStatCard
                title="Average Score"
                value={statsData.averageScore}
                suffix="%"
                icon={Target}
                semantic="warning"
                subtitle={`Pass rate: ${statsData.passRate}%`}
              />
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* Quick Actions - Updated Grid */}
      <FadeIn delay={0.2}>
        <div>
          <SectionHeader 
            title="Quick Actions" 
            icon={Sparkles} 
            iconColor="insight"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link href="/dashboard/questions" className="group">
              <div className="bento-card p-5 h-full flex flex-col items-center text-center space-y-3 transition-all hover:-translate-y-1 hover:shadow-glow-card-hover">
                <div className="icon-container icon-container-primary rounded-xl p-4 transition-transform duration-300 group-hover:scale-110">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Add Question</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Create new question</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/subjects" className="group">
              <div className="bento-card p-5 h-full flex flex-col items-center text-center space-y-3 transition-all hover:-translate-y-1 hover:shadow-glow-card-hover">
                <div className="icon-container icon-container-success rounded-xl p-4 transition-transform duration-300 group-hover:scale-110">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Subjects</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage curriculum</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/class-levels" className="group">
              <div className="bento-card p-5 h-full flex flex-col items-center text-center space-y-3 transition-all hover:-translate-y-1 hover:shadow-glow-card-hover">
                <div className="icon-container icon-container-warning rounded-xl p-4 transition-transform duration-300 group-hover:scale-110">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Class Levels</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Student cohorts</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/exam-structures" className="group">
              <div className="bento-card p-5 h-full flex flex-col items-center text-center space-y-3 transition-all hover:-translate-y-1 hover:shadow-glow-card-hover">
                <div className="icon-container icon-container-insight rounded-xl p-4 transition-transform duration-300 group-hover:scale-110">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Blueprints</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Exam structures</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Two Column Layout: Recent Activity + Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2">
          <FadeIn delay={0.3}>
            <div className="bento-card p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <Link
                  href="/dashboard/exams"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {safeRecentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-4 mb-4">
                      <Clock className="h-8 w-8 text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No recent activity</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Student exam attempts will appear here</p>
                  </div>
                ) : (
                  safeRecentActivity.map((exam: any) => {
                    const displayName = exam.profiles?.name || exam.profiles?.email?.split('@')[0] || 'Anonymous Student';
                    const subjectName = exam.subjects?.name_en || exam.exam_structure?.name_en || 'General Exam';
                    const timeAgo = exam.started_at ? formatTimeAgo(new Date(exam.started_at)) : '';
                    
                    return (
                    <div
                      key={exam.id}
                      className="group rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 bg-white/50 dark:bg-neutral-800/30 p-4 transition-all duration-200 hover:bg-white dark:hover:bg-neutral-800/60 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                              "h-2.5 w-2.5 rounded-full ring-4 ring-opacity-20",
                              exam.status === 'completed' 
                                ? 'bg-success-500 ring-success-500' 
                                : 'bg-warning-500 ring-warning-500'
                            )} />
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                              {displayName}
                            </p>
                            {timeAgo && (
                              <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
                                {timeAgo}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 ml-5">
                            {subjectName}
                          </p>
                          {exam.status === 'completed' && exam.percentage !== null && exam.percentage !== undefined ? (
                            <div className="flex items-center gap-3 ml-5">
                              <div className="h-2 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    exam.percentage >= 70
                                      ? 'bg-linear-to-r from-success-500 to-success-400'
                                      : exam.percentage >= 40
                                        ? 'bg-linear-to-r from-warning-500 to-warning-400'
                                        : 'bg-linear-to-r from-rose-500 to-rose-400'
                                  )}
                                  style={{ width: `${Math.min(exam.percentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold tabular-nums text-neutral-700 dark:text-neutral-300 min-w-10 text-right">
                                {Math.round(exam.percentage)}%
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 ml-5">
                              <div className="h-2 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-linear-to-r from-warning-500/60 to-warning-400/40 rounded-full animate-pulse" />
                              </div>
                              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                In progress...
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={exam.status === "completed" ? "success" : "warning"}
                        size="sm"
                      >
                        {exam.status === "completed" ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                );
                  })
              )}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Summary Stats - 1 column */}
        <div className="space-y-5">
          {/* Upcoming Exams */}
          <FadeIn delay={0.4}>
            <div className="bento-card p-6 overflow-hidden bg-linear-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/30 dark:to-primary-900/20 border-primary-200/50 dark:border-primary-800/50">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <h4 className="font-semibold text-primary-900 dark:text-primary-100">
                  Upcoming Exams
                </h4>
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-bold text-primary-900 dark:text-primary-100">
                  {statsData.activeScheduledExams}
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Scheduled for this week
                </p>
                <Link
                  href="/dashboard/scheduled-exams"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mt-2"
                >
                  View Calendar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Performance Summary */}
          <FadeIn delay={0.5}>
            <div className="bento-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-5 w-5 text-insight-500" />
                <h4 className="font-semibold text-neutral-900 dark:text-white">
                  Performance
                </h4>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Average Score</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {statsData.averageScore}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        statsData.averageScore >= 70
                          ? 'bg-linear-to-r from-success-500 to-success-400'
                          : statsData.averageScore >= 40
                            ? 'bg-linear-to-r from-warning-500 to-warning-400'
                            : 'bg-linear-to-r from-rose-500 to-rose-400'
                      )}
                      style={{ width: `${Math.min(statsData.averageScore, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Pass Rate</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {statsData.passRate}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-success-500 to-success-400"
                      style={{ width: `${Math.min(statsData.passRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mt-5"
              >
                View Detailed Analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
