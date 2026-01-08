/**
 * Exam Attempts List View - Premium DataTable with Pagination
 * 
 * A scalable list view using DataTable components for displaying exam attempts.
 * Includes pagination, loading states, and row click navigation.
 */

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Check,
  Timer,
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
import { LoaderSpinner } from "@/client/components/ui/loader";
import { usePagination } from "@/client/hooks/use-pagination";
import type { ExamAttempt } from "./exam-attempts-client";

// ============================================
// Types
// ============================================

interface ExamAttemptsListViewProps {
  exams: ExamAttempt[];
  isLoading?: boolean;
  pageSize?: number;
  isStudent?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}

// ============================================
// Status Configuration
// ============================================

const statusConfig: Record<string, { 
  label: string; 
  variant: "default" | "success" | "warning" | "error" | "info"; 
  icon: React.ElementType 
}> = {
  completed: {
    label: "Completed",
    variant: "success",
    icon: CheckCircle2
  },
  in_progress: {
    label: "In Progress",
    variant: "warning",
    icon: Clock
  },
  abandoned: {
    label: "Abandoned",
    variant: "error",
    icon: AlertCircle
  },
};

const defaultStatus = {
  label: "Unknown",
  variant: "default" as const,
  icon: FileText
};

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || defaultStatus;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size="sm" className="gap-1.5">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ============================================
// Avatar Component
// ============================================

function UserAvatar({ 
  name, 
  email, 
  avatarUrl 
}: { 
  name: string | null; 
  email: string | null; 
  avatarUrl: string | null;
}) {
  const getInitials = () => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "S";
  };

  const getGradient = () => {
    const gradients = [
      "from-primary-400 to-primary-600",
      "from-insight-400 to-insight-600",
      "from-success-400 to-success-600",
      "from-warning-400 to-warning-600",
      "from-primary-500 to-insight-500",
    ];
    const index = (name?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
      />
    );
  }

  return (
    <div className={clsx(
      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white",
      "bg-linear-to-br shadow-sm",
      getGradient()
    )}>
      {getInitials()}
    </div>
  );
}

// ============================================
// Pagination Controls Component
// ============================================

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

