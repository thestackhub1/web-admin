// Client-side only — no server secrets or database access here

"use client";

import { Plus, Trash2 } from "lucide-react";

interface FillBlankEditorProps {
    value: { blanks: string[] };
    onChange: (value: { blanks: string[] }) => void;
}

export function FillBlankEditor({ value, onChange }: FillBlankEditorProps) {
    const blanks = value.blanks || [""];

    const updateBlank = (index: number, text: string) => {
        const newBlanks = [...blanks];
        newBlanks[index] = text;
        onChange({ blanks: newBlanks });
    };

    const addBlank = () => {
        if (blanks.length < 5) {
            onChange({ blanks: [...blanks, ""] });
        }
    };

    const removeBlank = (index: number) => {
        if (blanks.length > 1) {
            onChange({ blanks: blanks.filter((_, i) => i !== index) });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Enter the correct answers for each blank:</p>
                <p className="mt-1 text-xs text-neutral-400">
                    Use <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">___</code> in the question text to mark
                    blanks
                </p>
            </div>

            <div className="space-y-3">
                {blanks.map((blank, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 font-semibold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            {index + 1}
                        </div>
                        <input
                            type="text"
                            value={blank}
                            onChange={(e) => updateBlank(index, e.target.value)}
                            placeholder={`Answer for blank ${index + 1}...`}
                            className="flex-1 rounded-xl border-0 bg-neutral-50 px-4 py-2.5 text-neutral-900 outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                        />
                        {blanks.length > 1 && (
                            <button
                                onClick={() => removeBlank(index)}
                                className="rounded-lg p-2 text-neutral-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {blanks.length < 5 && (
                <button
                    onClick={addBlank}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-3 text-sm text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-600 dark:border-neutral-700 dark:hover:border-neutral-600"
                >
                    <Plus className="h-4 w-4" />
                    Add Blank
                </button>
            )}
        </div>
    );
}
