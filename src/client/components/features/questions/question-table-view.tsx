// Client-side only — no server secrets or database access here

"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Check, CheckSquare, Square, Pencil } from "lucide-react";
import { Badge } from '@/client/components/ui/premium';
import { QuestionTypeBadge } from '@/client/components/ui/question-components';
import type { QuestionType, Difficulty } from "@/client/types/questions";
import { jsonToPlainText } from '@/client/utils/editor-utils';

interface Question {
  id: string;
  question_text: string;
  question_language: "en" | "mr";
  question_type: QuestionType;
  difficulty: Difficulty;
  chapter_id: string | null;
  is_active: boolean;
  chapters?: { name_en: string } | null;
  answer_data?: any;
}

interface QuestionTableViewProps {
  questions: Question[];
  selectedIds: Set<string>;
  subject: string;
  editingCell: { questionId: string; field: string } | null;
  editValue: string;
  isSaving: boolean;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onStartEditing: (questionId: string, field: string, currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEditing: () => void;
  onEditValueChange: (value: string) => void;
  getMcqOptions: (question: Question) => { text: string; isCorrect: boolean }[];
  allSelected: boolean;
}

export function QuestionTableView({
  questions,
  selectedIds,
  subject,
  editingCell,
  editValue,
  isSaving: _isSaving,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  onEditValueChange,
  getMcqOptions,
  allSelected,
}: QuestionTableViewProps) {
  const renderEditableCell = (question: Question, field: string, value: string, displayValue?: string) => {
    const isEditing = editingCell?.questionId === question.id && editingCell?.field === field;

    if (isEditing) {
      if (field === "difficulty") {
        return (
          <select
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSaveEdit();
              } else if (e.key === "Escape") {
                onCancelEditing();
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

      const isQuestionText = field === "question_text";

      return (
        <div className="flex items-start gap-1">
          {isQuestionText ? (
            <textarea
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              onBlur={onSaveEdit}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  onCancelEditing();
                }
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  onSaveEdit();
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
              onChange={(e) => onEditValueChange(e.target.value)}
              onBlur={onSaveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSaveEdit();
                } else if (e.key === "Escape") {
                  onCancelEditing();
                }
              }}
              autoFocus
              className="flex-1 rounded-lg border border-primary-500 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-neutral-800 dark:text-white"
            />
          )}
        </div>
      );
    }

    return (
      <div
        onClick={() => onStartEditing(question.id, field, value)}
        className="cursor-pointer rounded px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        title="Click to edit"
      >
        {displayValue || value || "-"}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            <th className="px-4 py-3 text-left">
              <button
                onClick={allSelected ? onClearSelection : onSelectAll}
                className="flex items-center"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 text-neutral-400" />
                )}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Question
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Difficulty
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Options
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Chapter
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {questions.map((question) => {
            const isSelected = selectedIds.has(question.id);

            return (
              <tr
                key={question.id}
                className={clsx(
                  "transition-colors",
                  isSelected && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggleSelect(question.id)}
                    className={clsx(
                      "flex h-5 w-5 items-center justify-center rounded transition-colors",
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-neutral-200 text-transparent hover:bg-neutral-300 dark:bg-neutral-700"
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <QuestionTypeBadge type={question.question_type} />
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-md">
                    {renderEditableCell(
                      question,
                      "question_text",
                      question.question_text,
                      (() => {
                        try {
                          const parsed = JSON.parse(question.question_text);
                          const text = jsonToPlainText(parsed);
                          return text.length > 100 ? text.substring(0, 100) + "..." : text;
                        } catch {
                          return question.question_text.length > 100
                            ? question.question_text.substring(0, 100) + "..."
                            : question.question_text;
                        }
                      })()
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {renderEditableCell(
                    question,
                    "difficulty",
                    question.difficulty,
                    question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    {(() => {
                      const options = getMcqOptions(question);
                      if (options.length === 0) {
                        return <span className="text-sm text-neutral-400">—</span>;
                      }
                      return (
                        <div className="space-y-1">
                          {options.slice(0, 3).map((opt, idx) => (
                            <div
                              key={idx}
                              className={clsx(
                                "flex items-center gap-1.5 truncate text-xs",
                                opt.isCorrect
                                  ? "text-green-700 dark:text-green-400"
                                  : "text-neutral-600 dark:text-neutral-400"
                              )}
                              title={opt.text}
                            >
                              {opt.isCorrect && (
                                <Check className="h-3 w-3 shrink-0 text-green-600" />
                              )}
                              <span className="font-medium text-neutral-500">
                                {String.fromCharCode(65 + idx)}:
                              </span>{" "}
                              <span className={opt.isCorrect ? "font-medium" : ""}>
                                {opt.text.length > 35 ? opt.text.substring(0, 35) + "..." : opt.text}
                              </span>
                            </div>
                          ))}
                          {options.length > 3 && (
                            <div className="text-xs text-neutral-400">
                              +{options.length - 3} more
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {question.chapters?.name_en || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={question.is_active ? "success" : "default"} dot size="sm">
                    {question.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/questions/${subject}/${question.id}`}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


