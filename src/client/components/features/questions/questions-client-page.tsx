/**
 * Questions Client Page - Premium SaaS Design
 * 
 * Comprehensive question management with bulk actions, filtering, and export.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import {
  Plus,
  Square,
  CheckSquare,
  FileQuestion,
  Save,
  X,
  Layers,
  BookOpen,
  ArrowLeft,
  BarChart3,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard, PageHeader, Badge, EmptyState, SectionHeader } from '@/client/components/ui/premium';
import { ExportDropdown, SmartFilterChips, QuestionTypeBadge, DifficultyBadge, QuestionStats } from '@/client/components/ui/question-components';
import { BulkActionBar } from '@/client/components/ui/bulk-action-bar';
import { Button } from '@/client/components/ui/button';
import { TextInput } from '@/client/components/ui/input';
import { useUpdateQuestion, useBulkUpdateQuestionStatus, useBulkDeleteQuestions } from "@/client/hooks";
import { questionTypeLabels, subjectDisplayMap, type QuestionType, type Difficulty } from "@/client/types/questions";
import { jsonToString, stringToJson, jsonToPlainText, plainTextToJson } from '@/client/utils/editor-utils';
import { convertToCSV, getMcqOptions } from './question-utils';
import { QuestionSearchBar } from './question-search-bar';
import { ViewModeToggle } from './view-mode-toggle';
import { QuestionFilters } from './question-filters';
import { QuestionListView } from './question-list-view';
import { QuestionTableView } from './question-table-view';
import { QuestionPagination } from './question-pagination';

// Stats Dialog Component - Premium Design consistent with SchoolSearchModal
interface StatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    byType: Record<string, number>;
    byDifficulty: Record<string, number>;
    byChapter: Record<string, number>;
  };
}

function StatsDialog({ isOpen, onClose, stats }: StatsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const difficultyConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    easy: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-700 dark:text-success-400', dot: 'bg-success-500', label: 'Easy' },
    medium: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-700 dark:text-warning-400', dot: 'bg-warning-500', label: 'Medium' },
    hard: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Hard' },
  };

  const typeColors = [
    { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-700 dark:text-primary-400', dot: 'bg-primary-500' },
    { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
    { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-400', dot: 'bg-pink-500' },
    { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
    { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
    { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-400', dot: 'bg-teal-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      {/* Dialog */}
      <div
        ref={dialogRef}
        className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Gradient Header */}
        <div className="relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-warning-500 via-warning-600 to-orange-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative px-6 pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Question Statistics</h2>
                  <p className="text-sm text-white/70 mt-0.5">Detailed breakdown of your questions</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Total Questions Hero */}
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <FileQuestion className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-4xl font-bold text-white">{stats.total}</div>
                <p className="text-sm text-white/70">Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* By Difficulty */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">By Difficulty</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['easy', 'medium', 'hard'].map((difficulty) => {
                const count = stats.byDifficulty[difficulty] || 0;
                const config = difficultyConfig[difficulty];
                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                return (
                  <div 
                    key={difficulty} 
                    className={clsx('flex items-center gap-2 px-3 py-2 rounded-xl', config.bg)}
                  >
                    <div className={clsx('h-2 w-2 rounded-full', config.dot)} />
                    <span className={clsx('text-sm font-medium', config.text)}>{config.label}</span>
                    <span className={clsx('text-sm font-bold', config.text)}>{count}</span>
                    <span className={clsx('text-xs opacity-70', config.text)}>({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">By Question Type</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(stats.byType).map(([type, count], index) => {
                const colors = typeColors[index % typeColors.length];
                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                return (
                  <div 
                    key={type} 
                    className={clsx('flex items-center justify-between px-3 py-2.5 rounded-xl', colors.bg)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={clsx('h-2 w-2 rounded-full shrink-0', colors.dot)} />
                      <span className={clsx('text-sm font-medium truncate', colors.text)}>
                        {questionTypeLabels[type as QuestionType] || type}
                      </span>
                    </div>
                    <div className={clsx('flex items-center gap-1 shrink-0 ml-2', colors.text)}>
                      <span className="text-sm font-bold">{count}</span>
                      <span className="text-xs opacity-70">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(stats.byType).length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4 col-span-2">No questions yet</p>
              )}
            </div>
          </div>

          {/* By Chapter */}
          {Object.keys(stats.byChapter).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-neutral-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">By Chapter</h3>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(stats.byChapter)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([chapter, count]) => (
                    <div 
                      key={chapter} 
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
                    >
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate flex-1">{chapter}</span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white ml-2">{count}</span>
                    </div>
                  ))}
                {Object.keys(stats.byChapter).length > 6 && (
                  <p className="text-xs text-neutral-500 text-center pt-2">
                    +{Object.keys(stats.byChapter).length - 6} more chapters
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface Question {
  id: string;
  question_text: string;
  question_language: "en" | "mr";
  question_text_secondary?: string | null;
  secondary_language?: "en" | "mr" | null;
  question_type: QuestionType;
  difficulty: Difficulty;
  chapter_id: string | null;
  tags: string[];
  is_active: boolean;
  chapters?: { name_en: string } | null;
  answer_data?: any;
  explanation_en?: string | null;
  explanation_mr?: string | null;
}

interface QuestionsClientPageProps {
  subject: string;
  initialQuestions: Question[];
  chapters: { id: string; name_en: string }[];
  currentChapter?: { id: string; name_en: string; name_mr?: string };
  showAllQuestions?: boolean;
}

type ViewMode = "list" | "table";

export function QuestionsClientPage({ subject, initialQuestions, chapters, currentChapter, showAllQuestions }: QuestionsClientPageProps) {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState(initialQuestions);
  const [filteredQuestions, setFilteredQuestions] = useState(initialQuestions);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ questionId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  // Use hooks for mutations
  const updateMutation = useUpdateQuestion(subject);
  const bulkActivateMutation = useBulkUpdateQuestionStatus(subject);
  const bulkDeactivateMutation = useBulkUpdateQuestionStatus(subject);
  const bulkDeleteMutation = useBulkDeleteQuestions(subject);
  
  const isSaving = updateMutation.isLoading;

  // Filter state - initialize from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filterChapter, setFilterChapter] = useState(searchParams.get("chapter") || "");
  const [filterDifficulty, setFilterDifficulty] = useState(searchParams.get("difficulty") || "");
  const [filterType, setFilterType] = useState(searchParams.get("type") || "");
  const [filterActive, setFilterActive] = useState(searchParams.get("status") || "");

  // Stats
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    const byChapter: Record<string, number> = {};

    questions.forEach((q) => {
      byType[q.question_type] = (byType[q.question_type] || 0) + 1;
      byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
      const chapterName = q.chapters?.name_en || "Uncategorized";
      byChapter[chapterName] = (byChapter[chapterName] || 0) + 1;
    });

    return { total: questions.length, byType, byDifficulty, byChapter };
  }, [questions]);

  const activeFiltersCount = [filterChapter, filterDifficulty, filterType, filterActive].filter(Boolean).length;

  // Apply filters
  useEffect(() => {
    let result = [...questions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.question_text.toLowerCase().includes(query) ||
          (q.question_text_secondary && q.question_text_secondary.toLowerCase().includes(query))
      );
    }

    if (filterChapter) {
      if (filterChapter === "uncategorized") {
        result = result.filter((q) => !q.chapter_id);
      } else {
        result = result.filter((q) => q.chapter_id === filterChapter);
      }
    }

    if (filterDifficulty) {
      result = result.filter((q) => q.difficulty === filterDifficulty);
    }

    if (filterType) {
      result = result.filter((q) => q.question_type === filterType);
    }

    if (filterActive !== "") {
      result = result.filter((q) => q.is_active === (filterActive === "true"));
    }

    setFilteredQuestions(result);
  }, [questions, searchQuery, filterChapter, filterDifficulty, filterType, filterActive]);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterChapter, filterDifficulty, filterType, filterActive]);


  const clearFilters = () => {
    setFilterChapter("");
    setFilterDifficulty("");
    setFilterType("");
    setFilterActive("");
    setSearchQuery("");
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredQuestions.map((q) => q.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Inline editing handlers
  const startEditing = (questionId: string, field: string, currentValue: string) => {
    setEditingCell({ questionId, field });
    // For question_text, extract plain text from JSON if needed
    if (field === "question_text") {
      try {
        const parsed = JSON.parse(currentValue);
        setEditValue(jsonToPlainText(parsed));
      } catch {
        setEditValue(currentValue);
      }
    } else {
      setEditValue(currentValue);
    }
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const question = questions.find((q) => q.id === editingCell.questionId);
    if (!question) return;

    try {
      // Prepare update data based on field
      let updateData: any = {};

      if (editingCell.field === "question_text") {
        // Convert plain text back to TipTap JSON format
        const jsonContent = plainTextToJson(editValue);
        updateData.questionText = jsonToString(jsonContent);
        updateData.questionLanguage = question.question_language;
        updateData.questionTextSecondary = question.question_text_secondary;
        updateData.secondaryLanguage = question.secondary_language;
        updateData.questionType = question.question_type;
        updateData.difficulty = question.difficulty;
        updateData.chapterId = question.chapter_id;
        updateData.answerData = question.answer_data || {};
        updateData.explanationEn = question.explanation_en || "";
        updateData.explanationMr = question.explanation_mr || "";
        updateData.tags = question.tags || [];
        updateData.isActive = question.is_active;
      } else if (editingCell.field === "difficulty") {
        updateData.questionText = jsonToString(stringToJson(question.question_text));
        updateData.questionLanguage = question.question_language;
        updateData.questionTextSecondary = question.question_text_secondary;
        updateData.secondaryLanguage = question.secondary_language;
        updateData.questionType = question.question_type;
        updateData.difficulty = editValue as Difficulty;
        updateData.chapterId = question.chapter_id;
        updateData.answerData = question.answer_data || {};
        updateData.explanationEn = question.explanation_en || "";
        updateData.explanationMr = question.explanation_mr || "";
        updateData.tags = question.tags || [];
        updateData.isActive = question.is_active;
      }

      // Use the update mutation hook
      const mutationData = {
        subject,
        id: editingCell.questionId,
        ...updateData,
      };
      
      const result = await updateMutation.mutateAsync(mutationData);
      
      if (result) {
        // Update local state
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id === editingCell.questionId) {
              if (editingCell.field === "question_text") {
                // Update with JSON string format
                return { ...q, question_text: jsonToString(plainTextToJson(editValue)) };
              } else if (editingCell.field === "difficulty") {
                return { ...q, difficulty: editValue as Difficulty };
              }
            }
            return q;
          })
        );
        cancelEditing();
      }
    } catch {
      toast.error("Failed to update question");
    }
  };

  // Bulk actions
  const handleBulkActivate = async () => {
    const ids = Array.from(selectedIds);
    const result = await bulkActivateMutation.mutate({ ids, is_active: true });
    if (result) {
      setQuestions((prev) => prev.map((q) => (selectedIds.has(q.id) ? { ...q, is_active: true } : q)));
      clearSelection();
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = Array.from(selectedIds);
    const result = await bulkDeactivateMutation.mutate({ ids, is_active: false });
    if (result) {
      setQuestions((prev) => prev.map((q) => (selectedIds.has(q.id) ? { ...q, is_active: false } : q)));
      clearSelection();
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} questions? This cannot be undone.`)) return;

    const ids = Array.from(selectedIds);
    const result = await bulkDeleteMutation.mutate({ ids });
    if (result) {
      setQuestions((prev) => prev.filter((q) => !selectedIds.has(q.id)));
      clearSelection();
    }
  };

  const handleBulkExport = async () => {
    setIsExporting(true);
    // Export only selected
    const selectedQuestions = questions.filter((q) => selectedIds.has(q.id));
    const json = JSON.stringify(
      selectedQuestions.map((q) => ({
        question_text: q.question_text,
        question_language: q.question_language,
        question_text_secondary: q.question_text_secondary,
        secondary_language: q.secondary_language,
        question_type: q.question_type,
        difficulty: q.difficulty,
        chapter: q.chapters?.name_en,
      })),
      null,
      2
    );

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject}-questions-${selectedIds.size}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedIds.size} questions`);
    setIsExporting(false);
  };

  const handleExport = async (format: "json" | "csv" | "pdf") => {
    setIsExporting(true);
    try {
      // Build query params for export
      const params = new URLSearchParams();
      if (filterChapter) params.append('chapter_id', filterChapter);
      if (filterDifficulty) params.append('difficulty', filterDifficulty);
      if (filterType) params.append('type', filterType);
      if (filterActive) params.append('is_active', filterActive);

      // For now, export locally from current questions data
      // In future, we can create an export API endpoint
      const filteredQuestions = questions.filter(q => {
        if (filterChapter && q.chapter_id !== filterChapter) return false;
        if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
        if (filterType && q.question_type !== filterType) return false;
        if (filterActive && String(q.is_active) !== filterActive) return false;
        return true;
      });

      const exportData = format === "json" 
        ? JSON.stringify(filteredQuestions, null, 2)
        : convertToCSV(filteredQuestions);

      const blob = new Blob(
        [exportData],
        { type: format === "json" ? "application/json" : "text/csv" }
      );
      
      const filename = format === "json"
        ? `${subject}-questions-${filteredQuestions.length}.json`
        : `${subject}-questions-${filteredQuestions.length}.csv`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filteredQuestions.length} questions`);
    } finally {
      setIsExporting(false);
    }
  };

  const displayName = subjectDisplayMap[subject] || subject;

  // Chapter filter chips - include uncategorized option
  const uncategorizedCount = questions.filter(q => !q.chapter_id).length;
  const chapterChips = [
    { id: "", label: "All", isActive: filterChapter === "", count: questions.length },
    ...chapters.map((ch) => ({
      id: ch.id,
      label: ch.name_en,
      isActive: filterChapter === ch.id,
      count: questions.filter((q) => q.chapter_id === ch.id).length,
    })),
    ...(uncategorizedCount > 0 ? [{
      id: "uncategorized",
      label: "Uncategorized",
      isActive: filterChapter === "uncategorized",
      count: uncategorizedCount,
    }] : []),
  ];

  const title = currentChapter
    ? `${currentChapter.name_en} Questions`
    : showAllQuestions
      ? `All ${displayName} Questions`
      : `${displayName} Questions`;

  const description = currentChapter
    ? `${questions.length} questions in ${currentChapter.name_en}`
    : `${questions.length} questions`;

  const breadcrumbs = currentChapter
    ? [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Questions", href: "/dashboard/questions" },
      { label: displayName, href: `/dashboard/questions/${subject}` },
      { label: currentChapter.name_en },
    ]
    : showAllQuestions
      ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Questions", href: "/dashboard/questions" },
        { label: displayName, href: `/dashboard/questions/${subject}` },
        { label: "All Questions" },
      ]
      : [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Questions", href: "/dashboard/questions" },
        { label: displayName },
      ];

  // Render editable cell
  const renderEditableCell = (question: Question, field: string, value: string, displayValue?: string) => {
    const isEditing = editingCell?.questionId === question.id && editingCell?.field === field;

    if (isEditing) {
      if (field === "difficulty") {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveEdit();
              } else if (e.key === "Escape") {
                cancelEditing();
              }
            }}
            autoFocus
            className="w-full rounded-lg border border-primary-500 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-neutral-800"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        );
      }

      // Use textarea for question text, input for other fields
      const isQuestionText = field === "question_text";

      return (
        <div className="flex items-start gap-1">
          {isQuestionText ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  cancelEditing();
                }
                // Ctrl/Cmd + Enter to save
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  saveEdit();
                }
              }}
              autoFocus
              rows={3}
              className="flex-1 rounded-lg border border-primary-500 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-neutral-800 dark:text-white resize-y"
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveEdit();
                } else if (e.key === "Escape") {
                  cancelEditing();
                }
              }}
              autoFocus
              className="flex-1 rounded-lg border border-primary-500 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-neutral-800 dark:text-white"
            />
          )}
          <div className="flex flex-col gap-1">
            <button
              onClick={saveEdit}
              disabled={isSaving}
              className="rounded p-1 text-primary-600 hover:bg-primary-50 dark:text-primary-400"
              title="Save (Ctrl+Enter)"
            >
              <Save className="h-3 w-3" />
            </button>
            <button
              onClick={cancelEditing}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              title="Cancel (Esc)"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => startEditing(question.id, field, value)}
        className="cursor-pointer rounded px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        title="Click to edit"
      >
        {displayValue || value || "-"}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Stats Dialog */}
      <StatsDialog 
        isOpen={showStatsDialog} 
        onClose={() => setShowStatsDialog(false)} 
        stats={stats} 
      />

      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        icon={currentChapter ? Layers : FileQuestion}
        iconColor={currentChapter ? "success" : "warning"}
      />

      {/* Unified Toolbar - Single Row (Consistent with Class Levels) */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
        {/* Search Input */}
        <div className="relative w-64">
          <QuestionSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

        {/* Stats Pills - Clickable to open dialog */}
        <button
          onClick={() => setShowStatsDialog(true)}
          className="hidden sm:flex items-center gap-2 group"
          title="Click to view detailed statistics"
        >
          {/* Total Questions */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50 hover:border-warning-300 dark:hover:border-warning-600 transition-colors">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-warning-500 text-white">
              <FileQuestion className="h-2.5 w-2.5" />
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-neutral-500">Questions</span>
            <BarChart3 className="h-3 w-3 text-neutral-400 group-hover:text-warning-500 transition-colors ml-0.5" />
          </div>
        </button>

        {/* Mobile: Compact stats button */}
        <button
          onClick={() => setShowStatsDialog(true)}
          className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-warning-500 text-white">
            <FileQuestion className="h-2.5 w-2.5" />
          </div>
          <span className="text-sm font-bold text-neutral-900 dark:text-white">{stats.total}</span>
          <BarChart3 className="h-3 w-3 text-neutral-400" />
        </button>

        {/* Actions Group */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Back to Subject - only for chapter view */}
          {currentChapter && (
            <Link
              href={`/dashboard/questions/${subject}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">All Chapters</span>
            </Link>
          )}

          {/* View Mode Toggle */}
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />

          {/* Filters */}
          <QuestionFilters
            showFilters={showFilters}
            activeFiltersCount={activeFiltersCount}
            filterType={filterType}
            filterDifficulty={filterDifficulty}
            filterActive={filterActive}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onClearFilters={clearFilters}
            onFilterTypeChange={setFilterType}
            onFilterDifficultyChange={setFilterDifficulty}
            onFilterActiveChange={setFilterActive}
          />

          {/* Export */}
          <ExportDropdown 
            onExport={handleExport} 
            isLoading={isExporting} 
            disabled={filteredQuestions.length === 0} 
          />

          {/* Add Question */}
          <Link href={`/dashboard/questions/${subject}/new${currentChapter ? `?chapter=${currentChapter.id}` : ''}`}>
            <Button variant="primary" size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Question</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Chapter Chips - Only show when not in chapter detail view */}
      {chapters.length > 0 && !currentChapter && (
        <SmartFilterChips label="Filter by Chapter" chips={chapterChips} onSelect={(id) => setFilterChapter(id)} />
      )}

      {/* Questions List/Table */}
      <GlassCard bento padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              Showing {paginatedQuestions.length} of {filteredQuestions.length}
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-xs text-neutral-500">
                ({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active)
              </span>
            )}
          </div>
          {filteredQuestions.length > 0 && (
            <button
              onClick={selectedIds.size === filteredQuestions.length ? clearSelection : selectAll}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
            >
              {selectedIds.size === filteredQuestions.length ? (
                <>
                  <CheckSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Deselect all</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  <span className="hidden sm:inline">Select all</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="p-5">
        {filteredQuestions.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="No questions found"
            description={questions.length === 0 ? "Add your first question" : "Adjust your filters"}
            action={
              questions.length === 0 ? (
                <Link href={`/dashboard/questions/${subject}/new`}>
                  <Button variant="primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : viewMode === "list" ? (
          <QuestionListView
            questions={paginatedQuestions}
            selectedIds={selectedIds}
            subject={subject}
            onToggleSelect={toggleSelect}
          />
        ) : (
          <QuestionTableView
            questions={paginatedQuestions}
            selectedIds={selectedIds}
            subject={subject}
            editingCell={editingCell}
            editValue={editValue}
            isSaving={isSaving}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onStartEditing={startEditing}
            onSaveEdit={saveEdit}
            onCancelEditing={cancelEditing}
            onEditValueChange={setEditValue}
            getMcqOptions={getMcqOptions}
            allSelected={selectedIds.size === filteredQuestions.length}
          />
        )}
        </div>

        {/* Pagination */}
        {filteredQuestions.length > itemsPerPage && (
          <div className="border-t border-neutral-200/60 dark:border-neutral-800/60">
            <QuestionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredQuestions.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </GlassCard>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={filteredQuestions.length}
        onSelectAll={selectAll}
        onClear={clearSelection}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
      />
    </div>
  );
}
