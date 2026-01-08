// Client-side only — no server secrets or database access here

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/client/utils';

/**
 * Button Component - Unified Premium Design
 *
 * Features from both previous implementations:
 * - Gradient primary buttons with glow shadows
 * - Loading state with spinner
 * - Icon support (left and right)
 * - Multiple variants and sizes
 * - forwardRef for ref forwarding
 *
 * @example
 * ```tsx
 * // Primary CTA
 * <Button variant="primary" size="lg" leftIcon={<Plus />}>
 *   Add Question
 * </Button>
 *
 * // With loading state
 * <Button isLoading>Saving...</Button>
 *
 * // Danger action
 * <Button variant="danger" size="sm">Delete</Button>
 * ```
 */

const buttonVariants = cva(
    // Base styles - Premium SaaS feel
    [
        "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-neutral-900",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none",
        "active:scale-[0.98]",
    ],
    {
        variants: {
            variant: {
                // Primary - gradient with glow (Linear/Vercel style)
                primary: [
                    "bg-linear-to-r from-primary-500 to-primary-600 text-white",
                    "shadow-lg shadow-primary-500/25",
                    "hover:from-primary-600 hover:to-primary-700",
                    "hover:shadow-xl hover:shadow-primary-500/30",
                    "hover:-translate-y-0.5",
                ],
                // Secondary - subtle, professional
                secondary: [
                    "bg-neutral-100 text-neutral-700",
                    "border border-neutral-200",
                    "hover:bg-neutral-200 hover:border-neutral-300",
                    "dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
                    "dark:hover:bg-neutral-700 dark:hover:border-neutral-600",
                ],
                // Outline - clean bordered
                outline: [
                    "border-2 border-primary-500/80 text-primary-600 bg-transparent",
                    "hover:bg-primary-50 hover:border-primary-500",
                    "dark:text-primary-400 dark:hover:bg-primary-950/30",
                ],
                // Ghost - minimal, for navigation
                ghost: [
                    "bg-transparent text-neutral-600",
                    "hover:bg-neutral-100 hover:text-neutral-900",
                    "dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                ],
                // Danger - destructive actions
                danger: [
                    "bg-linear-to-r from-rose-500 to-rose-600 text-white",
                    "shadow-lg shadow-rose-500/25",
                    "hover:from-rose-600 hover:to-rose-700",
                    "hover:shadow-xl hover:shadow-rose-500/30",
                    "hover:-translate-y-0.5",
                ],
                // Success/Emerald
                emerald: [
                    "bg-linear-to-r from-emerald-500 to-emerald-600 text-white",
                    "shadow-lg shadow-emerald-500/25",
                    "hover:from-emerald-600 hover:to-emerald-700",
                    "hover:shadow-xl hover:shadow-emerald-500/30",
                    "hover:-translate-y-0.5",
                ],
                // Warning/Amber
                amber: [
                    "bg-linear-to-r from-amber-500 to-amber-600 text-white",
                    "shadow-lg shadow-amber-500/25",
                    "hover:from-amber-600 hover:to-amber-700",
                    "hover:shadow-xl hover:shadow-amber-500/30",
                    "hover:-translate-y-0.5",
                ],
                // Insight/Purple
                insight: [
                    "bg-linear-to-r from-insight-500 to-insight-600 text-white",
                    "shadow-lg shadow-insight-500/25",
                    "hover:from-insight-600 hover:to-insight-700",
                    "hover:shadow-xl hover:shadow-insight-500/30",
                    "hover:-translate-y-0.5",
                ],
                // White - for use on dark/gradient backgrounds
                white: [
                    "bg-white text-primary-600",
                    "shadow-lg shadow-black/10",
                    "hover:bg-primary-50 hover:shadow-xl",
                    "hover:-translate-y-0.5",
                ],
                // Glass - translucent for gradient backgrounds
                glass: [
                    "bg-white/15 text-white border border-white/30",
                    "backdrop-blur-md",
                    "hover:bg-white/25 hover:border-white/50",
                    "shadow-lg shadow-black/10",
                ],
            },
            size: {
                xs: "h-7 px-2.5 text-xs rounded-lg",
                sm: "h-9 px-3.5 text-sm rounded-lg",
                md: "h-11 px-5 text-sm rounded-xl",
                lg: "h-12 px-6 text-base rounded-xl",
                xl: "h-14 px-8 text-base rounded-2xl",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    /** Show loading spinner and disable button */
    isLoading?: boolean;
    /** Icon to show on the left side */
    leftIcon?: React.ReactNode;
    /** Icon to show on the right side */
    rightIcon?: React.ReactNode;
}

/**
 * Loading spinner component for button
 */
function ButtonSpinner({ className }: { className?: string }) {
    return (
        <svg
            className={cn("h-4 w-4 animate-spin", className)}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
        </svg>
    );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            type = "button",
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled || isLoading}
                className={cn(buttonVariants({ variant, size }), className)}
                {...props}
            >
                {isLoading ? <ButtonSpinner /> : leftIcon}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
