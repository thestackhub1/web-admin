"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/client/utils";

/**
 * Select Component - Premium SaaS Design
 * 
 * Inspired by Linear, Raycast, and Vercel.
 * Features clean borders, subtle shadows, and smooth animations.
 */

export interface SelectOption {
    value: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    label?: string;
    placeholder?: string;
    error?: string;
    className?: string;
    icon?: React.ReactNode;
    required?: boolean;
    /** Size variant */
    selectSize?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "h-9 px-3 text-sm rounded-lg",
    md: "h-11 px-4 text-sm rounded-xl",
    lg: "h-12 px-4 text-base rounded-xl",
};

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    label,
    placeholder = "Select an option",
    error,
    className,
    icon,
    selectSize = "md"
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {label && (
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between gap-3 text-left transition-all",
                    "bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80",
                    "border border-neutral-200/80 dark:border-neutral-700/80",
                    "hover:border-neutral-300 dark:hover:border-neutral-600",
                    sizeClasses[selectSize],
                    error
                        ? "border-rose-400 focus:ring-rose-500/30 focus:border-rose-500"
                        : "",
                    isOpen && "border-primary-500 ring-2 ring-primary-500/30 dark:ring-primary-500/20"
                )}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {icon && <span className="text-neutral-400 shrink-0">{icon}</span>}
                    <span
                        className={cn(
                            "truncate",
                            selectedOption ? "text-neutral-900 dark:text-white" : "text-neutral-400"
                        )}
                    >
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-200",
                        isOpen && "transform rotate-180"
                    )}
                />
            </button>

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                    {error}
                </p>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 overflow-hidden bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-xl shadow-neutral-900/10"
                    >
                        <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <motion.button
                                        key={option.value}
                                        type="button"
                                        whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors",
                                            isSelected
                                                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium"
                                                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {option.icon}
                                            <div>
                                                <div className="truncate">{option.label}</div>
                                                {option.description && (
                                                    <div className="text-xs text-neutral-400 mt-0.5 font-normal">
                                                        {option.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
