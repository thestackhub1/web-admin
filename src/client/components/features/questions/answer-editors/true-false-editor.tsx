// Client-side only — no server secrets or database access here

"use client";

import { clsx } from "clsx";
import { Check, X } from "lucide-react";

interface TrueFalseEditorProps {
    value: { correct_answer: boolean };
    onChange: (value: { correct_answer: boolean }) => void;
}

export function TrueFalseEditor({ value, onChange }: TrueFalseEditorProps) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Select the correct answer:</p>
            <div className="flex gap-4">
                <button
                    onClick={() => onChange({ correct_answer: true })}
                    className={clsx(
                        "flex flex-1 items-center justify-center gap-3 rounded-xl p-6 text-lg font-semibold transition-all",
                        value.correct_answer === true
                            ? "bg-green-100 text-green-700 ring-2 ring-green-500 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    )}
                >
                    <Check className="h-6 w-6" />
                    True
                </button>
                <button
                    onClick={() => onChange({ correct_answer: false })}
                    className={clsx(
                        "flex flex-1 items-center justify-center gap-3 rounded-xl p-6 text-lg font-semibold transition-all",
                        value.correct_answer === false
                            ? "bg-red-100 text-red-700 ring-2 ring-red-500 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    )}
                >
                    <X className="h-6 w-6" />
                    False
                </button>
            </div>
        </div>
    );
}
