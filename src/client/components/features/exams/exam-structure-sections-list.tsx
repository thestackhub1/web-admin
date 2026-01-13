// Client-side only — no server secrets or database access here

"use client";

import { Plus, ClipboardList } from "lucide-react";
import { Button } from '@/client/components/ui/button';
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
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-sm">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Exam Sections
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {sections.length === 0 ? 'No sections yet' : `${sections.length} section${sections.length > 1 ? 's' : ''} defined`}
                        </p>
                    </div>
                </div>
                <Button onClick={onAddSection} size="sm" className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    Add Section
                </Button>
            </div>

            {sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900/50 dark:to-neutral-900">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 shadow-inner">
                        <ClipboardList className="h-8 w-8 text-neutral-300" />
                    </div>
                    <h4 className="text-base font-semibold text-neutral-600 dark:text-neutral-400 mb-1">No Sections Yet</h4>
                    <p className="max-w-[280px] text-sm text-neutral-400 mb-5">Add sections to define question types, marks, and rules for this blueprint.</p>
                    <Button onClick={onAddSection} size="sm" className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Add First Section
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
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


