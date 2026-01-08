/**
 * Scheduled Exams Grid View - Premium Cards with Pagination
 * 
 * A premium grid layout with beautifully designed cards and pagination.
 * Cards feature gradient accents, hover effects, and rich metadata display.
 */

"use client";

import Link from "next/link";
import { clsx } from "clsx";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Play,
  CheckCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
  Layers,
  BookOpen,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { usePagination } from "@/client/hooks/use-pagination";
import type { ScheduledExam } from "./types";

// ============================================
// Types
// ============================================

interface ScheduledExamsGridViewProps {
  exams: ScheduledExam[];
  isLoading?: boolean;
  pageSize?: number;
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
  draft: {
    label: "Draft",
    color: "text-neutral-600 dark:text-neutral-400",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
    borderColor: "border-neutral-200 dark:border-neutral-700",
    gradient: "bg-linear-to-r from-neutral-500 to-neutral-600",
    icon: FileText
  },
  scheduled: {
    label: "Scheduled",
    color: "text-primary-600 dark:text-primary-400",
    bgColor: "bg-primary-50 dark:bg-primary-900/30",
    borderColor: "border-primary-200 dark:border-primary-800",
    gradient: "bg-linear-to-r from-primary-500 to-primary-600",
    icon: Calendar
  },
  active: {
    label: "Active",
    color: "text-warning-600 dark:text-warning-400",
    bgColor: "bg-warning-50 dark:bg-warning-900/30",
    borderColor: "border-warning-200 dark:border-warning-800",
    gradient: "bg-linear-to-r from-warning-500 to-warning-600",
    icon: Play
  },
  completed: {
    label: "Completed",
    color: "text-success-600 dark:text-success-400",
    bgColor: "bg-success-50 dark:bg-success-900/30",
    borderColor: "border-success-200 dark:border-success-800",
    gradient: "bg-linear-to-r from-success-500 to-success-600",
    icon: CheckCircle
  },
  cancelled: {
    label: "Cancelled",
    color: "text-error-600 dark:text-error-400",
    bgColor: "bg-error-50 dark:bg-error-900/30",
    borderColor: "border-error-200 dark:border-error-800",
    gradient: "bg-linear-to-r from-error-500 to-error-600",
    icon: Archive
  },
  published: {
    label: "Published",
    color: "text-primary-600 dark:text-primary-400",
    bgColor: "bg-primary-50 dark:bg-primary-900/30",
    borderColor: "border-primary-200 dark:border-primary-800",
    gradient: "bg-linear-to-r from-primary-500 to-primary-600",
    icon: Play
  },
};

const defaultStatus = {
  label: "Unknown",
  color: "text-neutral-500",
  bgColor: "bg-neutral-100 dark:bg-neutral-800",
  borderColor: "border-neutral-200 dark:border-neutral-700",
  gradientFrom: "from-neutral-500",
  gradientTo: "to-neutral-600",
  icon: FileText
};

// ============================================
// Premium Exam Card Component
// ============================================

function PremiumExamCard({ exam }: { exam: ScheduledExam }) {
  const statusInfo = statusConfig[exam.status] || defaultStatus;
  const StatusIcon = statusInfo.icon;

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link
      href={`/dashboard/scheduled-exams/${exam.id}`}
      className="group block h-full"
    >
      <div className={clsx(
        "relative h-full overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-white dark:bg-neutral-900",
        "border-neutral-200/60 hover:border-neutral-300 dark:border-neutral-700/60 dark:hover:border-neutral-600",
        "hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50",
        "hover:-translate-y-1"
      )}>
        {/* Gradient Top Bar */}
        <div className={clsx(
          "h-1.5 w-full",
          statusInfo.gradient
        )} />

        <div className="p-5">
          {/* Header with Title & Status */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                {exam.name_en}
              </h3>
            </div>
            <span className={clsx(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              statusInfo.bgColor, statusInfo.color
            )}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusInfo.label}
            </span>
          </div>

          {/* Class & Subject Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              <Layers className="h-3.5 w-3.5 text-neutral-500" />
              <span>{exam.class_level?.name_en || "No class"}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              <BookOpen className="h-3.5 w-3.5 text-neutral-500" />
              <span>{exam.subject?.name_en || "No subject"}</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Date</span>
              </div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {formatDate(exam.scheduled_date) || "Not set"}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
              </div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {exam.duration_minutes ? `${exam.duration_minutes} min` : "—"}
              </p>
            </div>
          </div>

          {/* Footer with Blueprint & Attempts */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            {exam.exam_structure ? (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                <span className="truncate max-w-[140px]">{exam.exam_structure.name_en}</span>
                <span className="shrink-0 text-primary-600 dark:text-primary-400 font-medium">
                  ({exam.exam_structure.total_marks} marks)
                </span>
              </div>
            ) : (
              <span className="text-xs text-neutral-400">No blueprint</span>
            )}
            
            {exam.attempts_count > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-2 py-1 text-xs font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                <Users className="h-3.5 w-3.5" />
                <span>{exam.attempts_count}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Arrow Indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ChevronRightIcon className="h-5 w-5 text-primary-500" />
        </div>
      </div>
    </Link>
  );
}

// ============================================
// Loading Skeleton Card
// ============================================

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 dark:border-neutral-700/60 dark:bg-neutral-900 animate-pulse">
      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full mb-5" />
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
        <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
        <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
      </div>
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
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
        exams
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

export function ScheduledExamsGridView({
  exams,
  isLoading = false,
  pageSize: initialPageSize = 9, // 3x3 grid
}: ScheduledExamsGridViewProps) {
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
          <PremiumExamCard key={exam.id} exam={exam} />
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
