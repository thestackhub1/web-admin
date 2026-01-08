// Client-side only — no server secrets or database access here

"use client";

/**
 * Compact Searchable Question Type Selector
 * Dropdown with search functionality for better UX
 */

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import type { QuestionType } from "@/client/types/questions";
import {
  FileText,
  CheckSquare,
  CircleDot,
  CircleDotIcon,
  Link2,
  FileEdit,
  FileType,
  Code,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";

interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const questionTypes: QuestionTypeOption[] = [
  {
    value: "fill_blank",
    label: "Fill Blank",
    description: "Students fill in missing words",
    icon: FileEdit,
  },
  {
    value: "true_false",
    label: "True/False",
    description: "Binary choice question",
    icon: CheckSquare,
  },
  {
    value: "mcq_single",
    label: "MCQ (Single)",
    description: "Select one correct answer",
    icon: CircleDot,
  },
  {
    value: "mcq_two",
    label: "MCQ (Two)",
    description: "Select two correct answers",
    icon: CircleDotIcon,
  },
  {
    value: "mcq_three",
    label: "MCQ (Three)",
    description: "Select three correct answers",
    icon: CircleDotIcon,
  },
  {
    value: "match",
    label: "Match",
    description: "Match items from two columns",
    icon: Link2,
  },
  {
    value: "short_answer",
    label: "Short Answer",
    description: "Brief text response",
    icon: FileText,
  },
  {
    value: "long_answer",
    label: "Long Answer",
    description: "Detailed text response",
    icon: FileType,
  },
  {
    value: "programming",
    label: "Code",
    description: "Programming question",
    icon: Code,
  },
];

interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedType = questionTypes.find((type) => type.value === value);

  // Filter question types based on search query
  const filteredTypes = questionTypes.filter(
    (type) =>
      type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredTypes[highlightedIndex]) {
          onChange(filteredTypes[highlightedIndex].value);
          setIsOpen(false);
          setSearchQuery("");
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredTypes.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredTypes.length - 1));
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchQuery("");
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  // Reset highlighted index when search changes
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [searchQuery, isOpen]);

  const handleSelect = (type: QuestionType) => {
    onChange(type);
    setIsOpen(false);
    setSearchQuery("");
  };

  if (!selectedType) return null;

  const SelectedIcon = selectedType.icon;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
          Question Type
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Choose how students will answer this question
        </p>
      </div>

      <div ref={containerRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
            "focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20",
            isOpen
              ? "border-brand-blue-500 bg-brand-blue-50/50 dark:border-brand-blue-500 dark:bg-brand-blue-900/20"
              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
          )}
        >
          {/* Selected Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-500 text-white">
            <SelectedIcon className="h-5 w-5" />
          </div>

          {/* Selected Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              {selectedType.label}
            </div>
            <div className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {selectedType.description}
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={clsx(
              "h-4 w-4 shrink-0 text-neutral-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full">
            <div className="rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
              {/* Search Input */}
              <div className="border-b border-neutral-200 p-3 dark:border-neutral-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search question types..."
                    className={clsx(
                      "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm",
                      "focus:border-brand-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20",
                      "dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                    )}
                  />
                </div>
              </div>

              {/* Options List */}
              <ul
                ref={listRef}
                className="max-h-80 overflow-y-auto py-1.5"
                style={{ scrollbarWidth: "thin" }}
              >
                {filteredTypes.length > 0 ? (
                  filteredTypes.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = type.value === value;
                    const isHighlighted = highlightedIndex === index;

                    return (
                      <li
                        key={type.value}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(type.value);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={clsx(
                          "flex cursor-pointer items-center gap-3 px-4 py-2.5 mx-1.5 rounded-lg transition-all",
                          isHighlighted
                            ? "bg-primary-50 dark:bg-primary-900/20"
                            : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
                          isSelected && "bg-primary-100 dark:bg-primary-900/30"
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={clsx(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isSelected
                              ? "bg-primary-500 text-white"
                              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={clsx(
                              "text-sm font-medium",
                              isSelected
                                ? "text-primary-700 dark:text-primary-400"
                                : "text-neutral-900 dark:text-white"
                            )}
                          >
                            {type.label}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {type.description}
                          </div>
                        </div>

                        {/* Checkmark */}
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No question types found
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