function PaginationControls({
  page,
  pageSize,
  totalPages,
  totalItems,
  hasNextPage,
  hasPreviousPage,
  goToPage,
  nextPage,
  previousPage,
}: PaginationControlsProps) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/30">
      <p className="text-sm text-neutral-500">
        Showing{" "}
        <span className="font-medium text-neutral-900 dark:text-white">
          {Math.min((page - 1) * pageSize + 1, totalItems)}
        </span>{" "}
        to{" "}
        <span className="font-medium text-neutral-900 dark:text-white">
          {Math.min(page * pageSize, totalItems)}
        </span>{" "}
        of{" "}
        <span className="font-medium text-neutral-900 dark:text-white">
          {totalItems}
        </span>{" "}
        attempts
      </p>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={previousPage}
          disabled={!hasPreviousPage}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={clsx(
                "h-8 w-8 text-sm font-medium rounded-lg transition-all",
                page === pageNum
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              {pageNum}
            </button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={!hasNextPage}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ExamAttemptsListView({
  exams,
  isLoading = false,
  pageSize: initialPageSize = 10,
  isStudent = false,
  selectedIds,
  onSelect,
  onDelete,
  deletingId,
}: ExamAttemptsListViewProps) {
  const router = useRouter();
  
  const {
    page,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination(exams, { initialPageSize });

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return "—";
    const startTime = new Date(startedAt).getTime();
    const endTime = new Date(completedAt).getTime();
    const seconds = Math.floor((endTime - startTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const handleRowClick = (examId: string) => {
    router.push(`/dashboard/exams/${examId}`);
  };

  if (isLoading) {
    return (
      <DataTableContainer>
        <SkeletonTable rows={initialPageSize} />
      </DataTableContainer>
    );
  }

  return (
    <DataTableContainer>
      <DataTable>
        <DataTableHead>
          <tr>
            {!isStudent && onSelect && (
              <DataTableHeadCell className="w-12"></DataTableHeadCell>
            )}
            <DataTableHeadCell>Student</DataTableHeadCell>
            <DataTableHeadCell>Subject / Exam</DataTableHeadCell>
            <DataTableHeadCell>Status</DataTableHeadCell>
            <DataTableHeadCell>Score</DataTableHeadCell>
            <DataTableHeadCell>Duration</DataTableHeadCell>
            <DataTableHeadCell>Date</DataTableHeadCell>
            <DataTableHeadCell className="w-20">Actions</DataTableHeadCell>
          </tr>
        </DataTableHead>
        
        <DataTableBody>
          {paginatedItems.length === 0 ? (
            <DataTableRow>
              <DataTableCell colSpan={isStudent ? 7 : 8} className="text-center py-12">
                <p className="text-neutral-500">No exam attempts found</p>
              </DataTableCell>
            </DataTableRow>
          ) : (
            paginatedItems.map((exam) => {
              const scorePercentage = exam.percentage !== null && exam.percentage !== undefined
                ? Math.round(exam.percentage)
                : (exam.total_marks > 0 && exam.score !== null 
                    ? Math.round((exam.score / exam.total_marks) * 100) 
                    : null);
              const isPassing = scorePercentage !== null && scorePercentage >= 35;
              const isSelected = selectedIds?.has(exam.id);
              const isDeleting = deletingId === exam.id;

              return (
                <DataTableRow
                  key={exam.id}
                  onClick={() => handleRowClick(exam.id)}
                  className={clsx(
                    "cursor-pointer",
                    isSelected && "bg-primary-50/50 dark:bg-primary-900/10",
                    isDeleting && "opacity-50 pointer-events-none"
                  )}
                >
                  {/* Selection Checkbox */}
                  {!isStudent && onSelect && (
                    <DataTableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelect(exam.id)}
                          className={clsx(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                            isSelected
                              ? "border-primary-600 bg-primary-600 text-white"
                              : "border-neutral-300 hover:border-primary-400 dark:border-neutral-600"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </button>
                      </div>
                    </DataTableCell>
                  )}

                  {/* Student */}
                  <DataTableCell>
                    <Link 
                      href={`/dashboard/users/${exam.user_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-3 group/user"
                    >
                      <UserAvatar 
                        name={exam.profiles?.name || null}
                        email={exam.profiles?.email || null}
                        avatarUrl={exam.profiles?.avatar_url || null}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white truncate max-w-[150px] group-hover/user:text-primary-600 dark:group-hover/user:text-primary-400">
                          {exam.profiles?.name || "Student"}
                        </p>
                        <p className="text-xs text-neutral-500 truncate max-w-[150px]">
                          {exam.profiles?.email || "—"}
                        </p>
                      </div>
                    </Link>
                  </DataTableCell>

                  {/* Subject / Exam */}
                  <DataTableCell>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[120px]">
                          {exam.subjects?.name_en || "—"}
                        </span>
                      </div>
                      {exam.scheduled_exams?.name_en && (
                        <p className="text-xs text-neutral-500 truncate max-w-[150px] mt-0.5">
                          {exam.scheduled_exams.name_en}
                        </p>
                      )}
                    </div>
                  </DataTableCell>

                  {/* Status */}
                  <DataTableCell>
                    <StatusBadge status={exam.status} />
                  </DataTableCell>

                  {/* Score */}
                  <DataTableCell>
                    {exam.status === "completed" && scorePercentage !== null ? (
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "text-sm font-bold",
                          isPassing ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"
                        )}>
                          {scorePercentage}%
                        </span>
                        <span className="text-xs text-neutral-500">
                          ({exam.score}/{exam.total_marks})
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </DataTableCell>

                  {/* Duration */}
                  <DataTableCell>
                    {exam.completed_at ? (
                      <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                        <Timer className="h-4 w-4" />
                        <span>{formatDuration(exam.started_at, exam.completed_at)}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </DataTableCell>

                  {/* Date */}
                  <DataTableCell>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(exam.started_at)}</span>
                    </div>
                  </DataTableCell>

                  {/* Actions */}
                  <DataTableCell>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/dashboard/exams/${exam.id}`}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {!isStudent && onDelete && (
                        <button
                          onClick={() => onDelete(exam.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-neutral-500 hover:text-error-600 disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting ? (
                            <LoaderSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </DataTableCell>
                </DataTableRow>
              );
            })
          )}
        </DataTableBody>
      </DataTable>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          goToPage={goToPage}
          nextPage={nextPage}
          previousPage={previousPage}
        />
      )}
    </DataTableContainer>
  );
}
