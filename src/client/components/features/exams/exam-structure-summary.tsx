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
        <div className="grid gap-6 sm:grid-cols-3">
            <GlassCard className="relative overflow-hidden group border-none shadow-lg transition-all hover:shadow-xl hover:-translate-y-1" gradient="blue">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText className="h-12 w-12" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100/50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-neutral-900 dark:text-white">
                            {sectionsCount}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Total Sections</p>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="relative overflow-hidden group border-none shadow-lg transition-all hover:shadow-xl hover:-translate-y-1" gradient="purple">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HelpCircle className="h-12 w-12" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-insight-100/50 text-insight-600 dark:bg-insight-900/40 dark:text-insight-400">
                        <HelpCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-neutral-900 dark:text-white">
                            {totalQuestions}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Questions</p>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="relative overflow-hidden group border-none shadow-lg transition-all hover:shadow-xl hover:-translate-y-1" gradient="green">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Award className="h-12 w-12" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-100/50 text-success-600 dark:bg-success-900/40 dark:text-success-400">
                        <Award className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-neutral-900 dark:text-white">
                            {totalMarks}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Max Score</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}


