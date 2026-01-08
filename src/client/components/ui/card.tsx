// Client-side only — no server secrets or database access here

import * as React from "react";
import { cn } from '@/client/utils';

/**
 * Card Component - Premium Design
 * Matching marketing website: rounded-2xl, glow shadow, hover lift
 */

type CardVariant = "default" | "elevated" | "glass" | "gradient";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  gradient?: "none" | "blue" | "emerald" | "amber" | "purple" | "brand";
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800",
  elevated:
    "bg-white shadow-glow-card dark:bg-neutral-900",
  glass:
    "glass",
  gradient:
    "bg-white border border-neutral-100 dark:bg-neutral-900",
};

const gradientStyles = {
  none: "",
  blue: "bg-linear-to-br from-primary-50/50 to-primary-100/30 dark:from-primary-950/20 dark:to-primary-900/10",
  emerald:
    "bg-linear-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10",
  amber:
    "bg-linear-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10",
  purple:
    "bg-linear-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10",
  brand:
    "bg-linear-to-br from-primary-50/30 via-white to-purple-50/30 dark:from-primary-950/10 dark:via-neutral-900 dark:to-purple-950/10",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "elevated",
      hover = false,
      padding = "md",
      gradient = "none",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          variantStyles[variant],
          gradientStyles[gradient],
          paddingStyles[padding],
          hover &&
          "cursor-pointer hover:shadow-glow-card-hover hover:-translate-y-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card sub-components for better composition
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold text-neutral-900 dark:text-white",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-500 dark:text-neutral-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
