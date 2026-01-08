// Client-side only — no server secrets or database access here

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/client/utils";
import { Loader } from "@/client/components/ui";
import {
  Search,
  User,
  BookOpen,
  FileQuestion,
  Calendar,
  ArrowRight,
  Command,
} from "lucide-react";
import { useGlobalSearch, quickNavItems, type SearchResult } from "@/client/hooks/use-global-search";

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<SearchResult["type"], React.ElementType> = {
  user: User,
  subject: BookOpen,
  question: FileQuestion,
  exam: Calendar,
};

const typeLabels: Record<SearchResult["type"], string> = {
  user: "User",
  subject: "Subject",
  question: "Question",
  exam: "Exam",
};

const typeColors: Record<SearchResult["type"], string> = {
  user: "text-primary-600 bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/30 dark:text-primary-400",
  subject: "text-emerald-600 bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/30 dark:text-emerald-400",
  question: "text-violet-600 bg-linear-to-br from-violet-50 to-violet-100 dark:from-violet-900/40 dark:to-violet-800/30 dark:text-violet-400",
  exam: "text-amber-600 bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/30 dark:text-amber-400",
};

/**
 * Global Search Dialog Component
 * Follows best practices: keyboard navigation, accessibility, search debouncing
 */
export function GlobalSearchDialog({ isOpen, onClose }: GlobalSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const { results, isLoading, error } = useGlobalSearch(query);

  // Combine quick nav items with search results
  const displayItems = React.useMemo(() => {
    if (query.length < 2) {
      return quickNavItems;
    }
    return results;
  }, [query, results]);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [displayItems]);

  // Focus input when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Navigation handler - memoized to use in handleKeyDown
  const navigateTo = React.useCallback(
    (item: SearchResult) => {
      router.push(item.href);
      onClose();
    },
    [router, onClose]
  );

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < displayItems.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (displayItems[selectedIndex]) {
            navigateTo(displayItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [displayItems, selectedIndex, onClose, navigateTo]
  );

  // Scroll selected item into view
  React.useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;

    const selectedElement = container.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 px-4 animate-fade-in-up"
      >
        <div className="overflow-hidden rounded-2xl bg-white/95 shadow-2xl shadow-neutral-900/20 ring-1 ring-neutral-900/5 backdrop-blur-xl dark:bg-neutral-900/95 dark:shadow-black/40 dark:ring-white/10">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-neutral-200/80 bg-linear-to-r from-neutral-50/50 to-transparent px-4 py-4 dark:border-neutral-700/80 dark:from-neutral-800/30">
            {isLoading ? (
              <Loader size="sm" />
            ) : (
              <Search className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search users, exams, questions, subjects..."
              className="flex-1 bg-transparent text-sm font-medium text-neutral-900 placeholder-neutral-400 caret-primary-500 outline-none focus:outline-none dark:text-white dark:placeholder-neutral-500"
              aria-label="Search input"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-[10px] font-semibold text-neutral-500 shadow-sm sm:inline-flex dark:border-neutral-600 dark:bg-neutral-700/80 dark:text-neutral-400">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-80 overflow-y-auto overscroll-contain p-2"
          >
            {error ? (
              <div className="p-4 text-center text-sm text-danger-500">
                {error}
              </div>
            ) : displayItems.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {query.length < 2
                    ? "Start typing to search..."
                    : "No results found"}
                </p>
                {query.length >= 2 && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Try a different search term
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Section header for quick nav */}
                {query.length < 2 && (
                  <div className="mb-1 px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Quick Navigation
                  </div>
                )}

                {/* Results list */}
                {displayItems.map((item, index) => {
                  const Icon = typeIcons[item.type];
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      data-index={index}
                      onClick={() => navigateTo(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150",
                        isSelected
                          ? "bg-linear-to-r from-primary-50 to-primary-100/50 shadow-sm ring-1 ring-primary-200/50 dark:from-primary-900/30 dark:to-primary-800/20 dark:ring-primary-700/30"
                          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10",
                          typeColors[item.type]
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            isSelected
                              ? "text-primary-700 dark:text-primary-300"
                              : "text-neutral-900 dark:text-white"
                          )}
                        >
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full border border-neutral-200/80 bg-neutral-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                          {typeLabels[item.type]}
                        </span>
                        {isSelected && (
                          <ArrowRight className="h-4 w-4 text-primary-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-neutral-200/80 bg-linear-to-r from-neutral-50/80 to-transparent px-4 py-2.5 text-xs text-neutral-500 dark:border-neutral-700/80 dark:from-neutral-800/50 dark:text-neutral-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm dark:border-neutral-600 dark:bg-neutral-700">
                  ↑↓
                </kbd>
                <span className="font-medium">Navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm dark:border-neutral-600 dark:bg-neutral-700">
                  ↵
                </kbd>
                <span className="font-medium">Open</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <kbd className="flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm dark:border-neutral-600 dark:bg-neutral-700">
                <Command className="h-2.5 w-2.5" />
                K
              </kbd>
              <span>to open</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
