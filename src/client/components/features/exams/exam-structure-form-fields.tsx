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
        <GlassCard className="overflow-hidden border-none shadow-xl p-0!">
            <div className="flex items-center gap-3 px-8 py-6 bg-linear-to-b from-neutral-50/50 to-transparent dark:from-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                    <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                    Blueprint Identity & Config
                </h3>
            </div>

            <div className="p-8 space-y-8">
                {/* Names */}
                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400">English Identity</label>
                        <TextInput
                            label="Blueprint Name"
                            value={nameEn}
                            onChange={(e) => onNameEnChange(e.target.value)}
                            placeholder="e.g. Class 10 IT Final Exam"
                            className="font-bold!"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-insight-500/80 text-right block">प्रादेशिक माहिती (Marathi)</label>
                        <TextInput
                            label="ब्लूप्रिंटचे नाव"
                            value={nameMr}
                            onChange={(e) => onNameMrChange(e.target.value)}
                            placeholder="उदा. दहावी IT अंतिम परीक्षा"
                            className="font-bold! text-right"
                        />
                    </div>
                </div>

                {/* Technical Settings */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Subject</label>
                        <Select
                            value={subjectId}
                            onChange={onSubjectIdChange}
                            placeholder="Select subject..."
                            options={subjects.map((s) => ({
                                value: s.id,
                                label: s.name_en,
                            }))}
                            className="font-bold!"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Class Level</label>
                        <Select
                            value={classLevelId || classLevel}
                            onChange={(val: string) => {
                                if (hasClassLevelsList) onClassLevelIdChange(val);
                                else onClassLevelChange(val);
                            }}
                            options={hasClassLevelsList ? [
                                { value: "", label: "None (Global)" },
                                ...classLevelOptions,
                            ] : staticClassLevels}
                            className="font-bold!"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Duration (Min)</label>
                        <TextInput
                            type="number"
                            value={duration}
                            onChange={(e) => onDurationChange(Number(e.target.value))}
                            min={10}
                            className="font-bold!"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Passing %</label>
                        <TextInput
                            type="number"
                            value={passingPercentage}
                            onChange={(e) => onPassingPercentageChange(Number(e.target.value))}
                            min={0}
                            className="font-bold!"
                        />
                    </div>
                </div>

                {/* Flags */}
                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                        type="button"
                        onClick={() => onIsTemplateChange(!isTemplate)}
                        className={`group relative flex items-center gap-4 px-6 py-4 rounded-3xl border-2 transition-all duration-300 ${isTemplate
                            ? "border-primary-500 bg-primary-50/30 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-lg shadow-primary-500/10"
                            : "border-neutral-100 bg-neutral-50/50 text-neutral-400 hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/40"}`}
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${isTemplate ? "bg-primary-500 text-white shadow-glow-primary scale-110" : "bg-neutral-200/50 dark:bg-neutral-800"}`}>
                            <ScrollText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Standard</span>
                            <span className="text-sm font-black uppercase tracking-tight">Template</span>
                        </div>
                        {isTemplate && <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white shadow-md"><svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
                    </button>

                    <button
                        type="button"
                        onClick={() => onIsActiveChange(!isActive)}
                        className={`group relative flex items-center gap-4 px-6 py-4 rounded-3xl border-2 transition-all duration-300 ${isActive
                            ? "border-success-500 bg-success-50/30 text-success-700 dark:bg-success-900/20 dark:text-success-400 shadow-lg shadow-success-500/10"
                            : "border-neutral-100 bg-neutral-50/50 text-neutral-400 hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/40"}`}
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${isActive ? "bg-success-500 text-white shadow-glow-success scale-110" : "bg-neutral-200/50 dark:bg-neutral-800"}`}>
                            <Target className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Status</span>
                            <span className="text-sm font-black uppercase tracking-tight">Active Blueprint</span>
                        </div>
                        {isActive && <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-success-500 text-white shadow-md"><svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}


