// Client-side only — no server secrets or database access here

"use client";

import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, BookOpen, ExternalLink } from "lucide-react";
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
    selected_question_ids?: string[];
}

interface ExamStructureSectionCardProps {
    section: Section;
    index: number;
    totalSections: number;
    examStructureId?: string; // If provided, enables navigation to dedicated edit page
    onEdit: (section: Section) => void;
    onDelete: (id: string) => void;
    onMove: (index: number, direction: "up" | "down") => void;
}

export function ExamStructureSectionCard({
    section,
    index,
    totalSections,
    examStructureId,
    onEdit,
    onDelete,
    onMove,
}: ExamStructureSectionCardProps) {
    const router = useRouter();

    const handleEditClick = () => {
        if (examStructureId) {
            // Navigate to dedicated section edit page
            router.push(`/dashboard/exam-structures/${examStructureId}/sections/${index}`);
        } else {
            // Fall back to modal edit (for unsaved structures)
            onEdit(section);
        }
    };

    return (
        <div className="group flex items-center gap-2 rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-100 dark:border-neutral-700/50 px-3 py-2.5 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm transition-all">
            {/* Compact Index */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-500 text-white text-xs font-bold">
                {index + 1}
            </div>

            {/* Inline Move Buttons */}
            <div className="flex shrink-0 gap-0.5">
                <button
                    onClick={() => onMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded text-neutral-300 hover:text-primary-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowUp className="h-3 w-3" />
                </button>
                <button
                    onClick={() => onMove(index, "down")}
                    disabled={index === totalSections - 1}
                    className="p-1 rounded text-neutral-300 hover:text-primary-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowDown className="h-3 w-3" />
                </button>
            </div>

            {/* Section Info - Single Line */}
            <div className="min-w-0 flex-1 flex items-center gap-2 overflow-hidden">
                <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {section.name_en}
                </span>
                <Badge variant="info" size="sm" className="shrink-0">
                    {questionTypeLabels[section.question_type]}
                </Badge>
                {section.chapter_configs && section.chapter_configs.length > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-success-600 dark:text-success-400">
                        <BookOpen className="h-3 w-3" />
                        {section.chapter_configs.length}
                    </span>
                )}
            </div>

            {/* Stats - Compact */}
            <div className="hidden md:flex items-center gap-3 text-xs text-neutral-500 shrink-0">
                <span><strong className="text-neutral-700 dark:text-neutral-300">{section.total_marks}</strong> pts</span>
                <span className="text-neutral-300">·</span>
                <span><strong className="text-neutral-700 dark:text-neutral-300">{section.question_count}</strong> Q</span>
            </div>

            {/* Actions - Minimal */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleEditClick}
                    className="p-1.5 rounded-md text-neutral-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 transition-colors"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => onDelete(section.id)}
                    className="p-1.5 rounded-md text-neutral-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

