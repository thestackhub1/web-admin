// Client-side only — no server secrets or database access here

"use client";

import { useRef, useEffect } from "react";
import { X, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { clsx } from "clsx";
import { questionTypeLabels, type QuestionType } from "@/client/types/questions";

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

// Difficulty options with colors
const difficultyOptions = [
  { value: "", label: "All Difficulty", color: "bg-neutral-400" },
  { value: "easy", label: "Easy", color: "bg-success-500" },
  { value: "medium", label: "Medium", color: "bg-warning-500" },
  { value: "hard", label: "Hard", color: "bg-red-500" },
];

// Status options with colors
const statusOptions = [
  { value: "", label: "All Status", color: "bg-neutral-400" },
  { value: "true", label: "Active", color: "bg-success-500" },
  { value: "false", label: "Inactive", color: "bg-neutral-300" },
];

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
  const filterRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        if (showFilters) onToggleFilters();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters, onToggleFilters]);

  return (
    <div className="relative" ref={filterRef}>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggleFilters}
        className={clsx(
          "flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all border",
          showFilters || activeFiltersCount > 0
            ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300"
            : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white text-xs">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown className={clsx("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
      </button>

      {/* Filter Dropdown Panel */}
      {showFilters && (
        <div className="absolute right-0 top-full mt-2 w-72 z-30 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">Filters</span>
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="p-3 space-y-4">
            {/* Question Type Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 px-1">
                Question Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onFilterTypeChange("")}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    filterType === ""
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700"
                      : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  )}
                >
                  <span>All Types</span>
                  {filterType === "" && <Check className="h-3 w-3" />}
                </button>
                {Object.entries(questionTypeLabels).slice(0, 5).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => onFilterTypeChange(value)}
                    className={clsx(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors truncate",
                      filterType === value
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    )}
                  >
                    <span className="truncate">{label}</span>
                    {filterType === value && <Check className="h-3 w-3 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 px-1">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-1.5">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterDifficultyChange(option.value)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                      filterDifficulty === option.value
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    )}
                  >
                    <div className={clsx("h-2 w-2 rounded-full", option.color)} />
                    <span>{option.label}</span>
                    {filterDifficulty === option.value && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 px-1">
                Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterActiveChange(option.value)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                      filterActive === option.value
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    )}
                  >
                    <div className={clsx("h-2 w-2 rounded-full", option.color)} />
                    <span>{option.label}</span>
                    {filterActive === option.value && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer with Apply/Close */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
            <button
              onClick={onToggleFilters}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}