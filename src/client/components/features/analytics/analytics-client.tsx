// Client-side only — no server secrets or database access here

"use client";

import { useState, useMemo } from "react";
import { GlassCard, Badge } from '@/client/components/ui/premium';
import {
  DonutChart,
  TrendLineChart,
  ScoreBarChart,
  StackedBarChart,
  ComparisonBarChart,
} from '@/client/components/ui/analytics-charts';
import {
  SmartFilterBar,
  FilterState,
  FilterOption,
} from '@/client/components/ui/smart-filters';
import {
  KpiCard,
  ProgressRing,
  InsightPanel,
} from '@/client/components/ui/kpi-cards';
import { LoaderSpinner, PageLoader } from '@/client/components/ui/loader';
import {
  useDashboardStats,
  useKpiMetrics,
  useClassLevelAnalytics,
  useSubjectAnalytics,
  useMonthlyTrends,
  useFilterOptions,
} from '@/client/hooks/use-analytics';
import {
  Users,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Download,
  Layers,
  Brain,
  Filter,
} from "lucide-react";
import { theme } from "@/client/lib/theme";

// ============================================
// Types
// ============================================
import type {
  ClassLevelAnalytics,
  SubjectAnalytics,
} from '@/client/hooks/use-analytics';

export function AnalyticsClient() {
  // All hooks must be called at the top, before any early returns
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null, preset: "30days" },
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "subjects" | "questions">("overview");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all data using hooks
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: kpis, loading: kpisLoading } = useKpiMetrics();
  const { data: classAnalytics = [], loading: classLoading } = useClassLevelAnalytics();
  const { data: subjectAnalytics = [], loading: subjectLoading } = useSubjectAnalytics();
  const { data: trends = [], loading: trendsLoading } = useMonthlyTrends();
  const { data: filterOptions, loading: filtersLoading } = useFilterOptions();

  const isLoading = statsLoading || kpisLoading || classLoading || subjectLoading || trendsLoading || filtersLoading;

  // Default values
  const statsData = stats || {
    totalUsers: 0,
    activeStudents: 0,
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    passRate: 0,
    completionRate: 0,
    questionsBySubject: [],
    questionsByDifficulty: [],
  };

  const kpisData = kpis || {
    studentRetentionRate: 0,
    avgExamsPerStudent: 0,
    monthlyEnrollmentGrowth: 0,
    monthlyExamGrowth: 0,
    previousPeriod: {
      totalExams: 0,
      completedExams: 0,
      averageScore: 0,
      newUsers: 0,
    },
  };

  const classLevels = filterOptions?.classLevels || [];
  const subjects = filterOptions?.subjects || [];

  // Generate insights
  const insights = useMemo(() => {
    const result: Array<{ type: "success" | "info" | "danger" | "warning"; title: string; description: string; action?: { label: string; href: string } }> = [];

    if (statsData.activeStudents < 10) {
      result.push({
        type: "info",
        title: "Low Student Engagement",
        description: "Consider running marketing campaigns or offering new courses to attract more students.",
        action: { label: "View Marketing", href: "/dashboard/marketing" }
      });
    }

    if (kpisData.monthlyEnrollmentGrowth < 0) {
      result.push({
        type: "danger",
        title: "Declining Enrollments",
        description: `Enrollment decreased by ${Math.abs(kpisData.monthlyEnrollmentGrowth).toFixed(1)}% last month. Investigate reasons for churn.`,
        action: { label: "Analyze Trends", href: "/dashboard/analytics" }
      });
    }

    if ((statsData.questionsBySubject || []).reduce((sum: number, q: { count: number }) => sum + q.count, 0) < 100) {
      result.push({
        type: "warning",
        title: "Limited Question Bank",
        description: "Expand your question bank to offer more diverse practice opportunities.",
        action: { label: "Add Questions", href: "/dashboard/questions/import" }
      });
    }

    const lowPerformingClass = (classAnalytics || []).find((cl: ClassLevelAnalytics) => cl.averageScore < 40);
    if (lowPerformingClass) {
      result.push({
        type: "warning",
        title: `Low Performance in ${lowPerformingClass.classLevel}`,
        description: `Average score is ${lowPerformingClass.averageScore}% in ${lowPerformingClass.classLevel}. Consider targeted interventions.`,
        action: { label: "View Class", href: `/dashboard/class-levels/${lowPerformingClass.classLevel}` }
      });
    }

    return result;
  }, [statsData, kpisData, classAnalytics]);

  // Prepare chart data
  const questionsBySubject = useMemo(() =>
    (statsData.questionsBySubject || []).map((q: { subject: string; count: number; color?: string }) => ({
      name: q.subject,
      value: q.count,
      color: q.color,
    })), [statsData.questionsBySubject]
  );

  const questionsByDifficulty = useMemo(() =>
    (statsData.questionsByDifficulty || []).map((d: { difficulty: string; count: number; color?: string }) => ({
      name: d.difficulty,
      value: d.count,
      color: d.color,
    })), [statsData.questionsByDifficulty]
  );

  const questionTypePerformance: Array<{ type: string; total: number; correct: number; accuracy: number }> = [];
  const chapterPerformance: Array<{ chapterName: string; subjectName: string; accuracy: number }> = [];

  if (isLoading) {
    return <PageLoader message="Loading analytics and performance metrics..." />;
  }

  const {
    activeStudents,
    totalExams,
    completedExams,
    averageScore,
    passRate,
    completionRate,
  } = statsData;

  const {
    studentRetentionRate: retentionRate,
    monthlyExamGrowth,
    previousPeriod,
  } = kpisData;

  // Ensure previousPeriod has all fields with defaults
  const safePreviousPeriod = {
    ...(previousPeriod ?? {}),
    totalExams: (previousPeriod as { totalExams?: number })?.totalExams ?? 0,
    completedExams: (previousPeriod as { completedExams?: number })?.completedExams ?? 0,
    averageScore: (previousPeriod as { averageScore?: number })?.averageScore ?? 0,
    newUsers: (previousPeriod as { newUsers?: number })?.newUsers ?? 0,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Re-execute hooks would require refetch logic - for now just simulate
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // In a real app, this would trigger a CSV/PDF export
    alert("Export functionality would generate a report here");
  };

  // Prepare question type stacked bar data
  const questionTypeData = questionTypePerformance.map((qt) => ({
    name: qt.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    correct: qt.correct,
    incorrect: qt.total - qt.correct,
  }));

  // Prepare class comparison data (previous period data not available, showing current only)
  const classComparisonData = (classAnalytics || []).map((c: ClassLevelAnalytics) => ({
    name: c.classLevel,
    current: c.averageScore,
    previous: 0, // Previous period data requires separate API endpoint
  }));

  const activeFiltersCount = [
    filters.classLevelId,
    filters.subjectId,
    filters.difficulty,
    filters.questionType,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Simplified Header with Filters Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="brand" size="sm">{activeFiltersCount}</Badge>
            )}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-blue-600/20 transition-all hover:bg-brand-blue-700 hover:shadow-lg hover:shadow-brand-blue-600/30"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm" dot>
            Live Data
          </Badge>
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <GlassCard className="animate-in fade-in slide-in-from-top-2">
          <SmartFilterBar
            filters={filters}
            onChange={setFilters}
            classLevels={classLevels.map((cl) => ({ value: cl.id, label: cl.name_en }))}
            subjects={subjects.map((s) => ({ value: s.id, label: s.name_en }))}
            showDifficulty
            showQuestionType
            onRefresh={handleRefresh}
            isLoading={isRefreshing}
          />
        </GlassCard>
      )}

      {/* Tab Navigation - Premium Design */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800/50">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "classes", label: "Classes", icon: Layers },
          { id: "subjects", label: "Subjects", icon: BookOpen },
          { id: "questions", label: "Questions", icon: FileQuestion },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === tab.id
              ? "bg-white text-brand-blue-600 shadow-sm dark:bg-neutral-800 dark:text-brand-blue-400"
              : "text-neutral-600 hover:bg-white/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/50 dark:hover:text-white"
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Primary KPIs - 4 Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Pass Rate"
              value={`${passRate}%`}
              subtitle="Students scoring ≥35%"
              icon={Award}
              status={passRate >= 75 ? "success" : passRate >= 50 ? "warning" : "danger"}
              gradient="emerald"
              trend={{
                value: Math.abs(passRate - ((safePreviousPeriod.averageScore) || 0)),
                direction: passRate >= ((safePreviousPeriod.averageScore) || 0) ? "up" : "down",
                label: "vs previous period",
              }}
            />
            <KpiCard
              title="Completion Rate"
              value={`${completionRate}%`}
              subtitle="Exams finished vs started"
              icon={Target}
              status={completionRate >= 80 ? "success" : completionRate >= 60 ? "warning" : "danger"}
              gradient="primary"
            />
            <KpiCard
              title="Student Retention"
              value={`${retentionRate}%`}
              subtitle="Active exam takers"
              icon={Users}
              status={retentionRate >= 70 ? "success" : retentionRate >= 50 ? "warning" : "danger"}
              gradient="purple"
            />
            <KpiCard
              title="Average Score"
              value={`${averageScore}%`}
              subtitle="All completed exams"
              icon={TrendingUp}
              gradient="amber"
              trend={{
                value: monthlyExamGrowth,
                direction: monthlyExamGrowth > 0 ? "up" : monthlyExamGrowth < 0 ? "down" : "neutral",
              }}
            />
          </div>

          {/* Additional Metrics - Compact Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Total Exams</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalExams.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {totalExams >= previousPeriod.totalExams ? "+" : ""}
                    {((totalExams - previousPeriod.totalExams) / (previousPeriod.totalExams || 1) * 100).toFixed(1)}% vs last period
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </GlassCard>

            <GlassCard className="border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{completedExams.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {completedExams >= (safePreviousPeriod.completedExams || 0) ? "+" : ""}
                    {((completedExams - (safePreviousPeriod.completedExams || 0)) / ((safePreviousPeriod.completedExams || 0) || 1) * 100).toFixed(1)}% vs last period
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </GlassCard>

            <GlassCard className="border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Active Students</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{activeStudents.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {activeStudents >= (safePreviousPeriod.newUsers || 0) ? "+" : ""}
                    {((activeStudents - (safePreviousPeriod.newUsers || 0)) / ((safePreviousPeriod.newUsers || 0) || 1) * 100).toFixed(1)}% vs last period
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </GlassCard>

            <GlassCard className="border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Growth Rate</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {monthlyExamGrowth >= 0 ? "+" : ""}{monthlyExamGrowth.toFixed(1)}%
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Monthly exam growth</p>
                </div>
                <TrendingUp className="h-8 w-8 text-brand-blue-500 opacity-50" />
              </div>
            </GlassCard>
          </div>

          {/* Trend Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                  Performance Trends
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Last 6 months overview</p>
              </div>
              <TrendLineChart
                data={(trends || []).map((t: any) => ({ ...t, name: t.month }))}
                lines={[
                  { key: "exams", color: theme.semanticColors.exams, name: "Exams Taken" },
                  { key: "completions", color: theme.semanticColors.completions, name: "Completions" },
                ]}
                height={280}
              />
            </GlassCard>

            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                  Enrollment Growth
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Monthly new users</p>
              </div>
              <TrendLineChart
                data={(trends || []).map((t: any) => ({ ...t, name: t.month }))}
                lines={[{ key: "enrollments", color: theme.colors.insight[500], name: "New Enrollments" }]}
                height={280}
              />
            </GlassCard>
          </div>

          {/* Distribution Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                  Questions by Subject
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Content distribution</p>
              </div>
              <DonutChart
                data={questionsBySubject}
                centerValue={questionsBySubject.reduce((sum: number, q: { value: number }) => sum + q.value, 0)}
                centerLabel="Total"
              />
            </GlassCard>

            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                  Difficulty Distribution
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Question complexity balance</p>
              </div>
              <ScoreBarChart data={questionsByDifficulty} height={250} />
            </GlassCard>
          </div>

          {/* Insights Panel */}
          {insights.length > 0 && (
            <InsightPanel
              title="Insights & Recommendations"
              insights={insights}
            />
          )}
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === "classes" && (
        <div className="space-y-6">
          {/* Class Level Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(classAnalytics || []).map((cls: ClassLevelAnalytics) => (
              <GlassCard key={cls.classLevel} className="group transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">{cls.classLevel}</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {cls.totalStudents} students · {cls.totalExams} exams
                    </p>
                  </div>
                  <ProgressRing
                    value={cls.passRate}
                    size="sm"
                    color={cls.passRate >= 75 ? "emerald" : cls.passRate >= 50 ? "amber" : "purple"}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
                    <p className="text-xl font-bold text-neutral-900 dark:text-white">{cls.averageScore}%</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Avg Score</p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
                    <p className="text-xl font-bold text-neutral-900 dark:text-white">{cls.passRate}%</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Pass Rate</p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
                    <p className="text-xl font-bold text-neutral-900 dark:text-white">{Math.round((cls.totalExams / (cls.totalStudents || 1)) * 100)}%</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Completion</p>
                  </div>
                </div>
                {cls.passRate < 50 && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Needs attention
                  </div>
                )}
              </GlassCard>
            ))}
          </div>

          {/* Class Comparison Chart */}
          <GlassCard>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                Class Performance Comparison
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Current vs previous period</p>
            </div>
            <ComparisonBarChart data={classComparisonData} height={300} />
          </GlassCard>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === "subjects" && (
        <div className="space-y-6">
          {/* Subject Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(subjectAnalytics || []).map((subject: SubjectAnalytics) => (
              <GlassCard key={subject.subject} className="group transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">{subject.subject}</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {subject.totalQuestions} questions · {subject.totalExams} exams
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/30">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-neutral-500 dark:text-neutral-400">Average Score</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{subject.averageScore}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${subject.averageScore}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-neutral-500 dark:text-neutral-400">Average Score</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{subject.averageScore}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className={`h-full transition-all duration-500 ${subject.averageScore >= 75
                          ? "bg-linear-to-r from-emerald-500 to-emerald-600"
                          : subject.averageScore >= 50
                            ? "bg-linear-to-r from-amber-500 to-brand-purple-600"
                            : "bg-linear-to-r from-red-500 to-red-600"
                          }`}
                        style={{ width: `${subject.averageScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Subject Distribution */}
          <GlassCard>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                Question Distribution by Subject
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Content balance analysis</p>
            </div>
            <DonutChart data={questionsBySubject} height={300} />
          </GlassCard>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Question Type Performance */}
          <GlassCard>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                Question Type Performance
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Accuracy rates by question type
              </p>
            </div>
            {questionTypePerformance.length > 0 ? (
              <StackedBarChart
                data={questionTypeData}
                bars={[
                  { key: "correct", color: theme.semanticColors.correct, name: "Correct" },
                  { key: "incorrect", color: theme.semanticColors.incorrect, name: "Incorrect" },
                ]}
                layout="vertical"
                height={300}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-neutral-500 dark:text-neutral-400">
                No question performance data available
              </div>
            )}
          </GlassCard>

          {/* Difficulty Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                  Difficulty Breakdown
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Question pool analysis</p>
              </div>
              <div className="space-y-4">
                {questionsByDifficulty.map((d: { name: string; value: number; color?: string }) => {
                  const total = questionsByDifficulty.reduce((sum: number, q: { value: number }) => sum + q.value, 0);
                  const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;
                  const colors: Record<string, string> = {
                    easy: theme.semanticColors.easy,
                    medium: theme.semanticColors.medium,
                    hard: theme.semanticColors.hard,
                  };
                  return (
                    <div key={d.name}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-neutral-900 dark:text-white capitalize">{d.name}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {d.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: d.color || colors[d.name.toLowerCase()] || theme.colors.primary[500] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="mb-6 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Question Distribution
                </h3>
              </div>
              <div className="space-y-3">
                {questionsByDifficulty.length > 0 ? (
                  questionsByDifficulty.map((item: { name: string; value: number }) => {
                    const total = questionsByDifficulty.reduce((sum: number, q: { value: number }) => sum + q.value, 0);
                    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50"
                      >
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white capitalize">{item.name} Questions</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.value} questions</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-neutral-900 dark:text-white">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                    No question data available
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
