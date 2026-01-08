// Client-side only — no server secrets or database access here

"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { Calendar, ChevronRight, Users, GraduationCap } from "lucide-react";
import { GlassCard, Badge } from '@/client/components/ui/premium';
import type { ClassLevelWithStats } from "@/client/types/class-levels";
import { classLevelGradients } from "@/client/types/class-levels";

interface ClassLevelGridProps {
  classLevels: ClassLevelWithStats[];
  subjectSlug: string;
  subjectName: string;
  basePath?: string;
}

const colorBorderMap: Record<string, string> = {
  purple: "border-l-purple-500",
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  amber: "border-l-amber-500",
  red: "border-l-red-500",
  pink: "border-l-pink-500",
  cyan: "border-l-cyan-500",
};

const colorBgMap: Record<string, string> = {
  purple: "bg-purple-500/10",
  blue: "bg-blue-500/10",
  green: "bg-green-500/10",
  amber: "bg-brand-blue-500/10",
  red: "bg-red-500/10",
  pink: "bg-pink-500/10",
  cyan: "bg-cyan-500/10",
};

const colorTextMap: Record<string, string> = {
  purple: "text-purple-600 dark:text-purple-400",
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  amber: "text-brand-blue-600 dark:text-brand-blue-400",
  red: "text-red-600 dark:text-red-400",
  pink: "text-pink-600 dark:text-pink-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
};

export function ClassLevelGrid({
  classLevels,
  subjectSlug,
  subjectName,
  basePath = "/dashboard/scheduling",
}: ClassLevelGridProps) {
  if (classLevels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-16 dark:border-neutral-700 dark:bg-neutral-800/50">
        <GraduationCap className="mb-4 h-12 w-12 text-neutral-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          No Class Levels Available
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          No class levels have been mapped to {subjectName} yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {classLevels
        .filter((classLevel, index, self) => 
          // Deduplicate by ID
          index === self.findIndex(c => c.id === classLevel.id)
        )
        .map((classLevel, index) => {
        const gradient = classLevelGradients[classLevel.color] || classLevelGradients.blue;
        const borderColor = colorBorderMap[classLevel.color] || colorBorderMap.blue;
        const bgColor = colorBgMap[classLevel.color] || colorBgMap.blue;
        const textColor = colorTextMap[classLevel.color] || colorTextMap.blue;

        return (
          <Link
            key={`class-grid-${classLevel.id}-${index}`}
            href={`${basePath}/${subjectSlug}/${classLevel.slug}`}
            className="group"
          >
            <GlassCard
              className={clsx(
                "relative overflow-hidden border-l-4 transition-all duration-300",
                "hover:scale-[1.02] hover:shadow-xl",
                `bg-linear-to-br ${gradient}`,
                borderColor
              )}
            >
              {/* Icon & Title */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={clsx(
                      "flex h-14 w-14 items-center justify-center rounded-xl text-3xl",
                      bgColor
                    )}
                  >
                    {classLevel.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {classLevel.name_en}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {classLevel.name_mr}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={clsx(
                    "h-5 w-5 text-neutral-400 transition-transform duration-300",
                    "group-hover:translate-x-1",
                    `group-hover:${textColor}`
                  )}
                />
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/60 p-3 dark:bg-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <Calendar className={clsx("h-4 w-4", textColor)} />
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {classLevel.scheduled_exam_count || 0}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Scheduled Exams
                  </p>
                </div>
                <div className="rounded-lg bg-white/60 p-3 dark:bg-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <Users className={clsx("h-4 w-4", textColor)} />
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {classLevel.student_count || 0}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Students</p>
                </div>
              </div>

              {/* Description */}
              {classLevel.description_en && (
                <p className="mt-4 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {classLevel.description_en}
                </p>
              )}

              {/* Status Badge */}
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={classLevel.is_active ? "success" : "default"} dot>
                  {classLevel.is_active ? "Active" : "Inactive"}
                </Badge>
                <span className="text-xs text-neutral-400">Click to manage exams →</span>
              </div>

              {/* Decorative Element */}
              <div
                className={clsx(
                  "absolute -bottom-8 -right-8 h-32 w-32 rounded-full opacity-20",
                  bgColor
                )}
              />
            </GlassCard>
          </Link>
        );
      })}
    </div>
  );
}

// Compact version for sidebar or smaller spaces
export function ClassLevelList({
  classLevels,
  subjectSlug,
  basePath = "/dashboard/scheduling",
  currentClassSlug,
}: {
  classLevels: ClassLevelWithStats[];
  subjectSlug: string;
  basePath?: string;
  currentClassSlug?: string;
}) {
  return (
    <div className="space-y-2">
      {classLevels.map((classLevel) => {
        const isActive = currentClassSlug === classLevel.slug;
        const textColor = colorTextMap[classLevel.color] || colorTextMap.blue;

        return (
          <Link
            key={classLevel.id}
            href={`${basePath}/${subjectSlug}/${classLevel.slug}`}
            className={clsx(
              "flex items-center justify-between rounded-lg px-4 py-3 transition-all",
              isActive
                ? "bg-neutral-100 dark:bg-neutral-800"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{classLevel.icon}</span>
              <div>
                <p
                  className={clsx(
                    "font-medium",
                    isActive ? textColor : "text-neutral-700 dark:text-neutral-300"
                  )}
                >
                  {classLevel.name_en}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {classLevel.scheduled_exam_count || 0} exams
                </p>
              </div>
            </div>
            <ChevronRight
              className={clsx(
                "h-4 w-4 text-neutral-400",
                isActive && textColor
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
