// Client-side only — no server secrets or database access here

"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { cn } from '@/client/utils';

// ============================================
// Loading Component - Brand GIF loader
// ============================================

interface LoadingComponentProps {
    message?: string;
    className?: string;
}

/**
 * Brand loading component with animated GIF
 */
export function LoadingComponent({ message, className }: LoadingComponentProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
            <div className="relative h-12 w-12">
                <Image
                    src="/assets/logo-transparent.gif"
                    alt="Loading..."
                    fill
                    className="object-contain"
                    unoptimized
                />
            </div>
            {message && (
                <p className="text-sm font-medium text-neutral-500 animate-pulse-subtle">
                    {message}
                </p>
            )}
        </div>
    );
}

// ============================================
// Standard Spinner Loader
// ============================================

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "primary" | "white" | "neutral";
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
  xl: "h-16 w-16 border-4",
};

const variantClasses = {
  primary: "border-primary-600/30 border-t-primary-600",
  white: "border-white/30 border-t-white",
  neutral: "border-neutral-200 border-t-neutral-600 dark:border-neutral-700 dark:border-t-neutral-400",
};

/**
 * Standard spinner for general use
 */
export function Loader({ size = "md", variant = "primary", className }: LoaderProps) {
  return (
    <div
      className={clsx(
        "animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

// ============================================
// Alias for backwards compatibility
// ============================================

export function LoaderSpinner({ size = "sm", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  return <Loader size={size} className={className} />;
}

// ============================================
// Loading Overlay - For page/section loading
// ============================================

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

/**
 * Full overlay loader with optional message
 */
export function LoadingOverlay({ message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80",
        className
      )}
    >
      <LoadingComponent message={message} />
    </div>
  );
}

// ============================================
// Page Loader - For route transitions
// ============================================

interface PageLoaderProps {
  message?: string;
}

/**
 * Centered page loader for route transitions
 */
export function PageLoader({ message }: PageLoaderProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <LoadingComponent message={message} />
    </div>
  );
}

// ============================================
// Fullscreen Loader - For initial app load
// ============================================

export function FullscreenLoader() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-white dark:bg-neutral-950">
      <LoadingComponent message="Loading The Stack Hub..." />
    </div>
  );
}
