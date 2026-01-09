"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAllQuestions, Question } from "@/client/hooks/use-questions";
import { useSubjects } from "@/client/hooks/use-subjects";
import {
    FilterState,
    FilterPills,
    FilterOption
} from "@/client/components/ui/smart-filters";
import { PageHeader, EmptyState } from "@/client/components/ui/premium";
import { Button, buttonVariants } from "@/client/components/ui/button";
import { Loader } from "@/client/components/ui/loader";
import { QuestionsListView } from "./questions-list-view";
import { QuestionsFilterDialog } from "./questions-filter-dialog";
import {
    FileQuestion,
    Plus,
    CheckCircle,
    Target,
    BarChart3,
    Search,
    X,
    SlidersHorizontal,
} from "lucide-react";
import { clsx } from "clsx";

export default function QuestionsDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL State
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10"); // Match table page size default
    const search = searchParams.get("search") || "";

    // Dialog State
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

    // Construct FilterState from URL parameters
    const filterState: FilterState = useMemo(() => ({
        classLevelId: searchParams.get("classLevelId") || undefined,
        subjectId: searchParams.get("subject") || undefined,
        difficulty: searchParams.get("difficulty") || undefined,
        questionType: searchParams.get("type") || undefined,
        status: searchParams.get("status") || undefined,
        dateRange: { from: null, to: null, preset: "all" },
    }), [searchParams]);

    // Data Fetching
    const { data: subjectsData } = useSubjects();
    const { data: questions, loading, error } = useAllQuestions({
        search,
        subject: filterState.subjectId,
        difficulty: filterState.difficulty,
        type: filterState.questionType,
        status: filterState.status,
        limit,
        offset: (page - 1) * limit,
    });

    // Derived State for Filters
    const subjectOptions: FilterOption[] = useMemo(() => subjectsData
        ?.filter(s => ["scholarship", "english", "information-technology", "information_technology"].includes(s.slug))
        .map(s => ({
            value: s.slug,
            label: s.name_en,
        })) || [], [subjectsData]);

    // Client-side Stats (Note: Real stats should come from API, this mimics structure)
    // Using 0 as we don't have global stats API yet, similar to how screenshot showed 0
    const stats = useMemo(() => ({
        total: questions?.length || 0, // Placeholder
        easy: 0,
        medium: 0,
        hard: 0,
    }), [questions]);


    // Handlers
    const handleFilterChange = (newFilters: FilterState) => {
        const params = new URLSearchParams(currentSearchParams.toString());
        if (newFilters.subjectId) params.set("subject", newFilters.subjectId); else params.delete("subject");
        if (newFilters.difficulty) params.set("difficulty", newFilters.difficulty); else params.delete("difficulty");
        if (newFilters.questionType) params.set("type", newFilters.questionType); else params.delete("type");
        if (newFilters.status) params.set("status", newFilters.status); else params.delete("status");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const currentSearchParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

    const handleSearchChange = (val: string) => {
        const params = new URLSearchParams(currentSearchParams.toString());
        if (val) params.set("search", val); else params.delete("search");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push(pathname);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(currentSearchParams.toString());
        params.set("page", newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const removeFilter = (key: keyof FilterState) => {
        const newFilters = { ...filterState };
        delete newFilters[key];
        handleFilterChange(newFilters);
    };

    const activeFilterCount = [
        filterState.subjectId,
        filterState.difficulty,
        filterState.questionType,
        filterState.status
    ].filter(Boolean).length;


    // Search State (Debounced effect handled by simply pushing URL, local state for input)
    const [localSearch, setLocalSearch] = useState(search);
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearch(e.target.value);
        // In a real app, debounce this. For now user hits enter or we just let it update on blur?
        // Simulating the existing pattern which probably used OnChange directly?
        // Let's just update URL on Enter or Blur or debounce.
    };
    const submitSearch = () => handleSearchChange(localSearch);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Standard Header */}
            <PageHeader
                title="Question Bank"
                description="Manage, organize, and filter questions across all subjects"
                breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Questions" }]}
            />

            {/* Compact Stats Bar - Styled like Scheduled Exams List */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            <FileQuestion className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-neutral-500">Total Questions</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">-</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-success-100 bg-success-50/50 p-3 dark:border-success-900/20 dark:bg-success-900/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-success-600 dark:text-success-400">Easy</p>
                            <p className="text-lg font-bold text-success-700 dark:text-success-300">-</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-warning-100 bg-warning-50/50 p-3 dark:border-warning-900/20 dark:bg-warning-900/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-warning-600 dark:text-warning-400">Medium</p>
                            <p className="text-lg font-bold text-warning-700 dark:text-warning-300">-</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 dark:border-purple-900/20 dark:bg-purple-900/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Hard</p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">-</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters Bar - Styled like Scheduled Exams List */}
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={localSearch}
                            onChange={handleSearchInput}
                            onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                            onBlur={submitSearch}
                            className={clsx(
                                "w-full h-11 rounded-xl border pl-10 pr-4 text-sm",
                                "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900",
                                "placeholder:text-neutral-400",
                                "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            )}
                        />
                        {localSearch && (
                            <button
                                onClick={() => { setLocalSearch(""); handleSearchChange(""); }}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/questions/import"
                            className={clsx(buttonVariants({ variant: "primary" }), "hidden sm:flex")}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Question
                        </Link>
                        <Link
                            href="/dashboard/questions/import"
                            className={clsx(buttonVariants({ size: "sm" }), "sm:hidden p-2")}
                            title="Create Question"
                        >
                            <Plus className="h-4 w-4" />
                        </Link>


                        {/* Filter Button */}
                        <button
                            onClick={() => setIsFilterDialogOpen(true)}
                            className={clsx(
                                "flex items-center gap-2 h-11 px-4 rounded-xl border transition-all",
                                activeFilterCount > 0
                                    ? "border-neutral-900 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300"
                            )}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:inline">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Active Filter Pills */}
                <FilterPills
                    filters={filterState}
                    classLevels={[]} // Not really used for Questions in this context but prop required
                    subjects={subjectOptions}
                    onRemove={removeFilter}
                    className="pt-1"
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader size="lg" />
                </div>
            ) : error ? (
                <EmptyState
                    icon={FileQuestion}
                    title="Failed to load questions"
                    description="There was a problem fetching the question bank. Please try again."
                    action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
                />
            ) : !questions || questions.length === 0 ? (
                <EmptyState
                    icon={search || activeFilterCount > 0 ? Search : FileQuestion}
                    title={search || activeFilterCount > 0 ? "No matching questions" : "Question bank is empty"}
                    description={search || activeFilterCount > 0
                        ? "Try adjusting your filters to find what you're looking for."
                        : "Get started by creating a new question."}
                    action={
                        (search || activeFilterCount > 0) ? (
                            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                        ) : (
                            <Link href="/dashboard/questions/import">
                                <Button>Create Question</Button>
                            </Link>
                        )
                    }
                />
            ) : (
                <QuestionsListView
                    questions={questions}
                    page={page}
                    limit={limit}
                    total={questions.length} // Needs better total from API but ok for now
                    onPageChange={handlePageChange}
                />
            )}

            <QuestionsFilterDialog
                isOpen={isFilterDialogOpen}
                onClose={() => setIsFilterDialogOpen(false)}
                filters={filterState}
                onChange={handleFilterChange}
                subjects={subjectOptions}
            />
        </div>
    );
}
