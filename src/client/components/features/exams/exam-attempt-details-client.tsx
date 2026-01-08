"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { clsx } from "clsx";
import { useDeleteExamAttempt } from "@/client/hooks/use-exam-attempts";
import { 
  formatUserAnswer, 
  formatCorrectAnswer, 
  isOptionSelected, 
  isBooleanSelected,
  checkAnswer,
  parseAnswerData
} from '@/client/utils/exam-utils';

// ============================================
// Types
// ============================================
interface ExamAnswer {
  id: string;
  exam_id: string;
  question_id: string;
  question_table: string;
  user_answer: any;
  is_correct: boolean | null;
  marks_obtained: number;
  created_at: string;
  question?: {
    id: string;
    question_text: string;
    question_language: "en" | "mr";
    question_type: string;
    answer_data: any;
    marks: number;
    explanation?: string | null; // Single explanation field (language matches question_language)
    chapter?: {
      name_en: string;
      name_mr: string;
    };
  };
}

interface ExamAttemptDetailsClientProps {
  examId: string;
  answers: ExamAnswer[];
  status: string;
}

// ============================================
// Question Type Labels
// ============================================
const questionTypeLabels: Record<string, string> = {
  mcq_single: "Multiple Choice",
  mcq_multiple: "Multi-Select",
  mcq_two: "MCQ (2 answers)",
  mcq_three: "MCQ (3 answers)",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
  match: "Match the Following",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  programming: "Programming",
};

