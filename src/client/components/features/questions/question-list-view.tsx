// Client-side only — no server secrets or database access here

"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Pencil, Check, Square, BookOpen } from "lucide-react";
import { Badge } from '@/client/components/ui/premium';
import { QuestionTypeBadge, DifficultyBadge } from '@/client/components/ui/question-components';
import type { QuestionType, Difficulty } from "@/client/types/questions";

interface Question {
  id: string;
  question_text: string;
  question_language: "en" | "mr";
  question_text_secondary?: string | null;
  question_type: QuestionType;
  difficulty: Difficulty;
  chapter_id: string | null;
  is_active: boolean;
  chapters?: { name_en: string } | null;
}

interface QuestionListViewProps {
  questions: Question[];
  selectedIds: Set<string>;
  subject: string;
  onToggleSelect: (id: string) => void;
}

export function QuestionListView({ questions, selectedIds, subject, onToggleSelect }: QuestionListViewProps) {
  return (
    <div className="space-y-3">
      {questions.map((question) => {
        const isSelected = selectedIds.has(question.id);

        return (
          <div
            key={question.id}
            className={clsx(
              "group flex items-start gap-4 rounded-xl p-4 transition-all",
              isSelected
                ? "bg-primary-50 ring-2 ring-primary-500 dark:bg-primary-900/20"
                : "bg-neutral-50/50 hover:bg-neutral-100/50 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50"
            )}
          >
            {/* Checkbox */}
            <button
              onClick={() => onToggleSelect(question.id)}
              className={clsx(
                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
                isSelected
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-200 text-transparent hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              )}
            >
              <Check className="h-3 w-3" />
            </button>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <QuestionTypeBadge type={question.question_type} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-900 dark:text-white">{question.question_text}</p>
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                      {question.question_language.toUpperCase()}
                    </span>
                  </div>
                  {question.question_text_secondary && (
                    <p className="mt-1 text-sm text-neutral-500">{question.question_text_secondary}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={question.difficulty} />
                {question.chapters?.name_en && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                    <BookOpen className="h-3 w-3" />
                    {question.chapters.name_en}
                  </span>
                )}
                <Badge variant={question.is_active ? "success" : "default"} dot size="sm">
                  {question.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Link
                href={`/dashboard/questions/${subject}/${question.id}`}
                className="rounded-lg p-2 text-neutral-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}


