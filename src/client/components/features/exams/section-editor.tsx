// Client-side only — no server secrets or database access here

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
    Minus,
    Plus,
    Save,
    BookOpen,
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    Sparkles,
    Check,
    ListChecks,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { Button } from '@/client/components/ui/button';
import { useChaptersWithCounts } from "@/client/hooks";
import { ChapterSelector, type ChapterQuestionConfig } from '@/client/components/features/subjects/chapter-selector';
import { QuestionPicker } from './question-picker';
import { type QuestionType } from "@/client/types/questions";
import type { ExamSection } from "@/client/types/exam-structures";

import { api } from "@/client/api/api-client";

const questionTypes: { value: QuestionType; label: string; shortLabel: string; description: string }[] = [
    { value: "fill_blank", label: "Fill in the Blanks", shortLabel: "Fill Blanks", description: "Complete sentences with missing words" },
    { value: "true_false", label: "True or False", shortLabel: "True/False", description: "Evaluate statements as true or false" },
    { value: "mcq_single", label: "MCQ - Single Answer", shortLabel: "MCQ (1)", description: "Multiple choice with 1 correct answer" },
    { value: "mcq_two", label: "MCQ - Two Answers", shortLabel: "MCQ (2)", description: "Multiple choice with 2 correct answers" },
    { value: "mcq_three", label: "MCQ - Three Answers", shortLabel: "MCQ (3)", description: "Multiple choice with 3 correct answers" },
    { value: "match", label: "Match the Pairs", shortLabel: "Match", description: "Connect related items from two columns" },
    { value: "short_answer", label: "Short Answer", shortLabel: "Short", description: "Brief written response (1-2 sentences)" },
    { value: "long_answer", label: "Long Answer", shortLabel: "Long", description: "Detailed written response (paragraph)" },
    { value: "programming", label: "Programming", shortLabel: "Code", description: "Write code to solve a problem" },
];

interface SectionEditorProps {
    examStructureId: string;
    examStructureName: string;
    subjectId: string;
    subjectName: string;
    classLevelId?: string;
    section: ExamSection;
    sectionIndex: number;
    _totalSections?: number;
}

type StepId = 1 | 2 | 3;

const steps = [
    { id: 1 as StepId, label: "Configure", shortLabel: "1" },
    { id: 2 as StepId, label: "Source", shortLabel: "2" },
    { id: 3 as StepId, label: "Review", shortLabel: "3" },
];

