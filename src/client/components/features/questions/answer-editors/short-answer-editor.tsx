// Client-side only — no server secrets or database access here

"use client";

import { Lightbulb } from "lucide-react";

interface ShortAnswerEditorProps {
    value: { expected_answer: string };
    onChange: (value: { expected_answer: string }) => void;
}

export function ShortAnswerEditor({ value, onChange }: ShortAnswerEditorProps) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Enter the expected answer or key points:</p>

            <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Expected Answer</label>
                <textarea
                    value={value.expected_answer || ""}
                    onChange={(e) => onChange({ expected_answer: e.target.value })}
                    rows={4}
                    placeholder="Enter the expected answer..."
                    className="w-full rounded-xl border-0 bg-neutral-50 p-4 text-neutral-900 outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                />
            </div>

            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Short answer questions are manually graded. The expected answer is shown to graders as a reference.</span>
            </div>
        </div>
    );
}
