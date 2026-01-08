/**
 * Analytics Types
 *
 * Types for dashboard analytics, KPIs, and reporting.
 */

/**
 * Dashboard overview statistics
 */
export interface DashboardStats {
    totalUsers: number;
    activeStudents: number;
    totalAdmins: number;
    totalTeachers: number;
    totalSchools: number;
    totalSubjects: number;
    totalQuestions: number;
    totalExams: number;
    completedExams: number;
    averageScore: number;
    passRate: number;
    totalScheduledExams: number;
    publishedScheduledExams: number;
    activeScheduledExams: number;
    totalClassLevels: number;
    classLevelStats: ClassLevelStat[];
}

/**
 * Class level statistics
 */
export interface ClassLevelStat {
    name: string;
    studentCount: number;
    examCount: number;
}

/**
 * Key Performance Indicators
 */
export interface KpiMetrics {
    studentRetentionRate: number;
    avgExamsPerStudent: number;
    avgQuestionsAttempted: number;
    overallPassRate: number;
    averageCompletionRate: number;
    averageScorePercentage: number;
    monthlyEnrollmentGrowth: number;
    monthlyExamGrowth: number;
    previousPeriod: PreviousPeriodMetrics;
}

/**
 * Previous period metrics for comparison
 */
export interface PreviousPeriodMetrics {
    totalExams: number;
    completedExams: number;
    averageScore: number;
    newUsers: number;
}

/**
 * Analytics for a specific class level
 */
export interface ClassLevelAnalytics {
    id: string;
    name: string;
    studentCount: number;
    examCount: number;
    completedExams: number;
    averageScore: number;
    passRate: number;
    completionRate: number;
}

/**
 * Analytics for a specific subject
 */
export interface SubjectAnalytics {
    id: string;
    name: string;
    questionCount: number;
    examCount: number;
    averageScore: number;
    passRate: number;
    questionTypeBreakdown?: QuestionTypeBreakdown[];
}

/**
 * Question type breakdown
 */
export interface QuestionTypeBreakdown {
    type: string;
    count: number;
    accuracy: number;
}

/**
 * Insight notification types
 */
export type InsightType = "success" | "warning" | "danger" | "info";

/**
 * Analytics insight/recommendation
 */
export interface InsightData {
    type: InsightType;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

/**
 * Monthly trend data point
 */
export interface TrendData {
    name: string;
    exams: number;
    enrollments: number;
    avgScore: number;
}

/**
 * Chart data point (generic)
 */
export interface ChartDataPoint {
    name: string;
    value: number;
    [key: string]: string | number;
}

/**
 * Filter options for analytics
 */
export interface AnalyticsFilters {
    classLevelId?: string;
    subjectId?: string;
    dateRange?: {
        start: string;
        end: string;
    };
}

/**
 * Recent activity item
 */
export interface ActivityItem {
    id: string;
    type: "exam_completed" | "user_registered" | "question_added" | "exam_scheduled";
    description: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}