export function SectionEditor({
    examStructureId,
    examStructureName,
    subjectId,
    subjectName,
    classLevelId: _classLevelId,
    section,
    sectionIndex,
}: SectionEditorProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<StepId>(1);
    const [isSaving, setIsSaving] = useState(false);
    const [subjectSlug, setSubjectSlug] = useState<string>("");
    
    // Section form state
    const [nameEn, setNameEn] = useState(section.name_en);
    const [nameMr, setNameMr] = useState(section.name_mr || "");
    const [questionType, setQuestionType] = useState<QuestionType>(section.question_type);
    const [questionCount, setQuestionCount] = useState(section.question_count);
    const [marksPerQuestion, setMarksPerQuestion] = useState(section.marks_per_question);
    const [instructionsEn, setInstructionsEn] = useState(section.instructions_en || "");
    const [instructionsMr, setInstructionsMr] = useState(section.instructions_mr || "");
    const [chapterConfigs, setChapterConfigs] = useState<ChapterQuestionConfig[]>(
        section.chapter_configs || []
    );
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
        section.selected_question_ids || []
    );

    // Fetch subject slug from subjectId
    useEffect(() => {
        const fetchSubjectSlug = async () => {
            const { data } = await api.get<{ slug: string }>(`/api/v1/subjects/${subjectId}`);
            if (data?.slug) {
                setSubjectSlug(data.slug);
            }
        };
        if (subjectId) {
            fetchSubjectSlug();
        }
    }, [subjectId]);

    // Fetch chapters (hook takes slug, not id)
    const { data: chapters, loading: isLoadingChapters } = useChaptersWithCounts(subjectSlug);

    const totalMarks = questionCount * marksPerQuestion;

    // Check configuration status
    const hasChapterConfig = chapterConfigs.length > 0;
    const hasQuestionSelection = selectedQuestionIds.length > 0;

    // Step completion status
    const stepStatus = {
        1: !!nameEn.trim(),
        2: hasChapterConfig || hasQuestionSelection,
        3: true, // Review is always accessible
    };

    const handleSave = useCallback(async () => {
        if (!nameEn.trim()) {
            toast.error("Please enter a section name");
            return;
        }

        setIsSaving(true);

        try {
            // Build updated section
            const updatedSection: ExamSection = {
                ...section,
                name_en: nameEn,
                name_mr: nameMr,
                question_type: questionType,
                question_count: questionCount,
                marks_per_question: marksPerQuestion,
                total_marks: questionCount * marksPerQuestion,
                instructions_en: instructionsEn,
                instructions_mr: instructionsMr,
                chapter_configs: chapterConfigs.length > 0 ? chapterConfigs : undefined,
                selected_question_ids: selectedQuestionIds.length > 0 ? selectedQuestionIds : undefined,
            };

            // Fetch current exam structure
            const { data: currentStructure, error: fetchError } = await api.get<{
                sections: ExamSection[];
            }>(`/api/v1/exam-structures/${examStructureId}`);

            if (fetchError || !currentStructure) {
                throw new Error("Failed to fetch current structure");
            }

            // Update the section in the array
            const updatedSections = [...(currentStructure.sections || [])];
            updatedSections[sectionIndex] = updatedSection;

            // Calculate new totals
            const newTotalQuestions = updatedSections.reduce((acc, s) => acc + s.question_count, 0);
            const newTotalMarks = updatedSections.reduce((acc, s) => acc + s.total_marks, 0);

            // Save to server
            const { error: updateError } = await api.patch(
                `/api/v1/exam-structures/${examStructureId}`,
                {
                    sections: updatedSections,
                    total_questions: newTotalQuestions,
                    total_marks: newTotalMarks,
                }
            );

            if (updateError) {
                throw new Error(updateError);
            }

            toast.success("Section saved successfully");
            router.push(`/dashboard/exam-structures/${examStructureId}`);
            router.refresh();
        } catch (error) {
            console.error("Failed to save section:", error);
            toast.error("Failed to save section");
        } finally {
            setIsSaving(false);
        }
    }, [
        examStructureId,
        sectionIndex,
        section,
        nameEn,
        nameMr,
        questionType,
        questionCount,
        marksPerQuestion,
        instructionsEn,
        instructionsMr,
        chapterConfigs,
        selectedQuestionIds,
        router,
    ]);

    const handleBack = () => {
        router.push(`/dashboard/exam-structures/${examStructureId}`);
    };

    const handleNextStep = () => {
        if (currentStep < 3) setCurrentStep((currentStep + 1) as StepId);
    };

    const handlePrevStep = () => {
        if (currentStep > 1) setCurrentStep((currentStep - 1) as StepId);
    };

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
            {/* Minimal Top Bar */}
            <header className="shrink-0 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex h-14 items-center justify-between px-6">
                    {/* Left: Back + Title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
                        <div>
                            <h1 className="text-sm font-medium text-neutral-900 dark:text-white">
                                {nameEn || "Untitled Section"}
                            </h1>
                            <p className="text-xs text-neutral-400">
                                {examStructureName}
                            </p>
                        </div>
                    </div>

                    {/* Center: Step Indicators */}
                    <div className="hidden items-center gap-8 md:flex">
                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(step.id)}
                                className="group flex items-center gap-3"
                            >
                                <div className={clsx(
                                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
                                    currentStep === step.id
                                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                        : stepStatus[step.id]
                                            ? "bg-green-500 text-white"
                                            : "bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:group-hover:bg-neutral-700"
                                )}>
                                    {stepStatus[step.id] && currentStep !== step.id ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        step.shortLabel
                                    )}
                                </div>
                                <span className={clsx(
                                    "text-sm font-medium transition-colors",
                                    currentStep === step.id
                                        ? "text-neutral-900 dark:text-white"
                                        : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                                )}>
                                    {step.label}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={clsx(
                                        "ml-3 h-px w-12",
                                        stepStatus[step.id] ? "bg-green-300" : "bg-neutral-200 dark:bg-neutral-700"
                                    )} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right: Stats + Save */}
                    <div className="flex items-center gap-4">
                        <div className="hidden items-center gap-2 text-sm sm:flex">
                            <span className="font-mono text-neutral-400">{questionCount}×{marksPerQuestion}</span>
                            <span className="text-neutral-300">=</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">{totalMarks}</span>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-1.5">
                            {isSaving ? <LoaderSpinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            Save
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                {/* Step 1: Configure */}
                {currentStep === 1 && (
                    <div className="h-full overflow-y-auto animate-in fade-in duration-300">
                        <div className="flex h-full">
                            {/* Left Panel: Question Type Selection */}
                            <div className="w-1/2 border-r border-neutral-100 dark:border-neutral-800">
                                <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
                                    <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                        Question Type
                                    </label>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-2">
                                        {questionTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => setQuestionType(type.value)}
                                                className={clsx(
                                                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all",
                                                    questionType === type.value
                                                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                                        : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                )}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{type.label}</p>
                                                    <p className={clsx(
                                                        "text-xs",
                                                        questionType === type.value
                                                            ? "text-neutral-300 dark:text-neutral-600"
                                                            : "text-neutral-400"
                                                    )}>
                                                        {type.description}
                                                    </p>
                                                </div>
                                                {questionType === type.value && (
                                                    <Check className="h-5 w-5 shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Section Details */}
                            <div className="w-1/2 overflow-y-auto">
                                <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
                                    <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                        Section Details
                                    </label>
                                </div>
                                <div className="space-y-6 p-6">
                                    {/* Section Name */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                            Section Name
                                        </label>
                                        <input
                                            type="text"
                                            value={nameEn}
                                            onChange={(e) => setNameEn(e.target.value)}
                                            placeholder="Enter section name..."
                                            className="w-full rounded-xl border-0 bg-neutral-50 px-4 py-3 text-lg font-semibold text-neutral-900 ring-1 ring-neutral-200 transition-all placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                                        />
                                    </div>

                                    {/* Marks Configuration */}
                                    <div className="rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-900">
                                        <label className="mb-4 block text-xs font-medium uppercase tracking-wider text-neutral-400">
                                            Marks Configuration
                                        </label>

                                        <div className="space-y-4">
                                            {/* Questions Count */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">Number of Questions</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm ring-1 ring-neutral-200 transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={questionCount}
                                                        onChange={(e) => setQuestionCount(Math.max(1, Number(e.target.value)))}
                                                        className="h-9 w-16 rounded-lg bg-white text-center text-base font-bold text-neutral-900 shadow-sm ring-1 ring-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                                                    />
                                                    <button
                                                        onClick={() => setQuestionCount(questionCount + 1)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm ring-1 ring-neutral-200 transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Marks per Question */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">Marks per Question</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setMarksPerQuestion(Math.max(1, marksPerQuestion - 1))}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm ring-1 ring-neutral-200 transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={marksPerQuestion}
                                                        onChange={(e) => setMarksPerQuestion(Math.max(1, Number(e.target.value)))}
                                                        className="h-9 w-16 rounded-lg bg-white text-center text-base font-bold text-neutral-900 shadow-sm ring-1 ring-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                                                    />
                                                    <button
                                                        onClick={() => setMarksPerQuestion(marksPerQuestion + 1)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm ring-1 ring-neutral-200 transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Total Display */}
                                            <div className="mt-2 flex items-center justify-between rounded-xl bg-green-100 px-4 py-3 dark:bg-green-900/30">
                                                <span className="text-sm font-medium text-green-700 dark:text-green-400">Total Marks</span>
                                                <span className="text-2xl font-bold text-green-700 dark:text-green-400">{totalMarks}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Options */}
                                    <div className="rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-900">
                                        <button
                                            onClick={() => {
                                                const el = document.getElementById('advanced-options');
                                                el?.classList.toggle('hidden');
                                            }}
                                            className="flex w-full items-center justify-between text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-neutral-400" />
                                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                                    Advanced options
                                                </span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 text-neutral-400" />
                                        </button>
                                        <div id="advanced-options" className="hidden mt-4 space-y-4">
                                            <input
                                                type="text"
                                                value={nameMr}
                                                onChange={(e) => setNameMr(e.target.value)}
                                                placeholder="Section name in Marathi"
                                                className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-neutral-900 ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                                            />
                                            <textarea
                                                value={instructionsEn}
                                                onChange={(e) => setInstructionsEn(e.target.value)}
                                                rows={2}
                                                placeholder="Instructions in English (optional)"
                                                className="w-full resize-none rounded-xl border-0 bg-white p-4 text-sm text-neutral-900 ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                                            />
                                            <textarea
                                                value={instructionsMr}
                                                onChange={(e) => setInstructionsMr(e.target.value)}
                                                rows={2}
                                                placeholder="Instructions in Marathi (optional)"
                                                className="w-full resize-none rounded-xl border-0 bg-white p-4 text-sm text-neutral-900 ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Source - Chapters + Questions Side by Side */}
                {currentStep === 2 && (
                    <div className="flex h-full min-h-0 animate-in fade-in duration-300">
                        {/* Left Panel: Chapters */}
                        <div className="flex w-1/2 min-h-0 flex-col border-r border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Chapters</h3>
                                    <p className="text-xs text-neutral-400">
                                        {hasChapterConfig ? `${chapterConfigs.length} selected` : "All chapters"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {chapters?.length || 0}
                                </div>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                {isLoadingChapters ? (
                                    <div className="flex items-center justify-center py-12">
                                        <LoaderSpinner />
                                    </div>
                                ) : chapters && chapters.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <BookOpen className="h-10 w-10 text-neutral-300" />
                                        <p className="mt-3 text-sm text-neutral-500">No chapters available</p>
                                    </div>
                                ) : (
                                    <ChapterSelector
                                        chapters={chapters || []}
                                        chapterConfigs={chapterConfigs}
                                        onConfigChange={setChapterConfigs}
                                        questionType={questionType}
                                        requiredQuestionCount={questionCount}
                                        isLoading={isLoadingChapters}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Questions */}
                        <div className="flex w-1/2 min-h-0 flex-col">
                            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Questions</h3>
                                    <p className="text-xs text-neutral-400">
                                        {hasQuestionSelection ? `${selectedQuestionIds.length} manual` : "Auto-select"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <ListChecks className="h-3.5 w-3.5" />
                                    {selectedQuestionIds.length}/{questionCount}
                                </div>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                <QuestionPicker
                                    subjectId={subjectId}
                                    questionType={questionType}
                                    chapterConfigs={chapterConfigs}
                                    selectedQuestionIds={selectedQuestionIds}
                                    onSelectionChange={setSelectedQuestionIds}
                                    requiredCount={questionCount}
                                    chapters={chapters || []}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                    <div className="flex h-full animate-in fade-in duration-300">
                        {/* Left Panel: Configuration Summary */}
                        <div className="flex w-1/2 flex-col border-r border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Configuration</h3>
                                    <p className="text-xs text-neutral-400">Section settings</p>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <Check className="h-3.5 w-3.5" />
                                    Complete
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    {/* Section Name */}
                                    <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Section Name</p>
                                        <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{nameEn}</p>
                                        {nameMr && <p className="mt-0.5 text-sm text-neutral-500">{nameMr}</p>}
                                    </div>

                                    {/* Question Type */}
                                    <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Question Type</p>
                                        <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
                                            {questionTypes.find(t => t.value === questionType)?.label}
                                        </p>
                                        <p className="mt-0.5 text-sm text-neutral-500">
                                            {questionTypes.find(t => t.value === questionType)?.description}
                                        </p>
                                    </div>

                                    {/* Marks Breakdown */}
                                    <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">Marks</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-500">Questions</span>
                                                <span className="font-medium text-neutral-900 dark:text-white">{questionCount}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-500">Marks each</span>
                                                <span className="font-medium text-neutral-900 dark:text-white">{marksPerQuestion}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-neutral-200 pt-2 dark:border-neutral-700">
                                                <span className="font-medium text-neutral-700 dark:text-neutral-300">Total</span>
                                                <span className="text-xl font-bold text-green-600 dark:text-green-400">{totalMarks}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instructions if any */}
                                    {(instructionsEn || instructionsMr) && (
                                        <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Instructions</p>
                                            {instructionsEn && <p className="text-sm text-neutral-700 dark:text-neutral-300">{instructionsEn}</p>}
                                            {instructionsMr && <p className="mt-1 text-sm text-neutral-500">{instructionsMr}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Source Summary */}
                        <div className="flex w-1/2 flex-col">
                            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Question Source</h3>
                                    <p className="text-xs text-neutral-400">Chapters & selection</p>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {hasChapterConfig ? chapterConfigs.length : chapters?.length || 0} chapters
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    {/* Chapter Selection */}
                                    <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">Chapters</p>
                                        {hasChapterConfig ? (
                                            <div className="space-y-2">
                                                {chapterConfigs.map((config) => {
                                                    const chapter = chapters?.find(c => c.id === config.chapter_id);
                                                    return (
                                                        <div key={config.chapter_id} className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-neutral-800">
                                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                                {chapter?.name_en || "Unknown"}
                                                            </span>
                                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                                {config.question_count} Q
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 dark:bg-neutral-800">
                                                <BookOpen className="h-4 w-4 text-neutral-400" />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    Random from all {chapters?.length || 0} chapters
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Question Selection Mode */}
                                    <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">Selection Mode</p>
                                        <div className={clsx(
                                            "flex items-center gap-3 rounded-lg p-3",
                                            hasQuestionSelection 
                                                ? "bg-blue-50 dark:bg-blue-900/20" 
                                                : "bg-white dark:bg-neutral-800"
                                        )}>
                                            <div className={clsx(
                                                "flex h-10 w-10 items-center justify-center rounded-full",
                                                hasQuestionSelection 
                                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                                            )}>
                                                <ListChecks className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                    {hasQuestionSelection ? "Manual Selection" : "Auto-select"}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {hasQuestionSelection 
                                                        ? `${selectedQuestionIds.length} questions manually selected`
                                                        : `${questionCount} questions will be picked randomly`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ready Status */}
                                    <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-green-700 dark:text-green-400">Ready to Save</p>
                                                <p className="text-xs text-green-600 dark:text-green-500">
                                                    All configuration complete
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <footer className="shrink-0 border-t border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex items-center justify-between px-6 py-3">
                    <Button
                        variant="ghost"
                        onClick={currentStep === 1 ? handleBack : handlePrevStep}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {currentStep === 1 ? "Cancel" : "Back"}
                    </Button>

                    {/* Mobile Progress */}
                    <div className="flex items-center gap-2 md:hidden">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(step.id)}
                                className={clsx(
                                    "h-2 w-2 rounded-full transition-all",
                                    currentStep === step.id
                                        ? "w-6 bg-neutral-900 dark:bg-white"
                                        : stepStatus[step.id]
                                            ? "bg-green-500"
                                            : "bg-neutral-200 dark:bg-neutral-700"
                                )}
                            />
                        ))}
                    </div>

                    {currentStep < 3 ? (
                        <Button onClick={handleNextStep} className="gap-2">
                            {currentStep === 1 ? "Select Questions" : "Review"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                            {isSaving ? (
                                <>
                                    <LoaderSpinner className="h-4 w-4" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
}
