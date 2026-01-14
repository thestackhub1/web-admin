"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Check,
    Sparkles,
    SlidersHorizontal,
    Target,
    Zap,
    BookOpen,
    CircleCheck,
    CircleX,
} from "lucide-react";
import { clsx } from "clsx";
import { FilterState } from "@/client/components/ui/smart-filters";

// ============================================
// Types
// ============================================
interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface QuestionsFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    subjects: FilterOption[];
    className?: string;
}

// ============================================
// Animation Variants
// ============================================
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

// ============================================
// Components
// ============================================

const FilterSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
}> = ({ title, icon, children }) => (
    <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                {icon}
            </span>
            <span>{title}</span>
        </div>
        {children}
    </motion.div>
);

// Difficulty colors for visual feedback
const difficultyColors: Record<string, { bg: string; text: string; ring: string }> = {
    easy: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-500" },
    medium: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-500" },
    hard: { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-400", ring: "ring-rose-500" },
};

const RadioGroup: React.FC<{
    options: FilterOption[];
    value?: string;
    onChange: (value: string) => void;
    colorMap?: Record<string, { bg: string; text: string; ring: string }>;
}> = ({ options, value, onChange, colorMap }) => (
    <div className="flex flex-wrap gap-2">
        {options.map((option) => {
            const isSelected = option.value === value;
            const colors = colorMap?.[option.value];
            
            return (
                <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChange(option.value)}
                    className={clsx(
                        "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isSelected && colors
                            ? `${colors.bg} ${colors.text} ring-2 ${colors.ring}`
                            : isSelected
                                ? "bg-neutral-900 text-white ring-2 ring-neutral-900 dark:bg-white dark:text-neutral-900 dark:ring-white"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    )}
                >
                    <span>{option.label}</span>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center"
                        >
                            <Check className={clsx(
                                "w-3.5 h-3.5",
                                colors ? colors.text : "text-white dark:text-neutral-900"
                            )} />
                        </motion.div>
                    )}
                </motion.button>
            );
        })}
    </div>
);

const DIFFICULTY_OPTIONS = [
    { value: 'all', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'fill_blank', label: 'Fill in Blanks' },
    { value: 'match_pairs', label: 'Match Pairs' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

export function QuestionsFilterDialog({
    isOpen,
    onClose,
    filters,
    onChange,
    subjects,
    className
}: QuestionsFilterDialogProps) {
    const [localFilters, setLocalFilters] = useState<FilterState>(filters);

    // Sync local state when open
    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

    const handleApply = () => {
        onChange(localFilters);
        onClose();
    };

    const handleClear = () => {
        const cleared: FilterState = {
            dateRange: { from: null, to: null, preset: "all" },
            difficulty: undefined,
            questionType: undefined,
            status: undefined,
            subjectId: undefined,
            classLevelId: undefined
        };
        setLocalFilters(cleared);
    };

    const activeCount = [
        localFilters.subjectId,
        localFilters.difficulty && localFilters.difficulty !== 'all',
        localFilters.questionType && localFilters.questionType !== 'all',
        localFilters.status && localFilters.status !== 'all',
    ].filter(Boolean).length;

    const hasChanges = JSON.stringify(localFilters) !== JSON.stringify(filters);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                        className={clsx(
                            "relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900",
                            className
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
                                        <SlidersHorizontal className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Filter Questions</h2>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Narrow down your search results
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {activeCount > 0 && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs text-neutral-500">Active filters:</span>
                                    <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold dark:bg-primary-900/30 dark:text-primary-400">
                                        {activeCount}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="p-6 space-y-5 max-h-[55vh] overflow-y-auto"
                        >
                            {/* Subject Selection */}
                            <FilterSection title="Subject" icon={<BookOpen className="w-3.5 h-3.5 text-primary-500" />}>
                                <div className="flex flex-wrap gap-2">
                                    {subjects.map((sub) => {
                                        const isSelected = localFilters.subjectId === sub.value;
                                        return (
                                            <motion.button
                                                key={sub.value}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setLocalFilters(prev => ({
                                                    ...prev,
                                                    subjectId: prev.subjectId === sub.value ? undefined : sub.value
                                                }))}
                                                className={clsx(
                                                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border",
                                                    isSelected
                                                        ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-500"
                                                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
                                                )}
                                            >
                                                <span>{sub.label}</span>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </FilterSection>

                            {/* Difficulty */}
                            <FilterSection title="Difficulty" icon={<Target className="w-3.5 h-3.5 text-neutral-500" />}>
                                <RadioGroup
                                    options={DIFFICULTY_OPTIONS}
                                    value={localFilters.difficulty || 'all'}
                                    onChange={(val) => setLocalFilters(prev => ({ ...prev, difficulty: val === 'all' ? undefined : val }))}
                                    colorMap={difficultyColors}
                                />
                            </FilterSection>

                            {/* Question Type */}
                            <FilterSection title="Question Type" icon={<Zap className="w-3.5 h-3.5 text-neutral-500" />}>
                                <RadioGroup
                                    options={TYPE_OPTIONS}
                                    value={localFilters.questionType || 'all'}
                                    onChange={(val) => setLocalFilters(prev => ({ ...prev, questionType: val === 'all' ? undefined : val }))}
                                />
                            </FilterSection>

                            {/* Status */}
                            <FilterSection title="Status" icon={<Sparkles className="w-3.5 h-3.5 text-neutral-500" />}>
                                <div className="flex flex-wrap gap-2">
                                    {STATUS_OPTIONS.map((option) => {
                                        const isSelected = (localFilters.status || 'all') === option.value;
                                        const statusColors = {
                                            active: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-500", icon: CircleCheck },
                                            inactive: { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-600 dark:text-neutral-400", ring: "ring-neutral-400", icon: CircleX },
                                        };
                                        const color = statusColors[option.value as keyof typeof statusColors];
                                        const Icon = color?.icon;

                                        return (
                                            <motion.button
                                                key={option.value}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setLocalFilters(prev => ({ ...prev, status: option.value === 'all' ? undefined : option.value }))}
                                                className={clsx(
                                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                                    isSelected && color
                                                        ? `${color.bg} ${color.text} ring-2 ${color.ring}`
                                                        : isSelected
                                                            ? "bg-neutral-900 text-white ring-2 ring-neutral-900 dark:bg-white dark:text-neutral-900 dark:ring-white"
                                                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {Icon && <Icon className="w-4 h-4" />}
                                                <span>{option.label}</span>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <Check className={clsx(
                                                            "w-3.5 h-3.5",
                                                            color ? color.text : "text-white dark:text-neutral-900"
                                                        )} />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </FilterSection>

                        </motion.div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 flex items-center justify-between gap-3">
                            <button
                                onClick={handleClear}
                                disabled={activeCount === 0}
                                className={clsx(
                                    "text-sm font-medium transition-colors px-4 py-2.5 rounded-lg",
                                    activeCount > 0
                                        ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                                        : "text-neutral-300 cursor-not-allowed dark:text-neutral-600"
                                )}
                            >
                                Reset All
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleApply}
                                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all"
                                >
                                    Apply Filters
                                </motion.button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
