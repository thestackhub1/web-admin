"use client";

/**
 * Class Level Filter Badge Component
 * 
 * Displays an active class level filter with the ability to clear it.
 * Used across multiple pages to show when content is filtered by a class level.
 */

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Layers, X } from "lucide-react";
import { useClassLevels } from "@/client/hooks/use-class-levels";
import { Badge } from "@/client/components/ui/premium";

interface ClassLevelFilterBadgeProps {
  classLevelId?: string | null;
  showLabel?: boolean;
}

export function ClassLevelFilterBadge({ 
  classLevelId: propClassLevelId, 
  showLabel = true 
}: ClassLevelFilterBadgeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Use prop or get from URL
  const classLevelId = propClassLevelId ?? searchParams.get("classLevelId");
  
  // Fetch class levels to get the name
  const { data: classLevels } = useClassLevels();
  
  const classLevel = useMemo(() => {
    if (!classLevelId || !classLevels) return null;
    return classLevels.find((cl) => cl.id === classLevelId);
  }, [classLevelId, classLevels]);
  
  const handleClear = () => {
    // Remove classLevelId from URL params
    const params = new URLSearchParams(searchParams.toString());
    params.delete("classLevelId");
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  };
  
  if (!classLevelId) return null;
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showLabel && (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          Filtering by:
        </span>
      )}
      <div 
        className="cursor-pointer"
        onClick={handleClear}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClear(); }}
      >
        <Badge 
          variant="info" 
          className="gap-1.5 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors pr-1.5"
        >
          <Layers className="h-3 w-3" />
          {classLevel?.name_en || "Class Level"}
          <span
            className="ml-1 rounded-full p-0.5 hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors"
            aria-label="Clear class level filter"
          >
            <X className="h-3 w-3" />
          </span>
        </Badge>
      </div>
    </div>
  );
}

/**
 * Hook to get class level info from URL params
 */
export function useClassLevelFilter() {
  const searchParams = useSearchParams();
  const classLevelId = searchParams.get("classLevelId");
  const { data: classLevels } = useClassLevels();
  
  const classLevel = useMemo(() => {
    if (!classLevelId || !classLevels) return null;
    return classLevels.find((cl) => cl.id === classLevelId);
  }, [classLevelId, classLevels]);
  
  return {
    classLevelId,
    classLevel,
    hasFilter: !!classLevelId,
  };
}
