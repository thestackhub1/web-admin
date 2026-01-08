// Client-side only — no server secrets or database access here

"use client";

import { useState } from "react";
import { FileText, List, Hash, Info } from "lucide-react";

interface LongAnswerEditorProps {
    value: { sample_answer?: string; key_points?: string[]; max_words?: number };
    onChange: (value: { sample_answer?: string; key_points?: string[]; max_words?: number }) => void;
}

export function LongAnswerEditor({ value, onChange }: LongAnswerEditorProps) {
    const [activeTab, setActiveTab] = useState<"answer" | "points" | "settings">("answer");
    const [newKeyPoint, setNewKeyPoint] = useState("");

    const addKeyPoint = () => {
        if (newKeyPoint.trim()) {
            onChange({
                ...value,
                key_points: [...(value.key_points || []), newKeyPoint.trim()],
            });
            setNewKeyPoint("");
        }
    };

    const removeKeyPoint = (index: number) => {
        const newPoints = [...(value.key_points || [])];
        newPoints.splice(index, 1);
        onChange({ ...value, key_points: newPoints });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Configure the long answer question with sample answer and key points for grading.
            </p>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                <button
                    onClick={() => setActiveTab("answer")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${activeTab === "answer"
                        ? "bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                >
                    <FileText className="h-4 w-4" />
                    Sample Answer
                </button>
                <button
                    onClick={() => setActiveTab("points")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${activeTab === "points"
                        ? "bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                >
                    <List className="h-4 w-4" />
                    Key Points
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${activeTab === "settings"
                        ? "bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                >
                    <Hash className="h-4 w-4" />
                    Settings
                </button>
            </div>

            {/* Sample Answer */}
            {activeTab === "answer" && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Sample Answer (for grading reference)
                    </label>
                    <textarea
                        value={value.sample_answer || ""}
                        onChange={(e) => onChange({ ...value, sample_answer: e.target.value })}
                        rows={8}
                        placeholder="Write a sample answer that teachers can use as a reference for grading..."
                        className="w-full rounded-xl border-0 bg-neutral-50 p-4 text-neutral-900 outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                    />
                    <p className="mt-2 text-xs text-neutral-500">
                        This answer will be shown to teachers during manual grading.
                    </p>
                </div>
            )}

            {/* Key Points */}
            {activeTab === "points" && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Key Points (for grading checklist)
                    </label>
                    <div className="space-y-2">
                        {(value.key_points || []).map((point, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {index + 1}
                                </span>
                                <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">{point}</span>
                                <button
                                    onClick={() => removeKeyPoint(index)}
                                    className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={newKeyPoint}
                            onChange={(e) => setNewKeyPoint(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addKeyPoint()}
                            placeholder="Add a key point..."
                            className="flex-1 rounded-lg border-0 bg-neutral-50 px-3 py-2 text-sm outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:ring-neutral-700"
                        />
                        <button
                            onClick={addKeyPoint}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                        Key points help teachers quickly verify if the answer covers essential topics.
                    </p>
                </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Maximum Word Count (Optional)
                    </label>
                    <input
                        type="number"
                        value={value.max_words || ""}
                        onChange={(e) => onChange({ ...value, max_words: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="e.g., 500"
                        className="w-full rounded-xl border-0 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                    />
                    <p className="mt-2 text-xs text-neutral-500">
                        Set a word limit to guide students on expected answer length.
                    </p>
                </div>
            )}

            <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-3 text-sm text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                <Info className="h-4 w-4 shrink-0" />
                <span>Long answer questions require manual grading by teachers.</span>
            </div>
        </div>
    );
}
