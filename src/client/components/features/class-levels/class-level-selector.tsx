// Client-side only — no server secrets or database access here

"use client";

import { useState } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Target,
} from "lucide-react";
import { GlassCard, Badge } from '@/client/components/ui/premium';
import type { ClassLevelWithStats } from "@/client/types/class-levels";

interface ClassLevelSelectorProps {
  classLevels: ClassLevelWithStats[];
  subjectSlug: string;
  subjectName: string;
  basePath?: string;
}

const classColors: Record<string, { bg: string; border: string; text: string; glow: string; bgLight: string }> = {
  purple: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-400",
    text: "text-purple-600 dark:text-purple-400",
    glow: "shadow-purple-500/30",
  },
  blue: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    glow: "shadow-blue-500/30",
  },
  green: {
    bg: "bg-green-500",
    bgLight: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-400",
    text: "text-green-600 dark:text-green-400",
    glow: "shadow-green-500/30",
  },
  amber: {
    bg: "bg-brand-blue-500",
    bgLight: "bg-brand-blue-100 dark:bg-brand-blue-900/30",
    border: "border-brand-blue-400",
    text: "text-brand-blue-600 dark:text-brand-blue-400",
    glow: "shadow-brand-blue-500/30",
  },
  red: {
    bg: "bg-red-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-400",
    text: "text-red-600 dark:text-red-400",
    glow: "shadow-red-500/30",
  },
  pink: {
    bg: "bg-pink-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    border: "border-pink-400",
    text: "text-pink-600 dark:text-pink-400",
    glow: "shadow-pink-500/30",
  },
  cyan: {
    bg: "bg-cyan-500",
    bgLight: "bg-cyan-100 dark:bg-cyan-900/30",
    border: "border-cyan-400",
    text: "text-cyan-600 dark:text-cyan-400",
    glow: "shadow-cyan-500/30",
  },
};

export function ClassLevelSelector({
  classLevels,
  subjectSlug,
  subjectName,
  basePath = "/dashboard/scheduling",
}: ClassLevelSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Deduplicate class levels by ID
  const uniqueClassLevels = classLevels.reduce((acc, level) => {
    if (!acc.find((l) => l.id === level.id)) {
      acc.push(level);
    }
    return acc;
  }, [] as ClassLevelWithStats[]);

  if (uniqueClassLevels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 bg-linear-to-br from-neutral-50 to-neutral-100 py-20 dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900">
        <div className="mb-6 rounded-full bg-neutral-200 p-6 dark:bg-neutral-700">
          <GraduationCap className="h-12 w-12 text-neutral-400" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
          No Class Levels Available
        </h3>
        <p className="mt-3 max-w-sm text-center text-neutral-500 dark:text-neutral-400">
          No class levels have been mapped to {subjectName} yet. Configure class levels in settings.
        </p>
      </div>
    );
  }

  const selectedLevel = selectedIndex !== null ? uniqueClassLevels[selectedIndex] : null;

  return (
    <div className="space-y-8">
      {/* Class Level Tabs - Horizontal Scrollable */}
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Select Class Level
            </h3>
          </div>
          <Badge variant="info" size="sm">
            {uniqueClassLevels.length} Classes Available
          </Badge>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {uniqueClassLevels.map((level, index) => {
            const colors = classColors[level.color] || classColors.blue;
            const isSelected = selectedIndex === index;
            const isHovered = hoveredIndex === index;

            return (
              <button
                key={`class-tab-${level.id}-${index}`}
                onClick={() => setSelectedIndex(isSelected ? null : index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={clsx(
                  "group relative flex min-w-35 flex-col items-center rounded-2xl border-2 p-6 transition-all duration-300",
                  isSelected
                    ? `${colors.border} bg-white shadow-xl ${colors.glow} dark:bg-neutral-800`
                    : "border-neutral-200 bg-white/80 hover:border-neutral-300 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800/80 dark:hover:border-neutral-600"
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div
                    className={clsx(
                      "absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full transition-all duration-300",
                      colors.bg
                    )}
                  />
                )}

                {/* Icon */}
                <div
                  className={clsx(
                    "mb-3 flex h-16 w-16 items-center justify-center rounded-xl text-4xl transition-transform duration-300",
                    isSelected || isHovered ? "scale-110" : "",
                    isSelected ? colors.bgLight : "bg-neutral-100 dark:bg-neutral-700"
                  )}
                >
                  {level.icon}
                </div>

                {/* Class Name */}
                <span
                  className={clsx(
                    "text-lg font-bold transition-colors",
                    isSelected ? colors.text : "text-neutral-900 dark:text-white"
                  )}
                >
                  {level.name_en}
                </span>

                {/* Marathi Name */}
                <span className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {level.name_mr}
                </span>

                {/* Exam Count Badge */}
                <div
                  className={clsx(
                    "mt-3 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    isSelected
                      ? `${colors.bg} text-white`
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                  )}
                >
                  {level.scheduled_exam_count || 0} Exams
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Class Details Panel */}
      {selectedLevel && (
        <div
          key={`detail-${selectedLevel.id}`}
          className="animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <GlassCard className="overflow-hidden">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left: Class Info */}
              <div className="flex items-center gap-6">
                <div
                  className={clsx(
                    "flex h-20 w-20 items-center justify-center rounded-2xl text-5xl",
                    classColors[selectedLevel.color]?.bgLight || "bg-blue-100 dark:bg-blue-900/30"
                  )}
                >
                  {selectedLevel.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {selectedLevel.name_en}
                  </h2>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    {selectedLevel.name_mr} • {subjectName}
                  </p>
                  {selectedLevel.description_en && (
                    <p className="mt-2 max-w-lg text-sm text-neutral-500 dark:text-neutral-400">
                      {selectedLevel.description_en}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Stats & Action */}
              <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-center">
                {/* Quick Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wider">Exams</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                      {selectedLevel.scheduled_exam_count || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                      <Target className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wider">Status</span>
                    </div>
                    <p className="mt-1">
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={`${basePath}/${subjectSlug}/${selectedLevel.slug}`}
                  className={clsx(
                    "group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300",
                    "hover:scale-105 hover:shadow-lg",
                    classColors[selectedLevel.color]?.bg || "bg-blue-500",
                    classColors[selectedLevel.color]?.glow || "shadow-blue-500/30"
                  )}
                >
                  <span>Manage Exams</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Quick Access Cards - Show when nothing selected */}
      {selectedIndex === null && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
          {uniqueClassLevels.map((level, index) => {
            const colors = classColors[level.color] || classColors.blue;

            return (
              <Link
                key={`card-${level.id}-${index}`}
                href={`${basePath}/${subjectSlug}/${level.slug}`}
                className="group"
              >
                <GlassCard
                  hover
                  className={clsx(
                    "relative overflow-hidden border-l-4 transition-all duration-300",
                    colors.border
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl text-2xl", colors.bgLight)}>
                        {level.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white">
                          {level.name_en}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {level.scheduled_exam_count || 0} scheduled exams
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={clsx(
                        "h-5 w-5 text-neutral-400 transition-all duration-300",
                        "group-hover:translate-x-1 group-hover:text-neutral-600"
                      )}
                    />
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
