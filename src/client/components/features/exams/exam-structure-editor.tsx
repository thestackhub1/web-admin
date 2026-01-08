// Client-side only — no server secrets or database access here

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
    Minus,
    Plus,
    Save,
    X,
    Check,
    Target,
    HelpCircle,
    BookOpen,
    FileText,
    ScrollText,
    ClipboardList,
    Lightbulb,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { Button } from '@/client/components/ui/button';
import { TextInput } from "@/client/components/ui/input";
import { useChaptersWithCounts, useCreateExamStructure, useUpdateExamStructure } from "@/client/hooks";
import { ChapterSelector, type ChapterQuestionConfig, type ChapterWithCount } from '@/client/components/features/subjects/chapter-selector';
import { questionTypeLabels, type QuestionType } from "@/client/types/questions";
import { ExamStructureFormFields } from './exam-structure-form-fields';
import { ExamStructureSummary } from './exam-structure-summary';
import { ExamStructureSectionsList } from './exam-structure-sections-list';

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
    /** Per-chapter question allocation (empty = random from all chapters) */
    chapter_configs?: ChapterQuestionConfig[];
}

interface Subject {
    id: string;
    name_en: string;
    slug: string;
}

interface ClassLevel {
    id: string;
    name_en: string;
    slug: string;
}

interface ExamStructureEditorProps {
    subjects: Subject[];
    classLevelsList?: ClassLevel[]; // New: dynamic class levels from DB
    initialData?: {
        id?: string;
        name_en: string;
        name_mr: string;
        subject_id: string;
        class_level: string;
        class_level_id?: string | null; // New: FK to class_levels table
        is_template?: boolean; // New: template vs assigned to specific exam
        duration_minutes: number;
        total_marks: number;
        passing_percentage: number;
        sections: Section[];
        is_active: boolean;
    };
    mode: "create" | "edit";
}

// Fallback for when dynamic class levels aren't provided
const staticClassLevels = [
    { value: "class_8", label: "Class 8" },
    { value: "class_9", label: "Class 9" },
    { value: "class_10", label: "Class 10" },
    { value: "class_11", label: "Class 11" },
    { value: "class_12", label: "Class 12" },
];

const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
    { value: "fill_blank", label: "Fill in Blanks", icon: "✏" },
    { value: "true_false", label: "True/False", icon: "✓✗" },
    { value: "mcq_single", label: "MCQ (1)", icon: "①" },
    { value: "mcq_two", label: "MCQ (2)", icon: "②" },
    { value: "mcq_three", label: "MCQ (3)", icon: "③" },
    { value: "match", label: "Match", icon: "⇄" },
    { value: "short_answer", label: "Short Answer", icon: "✍" },
    { value: "long_answer", label: "Long Answer", icon: "☰" },
    { value: "programming", label: "Programming", icon: "</>" },
];

function generateId() {
    return Math.random().toString(36).substring(7);
}

