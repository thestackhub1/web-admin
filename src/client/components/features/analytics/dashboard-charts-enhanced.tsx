// Client-side only — no server secrets or database access here

"use client";

import { useState } from "react";
import { GlassCard } from '@/client/components/ui/premium';
import {
  DonutChart,
  TrendLineChart,
  ScoreBarChart,
  AreaGradientChart,
} from '@/client/components/ui/analytics-charts';
import { SmartFilterBar, FilterState, FilterOption } from '@/client/components/ui/smart-filters';
import { KpiCard, ProgressRing, InsightPanel, MetricComparison } from '@/client/components/ui/kpi-cards';
import {
  Users,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  BarChart3,
  Activity,
} from "lucide-react";
import { theme } from "@/client/lib/theme";

// ============================================
// Types
// ============================================
interface DashboardChartsEnhancedProps {
  // Stats
  totalUsers: number;
  activeStudents: number;
  totalExams: number;
  completedExams: number;
  averageScore: number;
  passRate: number;
  completionRate: number;

  // Chart Data
  questionsBySubject: { name: string; value: number; color?: string }[];
  questionsByDifficulty: { name: string; value: number; color?: string }[];
  monthlyTrends: { name: string; exams: number; enrollments: number; avgScore: number }[];
  classLevelStats: { name: string; value: number; target?: number }[];

  // KPIs
  retentionRate: number;
  avgExamsPerStudent: number;
  monthlyGrowth: number;
  previousPeriodExams: number;
  previousPeriodScore: number;

  // Filter Options
  classLevels: FilterOption[];
  subjects: FilterOption[];

  // Insights
  insights: {
    type: "success" | "warning" | "danger" | "info";
    title: string;
    description: string;
    action?: { label: string; href: string };
  }[];
}

export function DashboardChartsEnhanced({
  totalUsers: _totalUsers,
  activeStudents: _activeStudents,
  totalExams,
  completedExams: _completedExams,
  averageScore,
  passRate,
  completionRate,
  questionsBySubject,
  questionsByDifficulty,
  monthlyTrends,
  classLevelStats,
  retentionRate,
  avgExamsPerStudent,
  monthlyGrowth,
  previousPeriodExams,
  previousPeriodScore,
  classLevels,
  subjects,
  insights,
}: DashboardChartsEnhancedProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null, preset: "30days" },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate refresh - in real app, this would refetch data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Smart Filters */}
      <SmartFilterBar
        filters={filters}
        onChange={setFilters}
        classLevels={classLevels}
        subjects={subjects}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Student Retention"
          value={`${retentionRate}%`}
          subtitle="Active exam takers"
          icon={Users}
          trend={{
            value: monthlyGrowth,
            direction: monthlyGrowth > 0 ? "up" : monthlyGrowth < 0 ? "down" : "neutral",
            label: "vs last month",
          }}
          gradient="purple"
          status={retentionRate > 70 ? "success" : retentionRate > 50 ? "warning" : "danger"}
        />

        <KpiCard
          title="Pass Rate"
          value={`${passRate}%`}
          subtitle="Above 35% threshold"
          icon={Award}
          trend={{
            value: Math.abs(passRate - 75),
            direction: passRate >= 75 ? "up" : "down",
          }}
          gradient="emerald"
          status={passRate >= 75 ? "success" : passRate >= 50 ? "warning" : "danger"}
        />

        <KpiCard
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle="Exams finished vs started"
          icon={Target}
          gradient="primary"
          status={completionRate >= 80 ? "success" : completionRate >= 60 ? "warning" : "danger"}
        />

        <KpiCard
          title="Avg Exams/Student"
          value={avgExamsPerStudent.toFixed(1)}
          subtitle="Engagement metric"
          icon={Activity}
          gradient="amber"
          status={avgExamsPerStudent >= 3 ? "success" : avgExamsPerStudent >= 1 ? "info" : "warning"}
        />
      </div>

      {/* Progress Rings & Score Comparisons */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress Rings */}
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Performance Overview
          </h3>
          <div className="flex items-center justify-around py-4">
            <ProgressRing
              value={passRate}
              color="emerald"
              label="Pass Rate"
              sublabel={`${passRate}%`}
            />
            <ProgressRing
              value={completionRate}
              color="primary"
              label="Completion"
              sublabel={`${completionRate}%`}
            />
            <ProgressRing
              value={retentionRate}
              color="purple"
              label="Retention"
              sublabel={`${retentionRate}%`}
            />
          </div>
        </GlassCard>

        {/* Period Comparison */}
        <GlassCard className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Period Comparison
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricComparison
              title="Total Exams"
              current={totalExams}
              previous={previousPeriodExams}
              icon={BookOpen}
            />
            <MetricComparison
              title="Average Score"
              current={averageScore}
              previous={previousPeriodScore}
              format="percentage"
              icon={TrendingUp}
            />
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Questions by Subject */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Questions by Subject
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Distribution overview</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <DonutChart
            data={questionsBySubject}
            centerValue={questionsBySubject.reduce((sum, q) => sum + q.value, 0)}
            centerLabel="Total"
          />
        </GlassCard>

        {/* Monthly Trends */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Monthly Trends
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Last 6 months activity</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
              <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <TrendLineChart
            data={monthlyTrends}
            lines={[
              { key: "exams", color: theme.semanticColors.exams, name: "Exams" },
              { key: "enrollments", color: theme.semanticColors.enrollments, name: "Enrollments" },
            ]}
            height={250}
          />
        </GlassCard>
      </div>

      {/* Difficulty & Class Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Difficulty Distribution */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Question Difficulty
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">IT subject breakdown</p>
          </div>
          <ScoreBarChart
            data={questionsByDifficulty.map((d) => ({
              name: d.name,
              value: d.value,
              color: d.color,
            }))}
            height={200}
          />
        </GlassCard>

        {/* Class Performance */}
        {classLevelStats.length > 0 && (
          <GlassCard>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Performance by Class
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Average scores by class level</p>
            </div>
            <ScoreBarChart
              data={classLevelStats}
              height={200}
              showTarget
            />
          </GlassCard>
        )}
      </div>

      {/* Insights Panel */}
      {insights.length > 0 && (
        <InsightPanel insights={insights} />
      )}
    </div>
  );
}

// ============================================
// Simple Charts for Basic Dashboard View
// ============================================
interface SimpleChartsProps {
  subjectData: { name: string; value: number; color: string }[];
  weeklyData?: { name: string; value: number }[];
}

export function SimpleCharts({ subjectData, weeklyData }: SimpleChartsProps) {
  const defaultWeeklyData = [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 19 },
    { name: "Wed", value: 15 },
    { name: "Thu", value: 22 },
    { name: "Fri", value: 28 },
    { name: "Sat", value: 8 },
    { name: "Sun", value: 5 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Questions by Subject
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Distribution across subjects</p>
        </div>
        <DonutChart data={subjectData} />
      </GlassCard>

      <GlassCard>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Weekly Activity
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Exam attempts this week</p>
        </div>
        <AreaGradientChart data={weeklyData || defaultWeeklyData} height={220} />
      </GlassCard>
    </div>
  );
}
