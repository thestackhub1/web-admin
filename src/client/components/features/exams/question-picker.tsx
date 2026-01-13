// Client-side only — no server secrets or database access here

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import {
    Search,
    CheckSquare,
    Square,
    ChevronDown,
    ChevronRight,
    BookOpen,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { Button } from '@/client/components/ui/button';
import { Badge } from '@/client/components/ui/premium';
import { type QuestionType, difficultyLabels, difficultyColors } from "@/client/types/questions";
import type { Question, Difficulty } from "@/client/types/questions";
import type { ChapterQuestionConfig, ChapterWithCount } from '@/client/components/features/subjects/chapter-selector';
import { api } from "@/client/api/api-client";

interface QuestionPickerProps {
    subjectId: string;
    questionType: QuestionType;
    chapterConfigs: ChapterQuestionConfig[];
    selectedQuestionIds: string[];
    onSelectionChange: (ids: string[]) => void;
    requiredCount: number;
    chapters: ChapterWithCount[];
}

interface QuestionWithChapter extends Question {
    chapter_name?: string;
}

interface ChapterGroup {
    chapter_id: string;
    chapter_name: string;
    questions: QuestionWithChapter[];
    isExpanded: boolean;
}

export function QuestionPicker({
    subjectId,
    questionType,
    chapterConfigs,
    selectedQuestionIds,
    onSelectionChange,
    requiredCount,
    chapters,
}: QuestionPickerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [questions, setQuestions] = useState<QuestionWithChapter[]>([]);
    const [chapterGroups, setChapterGroups] = useState<ChapterGroup[]>([]);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
    const [error, setError] = useState<string | null>(null);

    // Get the subject slug for API calls
    const getSubjectSlug = useCallback(async () => {
        // Fetch subject to get slug
        const { data } = await api.get<{ slug: string }>(`/api/v1/subjects/${subjectId}`);
        return data?.slug || "scholarship";
    }, [subjectId]);

    // Fetch questions from selected chapters
    const fetchQuestions = useCallback(async () => {
        if (chapters.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const subjectSlug = await getSubjectSlug();
            const allQuestions: QuestionWithChapter[] = [];

            // Determine which chapters to fetch from
            const chaptersToFetch = chapterConfigs.length > 0
                ? chapterConfigs.map(c => c.chapter_id)
                : chapters.map(c => c.id);

            // Fetch questions from each chapter
            for (const chapterId of chaptersToFetch) {
                const chapter = chapters.find(c => c.id === chapterId);
                if (!chapter) continue;

                const { data, error: fetchErr } = await api.get<Question[]>(
                    `/api/v1/subjects/${subjectSlug}/chapters/${chapterId}/questions?type=${questionType}&limit=100`
                );

                if (fetchErr) {
                    console.error(`Failed to fetch questions for chapter ${chapterId}:`, fetchErr);
                    continue;
                }

                if (data) {
                    const questionsWithChapter: QuestionWithChapter[] = data.map((q: Question) => ({
                        ...q,
                        chapter_name: chapter.name_en,
                    }));
                    allQuestions.push(...questionsWithChapter);
                }
            }

            setQuestions(allQuestions);

            // Group by chapter
            const groups: ChapterGroup[] = [];
            const groupedMap = new Map<string, QuestionWithChapter[]>();

            for (const q of allQuestions) {
                const chapterId = q.chapter_id || "unknown";
                if (!groupedMap.has(chapterId)) {
                    groupedMap.set(chapterId, []);
                }
                groupedMap.get(chapterId)!.push(q);
            }

            for (const [chapterId, chapterQuestions] of groupedMap) {
                const chapter = chapters.find(c => c.id === chapterId);
                groups.push({
                    chapter_id: chapterId,
                    chapter_name: chapter?.name_en || "Unknown Chapter",
                    questions: chapterQuestions,
                    isExpanded: true,
                });
            }

            setChapterGroups(groups);

            // Expand first few chapters by default
            const initialExpanded = new Set<string>(groups.slice(0, 3).map(g => g.chapter_id));
            setExpandedChapters(initialExpanded);

        } catch (err) {
            console.error("Failed to fetch questions:", err);
            setError("Failed to load questions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [chapters, chapterConfigs, questionType, getSubjectSlug]);

    // Load questions on mount and when dependencies change
    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    // Toggle question selection
    const toggleQuestion = useCallback((questionId: string) => {
        if (selectedQuestionIds.includes(questionId)) {
            onSelectionChange(selectedQuestionIds.filter(id => id !== questionId));
        } else {
            onSelectionChange([...selectedQuestionIds, questionId]);
        }
    }, [selectedQuestionIds, onSelectionChange]);

    // Select all questions from a chapter
    const selectAllFromChapter = useCallback((chapterId: string) => {
        const chapterQuestions = questions.filter(q => q.chapter_id === chapterId);
        const chapterQuestionIds = chapterQuestions.map(q => q.id);
        const newSelection = new Set(selectedQuestionIds);
        chapterQuestionIds.forEach(id => newSelection.add(id));
        onSelectionChange(Array.from(newSelection));
    }, [questions, selectedQuestionIds, onSelectionChange]);

    // Deselect all questions from a chapter
    const deselectAllFromChapter = useCallback((chapterId: string) => {
        const chapterQuestions = questions.filter(q => q.chapter_id === chapterId);
        const chapterQuestionIds = new Set(chapterQuestions.map(q => q.id));
        onSelectionChange(selectedQuestionIds.filter(id => !chapterQuestionIds.has(id)));
    }, [questions, selectedQuestionIds, onSelectionChange]);

    // Toggle chapter expansion
    const toggleChapterExpansion = useCallback((chapterId: string) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(chapterId)) {
                next.delete(chapterId);
            } else {
                next.add(chapterId);
            }
            return next;
        });
    }, []);

    // Clear all selections
    const clearAllSelections = useCallback(() => {
        onSelectionChange([]);
    }, [onSelectionChange]);

    // Filter questions by search and difficulty
    const filteredGroups = useMemo(() => {
        return chapterGroups.map(group => {
            const filteredQuestions = group.questions.filter(q => {
                const matchesSearch = searchQuery === "" || 
                    q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
                return matchesSearch && matchesDifficulty;
            });

            return {
                ...group,
                questions: filteredQuestions,
            };
        }).filter(group => group.questions.length > 0);
    }, [chapterGroups, searchQuery, difficultyFilter]);

    // Count selected questions per chapter
    const getChapterSelectionCount = useCallback((chapterId: string) => {
        return questions.filter(q => 
            q.chapter_id === chapterId && selectedQuestionIds.includes(q.id)
        ).length;
    }, [questions, selectedQuestionIds]);

    // Check if all chapter questions are selected
    const isChapterFullySelected = useCallback((chapterId: string) => {
        const chapterQuestions = questions.filter(q => q.chapter_id === chapterId);
        return chapterQuestions.length > 0 && 
            chapterQuestions.every(q => selectedQuestionIds.includes(q.id));
    }, [questions, selectedQuestionIds]);

    if (chapters.length === 0) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-900/20">
                <BookOpen className="mx-auto h-10 w-10 text-amber-500/50" />
                <p className="mt-3 text-sm font-medium text-amber-800 dark:text-amber-300">
                    No chapters available
                </p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Configure chapters first to select specific questions.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Compact Selection Summary + Actions */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm",
                        selectedQuestionIds.length === requiredCount
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : selectedQuestionIds.length > requiredCount
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    )}>
                        {selectedQuestionIds.length}
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {selectedQuestionIds.length === 0 
                            ? "Auto-select enabled"
                            : `${selectedQuestionIds.length}/${requiredCount} selected`}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchQuestions}
                        disabled={isLoading}
                        className="h-8 px-2"
                    >
                        <RefreshCw className={clsx("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                    {selectedQuestionIds.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllSelections}
                            className="h-8 text-xs"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions..."
                        className="w-full h-10 rounded-lg border border-neutral-200 pl-10 pr-4 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                </div>
                <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | "all")}
                    className="h-10 rounded-lg border border-neutral-200 px-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <LoaderSpinner />
                    <span className="ml-2 text-sm text-neutral-500">Loading questions...</span>
                </div>
            )}

            {/* Question List by Chapter */}
            {!isLoading && !error && (
                <div className="space-y-3">
                    {filteredGroups.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
                            <p className="text-sm text-neutral-500">
                                {searchQuery || difficultyFilter !== "all"
                                    ? "No questions match your filters"
                                    : "No questions available for the selected question type"}
                            </p>
                        </div>
                    ) : (
                        filteredGroups.map((group) => {
                            const isExpanded = expandedChapters.has(group.chapter_id);
                            const selectionCount = getChapterSelectionCount(group.chapter_id);
                            const isFullySelected = isChapterFullySelected(group.chapter_id);

                            return (
                                <div
                                    key={group.chapter_id}
                                    className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                                >
                                    {/* Chapter Header */}
                                    <div
                                        className={clsx(
                                            "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
                                            isExpanded
                                                ? "bg-primary-50 dark:bg-primary-900/20"
                                                : "bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        )}
                                        onClick={() => toggleChapterExpansion(group.chapter_id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-neutral-500" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-neutral-500" />
                                            )}
                                            <BookOpen className="h-4 w-4 text-primary-500" />
                                            <span className="font-medium text-neutral-900 dark:text-white">
                                                {group.chapter_name}
                                            </span>
                                            <Badge variant="default" size="sm">
                                                {group.questions.length} questions
                                            </Badge>
                                            {selectionCount > 0 && (
                                                <Badge variant="success" size="sm">
                                                    {selectionCount} selected
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {isFullySelected ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => deselectAllFromChapter(group.chapter_id)}
                                                >
                                                    Deselect All
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => selectAllFromChapter(group.chapter_id)}
                                                >
                                                    Select All
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Questions */}
                                    {isExpanded && (
                                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                            {group.questions.map((question) => {
                                                const isSelected = selectedQuestionIds.includes(question.id);
                                                return (
                                                    <div
                                                        key={question.id}
                                                        className={clsx(
                                                            "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                                                            isSelected
                                                                ? "bg-primary-50/50 dark:bg-primary-900/10"
                                                                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                                                        )}
                                                        onClick={() => toggleQuestion(question.id)}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className="pt-0.5">
                                                            {isSelected ? (
                                                                <CheckSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                                            ) : (
                                                                <Square className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                                                            )}
                                                        </div>

                                                        {/* Question Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-neutral-900 dark:text-white line-clamp-2">
                                                                {question.question_text}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className={clsx(
                                                                    "px-1.5 py-0.5 rounded text-xs font-medium",
                                                                    difficultyColors[question.difficulty]
                                                                )}>
                                                                    {difficultyLabels[question.difficulty]}
                                                                </span>
                                                                <span className="text-xs text-neutral-400">
                                                                    {question.marks} mark{question.marks !== 1 ? "s" : ""}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
