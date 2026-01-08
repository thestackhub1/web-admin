// Client-side only — no server secrets or database access here

"use client";

import { clsx } from "clsx";
import { cn } from '@/client/utils';
import { Logo } from "@/client/components/shared/Logo";

// ============================================
// Loading Component - Premium Logo Spinner
// ============================================

interface LoadingComponentProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: { logo: "sm" as const, container: "h-8 w-8", text: "text-xs" },
  md: { logo: "md" as const, container: "h-12 w-12", text: "text-sm" },
  lg: { logo: "lg" as const, container: "h-16 w-16", text: "text-base" },
  xl: { logo: "xl" as const, container: "h-20 w-20", text: "text-lg" },
};

/**
 * Premium loading component with SVG logo and spinning rings.
 * Replaces the old GIF-based loader for better performance and aesthetics.
 */
export function LoadingComponent({
  message,
  className,
  size = "md"
}: LoadingComponentProps) {
  const sizeConfig = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("relative", sizeConfig.container)}>
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 border-r-primary-300 animate-spin" />

        {/* Inner logo with pulse */}
        <div className="absolute inset-2 flex items-center justify-center">
          <Logo
            size={sizeConfig.logo}
            className="animate-pulse-subtle"
            idPrefix={`loader-${size}`}
          />
        </div>
      </div>

      {message && (
        <p className={cn("text-neutral-500 font-medium animate-pulse", sizeConfig.text)}>
          {message}
        </p>
      )}
    </div>
  );
}

// ============================================
// Standard Spinner Loader (Legacy/Fallback)
// ============================================

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "primary" | "white" | "neutral";
}

const basicSizeClasses = {
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
 * Basic spinner for very small areas where Logo might be too much.
 */
export function Loader({ size = "md", variant = "primary", className }: LoaderProps) {
  return (
    <div
      className={clsx(
        "animate-spin rounded-full",
        basicSizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

/**
 * Alias for backwards compatibility - now uses the premium LoadingComponent
 */
export function LoaderSpinner({ size = "md", className, message }: { size?: "sm" | "md" | "lg"; className?: string; message?: string }) {
  return <LoadingComponent size={size} className={className} message={message} />;
}

// ============================================
// Loading Overlay - For page/section loading
// ============================================

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

/**
 * Full overlay loader with premium blurred background
 */
export function LoadingOverlay({ message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80",
        className
      )}
    >
      <LoadingComponent size="lg" message={message} />
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <LoadingComponent size="lg" message={message} />
    </div>
  );
}

// ============================================
// Fullscreen Loader - For initial app load
// ============================================

export function FullscreenLoader() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-white dark:bg-neutral-950">
      <LoadingComponent size="xl" message="Loading The Stack Hub..." />
    </div>
  );
}
