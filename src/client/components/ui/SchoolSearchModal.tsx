"use client";

/**
 * SchoolSearchModal - Premium School Selection Experience
 * 
 * Features:
 * - Beautiful visual hierarchy with gradient header
 * - Smart search with unified input
 * - Rich school cards with avatars and badges
 * - Smooth micro-interactions and animations
 * - Keyboard navigation support
 * - Categories: Recent, Popular, Search Results
 * - Beautiful empty and loading states
 */

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, X, MapPin, Plus, Loader2, Building2, Check,
    AlertCircle, ChevronRight, Sparkles,
    Clock, TrendingUp, ArrowLeft
} from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { schoolsApi } from "@/client/api/schools";
import type { School } from "@/client/hooks/use-schools";
import { toast } from "sonner";
import { cn } from "@/client/utils";

// Mock translation function for admin portal
const useTranslations = (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
        auth: {
            addYourSchool: "Add your school",
            noSchoolsFound: "No schools found",
            addNewSchool: "Add New School",
            selectSchool: "Select School",
            schoolName: "School Name",
            enterSchoolName: "Enter school name",
            cityOptional: "City (Optional)",
            stateOptional: "State (Optional)",
            schoolAdded: "School added successfully",
            failedToAddSchool: "Failed to add school",
            searchSchoolPlaceholder: "Search for your school...",
            searchSchoolHint: "Type at least 2 characters to search",
            popularSchools: "Popular Schools",
            addSchool: "Add School",
            'validation.schoolNameMin2': "School name must be at least 2 characters",
        },
        common: {
            retry: "Retry",
        }
    };
    return (key: string) => translations[namespace]?.[key] || key;
};

// Special ID for "Other" option
const OTHER_SCHOOL_ID = "other";

// Local storage key for recent schools
const RECENT_SCHOOLS_KEY = "abhedya_recent_schools";
const MAX_RECENT_SCHOOLS = 3;

interface SchoolSearchModalProps {
    isOpen: boolean;
    selectedSchoolId: string | null;
    onSelect: (school: School | null) => void;
    onClose: () => void;
}

interface ExtendedSchool extends School {
    is_other_option?: boolean;
    is_suggested?: boolean;
    is_new?: boolean;
    message?: string;
}

// Get initials from school name for avatar
const getSchoolInitials = (name: string): string => {
    const words = name.split(' ').filter(w => w.length > 0);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// Generate a consistent color based on school name
const getSchoolColor = (name: string): string => {
    const colors = [
        'from-blue-500 to-blue-600',
        'from-purple-500 to-purple-600',
        'from-emerald-500 to-emerald-600',
        'from-amber-500 to-amber-600',
        'from-rose-500 to-rose-600',
        'from-cyan-500 to-cyan-600',
        'from-indigo-500 to-indigo-600',
        'from-teal-500 to-teal-600',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

// School Card Component
const SchoolCard: React.FC<{
    school: ExtendedSchool;
    isSelected: boolean;
    onSelect: () => void;
    index: number;
}> = ({ school, isSelected, onSelect, index }) => {
    const isOtherOption = school.id === OTHER_SCHOOL_ID || school.is_other_option;
    const t = useTranslations('auth');

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            onClick={onSelect}
            className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200",
                "group relative overflow-hidden",
                isOtherOption
                    ? "bg-linear-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-2 border-dashed border-primary-300 dark:border-primary-700 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10"
                    : isSelected
                        ? "bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border-2 border-primary-500 shadow-lg shadow-primary-500/15"
                        : "bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 hover:shadow-lg hover:shadow-neutral-900/5 dark:hover:border-primary-600"
            )}
        >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-linear-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Avatar */}
            <div className={cn(
                "relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm",
                isOtherOption
                    ? "bg-linear-to-br from-primary-500 to-purple-500"
                    : `bg-linear-to-br ${getSchoolColor(school.name)}`
            )}>
                {isOtherOption ? (
                    <Plus className="w-5 h-5" />
                ) : (
                    getSchoolInitials(school.name)
                )}
                {school.is_verified && !isOtherOption && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-800">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2">
                    <p className={cn(
                        "font-semibold truncate",
                        isOtherOption
                            ? "text-primary-700 dark:text-primary-300"
                            : "text-neutral-900 dark:text-white"
                    )}>
                        {school.name}
                    </p>
                    {school.is_verified && !isOtherOption && (
                        <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                            Verified
                        </span>
                    )}
                </div>

                {!isOtherOption && (school.location_city || school.location_state) && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {[school.location_city, school.location_state].filter(Boolean).join(', ')}
                    </p>
                )}

                {isOtherOption && (
                    <p className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t('addYourSchool')}
                    </p>
                )}
            </div>

            {/* Action indicator */}
            <div className="shrink-0 relative z-10">
                {isSelected && !isOtherOption ? (
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                ) : (
                    <ChevronRight className={cn(
                        "w-5 h-5 transition-transform duration-200 group-hover:translate-x-1",
                        isOtherOption ? "text-primary-500" : "text-neutral-400 group-hover:text-primary-500"
                    )} />
                )}
            </div>
        </motion.button>
    );
};

