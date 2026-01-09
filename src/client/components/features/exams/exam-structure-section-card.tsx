// Client-side only — no server secrets or database access here

"use client";

import { ArrowUp, ArrowDown, Trash2, BookOpen, Pencil } from "lucide-react";
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
        <div className="group relative flex items-center gap-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800">
            {/* Index Badge */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 text-xs font-bold dark:bg-primary-900/30 dark:text-primary-400">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* Move Buttons */}
            <div className="flex flex-col gap-0.5 shrink-0">
                <button
                    onClick={() => onMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded text-neutral-400 hover:bg-white hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all dark:hover:bg-neutral-700"
                >
                    <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => onMove(index, "down")}
                    disabled={index === totalSections - 1}
                    className="p-1 rounded text-neutral-400 hover:bg-white hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all dark:hover:bg-neutral-700"
                >
                    <ArrowDown className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Section Info */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {section.name_en}
                    </h4>
                    <Badge variant="info" size="sm">
                        {questionTypeLabels[section.question_type]}
                    </Badge>
                    {section.chapter_configs && section.chapter_configs.length > 0 ? (
                        <Badge variant="success" size="sm">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {section.chapter_configs.length} Chapters
                        </Badge>
                    ) : (
                        <Badge variant="default" size="sm">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Global Scope
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Yield: <span className="font-medium text-neutral-700 dark:text-neutral-300">{section.total_marks} Marks</span></span>
                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                    <span>Questions: <span className="font-medium text-neutral-700 dark:text-neutral-300">{section.question_count} × {section.marks_per_question}</span></span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onEdit(section)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-white hover:text-primary-600 transition-all dark:hover:bg-neutral-700 dark:hover:text-primary-400"
                    title="Edit Section"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(section.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-500 transition-all dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                    title="Delete Section"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

