/**
 * Questions Client Page - Premium SaaS Design
 * 
 * Comprehensive question management with bulk actions, filtering, and export.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import {
  Plus,
  Pencil,
  Square,
  CheckSquare,
  FileQuestion,
  Pin,
  Save,
  X,
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
  explanation?: string | null; // Keep for compatibility if needed
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
        updateData.questionType = question.question_type;
        updateData.difficulty = question.difficulty;
        updateData.chapterId = question.chapter_id;
        updateData.answerData = question.answer_data || {};
        updateData.explanation = question.explanation || "";
        updateData.tags = question.tags || [];
        updateData.isActive = question.is_active;
      } else if (editingCell.field === "difficulty") {
        updateData.questionText = jsonToString(stringToJson(question.question_text));
        updateData.questionLanguage = question.question_language;
        updateData.questionType = question.question_type;
        updateData.difficulty = editValue as Difficulty;
        updateData.chapterId = question.chapter_id;
        updateData.answerData = question.answer_data || {};
        updateData.explanation = question.explanation || "";
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
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        icon={FileQuestion}
        iconColor="warning"
        action={
          <div className="flex items-center gap-3">
            <ExportDropdown onExport={handleExport} isLoading={isExporting} disabled={filteredQuestions.length === 0} />
            <Link href={`/dashboard/questions/${subject}/new`}>
              <Button variant="primary" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      {questions.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <GlassCard className="flex items-center gap-3 p-3">
            <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
              <FileQuestion className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3 p-3">
            <div className="rounded-lg bg-success-50 p-2 dark:bg-success-900/20">
              <CheckSquare className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{questions.filter(q => q.is_active).length}</p>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Active</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3 p-3">
            <div className="rounded-lg bg-primary-50 p-2 dark:bg-primary-900/20">
              <Square className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{questions.filter(q => q.question_type.startsWith('mcq')).length}</p>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">MCQ</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3 p-3">
            <div className="rounded-lg bg-warning-50 p-2 dark:bg-warning-900/20">
              <Pencil className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{questions.filter(q => ['short_answer', 'long_answer'].includes(q.question_type)).length}</p>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Descriptive</p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Chapter Chips */}
      {chapters.length > 0 && (
        <SmartFilterChips label="Filter by Chapter" chips={chapterChips} onSelect={(id) => setFilterChapter(id)} />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QuestionSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="flex items-center gap-2">
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
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
          </div>
        </div>
      </div>

      {/* Questions List/Table */}
      <GlassCard bento padding="none" className="overflow-hidden">
        <div className="p-5 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Questions</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{filteredQuestions.length} questions</p>
          </div>
          {filteredQuestions.length > 0 && (
            <button
              onClick={selectedIds.size === filteredQuestions.length ? clearSelection : selectAll}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
            >
              {selectedIds.size === filteredQuestions.length ? (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Deselect all
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  Select all
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
