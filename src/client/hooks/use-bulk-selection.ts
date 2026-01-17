// Client-side only — no server secrets or database access here

/**
 * useBulkSelection Hook
 *
 * Generic selection hook for list components with bulk actions.
 */

import { useState, useCallback } from "react";

export interface UseBulkSelectionResult<T extends { id: string }> {
    /** Set of selected item IDs */
    selectedIds: Set<string>;
    /** Number of selected items */
    selectedCount: number;
    /** Whether all items are selected */
    isAllSelected: boolean;
    /** Whether some (but not all) items are selected */
    isPartiallySelected: boolean;
    /** Check if a specific item is selected */
    isSelected: (id: string) => boolean;
    /** Toggle selection of a single item */
    toggleSelect: (id: string) => void;
    /** Select all items */
    selectAll: () => void;
    /** Clear all selections */
    clearSelection: () => void;
    /** Get selected items */
    getSelectedItems: () => T[];
}

/**
 * Generic bulk selection hook
 *
 * @param items - Array of items with id property
 * @returns Selection state and handlers
 *
 * @example
 * ```tsx
 * const { selectedIds, toggleSelect, selectAll, clearSelection } = useBulkSelection(questions);
 * ```
 */
export function useBulkSelection<T extends { id: string }>(
    items: T[]
): UseBulkSelectionResult<T> {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const selectedCount = selectedIds.size;
    const isAllSelected = items.length > 0 && selectedCount === items.length;
    const isPartiallySelected = selectedCount > 0 && selectedCount < items.length;

    const isSelected = useCallback(
        (id: string) => selectedIds.has(id),
        [selectedIds]
    );

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(items.map((item) => item.id)));
    }, [items]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const getSelectedItems = useCallback(() => {
        return items.filter((item) => selectedIds.has(item.id));
    }, [items, selectedIds]);

    return {
        selectedIds,
        selectedCount,
        isAllSelected,
        isPartiallySelected,
        isSelected,
        toggleSelect,
        selectAll,
        clearSelection,
        getSelectedItems,
    };
}
