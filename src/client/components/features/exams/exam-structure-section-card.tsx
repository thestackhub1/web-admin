// Client-side only — no server secrets or database access here

"use client";

import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, BookOpen, Pencil, ExternalLink, CheckSquare } from "lucide-react";
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
        <div className="group relative flex items-center gap-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-4 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
            {/* Index Badge with gradient */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white text-sm font-bold shadow-sm">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* Move Buttons - Vertical pill */}
            <div className="flex flex-col shrink-0 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-0.5">
                <button
                    onClick={() => onMove(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-md text-neutral-400 hover:bg-white hover:text-primary-600 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none transition-all dark:hover:bg-neutral-700"
                    title="Move up"
                >
                    <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => onMove(index, "down")}
                    disabled={index === totalSections - 1}
                    className="p-1.5 rounded-md text-neutral-400 hover:bg-white hover:text-primary-600 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none transition-all dark:hover:bg-neutral-700"
                    title="Move down"
                >
                    <ArrowDown className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Section Info */}
            <div className="min-w-0 flex-1 pl-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
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
                    {section.selected_question_ids && section.selected_question_ids.length > 0 && (
                        <Badge variant="warning" size="sm">
                            <CheckSquare className="h-3 w-3 mr-1" />
                            {section.selected_question_ids.length} Picked
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="text-neutral-400">Yield:</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{section.total_marks} Marks</span>
                    </div>
                    <div className="h-3 w-px bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex items-center gap-1.5">
                        <span className="text-neutral-400">Questions:</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{section.question_count} × {section.marks_per_question}</span>
                    </div>
                </div>
            </div>

            {/* Actions - Always visible with better styling */}
            <div className="flex items-center gap-1 pl-2 border-l border-neutral-100 dark:border-neutral-700">
                <button
                    onClick={handleEditClick}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-all dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                    title={examStructureId ? "Edit Section" : "Edit Section"}
                >
                    <ExternalLink className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(section.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-500 transition-all dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                    title="Delete Section"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

