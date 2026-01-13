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
        <div className="space-y-4">
            {/* Blueprint Name */}
            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-primary-500" />
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
                    />
                    <TextInput
                        label="मराठी"
                        value={nameMr}
                        onChange={(e) => onNameMrChange(e.target.value)}
                        placeholder="उदा. दहावी IT अंतिम परीक्षा"
                    />
                </div>
            </div>

            {/* Subject & Class */}
            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Subject & Class
                    </h3>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Subject</label>
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
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Class Level</label>
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
            </div>

            {/* Exam Settings */}
            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Exam Settings
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Duration</label>
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
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Passing</label>
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
            </div>

            {/* Status Toggles */}
            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-green-500" />
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Status
                    </h3>
                </div>
                <div className="space-y-3">
                    {/* Template Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                                isTemplate ? "bg-primary-500 text-white" : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700"
                            )}>
                                <ScrollText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-white">Template</p>
                                <p className="text-xs text-neutral-500">Reusable blueprint</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onIsTemplateChange(!isTemplate)}
                            className={clsx(
                                "relative h-7 w-12 rounded-full transition-colors duration-200",
                                isTemplate ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-600"
                            )}
                        >
                            <span className={clsx(
                                "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
                                isTemplate ? "translate-x-5" : "translate-x-0"
                            )} />
                        </button>
                    </div>

                    <div className="border-t border-neutral-200 dark:border-neutral-700" />

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                                isActive ? "bg-green-500 text-white" : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700"
                            )}>
                                <Target className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-white">Active</p>
                                <p className="text-xs text-neutral-500">Available for exams</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onIsActiveChange(!isActive)}
                            className={clsx(
                                "relative h-7 w-12 rounded-full transition-colors duration-200",
                                isActive ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"
                            )}
                        >
                            <span className={clsx(
                                "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
                                isActive ? "translate-x-5" : "translate-x-0"
                            )} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                <div className="flex items-center gap-2 mb-3">
                    <Layers className="h-4 w-4 text-neutral-500" />
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Summary
                    </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-lg bg-white dark:bg-neutral-800">
                        <Award className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{totalMarks}</p>
                        <p className="text-[10px] text-neutral-400 uppercase">Marks</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white dark:bg-neutral-800">
                        <HelpCircle className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{totalQuestions}</p>
                        <p className="text-[10px] text-neutral-400 uppercase">Questions</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white dark:bg-neutral-800">
                        <Layers className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{sectionsCount}</p>
                        <p className="text-[10px] text-neutral-400 uppercase">Sections</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


