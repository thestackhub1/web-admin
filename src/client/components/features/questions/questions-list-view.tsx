"use client";

import { useRouter } from "next/navigation";
import {
    MoreHorizontal,
    ExternalLink,
    Target,
    Zap,
    BookOpen,
    GraduationCap,
    Monitor,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import {
    DataTableContainer,
    DataTable,
    DataTableHead,
    DataTableHeadCell,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    SkeletonTable,
    Badge,
} from "@/client/components/ui/premium";
import { Button } from "@/client/components/ui/button";
import { Question } from "@/client/hooks/use-questions";
import { format } from "date-fns";

// ============================================
// Types
// ============================================

interface QuestionsListViewProps {
    questions: Question[];
    isLoading?: boolean;
    page: number;
    total: number; // Approximate total for pagination if needed, or just length
    onPageChange: (page: number) => void;
    limit: number;
}

// ============================================
// Helpers
// ============================================

const SubjectIconMap: Record<string, any> = {
    scholarship: GraduationCap,
    english: BookOpen,
    "information-technology": Monitor,
    "information_technology": Monitor,
};

const DifficultyColorMap: Record<string, "success" | "warning" | "error"> = {
    easy: "success",
    medium: "warning",
    hard: "error",
};

// ============================================
// Main Component
// ============================================

export function QuestionsListView({
    questions,
    isLoading = false,
    page,
    onPageChange,
    limit,
}: QuestionsListViewProps) {
    const router = useRouter();

    // Ensure questions is always an array
    const questionsList = Array.isArray(questions) ? questions : [];

    const handleRowClick = (question: Question) => {
        router.push(`/dashboard/questions/${question.subject?.slug || 'english'}/${question.id}`);
    };

    if (isLoading) {
        return (
            <DataTableContainer>
                <SkeletonTable rows={10} />
            </DataTableContainer>
        );
    }

    return (
        <DataTableContainer>
            <DataTable>
                <DataTableHead>
                    <tr>
                        <DataTableHeadCell>Question</DataTableHeadCell>
                        <DataTableHeadCell>Subject</DataTableHeadCell>
                        <DataTableHeadCell>Difficulty</DataTableHeadCell>
                        <DataTableHeadCell>Marks</DataTableHeadCell>
                        <DataTableHeadCell>Status</DataTableHeadCell>
                        <DataTableHeadCell>Added</DataTableHeadCell>
                        <DataTableHeadCell className="w-12"></DataTableHeadCell>
                    </tr>
                </DataTableHead>

                <DataTableBody>
                    {questionsList.length === 0 ? (
                        <DataTableRow>
                            <DataTableCell colSpan={7} className="text-center py-12">
                                <p className="text-neutral-500">No questions found</p>
                            </DataTableCell>
                        </DataTableRow>
                    ) : (
                        questionsList.map((question) => {
                            const SubjectIcon = SubjectIconMap[question.subject?.slug || 'english'] || BookOpen;

                            return (
                                <DataTableRow
                                    key={question.id}
                                    onClick={() => handleRowClick(question)}
                                    className="cursor-pointer"
                                >
                                    {/* Question Text */}
                                    <DataTableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                                <SubjectIcon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 max-w-[300px]">
                                                <p className="font-medium text-neutral-900 dark:text-white truncate">
                                                    {question.question_text || (question as any).question_text_en || "Untitled Question"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="purple" size="sm" className="opacity-80">
                                                        {question.question_type?.replace(/_/g, " ")}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </DataTableCell>

                                    {/* Subject */}
                                    <DataTableCell>
                                        <span className="text-neutral-700 dark:text-neutral-300">
                                            {question.subject?.name || "—"}
                                        </span>
                                    </DataTableCell>

                                    {/* Difficulty */}
                                    <DataTableCell>
                                        <Badge variant={DifficultyColorMap[question.difficulty] || "default"} size="sm" className="capitalize">
                                            {question.difficulty}
                                        </Badge>
                                    </DataTableCell>

                                    {/* Marks */}
                                    <DataTableCell>
                                        <span className="font-medium text-neutral-900 dark:text-white">
                                            {question.marks}
                                        </span>
                                    </DataTableCell>

                                    {/* Status */}
                                    <DataTableCell>
                                        {question.is_active ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                                <CheckCircle className="h-4 w-4" />
                                                Active
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-neutral-500 text-sm font-medium">
                                                <XCircle className="h-4 w-4" />
                                                Inactive
                                            </div>
                                        )}
                                    </DataTableCell>

                                    {/* Date */}
                                    <DataTableCell>
                                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {question.created_at ? format(new Date(question.created_at), "MMM d, yyyy") : "—"}
                                            </span>
                                        </div>
                                    </DataTableCell>

                                    {/* Actions */}
                                    <DataTableCell>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Navigate to detail
                                                    handleRowClick(question);
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700"
                                                title="View Details"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700"
                                                title="More Options"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        })
                    )}
                </DataTableBody>
            </DataTable>

            {/* Pagination Controls - Simplified for Questions since we rely on external state */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/30">
                <p className="text-sm text-neutral-500">
                    Page <span className="font-medium text-neutral-900 dark:text-white">{page}</span>
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={questions.length < limit || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </DataTableContainer>
    );
}
