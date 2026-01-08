"use client";

import Link from "next/link";
import { BookOpen, FileQuestion, Layers, ArrowRight } from "lucide-react";
import { GlassCard } from '@/client/components/ui/premium';
import { clsx } from "clsx";

interface Subject {
  id: string;
  name_en: string;
  name_mr: string | null;
  slug: string;
  icon?: string | null;
  is_active: boolean;
}

interface SubjectCardProps {
  subject: Subject;
  chapterCount: number;
  questionCount: number;
}

export function SubjectCard({ subject, chapterCount, questionCount }: SubjectCardProps) {
  return (
    <Link href={`/dashboard/subjects/${subject.id}`} className="block h-full">
      <GlassCard className="group h-full transition-all duration-300 hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-900/50 cursor-pointer">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="h-14 w-14 shrink-0 rounded-xl text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 bg-linear-to-br from-primary-500 to-primary-600">
                {subject.icon ? (
                  <span className="text-2xl">{subject.icon}</span>
                ) : (
                  <BookOpen className="h-7 w-7" />
                )}
              </div>

              {/* Title and Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                    {subject.name_en}
                  </h3>
                </div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 italic mb-3">
                  {subject.name_mr}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <Layers className="h-3.5 w-3.5" />
                    {chapterCount} Chapters
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <FileQuestion className="h-3.5 w-3.5" />
                    {questionCount} Questions
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0 ml-4">
                <div className={clsx(
                  "h-2.5 w-2.5 rounded-full",
                  subject.is_active
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-neutral-400'
                )}></div>
              </div>
            </div>
          </div>

          {/* Primary Action */}
          <div className="w-full rounded-xl bg-linear-to-r from-primary-600 to-purple-600 text-white py-3 px-4 text-sm font-semibold shadow-md shadow-primary-600/20 hover:from-primary-700 hover:to-purple-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all duration-200 flex items-center justify-center gap-2 group/button">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
