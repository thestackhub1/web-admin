// Client-side only — no server secrets or database access here

"use client";

import { Plus, Trash2, ArrowLeftRight } from "lucide-react";
import { QuestionEditor } from '@/client/components/shared/rich-text-editor';

interface MatchEditorProps {
    value: { pairs: { left: string; right: string }[] };
    onChange: (value: { pairs: { left: string; right: string }[] }) => void;
}

export function MatchEditor({ value, onChange }: MatchEditorProps) {
    const pairs = value.pairs || [{ left: "", right: "" }];

    const updatePair = (index: number, side: "left" | "right", html: any) => {
        const newPairs = [...pairs];
        newPairs[index] = { ...newPairs[index], [side]: html };
        onChange({ pairs: newPairs });
    };

    const addPair = () => {
        if (pairs.length < 6) {
            onChange({ pairs: [...pairs, { left: "", right: "" }] });
        }
    };

    const removePair = (index: number) => {
        if (pairs.length > 1) {
            onChange({ pairs: pairs.filter((_, i) => i !== index) });
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Create matching pairs:</p>

            {/* Header */}
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <div className="flex-1 text-center">Column A</div>
                <div className="w-8"></div>
                <div className="flex-1 text-center">Column B</div>
                <div className="w-10"></div>
            </div>

            <div className="space-y-3">
                {pairs.map((pair, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex-1">
                            <QuestionEditor
                                content={pair.left}
                                onChange={(html) => updatePair(index, "left", html)}
                                placeholder="Left side..."
                                variant="compact"
                                outputFormat="html"
                                className="min-h-0"
                            />
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mt-2">
                            <ArrowLeftRight className="h-4 w-4 text-neutral-400" />
                        </div>
                        <div className="flex-1">
                            <QuestionEditor
                                content={pair.right}
                                onChange={(html) => updatePair(index, "right", html)}
                                placeholder="Right side..."
                                variant="compact"
                                outputFormat="html"
                                className="min-h-0"
                            />
                        </div>
                        {pairs.length > 1 && (
                            <button
                                onClick={() => removePair(index)}
                                className="rounded-lg p-2 text-neutral-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 mt-2"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {pairs.length < 6 && (
                <button
                    onClick={addPair}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-3 text-sm text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-600 dark:border-neutral-700 dark:hover:border-neutral-600"
                >
                    <Plus className="h-4 w-4" />
                    Add Pair
                </button>
            )}
        </div>
    );
}
