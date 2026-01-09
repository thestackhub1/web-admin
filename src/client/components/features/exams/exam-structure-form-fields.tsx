// Client-side only — no server secrets or database access here

"use client";

import { BookOpen, ScrollText, Target } from "lucide-react";
import { Select } from '@/client/components/ui/select';
import { TextInput } from '@/client/components/ui/input';
import { GlassCard } from '@/client/components/ui/premium';

interface Subject {
    id: string;
    name_en: string;
    slug: string;
}

interface ExamStructureFormFieldsProps {
    nameEn: string;
    nameMr: string;
    subjectId: string;
    classLevel: string;
    classLevelId: string;
    isTemplate: boolean;
    duration: number;
    passingPercentage: number;
    isActive: boolean;
    subjects: Subject[];
    classLevelOptions: Array<{ value: string; label: string }>;
    staticClassLevels: Array<{ value: string; label: string }>;
    hasClassLevelsList: boolean;
    onNameEnChange: (value: string) => void;
    onNameMrChange: (value: string) => void;
    onSubjectIdChange: (value: string) => void;
    onClassLevelChange: (value: string) => void;
    onClassLevelIdChange: (value: string) => void;
    onIsTemplateChange: (checked: boolean) => void;
    onDurationChange: (value: number) => void;
    onPassingPercentageChange: (value: number) => void;
    onIsActiveChange: (checked: boolean) => void;
}

export function ExamStructureFormFields({
    nameEn,
    nameMr,
    subjectId,
    classLevel,
    classLevelId,
    isTemplate,
    duration,
    passingPercentage,
    isActive,
    subjects,
    classLevelOptions,
    staticClassLevels,
    hasClassLevelsList,
    onNameEnChange,
    onNameMrChange,
    onSubjectIdChange,
    onClassLevelChange,
    onClassLevelIdChange,
    onIsTemplateChange,
    onDurationChange,
    onPassingPercentageChange,
    onIsActiveChange,
}: ExamStructureFormFieldsProps) {
    return (
        <GlassCard>
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <BookOpen className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                        Blueprint Identity & Config
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure exam structure details</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Names Row */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <TextInput
                        label="Blueprint Name (English)"
                        value={nameEn}
                        onChange={(e) => onNameEnChange(e.target.value)}
                        placeholder="e.g. Class 10 IT Final Exam"
                    />
                    <TextInput
                        label="ब्लूप्रिंटचे नाव (Marathi)"
                        value={nameMr}
                        onChange={(e) => onNameMrChange(e.target.value)}
                        placeholder="उदा. दहावी IT अंतिम परीक्षा"
                    />
                </div>

                {/* Settings Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Subject</label>
                        <Select
                            value={subjectId}
                            onChange={onSubjectIdChange}
                            placeholder="Select subject..."
                            options={subjects.map((s) => ({
                                value: s.id,
                                label: s.name_en,
                            }))}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Class Level</label>
                        <Select
                            value={classLevelId || classLevel}
                            onChange={(val: string) => {
                                if (hasClassLevelsList) onClassLevelIdChange(val);
                                else onClassLevelChange(val);
                            }}
                            placeholder="Select class level..."
                            options={hasClassLevelsList ? [
                                { value: "", label: "None (Global)" },
                                ...classLevelOptions,
                            ] : staticClassLevels}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Duration (Min)</label>
                        <TextInput
                            type="number"
                            value={duration}
                            onChange={(e) => onDurationChange(Number(e.target.value))}
                            min={10}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Passing %</label>
                        <TextInput
                            type="number"
                            value={passingPercentage}
                            onChange={(e) => onPassingPercentageChange(Number(e.target.value))}
                            min={0}
                            max={100}
                        />
                    </div>
                </div>

                {/* Toggle Flags */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                        type="button"
                        onClick={() => onIsTemplateChange(!isTemplate)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all ${isTemplate
                            ? "border-primary-200 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400"
                            : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400"}`}
                    >
                        <div className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${isTemplate ? "bg-primary-500 text-white" : "bg-neutral-200 dark:bg-neutral-700"}`}>
                            <ScrollText className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium">Template</span>
                        {isTemplate && (
                            <svg className="h-4 w-4 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => onIsActiveChange(!isActive)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all ${isActive
                            ? "border-success-200 bg-success-50 text-success-700 dark:bg-success-900/20 dark:border-success-800 dark:text-success-400"
                            : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400"}`}
                    >
                        <div className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${isActive ? "bg-success-500 text-white" : "bg-neutral-200 dark:bg-neutral-700"}`}>
                            <Target className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium">Active</span>
                        {isActive && (
                            <svg className="h-4 w-4 text-success-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}


