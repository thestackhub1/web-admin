// Client-side only — no server secrets or database access here

"use client";

import { clsx } from "clsx";
import { 
    BookOpen, 
    ScrollText, 
    Target, 
    Clock, 
    Award, 
    GraduationCap,
    Layers,
    HelpCircle,
} from "lucide-react";
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
    // Stats for display
    totalMarks?: number;
    totalQuestions?: number;
    sectionsCount?: number;
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
    totalMarks = 0,
    totalQuestions = 0,
    sectionsCount = 0,
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
        <div className="space-y-5">
            {/* Blueprint Name Card */}
            <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        <BookOpen className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Blueprint Name
                    </h3>
                </div>
                <div className="space-y-3">
                    <TextInput
                        label="English"
                        value={nameEn}
                        onChange={(e) => onNameEnChange(e.target.value)}
                        placeholder="e.g. Class 10 IT Final Exam"
                        className="text-sm"
                    />
                    <TextInput
                        label="मराठी"
                        value={nameMr}
                        onChange={(e) => onNameMrChange(e.target.value)}
                        placeholder="उदा. दहावी IT अंतिम परीक्षा"
                        className="text-sm"
                    />
                </div>
            </GlassCard>

            {/* Subject & Class Card */}
            <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <GraduationCap className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Subject & Class
                    </h3>
                </div>
                <div className="space-y-3">
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
                </div>
            </GlassCard>

            {/* Exam Settings Card */}
            <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Exam Settings
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Duration</label>
                        <div className="relative">
                            <TextInput
                                type="number"
                                value={duration}
                                onChange={(e) => onDurationChange(Number(e.target.value))}
                                min={10}
                                className="pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">min</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Passing</label>
                        <div className="relative">
                            <TextInput
                                type="number"
                                value={passingPercentage}
                                onChange={(e) => onPassingPercentageChange(Number(e.target.value))}
                                min={0}
                                max={100}
                                className="pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">%</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Status Toggles Card */}
            <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
                        <Target className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Status
                    </h3>
                </div>
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => onIsTemplateChange(!isTemplate)}
                        className={clsx(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                            isTemplate
                                ? "border-primary-200 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800"
                                : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                                isTemplate ? "bg-primary-500 text-white" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700"
                            )}>
                                <ScrollText className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <p className={clsx(
                                    "text-sm font-medium",
                                    isTemplate ? "text-primary-700 dark:text-primary-400" : "text-neutral-600 dark:text-neutral-400"
                                )}>
                                    Template
                                </p>
                                <p className="text-xs text-neutral-500">Reusable blueprint</p>
                            </div>
                        </div>
                        <div className={clsx(
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isTemplate 
                                ? "border-primary-500 bg-primary-500" 
                                : "border-neutral-300 dark:border-neutral-600"
                        )}>
                            {isTemplate && (
                                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onIsActiveChange(!isActive)}
                        className={clsx(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                            isActive
                                ? "border-success-200 bg-success-50 dark:bg-success-900/20 dark:border-success-800"
                                : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                                isActive ? "bg-success-500 text-white" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700"
                            )}>
                                <Target className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <p className={clsx(
                                    "text-sm font-medium",
                                    isActive ? "text-success-700 dark:text-success-400" : "text-neutral-600 dark:text-neutral-400"
                                )}>
                                    Active
                                </p>
                                <p className="text-xs text-neutral-500">Available for exams</p>
                            </div>
                        </div>
                        <div className={clsx(
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isActive 
                                ? "border-success-500 bg-success-500" 
                                : "border-neutral-300 dark:border-neutral-600"
                        )}>
                            {isActive && (
                                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                    </button>
                </div>
            </GlassCard>

            {/* Stats Summary Card */}
            <GlassCard className="p-5 bg-linear-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-900/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                        <Layers className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Summary
                    </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Award className="h-3.5 w-3.5 text-primary-500" />
                        </div>
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{totalMarks}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Marks</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <HelpCircle className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{totalQuestions}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Questions</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Layers className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{sectionsCount}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Sections</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}


