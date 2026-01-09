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
    <Link href={`/dashboard/subjects/${subject.id}`} className="block h-full group">
      <GlassCard
        hover
        className="h-full relative flex flex-col justify-between overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-primary-900/20"
      >
        <div className="p-5 flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 rounded-xl bg-linear-to-br from-primary-50 to-primary-100 p-3 text-primary-600 shadow-inner group-hover:from-primary-100 group-hover:to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 dark:text-primary-400">
            {subject.icon ? (
              <span className="text-2xl">{subject.icon}</span>
            ) : (
              <BookOpen className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
              {subject.name_en}
            </h3>
            {subject.name_mr && (
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {subject.name_mr}
              </p>
            )}

            {/* Status Dot */}
            <div className="absolute top-5 right-5">
              <div className={clsx(
                "h-2 w-2 rounded-full",
                subject.is_active
                  ? 'bg-success-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-neutral-300 dark:bg-neutral-600'
              )}></div>
            </div>
          </div>
        </div>

        {/* Footer Stats & Action */}
        <div className="mt-auto flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/20">
          <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              {chapterCount} Chapters
            </div>
            <div className="flex items-center gap-1.5">
              <FileQuestion className="h-3.5 w-3.5" />
              {questionCount} Questions
            </div>
          </div>

          <div className="text-neutral-400 group-hover:text-primary-500 transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
