// Client-side only — no server secrets or database access here

"use client";

import { X, Filter } from "lucide-react";
import { clsx } from "clsx";
import { Button } from '@/client/components/ui/button';
import { questionTypeLabels, type QuestionType, type Difficulty } from "@/client/types/questions";

interface QuestionFiltersProps {
  showFilters: boolean;
  activeFiltersCount: number;
  filterType: string;
  filterDifficulty: string;
  filterActive: string;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  onFilterTypeChange: (value: string) => void;
  onFilterDifficultyChange: (value: string) => void;
  onFilterActiveChange: (value: string) => void;
}

export function QuestionFilters({
  showFilters,
  activeFiltersCount,
  filterType,
  filterDifficulty,
  filterActive,
  onToggleFilters,
  onClearFilters,
  onFilterTypeChange,
  onFilterDifficultyChange,
  onFilterActiveChange,
}: QuestionFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleFilters}
        className={clsx(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          showFilters || activeFiltersCount > 0
            ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
        )}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="rounded-full bg-primary-600 px-1.5 text-xs text-white">{activeFiltersCount}</span>
        )}
      </button>

      {activeFiltersCount > 0 && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}

      {showFilters && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 grid gap-4 border-t border-neutral-200/50 bg-white p-4 shadow-lg sm:grid-cols-3 dark:border-neutral-700/50 dark:bg-neutral-900">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Type</label>
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              <option value="">All Types</option>
              {Object.entries(questionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => onFilterDifficultyChange(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Status</label>
            <select
              value={filterActive}
              onChange={(e) => onFilterActiveChange(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}


