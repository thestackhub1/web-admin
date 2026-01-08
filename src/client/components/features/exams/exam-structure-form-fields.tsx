// Client-side only — no server secrets or database access here

"use client";

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
        <GlassCard className="relative z-10">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Basic Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Name (English) <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        value={nameEn}
                        onChange={(e) => onNameEnChange(e.target.value)}
                        placeholder="e.g. Class 10 IT Final Exam"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Name (Marathi)
                    </label>
                    <TextInput
                        value={nameMr}
                        onChange={(e) => onNameMrChange(e.target.value)}
                        placeholder="e.g. दहावी IT अंतिम परीक्षा"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Subject <span className="text-red-500">*</span>
                    </label>
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
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Class Level (Legacy)
                    </label>
                    <Select
                        value={classLevel}
                        onChange={onClassLevelChange}
                        options={staticClassLevels}
                    />
                </div>
                {hasClassLevelsList && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Linked Class Level
                        </label>
                        <Select
                            value={classLevelId}
                            onChange={onClassLevelIdChange}
                            placeholder="Select class level..."
                            options={[
                                { value: "", label: "None (All Classes)" },
                                ...classLevelOptions,
                            ]}
                        />
                    </div>
                )}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Duration (mins)
                    </label>
                    <TextInput
                        type="number"
                        value={duration}
                        onChange={(e) => onDurationChange(Number(e.target.value))}
                        min={10}
                        max={300}
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Passing %
                    </label>
                    <TextInput
                        type="number"
                        value={passingPercentage}
                        onChange={(e) => onPassingPercentageChange(Number(e.target.value))}
                        min={0}
                        max={100}
                    />
                </div>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isTemplate}
                        onChange={(e) => onIsTemplateChange(e.target.checked)}
                        className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Template
                    </span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => onIsActiveChange(e.target.checked)}
                        className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Active
                    </span>
                </label>
            </div>
        </GlassCard>
    );
}


