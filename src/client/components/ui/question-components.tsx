// Client-side only — no server secrets or database access here

"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Download, FileJson, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

interface ExportDropdownProps {
  onExport: (format: "json" | "csv" | "pdf") => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ExportDropdown({ onExport, isLoading, disabled }: ExportDropdownProps) {
  return (
    <Menu as="div" className="relative">
      <MenuButton
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
          "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
          "dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <Download className="h-4 w-4" />
        {isLoading ? "Exporting..." : "Export"}
        <ChevronDown className="h-4 w-4" />
      </MenuButton>

      <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white p-2 shadow-xl ring-1 ring-neutral-900/5 focus:outline-none dark:bg-neutral-900 dark:ring-neutral-700">
        <MenuItem>
          {({ active }) => (
            <button
              onClick={() => onExport("json")}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm",
                active && "bg-neutral-100 dark:bg-neutral-800"
              )}
            >
              <FileJson className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-white">JSON</p>
                <p className="text-xs text-neutral-500">For imports/backups</p>
              </div>
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ active }) => (
            <button
              onClick={() => onExport("csv")}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm",
                active && "bg-neutral-100 dark:bg-neutral-800"
              )}
            >
              <FileSpreadsheet className="h-4 w-4 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-white">CSV</p>
                <p className="text-xs text-neutral-500">For spreadsheets</p>
              </div>
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ active }) => (
            <button
              onClick={() => onExport("pdf")}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm",
                active && "bg-neutral-100 dark:bg-neutral-800"
              )}
            >
              <FileText className="h-4 w-4 text-red-500" />
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-white">PDF</p>
                <p className="text-xs text-neutral-500">For printing</p>
              </div>
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

interface FilterChip {
  id: string;
  label: string;
  count?: number;
  isActive: boolean;
}

interface SmartFilterChipsProps {
  chips: FilterChip[];
  onSelect: (id: string) => void;
  label?: string;
}

export function SmartFilterChips({ chips, onSelect, label }: SmartFilterChipsProps) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => onSelect(chip.id)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
              chip.isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            )}
          >
            {chip.label}
            {chip.count !== undefined && (
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-xs font-bold",
                  chip.isActive
                    ? "bg-blue-500/30 text-white"
                    : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                )}
              >
                {chip.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface QuestionTypeBadgeProps {
  type: string;
  size?: "sm" | "md";
}

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  fill_blank: {
    label: "Fill Blank",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: "✏️",
  },
  true_false: {
    label: "True/False",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: "✓✗",
  },
  mcq_single: {
    label: "MCQ (1)",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: "①",
  },
  mcq_two: {
    label: "MCQ (2)",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    icon: "②",
  },
  mcq_three: {
    label: "MCQ (3)",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    icon: "③",
  },
  match: {
    label: "Match",
    color: "bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900/30 dark:text-brand-blue-400",
    icon: "↔️",
  },
  short_answer: {
    label: "Short",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: "✍",
  },
  long_answer: {
    label: "Long",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: "☰",
  },
  programming: {
    label: "Code",
    color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    icon: "</>",
  },
};

export function QuestionTypeBadge({ type, size = "sm" }: QuestionTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.mcq_single;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

interface DifficultyBadgeProps {
  difficulty: string;
  size?: "sm" | "md";
}

const difficultyConfig: Record<string, { color: string; bgColor: string }> = {
  easy: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  medium: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  hard: { color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
};

export function DifficultyBadge({ difficulty, size = "sm" }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty] || difficultyConfig.medium;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-semibold capitalize",
        config.bgColor,
        config.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {difficulty}
    </span>
  );
}

interface QuestionStatsProps {
  stats: {
    total: number;
    byType: Record<string, number>;
    byDifficulty: Record<string, number>;
    byChapter: Record<string, number>;
  };
}

export function QuestionStats({ stats }: QuestionStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* By Difficulty */}
      <div className="rounded-xl bg-white/50 p-4 dark:bg-neutral-800/50">
        <p className="mb-3 text-xs font-medium tracking-wider text-neutral-500 uppercase">
          By Difficulty
        </p>
        <div className="space-y-2">
          {Object.entries(stats.byDifficulty).map(([diff, count]) => (
            <div key={diff} className="flex items-center justify-between">
              <DifficultyBadge difficulty={diff} />
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* By Type - Top 4 */}
      <div className="rounded-xl bg-white/50 p-4 dark:bg-neutral-800/50">
        <p className="mb-3 text-xs font-medium tracking-wider text-neutral-500 uppercase">By Type</p>
        <div className="space-y-2">
          {Object.entries(stats.byType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <QuestionTypeBadge type={type} />
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* By Chapter - Top 3 */}
      <div className="rounded-xl bg-white/50 p-4 dark:bg-neutral-800/50">
        <p className="mb-3 text-xs font-medium tracking-wider text-neutral-500 uppercase">
          By Chapter
        </p>
        <div className="space-y-2">
          {Object.entries(stats.byChapter)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([chapter, count]) => (
              <div key={chapter} className="flex items-center justify-between">
                <span className="max-w-[140px] truncate text-sm text-neutral-600 dark:text-neutral-400">
                  {chapter}
                </span>
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
