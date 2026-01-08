"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
    ArrowLeft,
    Download,
    FileText,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Printer,
    Copy,
    Check,
    AlertCircle,
    RefreshCw,
    X,
    Lightbulb,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { toast } from "sonner";
import { GlassCard } from '@/client/components/ui/premium';
import { questionTypeLabels } from "@/client/types/questions";
import { ExamPdfGenerator, type PdfLanguage } from "@/lib/pdf";
import { useScheduledExamPreview } from "@/client/hooks/use-scheduled-exams";

interface ExamSection {
    id: string;
    code: string;
    name_en: string;
    name_mr?: string;
    question_type: string;
    question_count: number;
    marks_per_question: number;
    total_marks: number;
    instructions_en?: string;
    instructions_mr?: string;
    order_index: number;
    questions: Question[];
}

interface Question {
    id: string;
    question_text_en: string;
    question_text_mr?: string;
    question_type: string;
    difficulty?: string;
    answer_data?: any;
}

interface ExamPreviewClientProps {
    examId: string;
    examName: string;
    examNameMr?: string;
    subjectName?: string;
    classLevelName?: string;
    totalMarks: number;
    durationMinutes: number;
    passingPercentage?: number;
    backUrl: string;
}

export function ExamPreviewClient({
    examId,
    examName,
    examNameMr,
    subjectName,
    classLevelName,
    totalMarks,
    durationMinutes,
    passingPercentage: _passingPercentage,
    backUrl,
}: ExamPreviewClientProps) {
    const previewHook = useScheduledExamPreview(examId);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pdfLanguage, setPdfLanguage] = useState<PdfLanguage>("en");
    const printRef = useRef<HTMLDivElement>(null);

    const sections = previewHook.data?.sections || [];
    const isLoading = previewHook.loading;
    const error = previewHook.error;

    useEffect(() => {
        if (previewHook.data?.sections) {
            setExpandedSections(new Set(previewHook.data.sections.map((s: ExamSection) => s.id)));
        }
    }, [previewHook.data]);


    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedSections(new Set(sections.map((s) => s.id)));
    };

    const collapseAll = () => {
        setExpandedSections(new Set());
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopyLink = async () => {
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        try {
            // Generate PDF using jsPDF-based generator with selected language
            const pdfGenerator = new ExamPdfGenerator(
                {
                    examName,
                    examNameMr,
                    subjectName,
                    classLevelName,
                    totalMarks,
                    durationMinutes,
                    language: pdfLanguage,
                },
                sections.map(section => ({
                    ...section,
                    questions: section.questions.map(q => ({
                        ...q,
                        question_text: q.question_text_en, // Map from en text
                        question_language: "en" // Default to en
                    }))
                }))
            );

            const blob = pdfGenerator.generate();

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const langSuffix = pdfLanguage === "mr" ? "_MR" : "_EN";
            link.download = `${examName.replace(/[^a-zA-Z0-9]/g, "_")}_Exam_Paper${langSuffix}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("PDF downloaded successfully");
        } catch (err) {
            console.error("PDF generation error:", err);
            toast.error("Failed to generate PDF");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="min-h-screen space-y-6 pb-12">
            {/* Header */}
            <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-6 bg-white/80 px-6 py-4 backdrop-blur-lg dark:bg-neutral-900/80">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={backUrl}
                            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                Exam Preview
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {examName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => previewHook.execute()}
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            <RefreshCw className={clsx("h-4 w-4", isLoading && "animate-spin")} />
                            Regenerate
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Copied!" : "Share"}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>

                        {/* Language Selector for PDF */}
                        <select
                            value={pdfLanguage}
                            onChange={(e) => setPdfLanguage(e.target.value as PdfLanguage)}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            <option value="en">English</option>
                            <option value="mr">मराठी (Marathi)</option>
                        </select>

                        <button
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf || isLoading}
                            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                        >
                            {isGeneratingPdf ? (
                                <LoaderSpinner size="sm" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={expandAll}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                        Expand All
                    </button>
                    <button
                        onClick={collapseAll}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                        Collapse All
                    </button>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 shrink-0" />
                    <span>This preview shows a sample of how questions will appear in the actual exam</span>
                </p>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <LoaderSpinner size="lg" />
                        <p className="mt-3 text-neutral-500">Generating exam preview...</p>
                    </div>
                </div>
            ) : error ? (
                <GlassCard className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <p className="mt-3 font-medium text-neutral-900 dark:text-white">
                        Failed to load preview
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">{error}</p>
                    <button
                        onClick={() => previewHook.execute()}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </GlassCard>
            ) : sections.length === 0 ? (
                <GlassCard className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-neutral-400" />
                    <p className="mt-3 font-medium text-neutral-900 dark:text-white">
                        No questions found
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                        This exam structure has no sections or questions available
                    </p>
                </GlassCard>
            ) : (
                <div ref={printRef} className="space-y-6">
                    {sections.map((section, sectionIndex) => (
                        <div
                            key={section.id}
                            className="section overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="flex w-full items-center justify-between bg-linear-to-r from-neutral-50 to-neutral-100 p-5 text-left transition-all hover:from-neutral-100 hover:to-neutral-150 dark:from-neutral-800 dark:to-neutral-750"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg">
                                        {sectionIndex + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            {section.name_en}
                                        </h3>
                                        {section.name_mr && (
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {section.name_mr}
                                            </p>
                                        )}
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                {questionTypeLabels[section.question_type as keyof typeof questionTypeLabels] || section.question_type}
                                            </span>
                                            <span>•</span>
                                            <span>{section.questions.length} questions</span>
                                            <span>•</span>
                                            <span>{section.marks_per_question} marks each</span>
                                            <span>•</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                                {section.total_marks} marks total
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {section.questions.length}/{section.question_count}
                                    </span>
                                    {expandedSections.has(section.id) ? (
                                        <ChevronUp className="h-5 w-5 text-neutral-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                                    )}
                                </div>
                            </button>

                            {/* Section Instructions */}
                            {section.instructions_en && expandedSections.has(section.id) && (
                                <div className="border-b border-neutral-200 bg-blue-50 px-5 py-3 dark:border-neutral-700 dark:bg-blue-900/20">
                                    <p className="flex items-center gap-2 text-sm italic text-blue-700 dark:text-blue-400">
                                        <FileText className="h-4 w-4 shrink-0" />
                                        <span>{section.instructions_en}</span>
                                    </p>
                                    {section.instructions_mr && (
                                        <p className="mt-1 text-sm italic text-blue-600 dark:text-blue-300">
                                            {section.instructions_mr}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Questions */}
                            {expandedSections.has(section.id) && (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                                    {section.questions.map((question, qIndex) => (
                                        <QuestionCard
                                            key={question.id}
                                            question={question}
                                            index={qIndex + 1}
                                            marks={section.marks_per_question}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Question Card Component
function QuestionCard({
    question,
    index,
    marks,
}: {
    question: Question;
    index: number;
    marks: number;
}) {
    const renderAnswerInput = () => {
        const type = question.question_type;
        const answerData = question.answer_data;

        // MCQ Options
        if (type.startsWith("mcq") && answerData?.options) {
            return (
                <div className="mt-4 space-y-2">
                    {answerData.options.map((option: string, i: number) => (
                        <div
                            key={i}
                            className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                        >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 text-xs font-semibold text-neutral-600 dark:border-neutral-600 dark:text-neutral-400">
                                {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-neutral-700 dark:text-neutral-300">{option}</span>
                        </div>
                    ))}
                </div>
            );
        }

        // True/False
        if (type === "true_false") {
            return (
                <div className="mt-4 flex gap-4">
                    <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-green-400 hover:bg-green-50 dark:border-neutral-700 dark:bg-neutral-800">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">True</span>
                    </div>
                    <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-red-400 hover:bg-red-50 dark:border-neutral-700 dark:bg-neutral-800">
                        <X className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">False</span>
                    </div>
                </div>
            );
        }

        // Fill in the Blanks - single input field
        if (type === "fill_blank") {
            return (
                <div className="mt-4">
                    <div className="h-10 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800" />
                </div>
            );
        }

        // Match Type
        if (type === "match" && answerData?.left_column) {
            return (
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                            Column A
                        </h4>
                        <div className="space-y-2">
                            {answerData.left_column.map((item: string, i: number) => (
                                <div
                                    key={i}
                                    className="rounded-lg bg-blue-50 p-3 text-sm text-neutral-700 dark:bg-blue-900/20 dark:text-neutral-300"
                                >
                                    {i + 1}. {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                            Column B
                        </h4>
                        <div className="space-y-2">
                            {answerData.right_column.map((item: string, i: number) => (
                                <div
                                    key={i}
                                    className="rounded-lg bg-amber-50 p-3 text-sm text-neutral-700 dark:bg-amber-900/20 dark:text-neutral-300"
                                >
                                    {String.fromCharCode(65 + i)}. {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Short/Long Answer
        if (type === "short_answer") {
            return (
                <div className="mt-4">
                    <div className="h-20 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800" />
                </div>
            );
        }

        if (type === "long_answer") {
            return (
                <div className="mt-4">
                    <div className="h-40 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800" />
                </div>
            );
        }

        // Programming
        if (type === "programming") {
            return (
                <div className="mt-4">
                    <div className="h-48 rounded-lg border border-neutral-300 bg-neutral-900 p-4 dark:border-neutral-600">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <span className="text-green-400">//</span> Write your code here
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="question p-5 transition-all hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
            {/* Question Header */}
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                        {index}
                    </span>
                    {question.difficulty && (
                        <span
                            className={clsx(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                question.difficulty === "easy" &&
                                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                question.difficulty === "medium" &&
                                "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                question.difficulty === "hard" &&
                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                        >
                            {question.difficulty}
                        </span>
                    )}
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {marks} {marks === 1 ? "mark" : "marks"}
                </span>
            </div>

            {/* Question Text */}
            <div className="question-text">
                <div className="flex items-center gap-2">
                    <p className="text-neutral-900 dark:text-white">
                        {question.question_text_en}
                    </p>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        EN
                    </span>
                </div>
                {question.question_text_mr && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {question.question_text_mr}
                    </p>
                )}
            </div>

            {/* Answer Input */}
            {renderAnswerInput()}
        </div>
    );
}
