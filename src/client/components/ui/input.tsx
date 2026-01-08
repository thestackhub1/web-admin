// Client-side only — no server secrets or database access here

import * as React from "react";
import { cn } from '@/client/utils';

/**
 * Input Component - Premium SaaS Design
 * 
 * Inspired by Linear, Raycast, and Vercel.
 * Features clean borders, subtle shadows, and smooth focus states.
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string | boolean;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    /** Size variant */
    inputSize?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "h-9 px-3 text-sm rounded-lg",
    md: "h-11 px-4 text-sm rounded-xl",
    lg: "h-12 px-4 text-base rounded-xl",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = "text",
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            id,
            inputSize = "md",
            ...props
        },
        ref
    ) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        className={cn(
                            "flex w-full bg-white/80 backdrop-blur-sm text-neutral-900",
                            "border border-neutral-200/80",
                            "placeholder:text-neutral-400",
                            "transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500",
                            "hover:border-neutral-300",
                            "dark:bg-neutral-900/80 dark:text-neutral-100 dark:border-neutral-700/80",
                            "dark:placeholder:text-neutral-500",
                            "dark:hover:border-neutral-600",
                            "dark:focus:border-primary-500 dark:focus:ring-primary-500/20",
                            sizeClasses[inputSize],
                            error
                                ? "border-rose-400 focus:ring-rose-500/30 focus:border-rose-500"
                                : "",
                            leftIcon && "pl-11",
                            rightIcon && "pr-11",
                            className
                        )}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={
                            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                        }
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && typeof error === "string" && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-2 text-sm text-rose-600 dark:text-rose-400"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p
                        id={`${inputId}-helper`}
                        className="mt-2 text-sm text-neutral-500 dark:text-neutral-400"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

/**
 * TextInput alias for backward compatibility
 * @deprecated Use Input instead
 */
export const TextInput = Input;

/**
 * Textarea Component - Premium SaaS Design
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string | boolean;
    helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "flex w-full min-h-[120px] bg-white/80 backdrop-blur-sm text-neutral-900",
                        "border border-neutral-200/80 rounded-xl px-4 py-3 text-sm",
                        "placeholder:text-neutral-400",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500",
                        "hover:border-neutral-300",
                        "dark:bg-neutral-900/80 dark:text-neutral-100 dark:border-neutral-700/80",
                        "dark:placeholder:text-neutral-500",
                        "dark:hover:border-neutral-600",
                        "dark:focus:border-primary-500 dark:focus:ring-primary-500/20",
                        "resize-none",
                        error
                            ? "border-rose-400 focus:ring-rose-500/30 focus:border-rose-500"
                            : "",
                        className
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={
                        error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                    }
                    {...props}
                />
                {error && typeof error === "string" && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-2 text-sm text-rose-600 dark:text-rose-400"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p
                        id={`${inputId}-helper`}
                        className="mt-2 text-sm text-neutral-500 dark:text-neutral-400"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
