"use client";
import { toast } from "sonner";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Badge, FadeIn } from "@/client/components/ui";
import { cn } from "@/client/utils";
import { formatTimeAgo } from "./utils";

interface ExamActivity {
  id: string;
  status: "completed" | "in_progress" | "abandoned";
  percentage?: number | null;
  started_at?: string | null;
  profiles?: {
    name?: string | null;
    email?: string | null;
  } | null;
  subjects?: {
    name_en?: string | null;
  } | null;
  exam_structure?: {
    name_en?: string | null;
  } | null;
}

interface RecentActivityCardProps {
  activities: ExamActivity[];
}

/**
 * Recent Activity Card
 * Displays recent exam attempts with status and progress
 */
export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  return (
    <FadeIn delay={0.3}>
      <div className="bento-card p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <Link
            href="/dashboard/exams"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-4 mb-4">
                <Clock className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No recent activity</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Student exam attempts will appear here</p>
            </div>
          ) : (
            activities.map((exam) => {
              const displayName = exam.profiles?.name || exam.profiles?.email?.split('@')[0] || 'Anonymous Student';
              const subjectName = exam.subjects?.name_en || exam.exam_structure?.name_en || 'General Exam';
              const timeAgo = exam.started_at ? formatTimeAgo(new Date(exam.started_at)) : '';

              return (
                <div
                  key={exam.id}
                  className="group rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 bg-white/50 dark:bg-neutral-800/30 p-4 transition-all duration-200 hover:bg-white dark:hover:bg-neutral-800/60 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "h-2.5 w-2.5 rounded-full ring-4 ring-opacity-20",
                          exam.status === 'completed'
                            ? 'bg-success-500 ring-success-500'
                            : exam.status === 'abandoned'
                              ? 'bg-neutral-500 ring-neutral-500'
                              : 'bg-warning-500 ring-warning-500'
                        )} />
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {displayName}
                        </p>
                        {timeAgo && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
                            {timeAgo}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 ml-5">
                        {subjectName}
                      </p>
                      {exam.status === 'completed' && exam.percentage !== null && exam.percentage !== undefined ? (
                        <div className="flex items-center gap-3 ml-5">
                          <div className="h-2 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                exam.percentage >= 70
                                  ? 'bg-gradient-to-r from-success-500 to-success-400'
                                  : exam.percentage >= 40
                                    ? 'bg-gradient-to-r from-warning-500 to-warning-400'
                                    : 'bg-gradient-to-r from-rose-500 to-rose-400'
                              )}
                              style={{ width: `${Math.min(exam.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums text-neutral-700 dark:text-neutral-300 min-w-10 text-right">
                            {Math.round(exam.percentage)}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 ml-5">
                          <div className="h-2 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-gradient-to-r from-warning-500/60 to-warning-400/40 rounded-full animate-pulse" />
                          </div>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            In progress...
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={exam.status === "completed" ? "success" : exam.status === "abandoned" ? "default" : "warning"}
                      size="sm"
                    >
                      {exam.status === "completed" ? "Completed" : exam.status === "abandoned" ? "Abandoned" : "In Progress"}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </FadeIn>
  );
}

