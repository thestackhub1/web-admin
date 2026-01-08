"use client";

import * as React from "react";
import { cn } from "@/client/utils";
import { Logo } from "@/client/components/shared/Logo";

export interface LoadingSpinnerProps {
    /** Additional CSS classes */
    className?: string;
    /** Size of the spinner */
    size?: "sm" | "md" | "lg" | "xl";
    /** Optional loading text */
    text?: string;
}

const sizeMap = {
    sm: { logo: "sm" as const, container: "h-8 w-8", text: "text-xs" },
    md: { logo: "md" as const, container: "h-12 w-12", text: "text-sm" },
    lg: { logo: "lg" as const, container: "h-16 w-16", text: "text-base" },
    xl: { logo: "xl" as const, container: "h-20 w-20", text: "text-lg" },
};

/**
 * LoadingSpinner Component
 * 
 * Uses the brand logo with a subtle pulse animation.
 * More performant than GIF and maintains brand consistency.
 */
export function LoadingSpinner({ className, size = "lg", text }: LoadingSpinnerProps) {
    const sizeConfig = sizeMap[size];

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className={cn("relative", sizeConfig.container)}>
                {/* Outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 border-r-primary-300 animate-spin" />

                {/* Inner logo with pulse */}
                <div className="absolute inset-2 flex items-center justify-center">
                    <Logo
                        size={sizeConfig.logo}
                        className="animate-pulse-subtle"
                        idPrefix={`spinner-${size}`}
                    />
                </div>
            </div>

            {text && (
                <p className={cn("text-neutral-500 font-medium animate-pulse", sizeConfig.text)}>
                    {text}
                </p>
            )}
        </div>
    );
}

/**
 * FullPageLoader - Centered loading spinner for page transitions
 */
export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm z-50">
            <LoadingSpinner size="xl" text={text} />
        </div>
    );
}

/**
 * InlineLoader - Small inline loading indicator
 */
export function InlineLoader({ className }: { className?: string }) {
    return (
        <div className={cn("inline-flex items-center gap-2", className)}>
            <div className="h-4 w-4 rounded-full border-2 border-neutral-200 border-t-primary-500 animate-spin" />
            <span className="text-sm text-neutral-500">Loading...</span>
        </div>
    );
}
