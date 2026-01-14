"use client";

/**
 * Subject Detail Filter Component
 * 
 * Displays a class level filter dropdown for the subject details page.
 * Allows users to filter content based on selected class levels.
 */

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Layers, X, Check } from "lucide-react";
import { useClassLevels } from "@/client/hooks/use-class-levels";
import { clsx } from "clsx";

interface SubjectDetailFilterProps {
  /** Pre-selected class level IDs */
  selectedLevelIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (levelIds: string[]) => void;
}

export function SubjectDetailFilter({
  selectedLevelIds = [],
  onSelectionChange
}: SubjectDetailFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: classLevels, loading } = useClassLevels();

  // Get selected levels from URL or props
  const urlLevelIds = searchParams.get("classLevels")?.split(",").filter(Boolean) || [];
  const activeLevelIds = selectedLevelIds.length > 0 ? selectedLevelIds : urlLevelIds;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle level toggle
  const handleToggleLevel = (levelId: string) => {
    const newSelection = activeLevelIds.includes(levelId)
      ? activeLevelIds.filter((id) => id !== levelId)
      : [...activeLevelIds, levelId];
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (newSelection.length > 0) {
        params.set("classLevels", newSelection.join(","));
      } else {
        params.delete("classLevels");
      }
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    }
  };

  // Clear all selections
  const handleClearAll = () => {
    if (onSelectionChange) {
      onSelectionChange([]);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("classLevels");
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    }
    setIsOpen(false);
  };

  // Get selected level names for display
  const selectedLevels = (classLevels || []).filter((cl) => activeLevelIds.includes(cl.id));
  const hasSelection = activeLevelIds.length > 0;

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all",
          "border",
          hasSelection
            ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300"
            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
        )}
      >
        <Layers className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {hasSelection 
            ? selectedLevels.length === 1 
              ? selectedLevels[0].name_en 
              : `${selectedLevels.length} Classes`
            : "All Classes"
          }
        </span>
        {hasSelection && (
          <button
            onClick={(e) => { e.stopPropagation(); handleClearAll(); }}
            className="ml-1 p-0.5 rounded hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 z-20 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
          <div className="p-2.5 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Filter by Class
              </span>
              {hasSelection && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-48 overflow-auto py-1">
            {loading ? (
              <div className="px-3 py-4 text-center text-sm text-neutral-500">Loading...</div>
            ) : classLevels && classLevels.length > 0 ? (
              classLevels.map((level) => {
                const isSelected = activeLevelIds.includes(level.id);
                return (
                  <button
                    key={level.id}
                    onClick={() => handleToggleLevel(level.id)}
                    className={clsx(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
                      isSelected
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    )}
                  >
                    <div className={clsx(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      isSelected
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "border-neutral-300 dark:border-neutral-600"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="flex-1">{level.name_en}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-sm text-neutral-500">No class levels found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact single-select class level filter
 */
export function ClassLevelSelectFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: classLevels, loading } = useClassLevels();

  // Get selected level from URL
  const selectedLevelId = searchParams.get("classLevelId");
  const selectedLevel = classLevels?.find((cl) => cl.id === selectedLevelId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle level selection
  const handleSelectLevel = (levelId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (levelId) {
      params.set("classLevelId", levelId);
    } else {
      params.delete("classLevelId");
    }
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium transition-all",
          "border",
          selectedLevelId
            ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300"
            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
        )}
      >
        <Layers className="h-3 w-3" />
        <span>{selectedLevel?.name_en || "All Classes"}</span>
        {selectedLevelId && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); handleSelectLevel(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleSelectLevel(null); } }}
            className="p-0.5 rounded hover:bg-primary-200 dark:hover:bg-primary-800 cursor-pointer"
          >
            <X className="h-2.5 w-2.5" />
          </span>
        )}
        <ChevronDown className={clsx("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-48 z-20 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
          <div className="max-h-48 overflow-auto py-1">
            <button
              onClick={() => handleSelectLevel(null)}
              className={clsx(
                "w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors",
                !selectedLevelId
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              <Layers className="h-3 w-3 text-neutral-400" />
              <span>All Classes</span>
            </button>
            {loading ? (
              <div className="px-3 py-3 text-center text-xs text-neutral-500">Loading...</div>
            ) : (
              classLevels?.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleSelectLevel(level.id)}
                  className={clsx(
                    "w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors",
                    selectedLevelId === level.id
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  )}
                >
                  <Layers className="h-3 w-3 text-primary-500" />
                  <span>{level.name_en}</span>
                  {selectedLevelId === level.id && <Check className="h-3 w-3 ml-auto" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
