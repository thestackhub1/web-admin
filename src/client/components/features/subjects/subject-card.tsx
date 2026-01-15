"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, FileQuestion, Layers, ChevronRight } from "lucide-react";
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

interface SubjectCardProps {
  subject: Subject;
  chapterCount: number;
  questionCount: number;
  colorIndex?: number;
}

// Helper to get icon component from string
function getIconComponent(iconName?: string | null) {
  if (!iconName) return null;
  const IconComp = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
  return IconComp || null;
}

// Logo colors rotation: primary (blue), success (green), warning (amber), insight (purple)
const colorSchemes = [
  {
    accent: 'bg-primary-500',
    line: 'from-primary-400 to-primary-600',
    badge: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400',
    hover: 'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-primary-500/10',
    text: 'group-hover:text-primary-600 dark:group-hover:text-primary-400',
    arrow: 'group-hover:text-primary-500',
  },
  {
    accent: 'bg-success-500',
    line: 'from-success-400 to-success-600',
    badge: 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-400',
    hover: 'hover:border-success-300 dark:hover:border-success-700 hover:shadow-success-500/10',
    text: 'group-hover:text-success-600 dark:group-hover:text-success-400',
    arrow: 'group-hover:text-success-500',
  },
  {
    accent: 'bg-warning-500',
    line: 'from-warning-400 to-warning-600',
    badge: 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-400',
    hover: 'hover:border-warning-300 dark:hover:border-warning-700 hover:shadow-warning-500/10',
    text: 'group-hover:text-warning-600 dark:group-hover:text-warning-400',
    arrow: 'group-hover:text-warning-500',
  },
  {
    accent: 'bg-insight-500',
    line: 'from-insight-400 to-insight-600',
    badge: 'bg-insight-100 text-insight-600 dark:bg-insight-900/40 dark:text-insight-400',
    hover: 'hover:border-insight-300 dark:hover:border-insight-700 hover:shadow-insight-500/10',
    text: 'group-hover:text-insight-600 dark:group-hover:text-insight-400',
    arrow: 'group-hover:text-insight-500',
  },
];

export function SubjectCard({ subject, chapterCount, questionCount, colorIndex = 0 }: SubjectCardProps) {
  const searchParams = useSearchParams();
  const classLevelId = searchParams.get('classLevelId');
  const colors = colorSchemes[colorIndex % colorSchemes.length];
  const IconComponent = getIconComponent(subject.icon) || BookOpen;
  
  // Build href with classLevelId if present
  const href = classLevelId 
    ? `/dashboard/subjects/${subject.id}?classLevelId=${classLevelId}`
    : `/dashboard/subjects/${subject.id}`;

  return (
    <Link href={href} className="block group">
      <div className={clsx(
        "relative flex items-center gap-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-100 dark:border-neutral-700/50 px-4 py-3 hover:shadow-md transition-all duration-200",
        colors.hover
      )}>
        {/* Gradient accent line */}
        <div className={clsx(
          "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-gradient-to-b",
          colors.line
        )} />
        
        {/* Icon */}
        <div className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ml-1",
          colors.accent
        )}>
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={clsx(
              "text-sm font-semibold text-neutral-900 dark:text-white truncate transition-colors",
              colors.text
            )}>
              {subject.name_en}
            </h3>
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

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-500 shrink-0">
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{chapterCount}</span>
          </div>
          <span className="text-neutral-200 dark:text-neutral-700">|</span>
          <div className="flex items-center gap-1">
            <FileQuestion className="h-3 w-3" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{questionCount}</span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className={clsx(
          "h-4 w-4 text-neutral-300 group-hover:translate-x-0.5 transition-all shrink-0",
          colors.arrow
        )} />
      </div>
    </Link>
  );
}
