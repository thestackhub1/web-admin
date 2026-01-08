// Client-side only — no server secrets or database access here

"use client";

import { clsx } from "clsx";
import { List, Table2 } from "lucide-react";

type ViewMode = "list" | "table";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-800">
      <button
        onClick={() => onViewModeChange("list")}
        className={clsx(
          "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-all",
          viewMode === "list"
            ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
        )}
      >
        <List className="h-4 w-4" />
        List
      </button>
      <button
        onClick={() => onViewModeChange("table")}
        className={clsx(
          "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-all",
          viewMode === "table"
            ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
        )}
      >
        <Table2 className="h-4 w-4" />
        Table
      </button>
    </div>
  );
}