export function ExamStructureEditor({
    subjects,
    classLevelsList,
    initialData,
    mode,
}: ExamStructureEditorProps) {
    const router = useRouter();

    // Find subject slug from subjectId
    const selectedSubject = subjects.find(s => s.id === subjectId);
    const subjectSlug = selectedSubject?.slug || "";

    // Fetch chapters with counts using hook
    const { data: chaptersData, loading: isLoadingChapters } = useChaptersWithCounts(subjectSlug);
    const chapters = chaptersData || [];

    // Build class levels options from DB or fallback
    const classLevelOptions = classLevelsList
        ? classLevelsList.map((cl) => ({ value: cl.id, label: cl.name_en }))
        : staticClassLevels;

    // Form state
    const [nameEn, setNameEn] = useState(initialData?.name_en || "");
    const [nameMr, setNameMr] = useState(initialData?.name_mr || "");
    const [subjectId, setSubjectId] = useState(initialData?.subject_id || "");
    const [classLevelId, setClassLevelId] = useState(initialData?.class_level_id || "");
    const [isTemplate, setIsTemplate] = useState(initialData?.is_template ?? true);
    const [classLevel, setClassLevel] = useState(initialData?.class_level || "class_10");
    const [duration, setDuration] = useState(initialData?.duration_minutes || 90);
    const [passingPercentage, setPassingPercentage] = useState(
        initialData?.passing_percentage || 35
    );
    const [isActive, setIsActive] = useState(initialData?.is_active ?? false);
    const [sections, setSections] = useState<Section[]>(
        initialData?.sections || []
    );

    // Add section modal
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    // Use mutation hooks
    const createMutation = useCreateExamStructure();
    const updateMutation = useUpdateExamStructure();
    const isSaving = createMutation.isLoading || updateMutation.isLoading;

    // Calculate totals
    const totalQuestions = sections.reduce((sum, s) => sum + s.question_count, 0);
    const totalMarks = sections.reduce((sum, s) => sum + s.total_marks, 0);

    const addSection = () => {
        setEditingSection(null);
        setShowSectionModal(true);
    };

    const editSection = (section: Section) => {
        setEditingSection(section);
        setShowSectionModal(true);
    };

    const deleteSection = (id: string) => {
        setSections(sections.filter((s) => s.id !== id));
    };

    const moveSection = (index: number, direction: "up" | "down") => {
        const newSections = [...sections];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= sections.length) return;
        [newSections[index], newSections[newIndex]] = [
            newSections[newIndex],
            newSections[index],
        ];
        setSections(newSections.map((s, i) => ({ ...s, order_index: i + 1 })));
    };

    const saveSection = (section: Section) => {
        if (editingSection) {
            setSections(sections.map((s) => (s.id === section.id ? section : s)));
        } else {
            setSections([
                ...sections,
                { ...section, id: generateId(), order_index: sections.length + 1 },
            ]);
        }
        setShowSectionModal(false);
        setEditingSection(null);
    };

    const handleSave = async () => {
        if (!nameEn.trim()) {
            toast.error("Please enter a name");
            return;
        }
        if (!subjectId) {
            toast.error("Please select a subject");
            return;
        }
        if (sections.length === 0) {
            toast.error("Please add at least one section");
            return;
        }

        const data = {
            name_en: nameEn,
            name_mr: nameMr,
            subject_id: subjectId,
            class_level: classLevel,
            class_level_id: classLevelId || null,
            is_template: isTemplate,
            duration_minutes: duration,
            total_marks: totalMarks,
            total_questions: totalQuestions,
            passing_percentage: passingPercentage,
            sections: sections.map(s => ({
                code: s.code,
                name_en: s.name_en,
                name_mr: s.name_mr,
                question_type: s.question_type,
                question_count: s.question_count,
                marks_per_question: s.marks_per_question,
                total_marks: s.total_marks,
                instructions_en: s.instructions_en,
                instructions_mr: s.instructions_mr,
                order_index: s.order_index,
                chapter_configs: s.chapter_configs,
            })),
            is_active: isActive,
        };

        if (mode === "edit" && initialData?.id) {
            const result = await updateMutation.mutateAsync({ id: initialData.id, ...data });
            if (result) {
                router.push("/dashboard/exam-structures");
                router.refresh();
            }
        } else {
            const result = await createMutation.mutateAsync(data);
            if (result) {
                router.push("/dashboard/exam-structures");
                router.refresh();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <LoaderSpinner size="sm" className="mr-2" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Structure
                </Button>
            </div>

            {/* Basic Info */}
            <ExamStructureFormFields
                nameEn={nameEn}
                nameMr={nameMr}
                subjectId={subjectId}
                classLevel={classLevel}
                classLevelId={classLevelId}
                isTemplate={isTemplate}
                duration={duration}
                passingPercentage={passingPercentage}
                isActive={isActive}
                subjects={subjects}
                classLevelOptions={classLevelOptions}
                staticClassLevels={staticClassLevels}
                hasClassLevelsList={!!classLevelsList && classLevelsList.length > 0}
                onNameEnChange={setNameEn}
                onNameMrChange={setNameMr}
                onSubjectIdChange={setSubjectId}
                onClassLevelChange={setClassLevel}
                onClassLevelIdChange={setClassLevelId}
                onIsTemplateChange={setIsTemplate}
                onDurationChange={setDuration}
                onPassingPercentageChange={setPassingPercentage}
                onIsActiveChange={setIsActive}
            />

            {/* Summary */}
            <ExamStructureSummary
                sectionsCount={sections.length}
                totalQuestions={totalQuestions}
                totalMarks={totalMarks}
            />

            {/* Sections */}
            <ExamStructureSectionsList
                sections={sections}
                onAddSection={addSection}
                onEditSection={editSection}
                onDeleteSection={deleteSection}
                onMoveSection={moveSection}
            />

            {/* Section Modal */}
            {showSectionModal && (
                <SectionModal
                    section={editingSection}
                    chapters={chapters}
                    isLoadingChapters={isLoadingChapters}
                    onSave={saveSection}
                    onClose={() => {
                        setShowSectionModal(false);
                        setEditingSection(null);
                    }}
                    nextIndex={sections.length + 1}
                />
            )}
        </div>
    );
}

// Section Modal Component - Premium Redesigned with Chapters Tab
function SectionModal({
    section,
    chapters,
    isLoadingChapters,
    onSave,
    onClose,
    nextIndex,
}: {
    section: Section | null;
    chapters: ChapterWithCount[];
    isLoadingChapters: boolean;
    onSave: (section: Section) => void;
    onClose: () => void;
    nextIndex: number;
}) {
    const [nameEn, setNameEn] = useState(section?.name_en || "");
    const [nameMr, setNameMr] = useState(section?.name_mr || "");
    const [questionType, setQuestionType] = useState<QuestionType>(
        section?.question_type || "fill_blank"
    );
    const [questionCount, setQuestionCount] = useState(section?.question_count || 10);
    const [marksPerQuestion, setMarksPerQuestion] = useState(section?.marks_per_question || 1);
    const [instructionsEn, setInstructionsEn] = useState(section?.instructions_en || "");
    const [instructionsMr, setInstructionsMr] = useState(section?.instructions_mr || "");
    const [chapterConfigs, setChapterConfigs] = useState<ChapterQuestionConfig[]>(section?.chapter_configs || []);
    const [activeTab, setActiveTab] = useState<"basic" | "marks" | "chapters" | "instructions">("basic");

    const handleSave = () => {
        if (!nameEn.trim()) {
            toast.error("Please enter a section name");
            return;
        }

        onSave({
            id: section?.id || "",
            code: `q${section?.order_index || nextIndex}`,
            name_en: nameEn,
            name_mr: nameMr,
            question_type: questionType,
            question_count: questionCount,
            marks_per_question: marksPerQuestion,
            total_marks: questionCount * marksPerQuestion,
            instructions_en: instructionsEn,
            instructions_mr: instructionsMr,
            order_index: section?.order_index || nextIndex,
            chapter_configs: chapterConfigs.length > 0 ? chapterConfigs : undefined,
        });
    };

    const totalMarks = questionCount * marksPerQuestion;

    // Get selected chapter IDs from configs for validation
    const selectedChapterIds = chapterConfigs.map((c) => c.chapter_id);
    const configuredQuestionCount = chapterConfigs.reduce((sum, c) => sum + c.question_count, 0);

    // Calculate available questions for validation
    const availableQuestions = chapterConfigs.length === 0
        ? chapters.reduce((sum, ch) => sum + (ch.question_counts?.[questionType] || 0), 0)
        : chapters
            .filter((ch) => selectedChapterIds.includes(ch.id))
            .reduce((sum, ch) => sum + (ch.question_counts?.[questionType] || 0), 0);

    const hasEnoughQuestions = availableQuestions >= questionCount;

    // Group question types
    const objectiveTypes = questionTypes.filter(t =>
        ["fill_blank", "true_false", "mcq_single", "mcq_two", "mcq_three"].includes(t.value)
    );
    const subjectiveTypes = questionTypes.filter(t =>
        ["match", "short_answer", "long_answer", "programming"].includes(t.value)
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-2xl transform animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Card */}
                <div className="relative overflow-hidden rounded-3xl bg-white/95 shadow-2xl dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 max-h-[90vh] flex flex-col">
                    {/* Gradient Header */}
                    <div className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 shrink-0">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <ClipboardList className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {section ? "Edit Section" : "Add New Section"}
                                    </h3>
                                    <p className="text-sm text-blue-100">
                                        {section ? `Section ${section.order_index}` : `Section ${nextIndex}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Marks Preview Badge */}
                        <div className="absolute -bottom-4 right-6 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg dark:bg-neutral-800">
                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{totalMarks}</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">marks</span>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 overflow-x-auto border-b border-neutral-200/50 px-6 pt-8 dark:border-neutral-700/50 shrink-0">
                        {[
                            { id: "basic", label: "Basic Info", icon: "✎" },
                            { id: "marks", label: "Marks", icon: "★" },
                            { id: "chapters", label: "Chapters", icon: "☰", badge: chapterConfigs.length > 0 ? `${chapterConfigs.length}` : undefined },
                            { id: "instructions", label: "Instructions", icon: "ℹ" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={clsx(
                                    "flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-b-2 border-blue-600"
                                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                                )}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                                {tab.badge && (
                                    <span className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs font-bold text-white">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Basic Info Tab */}
                        {activeTab === "basic" && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                {/* Section Names */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            <span className="flex h-5 w-5 items-center justify-center rounded bg-green-100 text-xs dark:bg-green-900/30">🇬🇧</span>
                                            Name (English) <span className="text-red-500">*</span>
                                        </label>
                                        <TextInput
                                            value={nameEn}
                                            onChange={(e) => setNameEn(e.target.value)}
                                            placeholder="e.g. Fill in the Blanks"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-blue-100 text-xs dark:bg-brand-blue-900/30">🇮🇳</span>
                                            Name (Marathi)
                                        </label>
                                        <TextInput
                                            value={nameMr}
                                            onChange={(e) => setNameMr(e.target.value)}
                                            placeholder="e.g. रिकाम्या जागा भरा"
                                        />
                                    </div>
                                </div>

                                {/* Question Type */}
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Question Type
                                    </label>

                                    {/* Objective Types */}
                                    <div className="mb-3">
                                        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-400">Objective</span>
                                        <div className="grid grid-cols-5 gap-2">
                                            {objectiveTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => setQuestionType(type.value)}
                                                    className={clsx(
                                                        "group relative flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-all",
                                                        questionType === type.value
                                                            ? "bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                                                            : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                    )}
                                                >
                                                    <span className="text-2xl">{type.icon}</span>
                                                    <span className="text-[10px] font-medium leading-tight">{type.label}</span>
                                                    {questionType === type.value && (
                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white shadow">
                                                            <Check className="h-3 w-3" />
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subjective Types */}
                                    <div>
                                        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-400">Subjective</span>
                                        <div className="grid grid-cols-4 gap-2">
                                            {subjectiveTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => setQuestionType(type.value)}
                                                    className={clsx(
                                                        "group relative flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-all",
                                                        questionType === type.value
                                                            ? "bg-linear-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-105"
                                                            : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                    )}
                                                >
                                                    <span className="text-2xl">{type.icon}</span>
                                                    <span className="text-[10px] font-medium leading-tight">{type.label}</span>
                                                    {questionType === type.value && (
                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white shadow">
                                                            <Check className="h-3 w-3" />
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Marks Tab */}
                        {activeTab === "marks" && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Question Count */}
                                    <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-5 dark:from-blue-900/20 dark:to-indigo-900/20">
                                        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            <HelpCircle className="h-4 w-4 text-blue-500" />
                                            Number of Questions
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-neutral-600 shadow hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                value={questionCount}
                                                onChange={(e) => setQuestionCount(Math.max(1, Number(e.target.value)))}
                                                className="h-12 w-20 rounded-xl border-0 bg-white text-center text-xl font-bold text-neutral-900 shadow focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
                                            />
                                            <button
                                                onClick={() => setQuestionCount(questionCount + 1)}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-neutral-600 shadow hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Marks per Question */}
                                    <div className="rounded-2xl bg-linear-to-br from-amber-50 to-amber-50 p-5 dark:from-amber-900/20 dark:to-amber-900/20">
                                        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            <Target className="h-4 w-4 text-amber-500" />
                                            Marks per Question
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setMarksPerQuestion(Math.max(1, marksPerQuestion - 1))}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-neutral-600 shadow hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                value={marksPerQuestion}
                                                onChange={(e) => setMarksPerQuestion(Math.max(1, Number(e.target.value)))}
                                                className="h-12 w-20 rounded-xl border-0 bg-white text-center text-xl font-bold text-neutral-900 shadow focus:ring-2 focus:ring-amber-500 dark:bg-neutral-800 dark:text-white"
                                            />
                                            <button
                                                onClick={() => setMarksPerQuestion(marksPerQuestion + 1)}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-neutral-600 shadow hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Marks Display */}
                                <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 p-6 text-center text-white">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/20 to-transparent" />
                                    <div className="relative">
                                        <p className="text-sm font-medium text-green-100">Total Section Marks</p>
                                        <div className="mt-2 flex items-center justify-center gap-3">
                                            <span className="text-3xl font-bold">{questionCount}</span>
                                            <span className="text-xl text-green-200">×</span>
                                            <span className="text-3xl font-bold">{marksPerQuestion}</span>
                                            <span className="text-xl text-green-200">=</span>
                                            <span className="text-5xl font-black">{totalMarks}</span>
                                        </div>
                                        <p className="mt-1 text-green-100">marks</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chapters Tab */}
                        {activeTab === "chapters" && (
                            <div className="animate-in fade-in duration-200">
                                {chapters.length === 0 && !isLoadingChapters ? (
                                    <div className="rounded-xl bg-amber-50 p-6 text-center dark:bg-amber-900/20">
                                        <BookOpen className="mx-auto h-12 w-12 text-amber-500/50" />
                                        <p className="mt-3 font-medium text-amber-800 dark:text-amber-300">
                                            No chapters available
                                        </p>
                                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                                            Please select a subject first, or add chapters to the selected subject.
                                        </p>
                                    </div>
                                ) : (
                                    <ChapterSelector
                                        chapters={chapters}
                                        chapterConfigs={chapterConfigs}
                                        onConfigChange={setChapterConfigs}
                                        questionType={questionType}
                                        requiredQuestionCount={questionCount}
                                        isLoading={isLoadingChapters}
                                    />
                                )}
                            </div>
                        )}

                        {/* Instructions Tab */}
                        {activeTab === "instructions" && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div className="rounded-xl bg-primary-50 p-4 dark:bg-primary-900/20">
                                    <p className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-400">
                                        <Lightbulb className="h-4 w-4 shrink-0" />
                                        Instructions are shown to students before attempting this section.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        <span className="flex h-5 w-5 items-center justify-center rounded bg-green-100 text-xs dark:bg-green-900/30">🇬🇧</span>
                                        Instructions (English)
                                    </label>
                                    <textarea
                                        value={instructionsEn}
                                        onChange={(e) => setInstructionsEn(e.target.value)}
                                        rows={3}
                                        placeholder="e.g. Fill in the blanks with correct answers. Each question carries 1 mark."
                                        className="w-full rounded-xl border-0 bg-neutral-50 p-4 text-neutral-900 outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-xs dark:bg-primary-900/30">🇮🇳</span>
                                        Instructions (Marathi)
                                    </label>
                                    <textarea
                                        value={instructionsMr}
                                        onChange={(e) => setInstructionsMr(e.target.value)}
                                        rows={3}
                                        placeholder="e.g. रिकाम्या जागा योग्य उत्तरांनी भरा. प्रत्येक प्रश्न 1 गुणांचा आहे."
                                        className="w-full rounded-xl border-0 bg-neutral-50 p-4 text-neutral-900 outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-neutral-200/50 bg-neutral-50/50 px-6 py-4 dark:border-neutral-700/50 dark:bg-neutral-800/50 shrink-0">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                            <span className="flex items-center gap-1">
                                <span className="text-lg">{questionTypes.find(t => t.value === questionType)?.icon}</span>
                                {questionTypes.find(t => t.value === questionType)?.label}
                            </span>
                            <span className="text-neutral-300 dark:text-neutral-600">|</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{totalMarks} marks</span>
                            {chapterConfigs.length > 0 && (
                                <>
                                    <span className="text-neutral-300 dark:text-neutral-600">|</span>
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        {chapterConfigs.length} chapter{chapterConfigs.length > 1 ? "s" : ""} • {configuredQuestionCount} Q
                                    </span>
                                </>
                            )}
                            {!hasEnoughQuestions && chapterConfigs.length > 0 && (
                                <>
                                    <span className="text-neutral-300 dark:text-neutral-600">|</span>
                                    <span className="text-amber-600 dark:text-amber-400">
                                        ⚠️ {availableQuestions}/{questionCount} available
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="gap-2">
                                <Check className="h-4 w-4" />
                                {section ? "Update Section" : "Add Section"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
