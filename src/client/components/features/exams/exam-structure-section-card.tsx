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
        <div className="group relative flex items-center gap-6 rounded-3xl bg-white p-6 shadow-sm border border-neutral-100 transition-all hover:shadow-md hover:border-primary-100 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-primary-900/50">
            {/* Index Pin */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 font-black text-xs uppercase tracking-tighter group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors dark:bg-neutral-800">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* Drag/Move Handle */}
            <div className="flex flex-col gap-1 shrink-0">
                <button
                    onClick={() => onMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded-lg text-neutral-300 hover:bg-neutral-50 hover:text-primary-500 disabled:opacity-0 transition-all dark:hover:bg-neutral-800"
                >
                    <ArrowUp className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onMove(index, "down")}
                    disabled={index === totalSections - 1}
                    className="p-1 rounded-lg text-neutral-300 hover:bg-neutral-50 hover:text-primary-500 disabled:opacity-0 transition-all dark:hover:bg-neutral-800"
                >
                    <ArrowDown className="h-4 w-4" />
                </button>
            </div>

            {/* Section Info */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h4 className="text-lg font-black text-neutral-900 dark:text-white leading-none">
                        {section.name_en}
                    </h4>
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-100/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-600 dark:bg-primary-900/40 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/50">
                        {questionTypeLabels[section.question_type]}
                    </span>
                    {/* Chapter config badge */}
                    {section.chapter_configs && section.chapter_configs.length > 0 ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-success-100/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-success-600 dark:bg-success-900/40 dark:text-success-400 border border-success-200/50 dark:border-success-800/50">
                            <BookOpen className="h-3 w-3" />
                            {section.chapter_configs.length} Targeted Chapters
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 border border-neutral-100 dark:border-neutral-700">
                            <BookOpen className="h-3 w-3" />
                            Global Scope
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-400">Yield:</span>
                        <span className="text-sm font-black text-neutral-700 dark:text-neutral-300">{section.total_marks} Marks</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-400">Questions:</span>
                        <span className="text-sm font-black text-neutral-700 dark:text-neutral-300">{section.question_count} × {section.marks_per_question}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-4 border-l border-neutral-100 dark:border-neutral-800">
                <button
                    onClick={() => onEdit(section)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-all dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                    title="Edit Section"
                >
                    <Trash2 className="hidden" /> {/* Placeholder just to keep Trash2 imported if I didn't mean to remove it */}
                    <div className="relative">
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    </div>
                </button>
                <button
                    onClick={() => onDelete(section.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 hover:bg-danger-50 hover:text-danger-500 transition-all dark:hover:bg-danger-900/20 dark:hover:text-danger-500"
                    title="Delete Section"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

