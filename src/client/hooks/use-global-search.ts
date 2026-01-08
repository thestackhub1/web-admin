// Client-side only — no server secrets or database access here

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/client/api";
import { debounce } from "@/client/utils";

export interface SearchResult {
  id: string;
  type: "user" | "subject" | "question" | "exam";
  title: string;
  subtitle?: string;
  icon?: string;
  href: string;
}

interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
}

interface UserResult {
  id: string;
  name?: string | null;
  email: string;
  role: string;
}

interface SubjectResult {
  id: string;
  name_en: string;
  slug: string;
  is_category: boolean;
}

interface QuestionResult {
  id: string;
  question_text: string;
  question_type: string;
  subject_slug?: string;
  subject_name?: string;
}

interface ExamResult {
  id: string;
  name: string;
  subject_id: string;
  subjects?: { name_en: string } | null;
}

/**
 * Global search hook that searches across users, subjects, questions, and exams
 * Following Single Responsibility Principle - only handles search logic
 */
export function useGlobalSearch(query: string) {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
  });

  const searchAll = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setState({ results: [], isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Search all resources in parallel
      const [usersRes, subjectsRes, questionsRes, examsRes] = await Promise.allSettled([
        api.get<{ items: UserResult[] }>(`/api/v1/users?search=${encodeURIComponent(searchQuery)}&pageSize=5`),
        api.get<SubjectResult[]>(`/api/v1/subjects?search=${encodeURIComponent(searchQuery)}`),
        api.get<QuestionResult[]>(`/api/v1/questions/search?q=${encodeURIComponent(searchQuery)}&limit=5`),
        api.get<ExamResult[]>(`/api/v1/scheduled-exams?search=${encodeURIComponent(searchQuery)}&pageSize=5`),
      ]);

      const results: SearchResult[] = [];

      // Process users
      if (usersRes.status === "fulfilled" && usersRes.value?.data?.items) {
        usersRes.value.data.items.forEach((user) => {
          results.push({
            id: user.id,
            type: "user",
            title: user.name || user.email,
            subtitle: user.role,
            href: `/dashboard/users/${user.id}`,
          });
        });
      }

      // Process subjects
      if (subjectsRes.status === "fulfilled" && Array.isArray(subjectsRes.value?.data)) {
        subjectsRes.value.data.slice(0, 5).forEach((subject) => {
          results.push({
            id: subject.id,
            type: "subject",
            title: subject.name_en,
            subtitle: subject.is_category ? "Category" : "Subject",
            href: `/dashboard/subjects/${subject.id}`,
          });
        });
      }

      // Process questions
      if (questionsRes.status === "fulfilled" && Array.isArray(questionsRes.value?.data)) {
        questionsRes.value.data.forEach((question) => {
          const subjectSlug = question.subject_slug || "unknown";
          results.push({
            id: question.id,
            type: "question",
            title: question.question_text.slice(0, 100) + (question.question_text.length > 100 ? "..." : ""),
            subtitle: question.question_type,
            href: `/dashboard/questions/${subjectSlug}?question=${question.id}`,
          });
        });
      }

      // Process exams
      if (examsRes.status === "fulfilled" && Array.isArray(examsRes.value?.data)) {
        examsRes.value.data.forEach((exam) => {
          results.push({
            id: exam.id,
            type: "exam",
            title: exam.name,
            subtitle: exam.subjects?.name_en || "Scheduled Exam",
            href: `/dashboard/scheduled-exams/${exam.id}`,
          });
        });
      }

      setState({ results, isLoading: false, error: null });
    } catch (err) {
      setState({
        results: [],
        isLoading: false,
        error: err instanceof Error ? err.message : "Search failed",
      });
    }
  }, []);

  // Debounced search to avoid too many API calls
  const debouncedSearch = useMemo(
    () => debounce(searchAll, 300),
    [searchAll]
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      // Cleanup debounce on unmount
    };
  }, [query, debouncedSearch]);

  return state;
}

/**
 * Quick navigation items for command palette
 * Static list of commonly used navigation routes
 */
export const quickNavItems: SearchResult[] = [
  { id: "nav-dashboard", type: "subject", title: "Dashboard", subtitle: "Overview", href: "/dashboard" },
  { id: "nav-users", type: "user", title: "Users", subtitle: "Manage users", href: "/dashboard/users" },
  { id: "nav-subjects", type: "subject", title: "Subjects", subtitle: "Manage curriculum", href: "/dashboard/subjects" },
  { id: "nav-questions", type: "question", title: "Questions", subtitle: "Question bank", href: "/dashboard/questions" },
  { id: "nav-exams", type: "exam", title: "Scheduled Exams", subtitle: "Exam schedules", href: "/dashboard/scheduled-exams" },
  { id: "nav-analytics", type: "subject", title: "Analytics", subtitle: "View analytics", href: "/dashboard/analytics" },
  { id: "nav-settings", type: "subject", title: "Settings", subtitle: "Account settings", href: "/dashboard/settings" },
];
