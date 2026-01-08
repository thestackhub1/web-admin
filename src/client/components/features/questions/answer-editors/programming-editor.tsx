// Client-side only — no server secrets or database access here

"use client";

import { useState } from "react";
import { Code, Play, Lightbulb } from "lucide-react";

interface ProgrammingEditorProps {
    value: { expected_output?: string; starter_code?: string };
    onChange: (value: { expected_output?: string; starter_code?: string }) => void;
}

export function ProgrammingEditor({ value, onChange }: ProgrammingEditorProps) {
    const [activeTab, setActiveTab] = useState<"code" | "output">("code");

    return (
        <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Configure the programming question with starter code and expected output.
            </p>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                <button
                    onClick={() => setActiveTab("code")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${activeTab === "code"
                            ? "bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white"
                            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                >
                    <Code className="h-4 w-4" />
                    Starter Code
                </button>
                <button
                    onClick={() => setActiveTab("output")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${activeTab === "output"
                            ? "bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white"
                            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                >
                    <Play className="h-4 w-4" />
                    Expected Output
                </button>
            </div>

            {/* Code Editor */}
            {activeTab === "code" && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Starter Code (Optional)
                    </label>
                    <div className="relative">
                        <textarea
                            value={value.starter_code || ""}
                            onChange={(e) => onChange({ ...value, starter_code: e.target.value })}
                            rows={10}
                            placeholder="<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <!-- Write your code here -->
</body>
</html>"
                            className="w-full rounded-xl border-0 bg-neutral-900 p-4 font-mono text-sm text-green-400 outline-none ring-1 ring-neutral-700 focus:ring-2 focus:ring-blue-500"
                            style={{ tabSize: 2 }}
                        />
                        <div className="absolute right-2 top-2 rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-400">
                            HTML/CSS/JS
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                        Provide starter code that students will complete. Leave empty for blank canvas.
                    </p>
                </div>
            )}

            {/* Expected Output */}
            {activeTab === "output" && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Expected Output
                    </label>
                    <textarea
                        value={value.expected_output || ""}
                        onChange={(e) => onChange({ ...value, expected_output: e.target.value })}
                        rows={6}
                        placeholder="Describe what the output should look like or paste expected HTML output..."
                        className="w-full rounded-xl border-0 bg-neutral-50 p-4 text-neutral-900 outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                    />
                    <p className="mt-2 text-xs text-neutral-500">
                        Describe the expected result or provide sample output for grading reference.
                    </p>
                </div>
            )}

            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Programming questions support HTML, CSS, and JavaScript. Students will see a live preview.</span>
            </div>
        </div>
    );
}
