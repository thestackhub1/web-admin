// Client-side only — no server secrets or database access here

"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { Check, X, Search, BookOpen, AlertCircle, Minus, Plus } from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import type { QuestionType } from "@/client/types/questions";

export interface ChapterWithCount {
    id: string;
    name_en: string;
    name_mr: string | null;
    subject_id?: string;
    order_index: number;
    question_counts?: Record<string, number>; // question_type -> count
    total_questions?: number;
    question_count?: number; // Alias for total_questions from API
}

/** Configuration for questions to pick from a specific chapter */
export interface ChapterQuestionConfig {
    chapter_id: string;
    question_count: number;
}

interface ChapterSelectorProps {
    chapters: ChapterWithCount[];
    /** Selected chapter configurations with question counts */
    chapterConfigs: ChapterQuestionConfig[];
    /** Callback when chapter selection or counts change */
    onConfigChange: (configs: ChapterQuestionConfig[]) => void;
    questionType?: QuestionType;
    requiredQuestionCount?: number;
    isLoading?: boolean;
    className?: string;
}

export function ChapterSelector({
    chapters,
    chapterConfigs,
    onConfigChange,
    questionType,
    requiredQuestionCount = 0,
    isLoading = false,
    className,
}: ChapterSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Get selected chapter IDs from configs
    const selectedChapterIds = useMemo(
        () => chapterConfigs.map((c) => c.chapter_id),
        [chapterConfigs]
    );

    // Filter chapters based on search
    const filteredChapters = useMemo(() => {
        if (!searchQuery.trim()) return chapters;
        const query = searchQuery.toLowerCase();
        return chapters.filter(
            (ch) =>
                ch.name_en.toLowerCase().includes(query) ||
                (ch.name_mr && ch.name_mr.toLowerCase().includes(query))
        );
    }, [chapters, searchQuery]);

    // Calculate total configured questions
    const totalConfiguredQuestions = useMemo(() => {
        return chapterConfigs.reduce((sum, c) => sum + c.question_count, 0);
    }, [chapterConfigs]);

    // Calculate available questions for selected chapters
    const _totalAvailableInSelected = useMemo(() => {
        if (!questionType) return 0;
        return chapterConfigs.reduce((sum, config) => {
            const chapter = chapters.find((ch) => ch.id === config.chapter_id);
            return sum + (chapter?.question_counts?.[questionType] || 0);
        }, 0);
    }, [chapters, chapterConfigs, questionType]);

    const isNoneSelected = chapterConfigs.length === 0;
    const isAllSelected = chapterConfigs.length === chapters.length;
    const _hasEnoughQuestions = isNoneSelected || totalConfiguredQuestions >= requiredQuestionCount;
    const configMatchesRequired = totalConfiguredQuestions === requiredQuestionCount;

    const getChapterQuestionCount = (chapter: ChapterWithCount) => {
        if (!questionType) return chapter.total_questions || 0;
        return chapter.question_counts?.[questionType] || 0;
    };

    const getChapterConfig = (chapterId: string): ChapterQuestionConfig | undefined => {
        return chapterConfigs.find((c) => c.chapter_id === chapterId);
    };

    const handleToggleChapter = (chapterId: string) => {
        const existing = getChapterConfig(chapterId);
        if (existing) {
            // Remove chapter
            onConfigChange(chapterConfigs.filter((c) => c.chapter_id !== chapterId));
        } else {
            // Add chapter with default count based on available questions
            const chapter = chapters.find((ch) => ch.id === chapterId);
            const available = chapter?.question_counts?.[questionType || ""] || 0;
            const remaining = Math.max(0, requiredQuestionCount - totalConfiguredQuestions);
            const defaultCount = Math.min(available, remaining > 0 ? remaining : available);
            onConfigChange([
                ...chapterConfigs,
                { chapter_id: chapterId, question_count: Math.max(1, defaultCount) },
            ]);
        }
    };

    const handleUpdateCount = (chapterId: string, count: number) => {
        const chapter = chapters.find((ch) => ch.id === chapterId);
        const maxAvailable = chapter?.question_counts?.[questionType || ""] || 0;
        const clampedCount = Math.max(0, Math.min(count, maxAvailable));
        
        if (clampedCount === 0) {
            // Remove if count is 0
            onConfigChange(chapterConfigs.filter((c) => c.chapter_id !== chapterId));
        } else {
            onConfigChange(
                chapterConfigs.map((c) =>
                    c.chapter_id === chapterId ? { ...c, question_count: clampedCount } : c
                )
            );
        }
    };

    const handleSelectAll = () => {
        // Distribute questions evenly across all chapters
        const perChapter = Math.floor(requiredQuestionCount / chapters.length);
        const remainder = requiredQuestionCount % chapters.length;
        
        const configs: ChapterQuestionConfig[] = chapters.map((ch, index) => {
            const available = ch.question_counts?.[questionType || ""] || 0;
            const desired = perChapter + (index < remainder ? 1 : 0);
            return {
                chapter_id: ch.id,
                question_count: Math.min(available, desired) || Math.min(available, 1),
            };
        }).filter(c => c.question_count > 0);
        
        onConfigChange(configs);
    };

    const handleDeselectAll = () => {
        onConfigChange([]);
    };

    const handleAutoDistribute = () => {
        if (chapterConfigs.length === 0) return;
        
        // Auto-distribute required questions among selected chapters
        const selectedChapters = chapters.filter((ch) =>
            selectedChapterIds.includes(ch.id)
        );
        
        let remaining = requiredQuestionCount;
        const newConfigs: ChapterQuestionConfig[] = [];
        
        for (const chapter of selectedChapters) {
            const available = chapter.question_counts?.[questionType || ""] || 0;
            const perChapter = Math.ceil(remaining / (selectedChapters.length - newConfigs.length));
            const toTake = Math.min(available, perChapter);
            
            if (toTake > 0) {
                newConfigs.push({ chapter_id: chapter.id, question_count: toTake });
                remaining -= toTake;
            }
        }
        
        onConfigChange(newConfigs);
    };

    if (isLoading) {
        return (
            <div className={clsx("flex items-center justify-center py-12", className)}>
                <LoaderSpinner size="md" />
                <span className="ml-2 text-neutral-500">Loading chapters...</span>
            </div>
        );
    }

    return (
        <div className={clsx("space-y-3", className)}>
            {/* Compact Status Bar */}
            <div className="flex items-center justify-between gap-3">
                {/* Left: Status */}
                <div className="flex items-center gap-2 text-sm">
                    {isNoneSelected ? (
                        <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <BookOpen className="h-3.5 w-3.5" />
                            Random from all chapters
                        </span>
                    ) : (
                        <>
                            <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                                <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                                {chapterConfigs.length} chapter{chapterConfigs.length > 1 ? "s" : ""}
                            </span>
                            {questionType && (
                                <>
                                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                    <span className={clsx(
                                        "font-medium",
                                        configMatchesRequired
                                            ? "text-green-600 dark:text-green-400"
                                            : totalConfiguredQuestions < requiredQuestionCount
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-red-600 dark:text-red-400"
                                    )}>
                                        {totalConfiguredQuestions}/{requiredQuestionCount} questions
                                        {!configMatchesRequired && (
                                            <AlertCircle className="ml-1 inline h-3.5 w-3.5" />
                                        )}
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                    {!configMatchesRequired && !isNoneSelected && (
                        <button
                            onClick={handleAutoDistribute}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        >
                            Auto-fill
                        </button>
                    )}
                    <button
                        onClick={handleSelectAll}
                        disabled={isAllSelected}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                        All
                    </button>
                    <button
                        onClick={handleDeselectAll}
                        disabled={isNoneSelected}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chapters..."
                    className="w-full rounded-xl border-0 bg-neutral-100 py-2 pl-10 pr-4 text-sm text-neutral-900 outline-none ring-1 ring-neutral-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700"
                />
            </div>

            {/* Chapter List */}
            <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                {filteredChapters.length === 0 ? (
                    <div className="py-8 text-center text-neutral-500">
                        {searchQuery ? "No chapters match your search" : "No chapters available"}
                    </div>
                ) : (
                    filteredChapters.map((chapter) => {
                        const config = getChapterConfig(chapter.id);
                        const isSelected = !!config;
                        const availableCount = getChapterQuestionCount(chapter);

                        return (
                            <div
                                key={chapter.id}
                                className={clsx(
                                    "flex items-center gap-3 rounded-xl p-3 transition-all",
                                    isSelected
                                        ? "bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-900/30"
                                        : "bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                )}
                            >
                                {/* Checkbox */}
                                <button
                                    onClick={() => handleToggleChapter(chapter.id)}
                                    className={clsx(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                                        isSelected
                                            ? "border-blue-500 bg-blue-500 text-white"
                                            : "border-neutral-300 hover:border-blue-400 dark:border-neutral-600"
                                    )}
                                >
                                    {isSelected && <Check className="h-3 w-3" />}
                                </button>

                                {/* Chapter Info */}
                                <button
                                    onClick={() => handleToggleChapter(chapter.id)}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <p
                                        className={clsx(
                                            "truncate font-medium",
                                            isSelected
                                                ? "text-blue-900 dark:text-blue-100"
                                                : "text-neutral-900 dark:text-white"
                                        )}
                                    >
                                        {chapter.name_en}
                                    </p>
                                    {chapter.name_mr && (
                                        <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                                            {chapter.name_mr}
                                        </p>
                                    )}
                                </button>

                                {/* Question Count Input (when selected) */}
                                {isSelected && config ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleUpdateCount(chapter.id, config.question_count - 1)}
                                            disabled={config.question_count <= 1}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm hover:bg-neutral-50 disabled:opacity-40 dark:bg-neutral-700 dark:text-neutral-300"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <input
                                            type="number"
                                            value={config.question_count}
                                            onChange={(e) =>
                                                handleUpdateCount(chapter.id, parseInt(e.target.value) || 0)
                                            }
                                            min={1}
                                            max={availableCount}
                                            className="h-7 w-12 rounded-lg border-0 bg-white text-center text-sm font-bold text-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
                                        />
                                        <button
                                            onClick={() => handleUpdateCount(chapter.id, config.question_count + 1)}
                                            disabled={config.question_count >= availableCount}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm hover:bg-neutral-50 disabled:opacity-40 dark:bg-neutral-700 dark:text-neutral-300"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                        <span className="ml-1 text-xs text-neutral-500">/ {availableCount}</span>
                                    </div>
                                ) : (
                                    /* Available Count Badge (when not selected) */
                                    <div
                                        className={clsx(
                                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                                            availableCount > 0
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                                        )}
                                    >
                                        {availableCount} {questionType ? questionType.replace("_", " ") : "total"}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Selected Summary with counts */}
            {chapterConfigs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {chapters
                        .filter((ch) => selectedChapterIds.includes(ch.id))
                        .map((chapter) => {
                            const config = getChapterConfig(chapter.id);
                            return (
                                <span
                                    key={chapter.id}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                    {chapter.name_en}
                                    <span className="rounded bg-blue-200 px-1.5 text-xs font-bold dark:bg-blue-800">
                                        {config?.question_count || 0}
                                    </span>
                                    <button
                                        onClick={() => handleToggleChapter(chapter.id)}
                                        className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
