// Client-side only — no server secrets or database access here

"use client";

import { useState } from "react";
import { Check, Search, ChevronDown, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { clsx } from "clsx";
import { Button } from '@/client/components/ui/button';

// Curated list of icons suitable for education/admin context
const ICON_NAMES = [
    // Academic & Learning
    "Book", "BookOpen", "GraduationCap", "School", "Library", "Pencil", "PenTool",
    "Calculator", "Beaker", "Microscope", "Dna", "Atom", "Globe", "Languages",
    "Music", "Palette", "Trophy", "Award", "Medal", "Target", "Brain", "Lightbulb",

    // Tech & Science
    "Code", "Terminal", "Cpu", "Database", "Server", "Laptop", "Monitor",
    "Smartphone", "Wifi", "Radio", "Rocket", "FlaskConical", "TestTube",

    // Interface & Utils
    "Home", "Layout", "Grid", "List", "Settings", "User", "Users", "Clock",
    "Calendar", "Bell", "Mail", "MessageCircle", "FileText", "Folder", "Tag",
    "Star", "Heart", "Zap", "Activity", "BarChart", "PieChart", "TrendingUp",

    // Objects
    "Briefcase", "Clipboard", "Compass", "Map", "Flag", "Key", "Lock",
    "Shield", "Umbrella", "Gift", "ShoppingBag", "CreditCard", "DollarSign"
] as const;

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedIconName = value as keyof typeof LucideIcons;
    const SelectedIcon = LucideIcons[selectedIconName] as LucideIcons.LucideIcon | undefined;

    const filteredIcons = ICON_NAMES.filter(name =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={clsx("relative", className)}>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Icon
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={clsx(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-all",
                        "bg-white dark:bg-neutral-900",
                        isOpen
                            ? "border-primary-500 ring-2 ring-primary-500/20"
                            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            selectedIconName
                                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                                : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                        )}>
                            {SelectedIcon ? <SelectedIcon className="h-5 w-5" /> : <Search className="h-4 w-4" />}
                        </div>
                        <span className={clsx("text-sm", !value && "text-neutral-500")}>
                            {value || "Select an icon"}
                        </span>
                    </div>
                    <ChevronDown className={clsx("h-4 w-4 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl shadow-neutral-900/10 dark:border-neutral-700 dark:bg-neutral-900">

                            {/* Search */}
                            <div className="mb-3 relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search icons..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    autoFocus
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            {/* Grid */}
                            <div className="grid max-h-60 grid-cols-6 gap-2 overflow-y-auto pr-1 sm:grid-cols-8">
                                {filteredIcons.map((name) => {
                                    const Icon = LucideIcons[name as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
                                    const isSelected = value === name;

                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => {
                                                onChange(name);
                                                setIsOpen(false);
                                            }}
                                            title={name}
                                            className={clsx(
                                                "flex aspect-square items-center justify-center rounded-lg transition-all",
                                                isSelected
                                                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/30"
                                                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:scale-110 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredIcons.length === 0 && (
                                <div className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                                    No icons found
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