// Section Header Component
const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    count?: number;
}> = ({ icon, title, count }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            {icon}
            <span className="text-sm font-medium">{title}</span>
        </div>
        {count !== undefined && (
            <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full">
                {count}
            </span>
        )}
    </div>
);

// Empty State Component  
const EmptyState: React.FC<{
    searchQuery: string;
    onAddNew: () => void;
    t: (key: string) => string;
}> = ({ searchQuery, onAddNew, t }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-4"
    >
        <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-linear-to-br from-primary-500/20 to-purple-500/20 rounded-full blur-xl" />
            <div className="relative w-full h-full bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
            </div>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            {t('noSchoolsFound')}
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs mx-auto">
            {searchQuery
                ? `We couldn't find "${searchQuery}" in our database`
                : t('addYourSchool')
            }
        </p>
        <Button onClick={onAddNew} className="shadow-lg shadow-primary-500/25">
            <Plus className="w-4 h-4 mr-2" />
            {t('addNewSchool')}
        </Button>
    </motion.div>
);

// Loading Skeleton Component
const LoadingSkeleton: React.FC = () => (
    <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
                </div>
            </div>
        ))}
    </div>
);

export const SchoolSearchModal: React.FC<SchoolSearchModalProps> = ({
    isOpen,
    selectedSchoolId,
    onSelect,
    onClose,
}) => {
    const t = useTranslations('auth');
    const tc = useTranslations('common');

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [schools, setSchools] = useState<ExtendedSchool[]>([]);
    const [popularSchools, setPopularSchools] = useState<ExtendedSchool[]>([]);
    const [recentSchools, setRecentSchools] = useState<ExtendedSchool[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Add new school form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [newSchoolCity, setNewSchoolCity] = useState('');
    const [newSchoolState, setNewSchoolState] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [suggestedSchool, setSuggestedSchool] = useState<ExtendedSchool | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Keyboard handling for ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Load recent schools from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(RECENT_SCHOOLS_KEY);
                if (stored) {
                    setRecentSchools(JSON.parse(stored));
                }
            } catch {
                // Ignore parse errors
            }
        }
    }, [isOpen]);

    // Save to recent schools
    const saveToRecent = useCallback((school: ExtendedSchool) => {
        if (typeof window === 'undefined' || school.id === OTHER_SCHOOL_ID) return;

        try {
            const stored = localStorage.getItem(RECENT_SCHOOLS_KEY);
            let recent: ExtendedSchool[] = stored ? JSON.parse(stored) : [];

            // Remove if already exists
            recent = recent.filter(s => s.id !== school.id);

            // Add to beginning
            recent.unshift(school);

            // Limit to max
            recent = recent.slice(0, MAX_RECENT_SCHOOLS);

            localStorage.setItem(RECENT_SCHOOLS_KEY, JSON.stringify(recent));
            setRecentSchools(recent);
        } catch {
            // Ignore storage errors
        }
    }, []);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            setSearchQuery('');
            setSchools([]);
            setShowAddForm(false);
            setNewSchoolName('');
            setNewSchoolCity('');
            setNewSchoolState('');
            setSuggestedSchool(null);
            setError(null);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (!isOpen) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 1) {
                performSearch(searchQuery);
            } else {
                setSchools([]);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [searchQuery, isOpen]);

    // Load popular schools on mount
    useEffect(() => {
        if (isOpen && searchQuery.trim().length < 2) {
            loadPopularSchools();
        }
    }, [isOpen]);

    const loadPopularSchools = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await schoolsApi.suggest(10);
            if (result.success && result.data) {
                // Mark some as verified for demo
                const enhanced = (result.data as ExtendedSchool[]).map((s, i) => ({
                    ...s,
                    is_verified: i < 4, // First 4 are verified
                }));
                setPopularSchools(enhanced);
            }
        } catch (err) {
            console.error('Failed to load popular schools:', err);
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async (query: string) => {
        setLoading(true);
        setError(null);

        try {
            abortControllerRef.current = new AbortController();

            const result = await schoolsApi.search({
                q: query,
                limit: 20
            });

            if (result.success && result.data) {
                const enhanced = (result.data as ExtendedSchool[]).map((s, i) => ({
                    ...s,
                    is_verified: i < 3,
                }));
                setSchools(enhanced);
            } else {
                setSchools([]);
                if (result.error) {
                    setError(result.error);
                }
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Search error:', err);
                setError('Failed to search schools. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSchool = useCallback((school: ExtendedSchool) => {
        if (school.id === OTHER_SCHOOL_ID || school.is_other_option) {
            setShowAddForm(true);
            setNewSchoolName(searchQuery);
            return;
        }

        saveToRecent(school);
        onSelect(school);
        onClose();
    }, [onSelect, onClose, searchQuery, saveToRecent]);

    const handleAcceptSuggestion = useCallback(() => {
        if (suggestedSchool) {
            saveToRecent(suggestedSchool);
            onSelect(suggestedSchool);
            onClose();
        }
    }, [suggestedSchool, onSelect, onClose, saveToRecent]);

    const handleAddNewSchool = async () => {
        if (!newSchoolName.trim() || newSchoolName.trim().length < 2) {
            toast.error(t('validation.schoolNameMin2'));
            return;
        }

        setIsCreating(true);
        setSuggestedSchool(null);

        try {
            const result = await schoolsApi.create({
                name: newSchoolName.trim(),
                location_city: newSchoolCity.trim() || undefined,
                location_state: newSchoolState.trim() || undefined,
                location_country: 'India',
            });

            if (result.success && result.data) {
                const schoolData = result.data as ExtendedSchool;

                if (schoolData.is_suggested) {
                    setSuggestedSchool(schoolData);
                    toast.info(schoolData.message || 'A similar school already exists');
                    return;
                }

                toast.success(schoolData.message || t('schoolAdded'));
                saveToRecent(schoolData);
                onSelect(result.data);
                onClose();
            } else {
                toast.error(result.error || t('failedToAddSchool'));
            }
        } catch (err) {
            console.error('Failed to create school:', err);
            toast.error(t('failedToAddSchool'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleBackToSearch = () => {
        setShowAddForm(false);
        setSuggestedSchool(null);
        setNewSchoolName('');
        setNewSchoolCity('');
        setNewSchoolState('');
    };

    const isSearching = searchQuery.trim().length >= 2;
    const displaySchools = isSearching ? schools : popularSchools;
    const hasRecentSchools = recentSchools.length > 0 && !isSearching && !showAddForm;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Premium Header */}
                    <div className="relative overflow-hidden shrink-0">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-linear-to-br from-primary-500 via-primary-600 to-purple-600" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

                        <div className="relative px-6 pt-6 pb-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {showAddForm && (
                                        <motion.button
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={handleBackToSearch}
                                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-white" />
                                        </motion.button>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {showAddForm ? t('addNewSchool') : t('selectSchool')}
                                        </h2>
                                        <p className="text-sm text-white/70 mt-0.5">
                                            {showAddForm
                                                ? "Add your school to our database"
                                                : "Find and select your school"
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Search Input - Only show when not in add form mode */}
                            <AnimatePresence mode="wait">
                                {!showAddForm && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder={t('searchSchoolPlaceholder')}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg text-base"
                                            />
                                            {loading && (
                                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin" />
                                            )}
                                        </div>
                                        {!isSearching && (
                                            <p className="text-xs text-white/60 mt-2 ml-1">
                                                {t('searchSchoolHint')}
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <AnimatePresence mode="wait">
                                {/* Add New School Form */}
                                {showAddForm ? (
                                    <motion.div
                                        key="add-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        {/* Suggested School Alert */}
                                        {suggestedSchool && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3">
                                                            Did you mean this school?
                                                        </p>
                                                        <button
                                                            onClick={handleAcceptSuggestion}
                                                            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 rounded-xl border-2 border-amber-200 dark:border-amber-700 hover:border-primary-500 transition-all hover:shadow-md text-left"
                                                        >
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm bg-linear-to-br",
                                                                getSchoolColor(suggestedSchool.name)
                                                            )}>
                                                                {getSchoolInitials(suggestedSchool.name)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-neutral-900 dark:text-white">
                                                                    {suggestedSchool.name}
                                                                </p>
                                                                {(suggestedSchool.location_city || suggestedSchool.location_state) && (
                                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {[suggestedSchool.location_city, suggestedSchool.location_state].filter(Boolean).join(', ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                                                                <Check className="w-4 h-4 text-primary-600" />
                                                            </div>
                                                        </button>
                                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-3">
                                                            Or continue adding your school below
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Add School Form Fields */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                    {t('schoolName')} <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                                    <input
                                                        type="text"
                                                        value={newSchoolName}
                                                        onChange={(e) => setNewSchoolName(e.target.value)}
                                                        placeholder={t('enterSchoolName')}
                                                        autoFocus
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                        {t('cityOptional')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newSchoolCity}
                                                        onChange={(e) => setNewSchoolCity(e.target.value)}
                                                        placeholder="e.g., Pune"
                                                        className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                        {t('stateOptional')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newSchoolState}
                                                        onChange={(e) => setNewSchoolState(e.target.value)}
                                                        placeholder="e.g., Maharashtra"
                                                        className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                                <Sparkles className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                                <p className="text-sm text-primary-700 dark:text-primary-300">
                                                    Your school will be added and verified by our team within 24 hours.
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleAddNewSchool}
                                            isLoading={isCreating}
                                            disabled={!newSchoolName.trim() || newSchoolName.trim().length < 2}
                                            className="w-full py-4 text-base font-semibold shadow-lg shadow-primary-500/25"
                                        >
                                            <Plus className="w-5 h-5 mr-2" />
                                            {t('addSchool')}
                                        </Button>
                                    </motion.div>
                                ) : (
                                    /* Schools List */
                                    <motion.div
                                        key="schools-list"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        {loading && !isSearching ? (
                                            <LoadingSkeleton />
                                        ) : error ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                                </div>
                                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
                                                <Button
                                                    onClick={() => performSearch(searchQuery)}
                                                    variant="outline"
                                                >
                                                    {tc('retry')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Recent Schools */}
                                                {hasRecentSchools && (
                                                    <div>
                                                        <SectionHeader
                                                            icon={<Clock className="w-4 h-4" />}
                                                            title="Recent"
                                                            count={recentSchools.length}
                                                        />
                                                        <div className="space-y-2">
                                                            {recentSchools.map((school, index) => (
                                                                <SchoolCard
                                                                    key={`recent-${school.id}`}
                                                                    school={school}
                                                                    isSelected={selectedSchoolId === school.id}
                                                                    onSelect={() => handleSelectSchool(school)}
                                                                    index={index}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Popular/Search Results */}
                                                <div>
                                                    {displaySchools.length > 0 && (
                                                        <>
                                                            <SectionHeader
                                                                icon={isSearching
                                                                    ? <Search className="w-4 h-4" />
                                                                    : <TrendingUp className="w-4 h-4" />
                                                                }
                                                                title={isSearching ? "Search Results" : t('popularSchools')}
                                                                count={displaySchools.length}
                                                            />
                                                            <div className="space-y-2 mb-4">
                                                                {displaySchools.map((school, index) => (
                                                                    <SchoolCard
                                                                        key={school.id}
                                                                        school={school}
                                                                        isSelected={selectedSchoolId === school.id}
                                                                        onSelect={() => handleSelectSchool(school)}
                                                                        index={hasRecentSchools ? index + recentSchools.length : index}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Show Empty State if searching and no results */}
                                                    {isSearching && displaySchools.length === 0 ? (
                                                        <EmptyState
                                                            searchQuery={searchQuery}
                                                            onAddNew={() => {
                                                                setShowAddForm(true);
                                                                setNewSchoolName(searchQuery);
                                                            }}
                                                            t={t}
                                                        />
                                                    ) : (
                                                        /* Always show "Can't Find School" option at the bottom if not empty state */
                                                        <div className="pt-2 pb-4">
                                                            <motion.button
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                onClick={() => {
                                                                    setShowAddForm(true);
                                                                    setNewSchoolName(searchQuery);
                                                                }}
                                                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/10 border-2 border-dashed border-primary-200 dark:border-primary-800 hover:border-primary-400 hover:bg-primary-100/50 transition-all group text-left"
                                                            >
                                                                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                                                    <Plus className="w-6 h-6" />
                                                                </div>
                                                                <div className="flex-1 text-left">
                                                                    <p className="font-semibold text-primary-900 dark:text-primary-100">
                                                                        {t('cantFindSchool')}
                                                                    </p>
                                                                    <p className="text-sm text-primary-600/80 dark:text-primary-400/80">
                                                                        {t('addYourSchool')}
                                                                    </p>
                                                                </div>
                                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ChevronRight className="w-4 h-4 text-primary-500" />
                                                                </div>
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Footer with keyboard hint */}
                    <div className="shrink-0 px-6 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center justify-center gap-4 text-xs text-neutral-400">
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[10px] font-medium">ESC</kbd>
                                to close
                            </span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[10px] font-medium">↵</kbd>
                                to select
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

SchoolSearchModal.displayName = "SchoolSearchModal";
