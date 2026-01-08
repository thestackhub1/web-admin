// Client-side only — no server secrets or database access here

/**
 * useInlineEdit Hook
 *
 * Hook for inline editing functionality in tables and lists.
 */

import { useState, useCallback } from "react";

export interface EditingCell {
    id: string;
    field: string;
}

export interface UseInlineEditOptions<T> {
    /** Callback when save is triggered */
    onSave: (id: string, field: string, value: T) => Promise<void>;
    /** Optional transform before editing (e.g., JSON to plain text) */
    transformToEdit?: (value: T) => string;
    /** Optional transform before saving (e.g., plain text to JSON) */
    transformToSave?: (value: string) => T;
}

export interface UseInlineEditResult<T> {
    /** Currently editing cell info */
    editingCell: EditingCell | null;
    /** Current edit value */
    editValue: string;
    /** Whether a save operation is in progress */
    isSaving: boolean;
    /** Start editing a cell */
    startEditing: (id: string, field: string, currentValue: T) => void;
    /** Cancel editing */
    cancelEditing: () => void;
    /** Save the current edit */
    saveEdit: () => Promise<void>;
    /** Update the edit value */
    setEditValue: (value: string) => void;
    /** Check if a specific cell is being edited */
    isEditing: (id: string, field: string) => boolean;
}

/**
 * Hook for inline editing in tables/lists
 *
 * @param options - Edit options including save callback
 * @returns Edit state and handlers
 *
 * @example
 * ```tsx
 * const { editingCell, editValue, startEditing, saveEdit } = useInlineEdit({
 *   onSave: async (id, field, value) => await updateQuestion(id, { [field]: value })
 * });
 * ```
 */
export function useInlineEdit<T = string>(
    options: UseInlineEditOptions<T>
): UseInlineEditResult<T> {
    const { onSave, transformToEdit, transformToSave } = options;

    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    const startEditing = useCallback(
        (id: string, field: string, currentValue: T) => {
            setEditingCell({ id, field });
            const stringValue = transformToEdit
                ? transformToEdit(currentValue)
                : String(currentValue);
            setEditValue(stringValue);
        },
        [transformToEdit]
    );

    const cancelEditing = useCallback(() => {
        setEditingCell(null);
        setEditValue("");
    }, []);

    const saveEdit = useCallback(async () => {
        if (!editingCell) return;

        setIsSaving(true);
        try {
            const valueToSave = transformToSave
                ? transformToSave(editValue)
                : (editValue as unknown as T);
            await onSave(editingCell.id, editingCell.field, valueToSave);
            cancelEditing();
        } finally {
            setIsSaving(false);
        }
    }, [editingCell, editValue, onSave, transformToSave, cancelEditing]);

    const isEditing = useCallback(
        (id: string, field: string) => {
            return editingCell?.id === id && editingCell?.field === field;
        },
        [editingCell]
    );

    return {
        editingCell,
        editValue,
        isSaving,
        startEditing,
        cancelEditing,
        saveEdit,
        setEditValue,
        isEditing,
    };
}
