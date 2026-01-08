/**
 * Exam Attempts Grid View - Premium Cards with Pagination
 * 
 * A premium grid layout with beautifully designed cards and pagination.
 * Cards feature gradient accents, hover effects, and rich metadata display.
 */

"use client";

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
  ChevronRightIcon,
  Timer,
  Target,
  Eye,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { LoaderSpinner } from "@/client/components/ui/loader";
import { usePagination } from "@/client/hooks/use-pagination";
import type { ExamAttempt } from "./exam-attempts-client";

// ============================================
// Types
// ============================================

interface ExamAttemptsGridViewProps {
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
  color: string; 
  bgColor: string; 
  borderColor: string;
  gradient: string;
  icon: React.ElementType 
}> = {
  completed: {
    label: "Completed",
    color: "text-success-600 dark:text-success-400",
    bgColor: "bg-success-50 dark:bg-success-900/30",
    borderColor: "border-success-200 dark:border-success-800",
    gradient: "bg-linear-to-r from-success-500 to-success-600",
    icon: CheckCircle2
  },
  in_progress: {
    label: "In Progress",
    color: "text-warning-600 dark:text-warning-400",
    bgColor: "bg-warning-50 dark:bg-warning-900/30",
    borderColor: "border-warning-200 dark:border-warning-800",
    gradient: "bg-linear-to-r from-warning-500 to-warning-600",
    icon: Clock
  },
  abandoned: {
    label: "Abandoned",
    color: "text-error-600 dark:text-error-400",
    bgColor: "bg-error-50 dark:bg-error-900/30",
    borderColor: "border-error-200 dark:border-error-800",
    gradient: "bg-linear-to-r from-error-500 to-error-600",
    icon: AlertCircle
  },
};

const defaultStatus = {
  label: "Unknown",
  color: "text-neutral-500",
  bgColor: "bg-neutral-100 dark:bg-neutral-800",
  borderColor: "border-neutral-200 dark:border-neutral-700",
  gradient: "bg-linear-to-r from-neutral-500 to-neutral-600",
  icon: FileText
};

// ============================================
// Avatar Component
// ============================================

function UserAvatar({ 
  name, 
  email, 
  avatarUrl,
  size = "md"
}: { 
  name: string | null; 
  email: string | null; 
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
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

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={clsx(
          sizeClasses[size],
          "rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
        )}
      />
    );
  }

  return (
    <div className={clsx(
      "flex items-center justify-center rounded-full font-bold text-white",
      "bg-linear-to-br shadow-sm",
      sizeClasses[size],
      getGradient()
    )}>
      {getInitials()}
    </div>
  );
}

// ============================================
// Premium Exam Card Component
// ============================================