// ============================================
// Answer Display Component
// ============================================
function AnswerCard({ 
  answer, 
  index, 
  showExplanations 
}: { 
  answer: ExamAnswer; 
  index: number;
  showExplanations: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const question = answer.question;

  if (!question) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
        <p className="text-sm text-neutral-500">Question data not available</p>
      </div>
    );
  }

  // Parse answer_data - handles both string and object formats from database
  const answerData = parseAnswerData(question.answer_data);

  // Recalculate is_correct using exam-utils library for accuracy
  // This ensures correct display even if stored value is wrong
  const isCorrect = answer.user_answer !== null && answer.user_answer !== undefined
    ? checkAnswer(
        { 
          id: question.id, 
          question_type: question.question_type, 
          answer_data: question.answer_data 
        }, 
        answer.user_answer
      )
    : null;

  const getStatusConfig = () => {
    if (isCorrect === true) {
      return {
        icon: CheckCircle2,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        label: "Correct",
        stripColor: "bg-green-500",
      };
    } else if (isCorrect === false) {
      return {
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        label: "Incorrect",
        stripColor: "bg-red-500",
      };
    }
    return {
      icon: HelpCircle,
      color: "text-neutral-500",
      bgColor: "bg-neutral-50 dark:bg-neutral-800/50",
      borderColor: "border-neutral-200 dark:border-neutral-700",
      label: "Not Answered",
      stripColor: "bg-neutral-400",
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  // Use the library functions for formatting - wrap for JSX compatibility
  const renderUserAnswer = (userAnswer: any, type: string, answerData: any) => {
    const formatted = formatUserAnswer(userAnswer, type, answerData);
    if (formatted === "No answer provided") {
      return <span className="italic text-neutral-400">No answer provided</span>;
    }
    if (formatted === "Invalid answer") {
      return <span className="italic text-neutral-400">Invalid answer</span>;
    }
    if (type === "programming") {
      return <pre className="text-xs overflow-auto max-h-20">{formatted}</pre>;
    }
    return formatted;
  };

  const renderCorrectAnswer = (type: string, answerData: any) => {
    return formatCorrectAnswer(type, answerData);
  };

  return (
    <div className={clsx(
      "relative overflow-hidden rounded-xl border transition-all duration-200",
      status.bgColor,
      status.borderColor,
      isExpanded && "ring-2 ring-blue-200 dark:ring-blue-800"
    )}>
      {/* Status strip */}
      <div className={clsx("absolute left-0 top-0 h-full w-1", status.stripColor)} />

      {/* Main content */}
      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white font-bold text-neutral-700 shadow-sm dark:bg-neutral-800 dark:text-neutral-300">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
                {question.question_text}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {questionTypeLabels[question.question_type] || question.question_type}
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">{question.marks} marks</span>
                {question.chapter && (
                  <>
                    <span className="text-neutral-400">•</span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      <BookOpen className="h-3 w-3" />
                      {question.chapter.name_en}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={clsx(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            status.color,
            "bg-white dark:bg-neutral-800"
          )}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
            <span className="ml-1 font-bold">
              +{answer.marks_obtained}
            </span>
          </div>
        </div>

        {/* Available Options (for MCQ types) */}
        {["mcq_single", "mcq_multiple", "mcq_two", "mcq_three"].includes(question.question_type) && 
          answerData?.options && (
          <div className="mt-4">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              Available Options
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {answerData.options.map((option: string, idx: number) => {
                const isCorrectOption = Array.isArray(answerData.correct)
                  ? answerData.correct.includes(idx)
                  : answerData.correct === idx;
                
                // Use library function for consistent answer detection
                const isUserSelected = isOptionSelected(
                  answer.user_answer, 
                  idx, 
                  answerData.options || []
                );
                
                return (
                  <div
                    key={idx}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-all",
                      isCorrectOption && isUserSelected
                        ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                        : isCorrectOption
                        ? "border-green-300 bg-green-50/50 dark:border-green-700/50 dark:bg-green-900/10"
                        : isUserSelected
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                        : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
                    )}
                  >
                    <span className={clsx(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isCorrectOption
                        ? "bg-green-500 text-white"
                        : isUserSelected
                        ? "bg-red-500 text-white"
                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={clsx(
                      "flex-1",
                      isCorrectOption
                        ? "text-green-700 dark:text-green-400"
                        : isUserSelected
                        ? "text-red-700 dark:text-red-400"
                        : "text-neutral-700 dark:text-neutral-300"
                    )}>
                      {option}
                    </span>
                    {isCorrectOption && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                    {isUserSelected && !isCorrectOption && (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Answer Summary for MCQ */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Student&apos;s Answer
                </p>
                <p className={clsx(
                  "text-sm font-medium",
                  isCorrect === true ? "text-green-600 dark:text-green-400" : 
                  isCorrect === false ? "text-red-600 dark:text-red-400" : 
                  "text-neutral-600 dark:text-neutral-300"
                )}>
                  {renderUserAnswer(answer.user_answer, question.question_type, question.answer_data)}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Correct Answer
                </p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {renderCorrectAnswer(question.question_type, question.answer_data)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* True/False Options */}
        {question.question_type === "true_false" && (
          <div className="mt-4">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              Options
            </p>
            <div className="flex gap-3">
              {[true, false].map((val) => {
                const isCorrectOption = answerData?.correct === val;
                
                // Use library function for consistent boolean detection
                const isUserSelected = isBooleanSelected(answer.user_answer, val);
                
                return (
                  <div
                    key={String(val)}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      isCorrectOption && isUserSelected
                        ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : isCorrectOption
                        ? "border-green-300 bg-green-50/50 text-green-600 dark:border-green-700/50 dark:bg-green-900/10 dark:text-green-400"
                        : isUserSelected
                        ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                    )}
                  >
                    {val ? "True" : "False"}
                    {isCorrectOption && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {isUserSelected && !isCorrectOption && <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                );
              })}
            </div>
            {/* Answer Summary for True/False */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Student&apos;s Answer
                </p>
                <p className={clsx(
                  "text-sm font-medium",
                  isCorrect === true ? "text-green-600 dark:text-green-400" : 
                  isCorrect === false ? "text-red-600 dark:text-red-400" : 
                  "text-neutral-600 dark:text-neutral-300"
                )}>
                  {renderUserAnswer(answer.user_answer, question.question_type, question.answer_data)}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Correct Answer
                </p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {renderCorrectAnswer(question.question_type, question.answer_data)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Answer Summary (for non-MCQ types) */}
        {!["mcq_single", "mcq_multiple", "mcq_two", "mcq_three", "true_false"].includes(question.question_type) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-3 dark:bg-neutral-800">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Student&apos;s Answer
              </p>
              <p className={clsx(
                "text-sm font-medium",
                isCorrect === true ? "text-green-600 dark:text-green-400" : 
                isCorrect === false ? "text-red-600 dark:text-red-400" : 
                "text-neutral-600 dark:text-neutral-300"
              )}>
                {renderUserAnswer(answer.user_answer, question.question_type, question.answer_data)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 dark:bg-neutral-800">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Correct Answer
              </p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {renderCorrectAnswer(question.question_type, question.answer_data)}
              </p>
            </div>
          </div>
        )}

        {/* Explanation (if enabled) */}
        {showExplanations && question.explanation && (
          <div className="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Explanation ({question.question_language === "mr" ? "Marathi" : "English"})
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export function ExamAttemptDetailsClient({ 
  examId, 
  answers, 
  status: _status 
}: ExamAttemptDetailsClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");
  const { mutateAsync: deleteExamAttempt } = useDeleteExamAttempt();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    const result = await deleteExamAttempt({ id: examId });
    
    if (result?.success) {
      toast.success("Exam attempt deleted successfully");
      router.push("/dashboard/exams");
    } else {
      toast.error("Failed to delete exam attempt");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Filter answers
  const filteredAnswers = answers.filter((a) => {
    switch (filter) {
      case "correct":
        return a.is_correct === true;
      case "incorrect":
        return a.is_correct === false;
      case "skipped":
        return a.is_correct === null;
      default:
        return true;
    }
  });

  const correctCount = answers.filter((a) => a.is_correct === true).length;
  const incorrectCount = answers.filter((a) => a.is_correct === false).length;
  const skippedCount = answers.filter((a) => a.is_correct === null).length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Question-wise Analysis
          </h3>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {answers.length} questions
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Explanations */}
          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              showExplanations 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            )}
          >
            {showExplanations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Explanations
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-all hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All", count: answers.length },
          { key: "correct", label: "Correct", count: correctCount, color: "text-green-600" },
          { key: "incorrect", label: "Incorrect", count: incorrectCount, color: "text-red-600" },
          { key: "skipped", label: "Skipped", count: skippedCount, color: "text-neutral-500" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              filter === tab.key
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            )}
          >
            {tab.label}
            <span className={clsx(
              "rounded-full px-1.5 py-0.5 text-xs",
              filter === tab.key
                ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                : "bg-white text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Answers List */}
      {filteredAnswers.length > 0 ? (
        <div className="space-y-3">
          {filteredAnswers.map((answer) => (
            <AnswerCard 
              key={answer.id} 
              answer={answer} 
              index={answers.indexOf(answer)}
              showExplanations={showExplanations}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
          <p className="text-neutral-500 dark:text-neutral-400">
            No answers match the selected filter
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Delete Exam Attempt
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to delete this exam attempt? This will permanently remove 
              the student&apos;s answers and score from the system.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <LoaderSpinner size="sm" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
