// Client-side only — no server secrets or database access here

"use client";

import { FileText, HelpCircle, Award } from "lucide-react";
import { GlassCard } from '@/client/components/ui/premium';

interface ExamStructureSummaryProps {
    sectionsCount: number;
    totalQuestions: number;
    totalMarks: number;
}

export function ExamStructureSummary({
    sectionsCount,
    totalQuestions,
    totalMarks,
}: ExamStructureSummaryProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard className="flex items-center gap-4" gradient="blue">
                <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {sectionsCount}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Sections</p>
                </div>
            </GlassCard>
            <GlassCard className="flex items-center gap-4" gradient="purple">
                <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                    <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {totalQuestions}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Questions</p>
                </div>
            </GlassCard>
            <GlassCard className="flex items-center gap-4" gradient="green">
                <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                    <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {totalMarks}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Marks</p>
                </div>
            </GlassCard>
        </div>
    );
}


