// Client-side only — no server secrets or database access here

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
    Minus,
    Plus,
    Save,
    X,
    Check,
    BookOpen,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Sparkles,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { Button } from '@/client/components/ui/button';
import { useChaptersWithCounts, useCreateExamStructure, useUpdateExamStructure } from "@/client/hooks";
import { ChapterSelector, type ChapterQuestionConfig, type ChapterWithCount } from '@/client/components/features/subjects/chapter-selector';
import { type QuestionType } from "@/client/types/questions";
import { ExamStructureFormFields } from './exam-structure-form-fields';
import { ExamStructureSectionsList } from './exam-structure-sections-list';
import { PageHeader, Badge } from '@/client/components/ui/premium';

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
    /** Manually selected question IDs for this section */
    selected_question_ids?: string[];
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

    // State Hooks first (Best Practice)
    const [subjectId, setSubjectId] = useState(initialData?.subject_id || "");
    const [classLevelId, setClassLevelId] = useState(initialData?.class_level_id || "");
    const [nameEn, setNameEn] = useState(initialData?.name_en || "");
    const [nameMr, setNameMr] = useState(initialData?.name_mr || "");
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
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Premium Header */}
            <PageHeader
                title={mode === "edit" ? (nameEn || "Edit Blueprint") : "Create New Blueprint"}
                description={mode === "edit" 
                    ? (nameMr || "Configure section logic, marking schemes, and question distributions")
                    : "Design a new exam structure with sections and question types"
                }
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Exam Blueprints", href: "/dashboard/exam-structures" },
                    { label: mode === "edit" ? "Edit" : "Create" },
                ]}
                action={
                    <div className="flex items-center gap-2">
                        {/* Status Badges */}
                        <div className="flex items-center gap-1.5 mr-2">
                            <Badge variant={isActive ? "success" : "warning"} size="sm" dot>
                                {isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant={isTemplate ? "info" : "purple"} size="sm">
                                {isTemplate ? "Template" : "Assigned"}
                            </Badge>
                        </div>
                        {/* Action Buttons */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="gap-1.5 text-neutral-600 hover:text-neutral-900"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                            className="gap-1.5 px-4"
                        >
                            {isSaving ? (
                                <LoaderSpinner size="sm" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {mode === "create" ? "Create Blueprint" : "Save Changes"}
                        </Button>
                    </div>
                }
            />

            {/* Full Width Split Layout */}
            <div className="flex">
                {/* Left Panel - Config (Fixed Width) */}
                <div className="w-[400px] shrink-0 border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                    <div className="p-6">
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
                        totalMarks={totalMarks}
                        totalQuestions={totalQuestions}
                        sectionsCount={sections.length}
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
                    </div>
                </div>

                {/* Right Panel - Sections (Flexible Width) */}
                <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                    <ExamStructureSectionsList
                        sections={sections}
                        examStructureId={mode === "edit" ? initialData?.id : undefined}
                        onAddSection={addSection}
                        onEditSection={editSection}
                        onDeleteSection={deleteSection}
                        onMoveSection={moveSection}
                    />
                </div>
            </div>

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
                    allChapters={chapters || []}
                />
            )}
        </div>
    );
}

