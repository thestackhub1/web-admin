"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Calendar,
    Filter,
    Check,
    Sparkles,
    SlidersHorizontal,
} from "lucide-react";
import { clsx } from "clsx";
import { DateRangePicker, type DateRange } from "@/client/components/ui/smart-filters";

// ============================================
// Types
// ============================================
interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface FilterState {
    classLevelId?: string;
    subjectId?: string;
    dateRange?: DateRange;
    status?: string;
}

interface FilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    classLevels: FilterOption[];
    subjects: FilterOption[];
    className?: string;
}

// ============================================
// Components
// ============================================

const FilterSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, icon, children }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {icon}
            <span>{title}</span>
        </div>
        {children}
    </div>
);

const RadioGroup: React.FC<{
    options: FilterOption[];
    value?: string;
    onChange: (value: string) => void;
    name: string;
}> = ({ options, value, onChange, name }) => (
    <div className="flex flex-wrap gap-2">
        {options.map((option) => {
            const isSelected = option.value === value;
            return (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={clsx(
                        "group relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                        isSelected
                            ? "bg-neutral-900 text-white shadow-lg dark:bg-white dark:text-neutral-900"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    )}
                >
                    {isSelected && (
                        <motion.div
                            layoutId={`check-${name}`}
                            className="absolute inset-0 rounded-xl bg-neutral-900 dark:bg-white -z-10"
                        />
                    )}
                    <span>{option.label}</span>
                    {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white dark:text-neutral-900" />
                    )}
                </button>
            );
        })}
    </div>
);

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
];

export function FilterDialog({
    isOpen,
    onClose,
    filters,
    onChange,
    classLevels,
    subjects,
    className
}: FilterDialogProps) {
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
        const cleared = {
            dateRange: { from: null, to: null, preset: "all" },
            status: 'all'
        };
        setLocalFilters(cleared);
    };

    const activeCount = [
        localFilters.classLevelId,
        localFilters.subjectId,
        localFilters.status && localFilters.status !== 'all',
        localFilters.dateRange?.preset && localFilters.dateRange.preset !== 'all'
    ].filter(Boolean).length;

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
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className={clsx(
                            "relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900",
                            className
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
                            <div className="absolute inset-0 bg-linear-to-r from-primary-50 to-insight-50 dark:from-primary-900/10 dark:to-insight-900/10 opacity-50" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-neutral-800">
                                        <SlidersHorizontal className="h-5 w-5 text-neutral-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Filters</h2>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Refine your exam list
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
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">

                            {/* Status */}
                            <FilterSection title="Status" icon={<Sparkles className="w-4 h-4" />}>
                                <RadioGroup
                                    name="status"
                                    options={STATUS_OPTIONS}
                                    value={localFilters.status || 'all'}
                                    onChange={(val) => setLocalFilters(prev => ({ ...prev, status: val === 'all' ? undefined : val }))}
                                />
                            </FilterSection>

                            {/* Class Level */}
                            <FilterSection title="Class Level" icon={<Filter className="w-4 h-4" />}>
                                <div className="grid grid-cols-2 gap-2">
                                    {classLevels.map((cl) => (
                                        <button
                                            key={cl.value}
                                            onClick={() => setLocalFilters(prev => ({
                                                ...prev,
                                                classLevelId: prev.classLevelId === cl.value ? undefined : cl.value
                                            }))}
                                            className={clsx(
                                                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
                                                localFilters.classLevelId === cl.value
                                                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-500"
                                                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
                                            )}
                                        >
                                            <span>{cl.label}</span>
                                            {localFilters.classLevelId === cl.value && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Subject */}
                            <FilterSection title="Subject" icon={<Filter className="w-4 h-4" />}>
                                <div className="grid grid-cols-2 gap-2">
                                    {subjects.map((sub) => (
                                        <button
                                            key={sub.value}
                                            onClick={() => setLocalFilters(prev => ({
                                                ...prev,
                                                subjectId: prev.subjectId === sub.value ? undefined : sub.value
                                            }))}
                                            className={clsx(
                                                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
                                                localFilters.subjectId === sub.value
                                                    ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500"
                                                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
                                            )}
                                        >
                                            <span>{sub.label}</span>
                                            {localFilters.subjectId === sub.value && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Date Range */}
                            <FilterSection title="Date Range" icon={<Calendar className="w-4 h-4" />}>
                                <div className="p-1">
                                    <DateRangePicker
                                        value={localFilters.dateRange || { from: null, to: null, preset: 'all' }}
                                        onChange={(range) => setLocalFilters(prev => ({ ...prev, dateRange: range }))}
                                        className="w-full"
                                    />
                                </div>
                            </FilterSection>

                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                            <button
                                onClick={handleClear}
                                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors px-4 py-2"
                            >
                                Clear all
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors shadow-lg shadow-neutral-900/20 dark:shadow-white/10"
                                >
                                    Apply Filters {activeCount > 0 && `(${activeCount})`}
                                </button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
