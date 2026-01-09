// Client-side only — no server secrets or database access here

"use client";

import { Plus, ClipboardList } from "lucide-react";
import { GlassCard } from '@/client/components/ui/premium';
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
}

interface ExamStructureSectionsListProps {
    sections: Section[];
    onAddSection: () => void;
    onEditSection: (section: Section) => void;
    onDeleteSection: (id: string) => void;
    onMoveSection: (index: number, direction: "up" | "down") => void;
}

export function ExamStructureSectionsList({
    sections,
    onAddSection,
    onEditSection,
    onDeleteSection,
    onMoveSection,
}: ExamStructureSectionsListProps) {
    return (
        <GlassCard className="overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                            Exam Sections
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{sections.length} components defined</p>
                    </div>
                </div>
                <Button onClick={onAddSection} size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add New Section
                </Button>
            </div>

            {sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/20">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700">
                        <ClipboardList className="h-6 w-6 text-neutral-300" />
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-500 mb-1">No Sections Yet</h4>
                    <p className="max-w-[280px] text-xs text-neutral-400">Add sections to define question types, marks, and rules for this blueprint.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {sections.map((section, index) => (
                        <ExamStructureSectionCard
                            key={section.id}
                            section={section}
                            index={index}
                            totalSections={sections.length}
                            onEdit={onEditSection}
                            onDelete={onDeleteSection}
                            onMove={onMoveSection}
                        />
                    ))}
                </div>
            )}
        </GlassCard>
    );
}


