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
        <GlassCard className="overflow-hidden border-none shadow-xl p-0!">
            <div className="flex items-center justify-between px-8 py-6 bg-linear-to-b from-neutral-50/50 to-transparent dark:from-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                            Exam Sections
                        </h3>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{sections.length} Components defined</p>
                    </div>
                </div>
                <button
                    onClick={onAddSection}
                    className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-primary-600 to-insight-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:from-primary-700 hover:to-insight-700 hover:shadow-xl active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Add New Section
                </button>
            </div>

            <div className="p-8">
                {sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700">
                            <ClipboardList className="h-10 w-10 text-neutral-300" />
                        </div>
                        <h4 className="text-xl font-black text-neutral-400 uppercase tracking-tighter mb-2">Structure Empty</h4>
                        <p className="max-w-[280px] text-sm font-bold text-neutral-400">Add sections to define question types, marks, and section logic for this blueprint.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
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
            </div>
        </GlassCard>
    );
}


