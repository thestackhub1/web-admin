"use client";

import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { FadeIn } from "@/client/components/ui";

interface UpcomingExamsCardProps {
  activeScheduledExams: number;
}

/**
 * Upcoming Exams Card
 * Displays count of scheduled exams
 */
export function UpcomingExamsCard({ activeScheduledExams }: UpcomingExamsCardProps) {
  return (
    <FadeIn delay={0.4}>
      <div className="bento-card p-6 overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/30 dark:to-primary-900/20 border-primary-200/50 dark:border-primary-800/50">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h4 className="font-semibold text-primary-900 dark:text-primary-100">
            Upcoming Exams
          </h4>
        </div>
        <div className="space-y-3">
          <p className="text-3xl font-bold text-primary-900 dark:text-primary-100">
            {activeScheduledExams}
          </p>
          <p className="text-sm text-primary-700 dark:text-primary-300">
            Scheduled for this week
          </p>
          <Link
            href="/dashboard/scheduled-exams"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mt-2"
          >
            View Calendar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}

