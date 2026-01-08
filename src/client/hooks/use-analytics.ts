// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';

export interface DashboardStats {
  totalUsers: number;
  activeStudents: number;
  totalAdmins: number;
  totalTeachers: number;
  totalExams: number;
  completedExams: number;
  averageScore: number;
  passRate: number;
  completionRate: number;
  activeScheduledExams: number;
  totalQuestions: number;
  questionsBySubject: Array<{ subject: string; count: number; color: string }>;
  questionsByDifficulty: Array<{ difficulty: string; count: number; color: string }>;
  questionsByType: Array<{ type: string; count: number }>;
  usersByRole: Array<{ role: string; count: number }>;
  classLevelStats: Array<{ classLevel: string; count: number }>;
}

export interface KpiMetrics {
  studentRetentionRate: number;
  avgExamsPerStudent: number;
  monthlyEnrollmentGrowth: number;
  monthlyExamGrowth: number;
  previousPeriod: {
    totalUsers: number;
    totalExams: number;
  };
  questionTypeBreakdown?: Array<{ type: string; total: number; correct: number; accuracy: number }>;
}

export interface ClassLevelAnalytics {
  classLevel: string;
  totalStudents: number;
  totalExams: number;
  averageScore: number;
  passRate: number;
}

export interface SubjectAnalytics {
  subject: string;
  totalQuestions: number;
  totalExams: number;
  averageScore: number;
  chapterPerformance?: Array<{ chapterName: string; accuracy: number }>;
}

export interface MonthlyTrend {
  month: string;
  enrollments: number;
  exams: number;
  completions: number;
}

export interface FilterOptions {
  classLevels: Array<{ id: string; name_en: string }>;
  subjects: Array<{ id: string; name_en: string }>;
}

export interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  action?: string;
}

export function useDashboardStats(filters?: {
  classLevelId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useApi<DashboardStats>(async () => {
    const params = new URLSearchParams();
    if (filters?.classLevelId) params.append('class_level_id', filters.classLevelId);
    if (filters?.subjectId) params.append('subject_id', filters.subjectId);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const url = params.toString()
      ? `/api/v1/analytics/dashboard-stats?${params.toString()}`
      : '/api/v1/analytics/dashboard-stats';
    return api.get<DashboardStats>(url);
  }, true);
}

export function useKpiMetrics(filters?: {
  classLevelId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useApi<KpiMetrics>(async () => {
    const params = new URLSearchParams();
    if (filters?.classLevelId) params.append('class_level_id', filters.classLevelId);
    if (filters?.subjectId) params.append('subject_id', filters.subjectId);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const url = params.toString()
      ? `/api/v1/analytics/kpi-metrics?${params.toString()}`
      : '/api/v1/analytics/kpi-metrics';
    return api.get<KpiMetrics>(url);
  }, true);
}

export function useClassLevelAnalytics(filters?: {
  classLevelId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useApi<ClassLevelAnalytics[]>(async () => {
    const params = new URLSearchParams();
    if (filters?.classLevelId) params.append('class_level_id', filters.classLevelId);
    if (filters?.subjectId) params.append('subject_id', filters.subjectId);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const url = params.toString()
      ? `/api/v1/analytics/class-level-analytics?${params.toString()}`
      : '/api/v1/analytics/class-level-analytics';
    return api.get<ClassLevelAnalytics[]>(url);
  }, true);
}

export function useSubjectAnalytics(filters?: {
  classLevelId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useApi<SubjectAnalytics[]>(async () => {
    const params = new URLSearchParams();
    if (filters?.classLevelId) params.append('class_level_id', filters.classLevelId);
    if (filters?.subjectId) params.append('subject_id', filters.subjectId);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const url = params.toString()
      ? `/api/v1/analytics/subject-analytics?${params.toString()}`
      : '/api/v1/analytics/subject-analytics';
    return api.get<SubjectAnalytics[]>(url);
  }, true);
}

export function useMonthlyTrends(filters?: {
  classLevelId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useApi<MonthlyTrend[]>(async () => {
    const params = new URLSearchParams();
    if (filters?.classLevelId) params.append('class_level_id', filters.classLevelId);
    if (filters?.subjectId) params.append('subject_id', filters.subjectId);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const url = params.toString()
      ? `/api/v1/analytics/monthly-trends?${params.toString()}`
      : '/api/v1/analytics/monthly-trends';
    return api.get<MonthlyTrend[]>(url);
  }, true);
}

export function useFilterOptions() {
  return useApi<FilterOptions>(async () => {
    return api.get<FilterOptions>('/api/v1/analytics/filter-options');
  }, true);
}

