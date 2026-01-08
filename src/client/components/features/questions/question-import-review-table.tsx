// Client-side only — no server secrets or database access here

"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { Check, X, Trash2, AlertCircle, Edit2 } from "lucide-react";
import { GlassCard, Badge } from '@/client/components/ui/premium';
import { Button } from '@/client/components/ui/button';
import { Select, type SelectOption } from '@/client/components/ui/select';
import { TextInput } from '@/client/components/ui/input';
import type { ParsedQuestion } from "@/client/types/questions";
import { questionTypeLabels } from "@/client/types/questions";

interface QuestionImportReviewTableProps {
  questions: ParsedQuestion[];
  chapters: Array<{ id: string; name_en: string; name_mr: string }>;
  onQuestionsChange: (questions: ParsedQuestion[]) => void;
  defaultChapterId?: string;
  defaultDifficulty?: string;
  defaultMarks?: number;
}

export function QuestionImportReviewTable({
  questions,
  chapters,
  onQuestionsChange,
  defaultChapterId,
  defaultDifficulty = "medium",
  defaultMarks: _defaultMarks = 1,
}: QuestionImportReviewTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<ParsedQuestion | null>(null);

  const chapterOptions: SelectOption[] = [
    { value: "", label: "Select chapter..." },
    ...chapters.map((ch) => ({
      value: ch.id,
      label: `${ch.name_en} (${ch.name_mr})`,
    })),
  ];

  const difficultyOptions: SelectOption[] = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const questionTypeOptions: SelectOption[] = [
    { value: "mcq_single", label: "MCQ (1 Correct)" },
    { value: "mcq_two", label: "MCQ (2 Correct)" },
    { value: "mcq_three", label: "MCQ (3 Correct)" },
    { value: "true_false", label: "True/False" },
    { value: "fill_blank", label: "Fill in the Blank" },
    { value: "short_answer", label: "Short Answer" },
  ];

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((_, i) => i)));
    }
  };

  const deleteSelected = () => {
    const newQuestions = questions.filter((_, i) => !selectedIds.has(i));
    onQuestionsChange(newQuestions);
    setSelectedIds(new Set());
  };

  const bulkUpdateChapter = (chapterId: string) => {
    const newQuestions = questions.map((q, i) =>
      selectedIds.has(i) ? { ...q, chapterId: chapterId || undefined } : q
    );
    onQuestionsChange(newQuestions);
  };

  const bulkUpdateDifficulty = (difficulty: string) => {
    const newQuestions = questions.map((q, i) =>
      selectedIds.has(i) ? { ...q, difficulty } : q
    );
    onQuestionsChange(newQuestions);
  };

  const startEdit = (index: number) => {
    setEditingId(index);
    setEditedQuestion({ ...questions[index] });
  };

  const saveEdit = () => {
    if (editingId === null || !editedQuestion) return;
    const newQuestions = [...questions];
    newQuestions[editingId] = editedQuestion;
    onQuestionsChange(newQuestions);
    setEditingId(null);
    setEditedQuestion(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedQuestion(null);
  };

  const updateQuestion = (index: number, updates: Partial<ParsedQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    onQuestionsChange(newQuestions);
  };

  const hasErrors = (q: ParsedQuestion) => {
    return (
      !q.questionTextMr ||
      !q.options ||
      q.options.length !== 4 ||
      q.options.some((opt) => !opt || opt.trim() === "") ||
      (q.parsingErrors && q.parsingErrors.length > 0)
    );
  };

  const errorCount = useMemo(() => questions.filter(hasErrors).length, [questions]);

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <GlassCard className="bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {selectedIds.size} question{selectedIds.size !== 1 ? "s" : ""} selected
              </span>
              <Select
                value=""
                onChange={(value) => bulkUpdateChapter(value)}
                options={chapterOptions}
                placeholder="Change chapter..."
                className="w-64"
              />
              <Select
                value=""
                onChange={(value) => bulkUpdateDifficulty(value)}
                options={difficultyOptions}
                placeholder="Change difficulty..."
                className="w-48"
              />
            </div>
            <Button variant="danger" size="sm" onClick={deleteSelected}>
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <Badge variant="info">{questions.length} Total</Badge>
        {errorCount > 0 && (
          <Badge variant="error">
            <AlertCircle className="h-3 w-3" />
            {errorCount} with errors
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center"
                >
                  <Check
                    className={clsx(
                      "h-4 w-4",
                      selectedIds.size === questions.length && questions.length > 0
                        ? "text-blue-600"
                        : "text-neutral-400"
                    )}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                Question (Marathi)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                Options (A, B, C, D)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                Chapter
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {questions.map((question, index) => {
              const isSelected = selectedIds.has(index);
              const isEditing = editingId === index;
              const hasError = hasErrors(question);
              const q = isEditing && editedQuestion ? editedQuestion : question;

              return (
                <tr
                  key={index}
                  className={clsx(
                    "transition-colors",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20",
                    hasError && "bg-red-50 dark:bg-red-900/10",
                    isEditing && "bg-yellow-50 dark:bg-yellow-900/10"
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelect(index)}
                      className="flex items-center justify-center"
                    >
                      <Check
                        className={clsx(
                          "h-4 w-4",
                          isSelected ? "text-blue-600" : "text-neutral-400"
                        )}
                      />
                    </button>
                  </td>

                  {/* Question Number */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {question.questionNumber || index + 1}
                    </span>
                  </td>

                  {/* Question Text */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={q.questionTextMr || ""}
                        onChange={(e) =>
                          setEditedQuestion({
                            ...q,
                            questionTextMr: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                      />
                    ) : (
                      <div className="max-w-md">
                        <p className="text-sm text-neutral-900 dark:text-white">
                          {q.questionTextMr || (
                            <span className="text-red-500 italic">Missing question text</span>
                          )}
                        </p>
                        {q.parsingErrors && q.parsingErrors.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {q.parsingErrors.map((err, i) => (
                              <Badge key={i} variant="error" size="sm">
                                {err}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Options */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        {["A", "B", "C", "D"].map((letter, optIdx) => (
                          <TextInput
                            key={letter}
                            value={q.options?.[optIdx] || ""}
                            onChange={(e) => {
                              const newOptions = [...(q.options || [])];
                              newOptions[optIdx] = e.target.value;
                              setEditedQuestion({ ...q, options: newOptions });
                            }}
                            placeholder={`Option ${letter}`}
                            className="text-sm"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1 text-xs">
                        {q.options?.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={clsx(
                              !opt || opt.trim() === ""
                                ? "text-red-500 italic"
                                : "text-neutral-700 dark:text-neutral-300"
                            )}
                          >
                            <strong>{String.fromCharCode(65 + optIdx)}.</strong>{" "}
                            {opt || "Missing"}
                          </div>
                        )) || (
                            <span className="text-red-500 italic">No options</span>
                          )}
                      </div>
                    )}
                  </td>

                  {/* Chapter */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Select
                        value={q.chapterId || defaultChapterId || ""}
                        onChange={(value) =>
                          setEditedQuestion({ ...q, chapterId: value || undefined })
                        }
                        options={chapterOptions}
                        className="w-48"
                      />
                    ) : (
                      <Select
                        value={q.chapterId || defaultChapterId || ""}
                        onChange={(value) =>
                          updateQuestion(index, { chapterId: value || undefined })
                        }
                        options={chapterOptions}
                        className="w-48"
                      />
                    )}
                  </td>

                  {/* Type & Difficulty */}
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      {isEditing ? (
                        <>
                          <Select
                            value={q.questionType || "mcq_single"}
                            onChange={(value) =>
                              setEditedQuestion({ ...q, questionType: value })
                            }
                            options={questionTypeOptions}
                            className="w-40"
                          />
                          <Select
                            value={q.difficulty || defaultDifficulty}
                            onChange={(value) =>
                              setEditedQuestion({ ...q, difficulty: value })
                            }
                            options={difficultyOptions}
                            className="w-40"
                          />
                        </>
                      ) : (
                        <>
                          <Badge variant="info" size="sm">
                            {questionTypeLabels[q.questionType as keyof typeof questionTypeLabels] ||
                              q.questionType}
                          </Badge>
                          <Badge variant="default" size="sm">
                            {q.difficulty || defaultDifficulty}
                          </Badge>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={cancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => startEdit(index)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {questions.length === 0 && (
        <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
          No questions to review
        </div>
      )}
    </div>
  );
}




