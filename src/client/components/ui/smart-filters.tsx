// Client-side only — no server secrets or database access here

"use client";

import { useState, useCallback } from "react";
import { clsx } from "clsx";
import { ChevronDown, X, Calendar, Filter, RefreshCw } from "lucide-react";
import { Loader } from "@/client/components/ui/loader";

// ============================================
// Types
// ============================================
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
  preset?: string;
}

export interface FilterState {
  classLevelId?: string;
  subjectId?: string;
  dateRange?: DateRange;
  difficulty?: string;
  questionType?: string;
  status?: string;
}

// ============================================
// Single Select Dropdown
// ============================================
interface SelectFilterProps {
  label: string;
  value?: string;
  options: FilterOption[];
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  showCount?: boolean;
}

export function SelectFilter({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
  icon,
  className,
  showCount = false,
}: SelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={clsx("relative", className)}>
      <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5",
          "border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80",
          "text-sm font-medium text-neutral-900 dark:text-white",
          "transition-all hover:border-neutral-300 dark:hover:border-neutral-600",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/20",
          isOpen && "ring-2 ring-primary-500/20"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          {selectedOption?.label || placeholder}
          {showCount && selectedOption?.count !== undefined && (
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              {selectedOption.count}
            </span>
          )}
        </span>
        <ChevronDown className={clsx("h-4 w-4 shrink-0 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              className={clsx(
                "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm",
                "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                !value && "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
              )}
            >
              {placeholder}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm",
                  "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                  option.value === value && "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                )}
              >
                <span className="truncate">{option.label}</span>
                {showCount && option.count !== undefined && (
                  <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Multi Select Dropdown
// ============================================
interface MultiSelectFilterProps {
  label: string;
  values: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectFilter({
  label,
  values,
  options,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const selectedLabels = values.map((v) => options.find((o) => o.value === v)?.label).filter(Boolean);

  return (
    <div className={clsx("relative", className)}>
      <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5",
          "border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80",
          "text-sm font-medium text-neutral-900 dark:text-white",
          "transition-all hover:border-neutral-300 dark:hover:border-neutral-600",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        )}
      >
        <span className="flex-1 truncate text-left">
          {selectedLabels.length > 0 ? (
            <span className="flex items-center gap-1">
              <span>{selectedLabels.length} selected</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={clsx("h-4 w-4 shrink-0 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {values.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="flex w-full items-center gap-2 border-b border-neutral-100 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:border-neutral-800 dark:text-rose-400 dark:hover:bg-rose-900/20"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
            {options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <input
                  type="checkbox"
                  checked={values.includes(option.value)}
                  onChange={() => toggleValue(option.value)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="flex-1">{option.label}</span>
                {option.count !== undefined && (
                  <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
                    {option.count}
                  </span>
                )}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Date Range Picker
// ============================================
const DATE_PRESETS = [
  { value: "today", label: "Today", days: 0 },
  { value: "7days", label: "Last 7 days", days: 7 },
  { value: "30days", label: "Last 30 days", days: 30 },
  { value: "90days", label: "Last 90 days", days: 90 },
  { value: "year", label: "This year", days: 365 },
  { value: "all", label: "All time", days: null },
];

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: typeof DATE_PRESETS[0]) => {
    if (preset.days === null) {
      onChange({ from: null, to: null, preset: preset.value });
    } else if (preset.days === 0) {
      const today = new Date();
      onChange({ from: today, to: today, preset: preset.value });
    } else {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - preset.days);
      onChange({ from, to, preset: preset.value });
    }
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (value.preset) {
      return DATE_PRESETS.find((p) => p.value === value.preset)?.label || "Select range";
    }
    if (value.from && value.to) {
      return `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`;
    }
    return "All time";
  };

  return (
    <div className={clsx("relative", className)}>
      <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Date Range
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5",
          "border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80",
          "text-sm font-medium text-neutral-900 dark:text-white",
          "transition-all hover:border-neutral-300 dark:hover:border-neutral-600",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        )}
      >
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-400" />
          {getDisplayLabel()}
        </span>
        <ChevronDown className={clsx("h-4 w-4 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 z-20 mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={clsx(
                  "flex w-full items-center px-4 py-2.5 text-left text-sm",
                  "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                  value.preset === preset.value && "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Smart Filter Bar (Composite Component)
// ============================================
interface SmartFilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  classLevels: FilterOption[];
  subjects: FilterOption[];
  showDifficulty?: boolean;
  showQuestionType?: boolean;
  showStatus?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

const DIFFICULTY_OPTIONS: FilterOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const QUESTION_TYPE_OPTIONS: FilterOption[] = [
  { value: "mcq_single", label: "MCQ (Single)" },
  { value: "mcq_two", label: "MCQ (Two)" },
  { value: "mcq_three", label: "MCQ (Three)" },
  { value: "true_false", label: "True/False" },
  { value: "fill_blank", label: "Fill in Blank" },
  { value: "match", label: "Match" },
  { value: "short_answer", label: "Short Answer" },
  { value: "long_answer", label: "Long Answer" },
  { value: "programming", label: "Programming" },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function SmartFilterBar({
  filters,
  onChange,
  classLevels,
  subjects,
  showDifficulty = false,
  showQuestionType = false,
  showStatus = false,
  onRefresh,
  isLoading = false,
  className,
}: SmartFilterBarProps) {
  const activeFilterCount = [
    filters.classLevelId,
    filters.subjectId,
    filters.difficulty,
    filters.questionType,
    filters.status,
    filters.dateRange?.preset && filters.dateRange.preset !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    onChange({
      dateRange: { from: null, to: null, preset: "all" },
    });
  };

  return (
    <div
      className={clsx(
        "rounded-2xl border border-neutral-200/50 bg-white/80 p-4 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/80",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Filters</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={clsx(
                "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
                isLoading && "opacity-50"
              )}
            >
              {isLoading ? (
                <Loader size="sm" className="h-3 w-3" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <SelectFilter
          label="Class Level"
          value={filters.classLevelId}
          options={classLevels}
          onChange={(v) => onChange({ ...filters, classLevelId: v })}
          placeholder="All Classes"
          showCount
        />

        <SelectFilter
          label="Subject"
          value={filters.subjectId}
          options={subjects}
          onChange={(v) => onChange({ ...filters, subjectId: v })}
          placeholder="All Subjects"
          showCount
        />

        <DateRangePicker
          value={filters.dateRange || { from: null, to: null, preset: "all" }}
          onChange={(range) => onChange({ ...filters, dateRange: range })}
        />

        {showDifficulty && (
          <SelectFilter
            label="Difficulty"
            value={filters.difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={(v) => onChange({ ...filters, difficulty: v })}
            placeholder="All Difficulties"
          />
        )}

        {showQuestionType && (
          <SelectFilter
            label="Question Type"
            value={filters.questionType}
            options={QUESTION_TYPE_OPTIONS}
            onChange={(v) => onChange({ ...filters, questionType: v })}
            placeholder="All Types"
          />
        )}

        {showStatus && (
          <SelectFilter
            label="Status"
            value={filters.status}
            options={STATUS_OPTIONS}
            onChange={(v) => onChange({ ...filters, status: v })}
            placeholder="All Statuses"
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// Active Filter Pills
// ============================================
interface FilterPillsProps {
  filters: FilterState;
  classLevels: FilterOption[];
  subjects: FilterOption[];
  onRemove: (key: keyof FilterState) => void;
  className?: string;
}

export function FilterPills({
  filters,
  classLevels,
  subjects,
  onRemove,
  className,
}: FilterPillsProps) {
  const pills: { key: keyof FilterState; label: string }[] = [];

  if (filters.classLevelId) {
    const cls = classLevels.find((c) => c.value === filters.classLevelId);
    pills.push({ key: "classLevelId", label: cls?.label || filters.classLevelId });
  }

  if (filters.subjectId) {
    const sub = subjects.find((s) => s.value === filters.subjectId);
    pills.push({ key: "subjectId", label: sub?.label || filters.subjectId });
  }

  if (filters.dateRange?.preset && filters.dateRange.preset !== "all") {
    const preset = DATE_PRESETS.find((p) => p.value === filters.dateRange?.preset);
    pills.push({ key: "dateRange", label: preset?.label || "Custom date" });
  }

  if (filters.difficulty) {
    pills.push({ key: "difficulty", label: filters.difficulty });
  }

  if (filters.questionType) {
    const type = QUESTION_TYPE_OPTIONS.find((t) => t.value === filters.questionType);
    pills.push({ key: "questionType", label: type?.label || filters.questionType });
  }

  if (filters.status) {
    pills.push({ key: "status", label: filters.status });
  }

  if (pills.length === 0) return null;

  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {pills.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
        >
          {label}
          <button
            onClick={() => onRemove(key)}
            className="rounded-full p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ============================================
// useFilters Hook
// ============================================
export function useFilters(initialFilters?: FilterState) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      dateRange: { from: null, to: null, preset: "all" },
    }
  );

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key: keyof FilterState) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (key === "dateRange") {
        next.dateRange = { from: null, to: null, preset: "all" };
      } else {
        delete next[key];
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: { from: null, to: null, preset: "all" },
    });
  }, []);

  return {
    filters,
    setFilters,
    updateFilter,
    removeFilter,
    clearFilters,
  };
}