// Custom Question Type Dropdown Component
function QuestionTypeDropdown({
    value,
    onChange,
    chapters,
}: {
    value: QuestionType;
    onChange: (type: QuestionType) => void;
    chapters: ChapterWithCount[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calculate available questions per type from all chapters
    const getAvailableCount = (type: QuestionType): number => {
        return chapters.reduce((sum, ch) => sum + (ch.question_counts?.[type] || 0), 0);
    };

    const selectedType = questionTypes.find(t => t.value === value);
    const availableForSelected = getAvailableCount(value);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    isOpen
                        ? "border-primary-500 ring-2 ring-primary-500/20"
                        : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                )}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900 dark:text-white">
                            {selectedType?.label}
                        </span>
                        {availableForSelected > 0 ? (
                            <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-900/30 dark:text-success-400">
                                {availableForSelected} available
                            </span>
                        ) : (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                0 available
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{selectedType?.description}</p>
                </div>
                <ChevronDown className={clsx(
                    "h-5 w-5 text-neutral-400 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 max-h-[300px] overflow-y-auto">
                        {questionTypes.map((type) => {
                            const available = getAvailableCount(type.value);
                            const isSelected = type.value === value;
                            const hasQuestions = available > 0;

                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(type.value);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                                        isSelected
                                            ? "bg-primary-50 dark:bg-primary-900/20"
                                            : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                                    )}
                                >
                                    {/* Selection Indicator */}
                                    <div className={clsx(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                        isSelected
                                            ? "border-primary-600 bg-primary-600"
                                            : "border-neutral-300 dark:border-neutral-600"
                                    )}>
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "font-medium",
                                                isSelected
                                                    ? "text-primary-700 dark:text-primary-400"
                                                    : "text-neutral-900 dark:text-white"
                                            )}>
                                                {type.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                            {type.description}
                                        </p>
                                    </div>

                                    {/* Count Badge */}
                                    <div className={clsx(
                                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                                        hasQuestions
                                            ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                                    )}>
                                        {available}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// Section Modal Component - Stepper Design
function SectionModal({
    section,
    chapters,
    isLoadingChapters,
    onSave,
    onClose,
    nextIndex,
    allChapters,
}: {
    section: Section | null;
    chapters: ChapterWithCount[];
    isLoadingChapters: boolean;
    onSave: (section: Section) => void;
    onClose: () => void;
    nextIndex: number;
    allChapters: ChapterWithCount[];
}) {
    const [currentStep, setCurrentStep] = useState(1);
    const [nameEn, setNameEn] = useState(section?.name_en || "");
    const [nameMr, setNameMr] = useState(section?.name_mr || "");
    const [questionType, setQuestionType] = useState<QuestionType>(
        section?.question_type || "fill_blank"
    );
    const [questionCount, setQuestionCount] = useState(section?.question_count || 10);
    const [marksPerQuestion, setMarksPerQuestion] = useState(section?.marks_per_question || 1);
    const [instructionsEn, setInstructionsEn] = useState(section?.instructions_en || "");
    const [chapterConfigs, setChapterConfigs] = useState<ChapterQuestionConfig[]>(section?.chapter_configs || []);

    // Calculate total available questions for selected type
    const totalAvailable = allChapters.reduce(
        (sum, ch) => sum + (ch.question_counts?.[questionType] || 0),
        0
    );

    const handleSave = () => {
        if (!nameEn.trim()) {
            toast.error("Please enter a section name");
            setCurrentStep(1);
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
            instructions_mr: "",
            order_index: section?.order_index || nextIndex,
            chapter_configs: chapterConfigs.length > 0 ? chapterConfigs : undefined,
        });
    };

    const totalMarks = questionCount * marksPerQuestion;

    // Step configuration
    const steps = [
        { number: 1, label: "Type & Marks", description: "Question type and scoring" },
        { number: 2, label: "Details", description: "Name and instructions" },
        { number: 3, label: "Chapters", description: "Source selection (optional)" },
    ];

    const canProceed = currentStep === 1 ? true : currentStep === 2 ? nameEn.trim() !== "" : true;
    const isLastStep = currentStep === 3;

    const handleNext = () => {
        if (currentStep === 2 && !nameEn.trim()) {
            toast.error("Please enter a section name");
            return;
        }
        if (!isLastStep) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSave();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-neutral-900 max-h-[85vh] flex flex-col">
                    {/* Header with Stepper */}
                    <div className="border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        {section ? "Edit Section" : "New Section"}
                                    </h3>
                                    <p className="text-xs text-neutral-500">Section {section?.order_index || nextIndex}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all dark:hover:bg-neutral-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex items-center gap-2">
                            {steps.map((step, idx) => (
                                <div key={step.number} className="flex items-center flex-1">
                                    <button
                                        onClick={() => setCurrentStep(step.number)}
                                        className={clsx(
                                            "flex items-center gap-2 w-full rounded-lg px-3 py-2 transition-all",
                                            currentStep === step.number
                                                ? "bg-primary-50 dark:bg-primary-900/20"
                                                : currentStep > step.number
                                                    ? "bg-success-50 dark:bg-success-900/10"
                                                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                        )}
                                    >
                                        <div className={clsx(
                                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                                            currentStep === step.number
                                                ? "bg-primary-600 text-white"
                                                : currentStep > step.number
                                                    ? "bg-success-500 text-white"
                                                    : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                                        )}>
                                            {currentStep > step.number ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                step.number
                                            )}
                                        </div>
                                        <span className={clsx(
                                            "text-xs font-medium hidden sm:block",
                                            currentStep === step.number
                                                ? "text-primary-700 dark:text-primary-400"
                                                : "text-neutral-500"
                                        )}>
                                            {step.label}
                                        </span>
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <ChevronRight className="h-4 w-4 text-neutral-300 mx-1 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Step 1: Type & Marks */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                {/* Question Type - Custom Dropdown */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Question Type
                                    </label>
                                    <QuestionTypeDropdown
                                        value={questionType}
                                        onChange={setQuestionType}
                                        chapters={allChapters}
                                    />
                                    {totalAvailable === 0 && (
                                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                                No questions of this type are available yet. You can still create the section and add questions later.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Marks Configuration */}
                                <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                                    <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Scoring Configuration
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-xs text-neutral-500">Questions</label>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                                                    className="flex h-10 w-10 items-center justify-center rounded-l-lg border border-r-0 border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={questionCount}
                                                    onChange={(e) => setQuestionCount(Math.max(1, Number(e.target.value)))}
                                                    className="h-10 w-full border-y border-neutral-200 text-center font-bold text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                                />
                                                <button
                                                    onClick={() => setQuestionCount(questionCount + 1)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs text-neutral-500">Marks Each</label>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => setMarksPerQuestion(Math.max(1, marksPerQuestion - 1))}
                                                    className="flex h-10 w-10 items-center justify-center rounded-l-lg border border-r-0 border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={marksPerQuestion}
                                                    onChange={(e) => setMarksPerQuestion(Math.max(1, Number(e.target.value)))}
                                                    className="h-10 w-full border-y border-neutral-200 text-center font-bold text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                                />
                                                <button
                                                    onClick={() => setMarksPerQuestion(marksPerQuestion + 1)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs text-neutral-500">Total</label>
                                            <div className="flex h-10 items-center justify-center rounded-lg bg-success-100 font-bold text-lg text-success-700 dark:bg-success-900/30 dark:text-success-400">
                                                {totalMarks}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {currentStep === 2 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                {/* Section Name */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Section Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={nameEn}
                                        onChange={(e) => setNameEn(e.target.value)}
                                        placeholder="e.g., Fill in the Blanks"
                                        className="w-full h-11 rounded-xl border border-neutral-200 px-4 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                        autoFocus
                                    />
                                    <p className="mt-1.5 text-xs text-neutral-500">
                                        This name will be shown to students during the exam.
                                    </p>
                                </div>

                                {/* Marathi Name (Optional) */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Name in Marathi <span className="text-neutral-400">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nameMr}
                                        onChange={(e) => setNameMr(e.target.value)}
                                        placeholder="e.g., रिकाम्या जागा भरा"
                                        className="w-full h-11 rounded-xl border border-neutral-200 px-4 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    />
                                </div>

                                {/* Instructions (Optional) */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Instructions <span className="text-neutral-400">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={instructionsEn}
                                        onChange={(e) => setInstructionsEn(e.target.value)}
                                        rows={3}
                                        placeholder="e.g., Fill in the blanks with the correct answer."
                                        className="w-full rounded-xl border border-neutral-200 p-4 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white resize-none"
                                    />
                                </div>

                                {/* Summary Card */}
                                <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Section Summary</span>
                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {questionCount} × {marksPerQuestion} = <span className="text-success-600 dark:text-success-400">{totalMarks} marks</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Chapters */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                {isLoadingChapters ? (
                                    <div className="flex items-center justify-center py-12">
                                        <LoaderSpinner />
                                    </div>
                                ) : chapters.length === 0 ? (
                                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
                                        <BookOpen className="mx-auto h-10 w-10 text-neutral-400" />
                                        <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            No chapters available
                                        </p>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Select a subject first to see available chapters.
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
                    </div>

                    {/* Footer with Navigation */}
                    <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800/50 shrink-0">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {questionTypes.find(t => t.value === questionType)?.shortLabel}
                            </span>
                            <span className="text-neutral-300 dark:text-neutral-600">•</span>
                            <span className="text-success-600 dark:text-success-400 font-medium">{totalMarks} marks</span>
                            {chapterConfigs.length > 0 && (
                                <>
                                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                    <span className="text-primary-600 dark:text-primary-400">{chapterConfigs.length} ch</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {currentStep > 1 ? (
                                <Button variant="outline" size="sm" onClick={handleBack}>
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" onClick={onClose}>
                                    Cancel
                                </Button>
                            )}
                            <Button 
                                size="sm" 
                                onClick={handleNext} 
                                disabled={!canProceed}
                                className="gap-1.5"
                            >
                                {isLastStep ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        {section ? "Save" : "Add Section"}
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
