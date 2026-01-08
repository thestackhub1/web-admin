/**
 * Scheduled Exams List View - Premium DataTable with Pagination
 * 
 * A scalable list view using DataTable components for displaying scheduled exams.
 * Includes pagination, loading states, and row click navigation.
 */

"use client";

import { useRouter } from "next/navigation";
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
  MoreHorizontal,
  ExternalLink,
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
import { usePagination } from "@/client/hooks/use-pagination";
import type { ScheduledExam } from "./types";

// ============================================
// Types
// ============================================

interface ScheduledExamsListViewProps {
  exams: ScheduledExam[];
  isLoading?: boolean;
  pageSize?: number;
}

// ============================================
// Status Configuration
// ============================================

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info"; icon: React.ElementType }> = {
  draft: {
    label: "Draft",
    variant: "default",
    icon: FileText
  },
  scheduled: {
    label: "Scheduled",
    variant: "info",
    icon: Calendar
  },
  active: {
    label: "Active",
    variant: "warning",
    icon: Play
  },
  completed: {
    label: "Completed",
    variant: "success",
    icon: CheckCircle
  },
  cancelled: {
    label: "Cancelled",
    variant: "error",
    icon: Archive
  },
  published: {
    label: "Published",
    variant: "info",
    icon: Play
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
  // Generate page numbers to show (max 5 centered around current page)
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    
    // Adjust start if we're near the end
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
        exams
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

export function ScheduledExamsListView({
  exams,
  isLoading = false,
  pageSize: initialPageSize = 10,
}: ScheduledExamsListViewProps) {
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

  const handleRowClick = (examId: string) => {
    router.push(`/dashboard/scheduled-exams/${examId}`);
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
            <DataTableHeadCell>Exam Name</DataTableHeadCell>
            <DataTableHeadCell>Class Level</DataTableHeadCell>
            <DataTableHeadCell>Subject</DataTableHeadCell>
            <DataTableHeadCell>Status</DataTableHeadCell>
            <DataTableHeadCell>Scheduled Date</DataTableHeadCell>
            <DataTableHeadCell>Duration</DataTableHeadCell>
            <DataTableHeadCell>Attempts</DataTableHeadCell>
            <DataTableHeadCell className="w-12"></DataTableHeadCell>
          </tr>
        </DataTableHead>
        
        <DataTableBody>
          {paginatedItems.length === 0 ? (
            <DataTableRow>
              <DataTableCell colSpan={8} className="text-center py-12">
                <p className="text-neutral-500">No scheduled exams found</p>
              </DataTableCell>
            </DataTableRow>
          ) : (
            paginatedItems.map((exam) => (
              <DataTableRow
                key={exam.id}
                onClick={() => handleRowClick(exam.id)}
                className="cursor-pointer"
              >
                {/* Exam Name */}
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/10">
                      <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
                        {exam.name_en}
                      </p>
                      {exam.exam_structure && (
                        <p className="text-xs text-neutral-500 truncate max-w-[200px]">
                          {exam.exam_structure.name_en}
                        </p>
                      )}
                    </div>
                  </div>
                </DataTableCell>

                {/* Class Level */}
                <DataTableCell>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {exam.class_level?.name_en || "—"}
                  </span>
                </DataTableCell>

                {/* Subject */}
                <DataTableCell>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {exam.subject?.name_en || "—"}
                  </span>
                </DataTableCell>

                {/* Status */}
                <DataTableCell>
                  <StatusBadge status={exam.status} />
                </DataTableCell>

                {/* Scheduled Date */}
                <DataTableCell>
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(exam.scheduled_date)}</span>
                  </div>
                </DataTableCell>

                {/* Duration */}
                <DataTableCell>
                  {exam.duration_minutes ? (
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration_minutes} min</span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </DataTableCell>

                {/* Attempts */}
                <DataTableCell>
                  {exam.attempts_count > 0 ? (
                    <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{exam.attempts_count}</span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">0</span>
                  )}
                </DataTableCell>

                {/* Actions */}
                <DataTableCell>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/scheduled-exams/${exam.id}`);
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
            ))
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
