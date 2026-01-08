// Client-side only — no server secrets or database access here

"use client";

import { ArrowUp, ArrowDown, Trash2, BookOpen } from "lucide-react";
import { Badge } from '@/client/components/ui/premium';
import { questionTypeLabels } from "@/client/types/questions";
import type { QuestionType } from "@/client/types/questions";
import type { ChapterQuestionConfig } from '@/client/components/features/subjects/chapter-selector';

interface Section {
    id: string;
    code: string;
    name_en: string;
    name_mr: string;
    question_type: QuestionType;
    question_count: number;
    marks_per_question: number;
    total_marks: number;
    instructions_en: string;
    instructions_mr: string;
    order_index: number;
    chapter_configs?: ChapterQuestionConfig[];
}

interface ExamStructureSectionCardProps {
    section: Section;
    index: number;
    totalSections: number;
    onEdit: (section: Section) => void;
    onDelete: (id: string) => void;
    onMove: (index: number, direction: "up" | "down") => void;
}

export function ExamStructureSectionCard({
    section,
    index,
    totalSections,
    onEdit,
    onDelete,
    onMove,
}: ExamStructureSectionCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            {/* Drag Handle */}
            <div className="flex flex-col gap-1">
                <button
                    onClick={() => onMove(index, "up")}
                    disabled={index === 0}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30 dark:hover:bg-neutral-700"
                >
                    <ArrowUp className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onMove(index, "down")}
                    disabled={index === totalSections - 1}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30 dark:hover:bg-neutral-700"
                >
                    <ArrowDown className="h-4 w-4" />
                </button>
            </div>

            {/* Section Info */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        Q{section.order_index}
                    </span>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {section.name_en}
                    </h4>
                    <Badge variant="purple" size="sm">
                        {questionTypeLabels[section.question_type]}
                    </Badge>
                    {/* Chapter config badge */}
                    {section.chapter_configs && section.chapter_configs.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <BookOpen className="h-3 w-3" />
                            {section.chapter_configs.length} chapter{section.chapter_configs.length > 1 ? "s" : ""} • {section.chapter_configs.reduce((sum, c) => sum + c.question_count, 0)} Q
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400">
                            <BookOpen className="h-3 w-3" />
                            All chapters
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {section.question_count} × {section.marks_per_question} marks = {section.total_marks} marks
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(section)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(section.id)}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}


