// Client-side only — no server secrets or database access here
"use client";

/**
 * BentoStatCard Component
 * 
 * Premium glass-style stat card used in dashboards and analytics pages.
 * Supports different semantic colors and optional animations.
 * Matches Student Portal design language exactly.
 */

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/client/utils";
import { AnimatedCounter } from "./motion";

export interface BentoStatCardProps {
    /** Title text displayed above the value */
    title: string;
    /** Numeric value to display */
    value: number;
    /** Optional suffix (e.g., "%" or " Days") */
    suffix?: string;
    /** Icon component to display */
    icon: React.ElementType;
    /** Semantic color variant */
    semantic: "primary" | "success" | "warning" | "insight";
    /** Optional change percentage to show trend */
    change?: number;
    /** Whether to animate the icon */
    animateIcon?: boolean;
    /** Optional subtitle text */
    subtitle?: string;
    /** Whether to show trend indicator */
    showTrend?: boolean;
    /** Whether to highlight the card with a glow effect */
    highlight?: boolean;
}

const iconContainerClasses = {
    primary: "icon-container-primary",
    success: "icon-container-success",
    warning: "icon-container-warning",
    insight: "icon-container-insight"
};

const valueColors = {
    primary: "text-primary-500 dark:text-primary-400",
    success: "text-success-600 dark:text-success-400",
    warning: "text-warning-600 dark:text-warning-400",
    insight: "text-insight-600 dark:text-insight-400"
};

export function BentoStatCard({
    title,
    value,
    suffix = "",
    icon: Icon,
    semantic,
    change,
    animateIcon = false,
    subtitle,
    showTrend = false,
    highlight = false,
}: BentoStatCardProps) {
    return (
        <div className={cn(
            "bento-card p-5 h-full flex flex-col group transition-all hover:-translate-y-1 hover:shadow-glow-card-hover",
            highlight && "ring-2 ring-primary-200 dark:ring-primary-800"
        )}>
            <div className="flex items-start justify-between flex-1">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                        {title}
                    </p>
                    <div className={cn("text-3xl font-bold tracking-tight", valueColors[semantic])}>
                        <AnimatedCounter value={value} suffix={suffix} />
                    </div>
                    {subtitle && (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={cn(
                    "icon-container transition-transform duration-300 group-hover:scale-110",
                    iconContainerClasses[semantic]
                )}>
                    <Icon className={cn("h-5 w-5", animateIcon && "animate-flame-glow")} />
                </div>
            </div>

            {/* Change indicator */}
            <div className="mt-4 h-4 flex items-center">
                {change !== undefined && (
                    <div className="flex items-center text-xs font-medium text-success-600 dark:text-success-400">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        <span>+{change}% from last week</span>
                    </div>
                )}
                {showTrend && !change && (
                    <div className="flex items-center text-xs font-medium text-neutral-400">
                        <TrendingUp className="mr-1 h-3 w-3 opacity-50" />
                        <span>No change</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BentoStatCard;

