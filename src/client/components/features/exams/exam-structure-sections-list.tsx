// Client-side only — no server secrets or database access here

"use client";

import { Plus, ClipboardList } from "lucide-react";
import { ExamStructureSectionCard } from './exam-structure-section-card';
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

interface ExamStructureSectionsListProps {
    sections: Section[];
    examStructureId?: string; // If provided, enables navigation to dedicated edit page
    onAddSection: () => void;
    onEditSection: (section: Section) => void;
    onDeleteSection: (id: string) => void;
    onMoveSection: (index: number, direction: "up" | "down") => void;
}

export function ExamStructureSectionsList({
    sections,
    examStructureId,
    onAddSection,
    onEditSection,
    onDeleteSection,
    onMoveSection,
}: ExamStructureSectionsListProps) {
    return (
        <div>
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
                        <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                            Sections
                            <span className="ml-2 text-xs font-normal text-neutral-400">
                                {sections.length === 0 ? 'Empty' : `${sections.length}`}
                            </span>
                        </h3>
                    </div>
                </div>
                <button
                    onClick={onAddSection}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Add</span>
                </button>
            </div>

            {sections.length === 0 ? (
                <div 
                    onClick={onAddSection}
                    className="flex items-center justify-center gap-3 py-8 px-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 dark:hover:border-primary-700 transition-all group"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                        <Plus className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">Add your first section</p>
                        <p className="text-xs text-neutral-400">Define question types, marks & rules</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {sections.map((section, index) => (
                        <ExamStructureSectionCard
                            key={section.id}
                            section={section}
                            index={index}
                            totalSections={sections.length}
                            examStructureId={examStructureId}
                            onEdit={onEditSection}
                            onDelete={onDeleteSection}
                            onMove={onMoveSection}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


