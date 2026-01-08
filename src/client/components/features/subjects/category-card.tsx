"use client";

import Link from "next/link";
import { Folder, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { GlassCard, Badge } from '@/client/components/ui/premium';
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
    <Link href={`/dashboard/subjects/${subject.id}`} className="block h-full">
      <GlassCard className="group h-full cursor-pointer transition-all duration-300 hover:border-purple-200 hover:shadow-xl dark:hover:border-purple-900/50">
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              {/* Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-purple-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                <DisplayIcon className="h-7 w-7" />
              </div>

              {/* Title and Info */}
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="truncate text-xl font-bold text-neutral-900 dark:text-white">
                    {subject.name_en}
                  </h3>
                  <Badge variant="purple" size="sm">
                    Category
                  </Badge>
                </div>
                <p className="mb-3 text-sm font-medium italic text-neutral-500 dark:text-neutral-400">
                  {subject.name_mr}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    <Folder className="h-3.5 w-3.5" />
                    {childSubjectCount} Subjects
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="ml-4 shrink-0">
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
          <div className="group/button flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-purple-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-purple-600/20 transition-all duration-200 hover:from-purple-700 hover:to-purple-800 hover:shadow-lg hover:shadow-purple-600/30">
            View Subjects
            <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
