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
    BookOpen,
    ClipboardList,
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
        <div className="space-y-6 pb-20">
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
                    <div className="flex items-center gap-3">
                        <Badge variant={isActive ? "success" : "warning"} size="md" dot>
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={isTemplate ? "info" : "purple"} size="md">
                            {isTemplate ? "Template" : "Assigned"}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="gap-1.5"
                        >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                            className="gap-1.5"
                        >
                            {isSaving ? (
                                <LoaderSpinner size="sm" />
                            ) : (
                                <Save className="h-3.5 w-3.5" />
                            )}
                            {mode === "create" ? "Create" : "Save Changes"}
                        </Button>
                    </div>
                }
            />

            {/* Two-Column Layout */}
            <div className="grid gap-6 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr]">
                {/* Left Column - Config (Sticky on Desktop) */}
                <div className="lg:sticky lg:top-6 lg:self-start space-y-0">
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

                {/* Right Column - Sections */}
                <div>
                    <ExamStructureSectionsList
                        sections={sections}
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
                />
            )}
        </div>
    );
}

// Section Modal Component - Simplified Premium Design
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
    const [chapterConfigs, setChapterConfigs] = useState<ChapterQuestionConfig[]>(section?.chapter_configs || []);
    const [showAdvanced, setShowAdvanced] = useState(false);

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
            instructions_mr: "",
            order_index: section?.order_index || nextIndex,
            chapter_configs: chapterConfigs.length > 0 ? chapterConfigs : undefined,
        });
    };

    const totalMarks = questionCount * marksPerQuestion;

    // All question types in a single grid
    const allQuestionTypes = questionTypes;

    // Check if advanced options have any values set
    const hasAdvancedConfig = chapterConfigs.length > 0 || instructionsEn.trim() || nameMr.trim();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-neutral-900 max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 px-5 py-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    {section ? "Edit Section" : "New Section"}
                                </h3>
                                <p className="text-xs text-neutral-500">Section {section?.order_index || nextIndex}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 rounded-lg bg-success-100 px-3 py-1.5 dark:bg-success-900/30">
                                <span className="text-lg font-bold text-success-700 dark:text-success-400">{totalMarks}</span>
                                <span className="text-xs text-success-600 dark:text-success-400">marks</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all dark:hover:bg-neutral-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 border-b border-neutral-100 px-5 dark:border-neutral-800 shrink-0">
                        <button
                            onClick={() => setShowAdvanced(false)}
                            className={clsx(
                                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
                                !showAdvanced
                                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            )}
                        >
                            Basic Info
                        </button>
                        <button
                            onClick={() => setShowAdvanced(true)}
                            className={clsx(
                                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
                                showAdvanced
                                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            )}
                        >
                            Advanced
                            {hasAdvancedConfig && (
                                <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                    ✓
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Content - Tab Based */}
                    <div className="p-5 space-y-5 overflow-y-auto flex-1">
                        {!showAdvanced ? (
                            /* Basic Info Tab */
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
                                        className="w-full h-10 rounded-lg border border-neutral-200 px-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                        autoFocus
                                    />
                                </div>

                                {/* Question Type - Compact Grid */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Question Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {allQuestionTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => setQuestionType(type.value)}
                                                className={clsx(
                                                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                                    questionType === type.value
                                                        ? "bg-primary-100 text-primary-700 ring-2 ring-primary-500 dark:bg-primary-900/30 dark:text-primary-400"
                                                        : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                <span className="text-base">{type.icon}</span>
                                                <span className="truncate">{type.label.replace('MCQ ', '').replace('(', '').replace(')', '')}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Marks Configuration - Inline */}
                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Questions
                                        </label>
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
                                                className="h-10 w-14 border-y border-neutral-200 text-center font-medium text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                            />
                                            <button
                                                onClick={() => setQuestionCount(questionCount + 1)}
                                                className="flex h-10 w-10 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Marks Each
                                        </label>
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
                                                className="h-10 w-14 border-y border-neutral-200 text-center font-medium text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                            />
                                            <button
                                                onClick={() => setMarksPerQuestion(marksPerQuestion + 1)}
                                                className="flex h-10 w-10 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Total
                                        </label>
                                        <div className="flex h-10 items-center justify-center rounded-lg bg-success-100 font-bold text-success-700 dark:bg-success-900/30 dark:text-success-400">
                                            {totalMarks} marks
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Advanced Tab */
                            <div className="space-y-5 animate-in fade-in duration-200">
                                {/* Marathi Name */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Name (Marathi)
                                    </label>
                                    <input
                                        type="text"
                                        value={nameMr}
                                        onChange={(e) => setNameMr(e.target.value)}
                                        placeholder="e.g., रिकाम्या जागा भरा"
                                        className="w-full h-10 rounded-lg border border-neutral-200 px-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    />
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Instructions (Optional)
                                    </label>
                                    <p className="mb-2 text-xs text-neutral-500">
                                        Instructions shown to students before attempting this section.
                                    </p>
                                    <textarea
                                        value={instructionsEn}
                                        onChange={(e) => setInstructionsEn(e.target.value)}
                                        rows={3}
                                        placeholder="e.g., Fill in the blanks with the correct answer..."
                                        className="w-full rounded-lg border border-neutral-200 p-3 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    />
                                </div>

                                {/* Chapter Selection */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Chapters ({chapterConfigs.length} selected)
                                    </label>
                                    {isLoadingChapters ? (
                                        <div className="flex items-center justify-center py-8">
                                            <LoaderSpinner />
                                        </div>
                                    ) : chapters.length === 0 ? (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-900/20">
                                            <BookOpen className="mx-auto h-8 w-8 text-amber-500/50" />
                                            <p className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                                                No chapters available
                                            </p>
                                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                                Select a subject first to see chapters.
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
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-5 py-4 dark:border-neutral-700 dark:bg-neutral-800/50 shrink-0">
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <span>{allQuestionTypes.find(t => t.value === questionType)?.icon}</span>
                            <span>{allQuestionTypes.find(t => t.value === questionType)?.label}</span>
                            <span className="text-neutral-300 dark:text-neutral-600">•</span>
                            <span className="font-medium text-neutral-700 dark:text-neutral-300">{totalMarks} marks</span>
                            {chapterConfigs.length > 0 && (
                                <>
                                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                    <span className="text-primary-600 dark:text-primary-400">{chapterConfigs.length} chapters</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} className="gap-1.5">
                                <Check className="h-4 w-4" />
                                {section ? "Save Changes" : "Add Section"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
