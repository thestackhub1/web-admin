"use client";

import Link from "next/link";
import { Folder, ChevronRight, BookOpen } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { clsx } from "clsx";

interface Subject {
  id: string;
  name_en: string;
  name_mr: string | null;
  slug: string;
  icon?: string | null;
  is_active: boolean;
}

interface CategoryCardProps {
  subject: Subject;
  childSubjectCount: number;
}

export function CategoryCard({ subject, childSubjectCount }: CategoryCardProps) {
  // Dynamically resolve icon component
  const IconComponent = subject.icon
    ? (LucideIcons[subject.icon as keyof typeof LucideIcons] as LucideIcons.LucideIcon)
    : Folder;

  // Fallback if the icon name doesn't exist in Lucide
  const DisplayIcon = IconComponent || Folder;

  return (
    <Link href={`/dashboard/subjects/${subject.id}`} className="block group">
      <div className="relative flex items-center gap-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-100 dark:border-neutral-700/50 px-4 py-3 hover:border-insight-300 dark:hover:border-insight-700 hover:shadow-md hover:shadow-insight-500/10 transition-all duration-200">
        {/* Gradient accent line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-gradient-to-b from-insight-400 to-insight-600" />
        
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-insight-500 text-white shadow-sm ml-1">
          <DisplayIcon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-insight-600 dark:group-hover:text-insight-400 transition-colors">
              {subject.name_en}
            </h3>
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-insight-100 text-insight-600 dark:bg-insight-900/40 dark:text-insight-400">
              Category
            </span>
            {/* Status dot */}
            <div className={clsx(
              "h-1.5 w-1.5 rounded-full shrink-0",
              subject.is_active
                ? 'bg-success-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                : 'bg-neutral-300 dark:bg-neutral-600'
            )} />
          </div>
          {subject.name_mr && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {subject.name_mr}
            </p>
          )}
        </div>

        {/* Stats & Arrow */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-500">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{childSubjectCount}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-insight-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
