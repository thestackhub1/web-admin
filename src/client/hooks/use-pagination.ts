// Client-side only — no server secrets or database access here

/**
 * usePagination Hook
 *
 * Generic pagination hook for list components.
 */

import { useState, useMemo, useCallback } from "react";

export interface PaginationState {
    page: number;
    pageSize: number;
}

export interface UsePaginationOptions {
    initialPage?: number;
    initialPageSize?: number;
}

export interface UsePaginationResult<T> {
    /** Current page (1-indexed) */
    page: number;
    /** Items per page */
    pageSize: number;
    /** Total number of pages */
    totalPages: number;
    /** Total number of items */
    totalItems: number;
    /** Paginated items for current page */
    paginatedItems: T[];
    /** Whether there is a next page */
    hasNextPage: boolean;
    /** Whether there is a previous page */
    hasPreviousPage: boolean;
    /** Go to a specific page */
    goToPage: (page: number) => void;
    /** Go to next page */
    nextPage: () => void;
    /** Go to previous page */
    previousPage: () => void;
    /** Change page size */
    setPageSize: (size: number) => void;
    /** Reset to first page */
    resetPage: () => void;
}

/**
 * Generic pagination hook
 *
 * @param items - Array of items to paginate
 * @param options - Pagination options
 * @returns Pagination state and handlers
 *
 * @example
 * ```tsx
 * const { paginatedItems, page, totalPages, goToPage } = usePagination(questions, { initialPageSize: 20 });
 * ```
 */
export function usePagination<T>(
    items: T[],
    options: UsePaginationOptions = {}
): UsePaginationResult<T> {
    const { initialPage = 1, initialPageSize = 20 } = options;

    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSizeState] = useState(initialPageSize);

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Ensure page is within bounds
    const validPage = Math.max(1, Math.min(page, totalPages || 1));

    const paginatedItems = useMemo(() => {
        const startIndex = (validPage - 1) * pageSize;
        return items.slice(startIndex, startIndex + pageSize);
    }, [items, validPage, pageSize]);

    const hasNextPage = validPage < totalPages;
    const hasPreviousPage = validPage > 1;

    const goToPage = useCallback(
        (newPage: number) => {
            setPage(Math.max(1, Math.min(newPage, totalPages || 1)));
        },
        [totalPages]
    );

    const nextPage = useCallback(() => {
        if (hasNextPage) {
            setPage((p) => p + 1);
        }
    }, [hasNextPage]);

    const previousPage = useCallback(() => {
        if (hasPreviousPage) {
            setPage((p) => p - 1);
        }
    }, [hasPreviousPage]);

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setPage(1); // Reset to first page when page size changes
    }, []);

    const resetPage = useCallback(() => {
        setPage(1);
    }, []);

    return {
        page: validPage,
        pageSize,
        totalPages,
        totalItems,
        paginatedItems,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        nextPage,
        previousPage,
        setPageSize,
        resetPage,
    };
}
