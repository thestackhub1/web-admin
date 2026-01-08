"use client";

import * as React from "react";
import { cn } from "@/client/utils";

/**
 * Logo Component - Centralized brand logo
 * 
 * Following DRY principle - single source of truth for logo SVG
 * Supports different sizes and variants
 */

export interface LogoProps {
    /** Size preset or custom className */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    /** Additional CSS classes */
    className?: string;
    /** Whether to show the logo with animation */
    animated?: boolean;
    /** Unique ID prefix to avoid gradient conflicts when multiple logos on page */
    idPrefix?: string;
}

const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20",
};

/**
 * The Stack Hub / The Stack Hub Logo
 * Layered book/stack design with gradient colors
 */
export function Logo({ size = "md", className, animated = false, idPrefix = "logo" }: LogoProps) {
    const gradientIds = {
        blue: `${idPrefix}Blue`,
        emerald: `${idPrefix}Emerald`,
        amber: `${idPrefix}Amber`,
        purple: `${idPrefix}Purple`,
    };

    return (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
                sizeClasses[size],
                animated && "animate-pulse-subtle",
                className
            )}
            aria-label="The Stack Hub Logo"
            role="img"
        >
            <defs>
                <linearGradient
                    id={gradientIds.blue}
                    x1="0"
                    y1="0"
                    x2="40"
                    y2="40"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>
                <linearGradient
                    id={gradientIds.emerald}
                    x1="0"
                    y1="0"
                    x2="40"
                    y2="40"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#6EE7B7" />
                </linearGradient>
                <linearGradient
                    id={gradientIds.amber}
                    x1="0"
                    y1="0"
                    x2="40"
                    y2="40"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#FCD34D" />
                </linearGradient>
                <linearGradient
                    id={gradientIds.purple}
                    x1="0"
                    y1="0"
                    x2="40"
                    y2="40"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#C4B5FD" />
                </linearGradient>
            </defs>
            <g>
                {/* Bottom stem - purple */}
                <path
                    d="M20 37V31"
                    stroke={`url(#${gradientIds.purple})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                {/* Third layer - amber */}
                <path
                    d="M6 23L20 31L34 23"
                    stroke={`url(#${gradientIds.amber})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Second layer - emerald */}
                <path
                    d="M6 15L20 23L34 15"
                    stroke={`url(#${gradientIds.emerald})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Top layer (book) - blue filled */}
                <path
                    d="M20 3L6 11L20 19L34 11L20 3Z"
                    fill={`url(#${gradientIds.blue})`}
                />
            </g>
        </svg>
    );
}

/**
 * Logo with brand text
 */
export interface LogoWithTextProps extends Omit<LogoProps, "size"> {
    /** Size of the logo */
    logoSize?: LogoProps["size"];
    /** Text size */
    textSize?: "sm" | "md" | "lg" | "xl";
    /** Show text on right (horizontal) or bottom (vertical) */
    layout?: "horizontal" | "vertical";
}

const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
};

export function LogoWithText({
    logoSize = "md",
    textSize = "md",
    layout = "horizontal",
    className,
    ...logoProps
}: LogoWithTextProps) {
    return (
        <div
            className={cn(
                "flex items-center",
                layout === "horizontal" ? "flex-row gap-3" : "flex-col gap-2",
                className
            )}
        >
            <Logo size={logoSize} {...logoProps} />
            <span
                className={cn(
                    "font-bold text-neutral-900 dark:text-white",
                    textSizeClasses[textSize]
                )}
            >
                The Stack Hub
            </span>
        </div>
    );
}

/**
 * Animated loading logo with spinner effect
 */
export function LogoSpinner({
    size = "lg",
    className,
}: Pick<LogoProps, "size" | "className">) {
    return (
        <div className={cn("relative", className)}>
            {/* Spinning ring */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin",
                    sizeClasses[size]
                )}
            />
            {/* Static logo */}
            <Logo size={size} idPrefix="spinner" />
        </div>
    );
}