function PremiumExamCard({ 
  exam,
  isStudent,
  isSelected,
  onSelect,
  onDelete,
  isDeleting,
}: { 
  exam: ExamAttempt;
  isStudent?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}) {
  const statusInfo = statusConfig[exam.status] || defaultStatus;
  const StatusIcon = statusInfo.icon;

  const scorePercentage = exam.percentage !== null && exam.percentage !== undefined
    ? Math.round(exam.percentage)
    : (exam.total_marks > 0 && exam.score !== null 
        ? Math.round((exam.score / exam.total_marks) * 100) 
        : null);
  const isPassing = scorePercentage !== null && scorePercentage >= 35;

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return null;
    const startTime = new Date(startedAt).getTime();
    const endTime = new Date(completedAt).getTime();
    const seconds = Math.floor((endTime - startTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <div className={clsx(
      "group relative h-full overflow-hidden rounded-2xl border transition-all duration-300",
      "bg-white dark:bg-neutral-900",
      isSelected 
        ? "border-primary-400 ring-2 ring-primary-200 dark:border-primary-600 dark:ring-primary-800"
        : "border-neutral-200/60 hover:border-neutral-300 dark:border-neutral-700/60 dark:hover:border-neutral-600",
      "hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50",
      "hover:-translate-y-1",
      isDeleting && "opacity-50 pointer-events-none"
    )}>
      {/* Gradient Top Bar */}
      <div className={clsx(
        "h-1.5 w-full",
        statusInfo.gradient
      )} />

      {/* Selection Checkbox */}
      {!isStudent && onSelect && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(exam.id);
          }}
          className={clsx(
            "absolute top-4 right-4 z-10 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all",
            isSelected
              ? "border-primary-600 bg-primary-600 text-white"
              : "border-neutral-300 bg-white hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-800"
          )}
        >
          {isSelected && <Check className="h-4 w-4" />}
        </button>
      )}

      <Link
        href={`/dashboard/exams/${exam.id}`}
        className="block p-5"
      >
        {/* Header with User & Status */}
        <div className="flex items-start justify-between gap-3 mb-4 pr-8">
          <Link 
            href={`/dashboard/users/${exam.user_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 group/user"
          >
            <UserAvatar 
              name={exam.profiles?.name || null}
              email={exam.profiles?.email || null}
              avatarUrl={exam.profiles?.avatar_url || null}
              size="md"
            />
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900 dark:text-white truncate max-w-[140px] group-hover/user:text-primary-600 dark:group-hover/user:text-primary-400 transition-colors">
                {exam.profiles?.name || "Student"}
              </p>
              <p className="text-xs text-neutral-500 truncate max-w-[140px]">
                {exam.profiles?.email || "—"}
              </p>
            </div>
          </Link>
        </div>

        {/* Subject & Exam Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300 truncate">
              {exam.subjects?.name_en || "Unknown Subject"}
            </span>
          </div>
          {exam.scheduled_exams?.name_en && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-500 truncate">
                {exam.scheduled_exams.name_en}
              </span>
            </div>
          )}
        </div>

        {/* Score & Status */}
        <div className="flex items-center justify-between mb-4">
          {exam.status === "completed" && scorePercentage !== null ? (
            <div className={clsx(
              "flex items-center gap-2 rounded-xl px-3 py-2",
              isPassing 
                ? "bg-success-50 dark:bg-success-900/30" 
                : "bg-error-50 dark:bg-error-900/30"
            )}>
              <span className={clsx(
                "text-xl font-bold",
                isPassing ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"
              )}>
                {scorePercentage}%
              </span>
              <span className="text-xs text-neutral-500">
                ({exam.score}/{exam.total_marks})
              </span>
            </div>
          ) : (
            <span className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
              statusInfo.bgColor, statusInfo.color
            )}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusInfo.label}
            </span>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Date</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {formatDate(exam.started_at) || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
              <Timer className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {formatDuration(exam.started_at, exam.completed_at) || "—"}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            {exam.status === "completed" && scorePercentage !== null && (
              <span className={clsx(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                isPassing 
                  ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                  : "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400"
              )}>
                {isPassing ? "Pass" : "Fail"}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/dashboard/exams/${exam.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-primary-100 dark:bg-neutral-800 dark:hover:bg-primary-900/30 text-neutral-500 hover:text-primary-600"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            {!isStudent && onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(exam.id);
                }}
                disabled={isDeleting}
                className="p-1.5 rounded-lg bg-neutral-100 hover:bg-error-100 dark:bg-neutral-800 dark:hover:bg-error-900/30 text-neutral-500 hover:text-error-600 disabled:opacity-50"
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
        </div>
      </Link>

      {/* Hover Arrow Indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <ChevronRightIcon className="h-5 w-5 text-primary-500" />
      </div>
    </div>
  );
}

// ============================================
// Loading Skeleton Card
// ============================================

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 dark:border-neutral-700/60 dark:bg-neutral-900 animate-pulse">
      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full mb-5" />
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
      </div>
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
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
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl p-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={clsx(
                "h-8 w-8 text-sm font-medium rounded-lg transition-all",
                page === pageNum
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
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
          className="h-9 w-9 p-0"
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

export function ExamAttemptsGridView({
  exams,
  isLoading = false,
  pageSize: initialPageSize = 9,
  isStudent = false,
  selectedIds,
  onSelect,
  onDelete,
  deletingId,
}: ExamAttemptsGridViewProps) {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: initialPageSize }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedItems.map((exam) => (
          <PremiumExamCard 
            key={exam.id} 
            exam={exam}
            isStudent={isStudent}
            isSelected={selectedIds?.has(exam.id)}
            onSelect={onSelect}
            onDelete={onDelete}
            isDeleting={deletingId === exam.id}
          />
        ))}
      </div>

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
    </div>
  );
}
