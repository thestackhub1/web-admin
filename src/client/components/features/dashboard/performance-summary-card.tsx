"use client";

import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { FadeIn } from "@/client/components/ui";
import { cn } from "@/client/utils";

interface PerformanceSummaryCardProps {
  averageScore: number;
  passRate: number;
}

/**
 * Performance Summary Card
 * Displays key performance metrics with progress bars
 */
export function PerformanceSummaryCard({
  averageScore,
  passRate,
}: PerformanceSummaryCardProps) {
  return (
    <FadeIn delay={0.5}>
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-5 w-5 text-insight-500" />
          <h4 className="font-semibold text-neutral-900 dark:text-white">
            Performance
          </h4>
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600 dark:text-neutral-400">Average Score</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {averageScore}%
              </span>
            </div>
            <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  averageScore >= 70
                    ? 'bg-gradient-to-r from-success-500 to-success-400'
                    : averageScore >= 40
                      ? 'bg-gradient-to-r from-warning-500 to-warning-400'
                      : 'bg-gradient-to-r from-rose-500 to-rose-400'
                )}
                style={{ width: `${Math.min(averageScore, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600 dark:text-neutral-400">Pass Rate</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {passRate}%
              </span>
            </div>
            <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-success-500 to-success-400"
                style={{ width: `${Math.min(passRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mt-5"
        >
          View Detailed Analytics
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </FadeIn>
  );
}

