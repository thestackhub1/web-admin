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
        <GlassCard>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Sections
                </h3>
                <Button onClick={onAddSection} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Section
                </Button>
            </div>

            {sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="mb-4 h-12 w-12 text-neutral-400" />
                    <p className="text-neutral-500 dark:text-neutral-400">No sections yet</p>
                    <p className="text-sm text-neutral-400">Add sections to define exam structure</p>
                </div>
            ) : (
                <div className="space-y-3">
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


