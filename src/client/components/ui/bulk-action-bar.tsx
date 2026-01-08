// Client-side only — no server secrets or database access here

"use client";

import { X, Trash2, ToggleRight, Download } from "lucide-react";

interface BulkActionBarProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onClear: () => void;
    onActivate: () => void;
    onDeactivate: () => void;
    onDelete: () => void;
    onExport: () => void;
}

export function BulkActionBar({
    selectedCount,
    totalCount,
    onSelectAll,
    onClear,
    onActivate,
    onDeactivate,
    onDelete,
    onExport,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <div className="flex items-center gap-4 rounded-2xl bg-neutral-900 px-6 py-4 shadow-2xl dark:bg-neutral-800">
                {/* Selection Info */}
                <div className="flex items-center gap-3 border-r border-neutral-700 pr-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                        {selectedCount}
                    </div>
                    <span className="text-sm text-neutral-300">
                        selected
                        {selectedCount < totalCount && (
                            <button onClick={onSelectAll} className="ml-2 text-primary-400 hover:text-primary-300">
                                Select all ({totalCount})
                            </button>
                        )}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onActivate}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                    >
                        <ToggleRight className="h-4 w-4" />
                        Activate
                    </button>
                    <button
                        onClick={onDeactivate}
                        className="flex items-center gap-2 rounded-xl bg-neutral-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-500"
                    >
                        <ToggleRight className="h-4 w-4" />
                        Deactivate
                    </button>
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-500"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>

                {/* Close */}
                <button
                    onClick={onClear}
                    className="ml-2 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
