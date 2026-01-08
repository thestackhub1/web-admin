// Client-side only — no server secrets or database access here

/**
 * Premium UI Components - The Stack Hub Admin Portal
 * 
 * Premium SaaS design system inspired by Linear, Raycast, and Vercel.
 * These components provide a consistent, high-fidelity experience.
 */

import { clsx } from "clsx";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: "brand" | "blue" | "purple" | "green" | "amber" | "pink" | "none";
  padding?: "sm" | "md" | "lg" | "xl" | "none";
  /** Use bento-style glass morphism */
  bento?: boolean;
}

const gradientClasses = {
  brand: "from-primary-50 to-purple-50 dark:from-primary-950/20 dark:to-purple-950/20",
  blue: "from-primary-50 to-cyan-50 dark:from-primary-950/20 dark:to-cyan-950/20",
  purple: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  green: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
  amber: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
  pink: "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
  none: "",
};

const paddingClasses = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
  xl: "p-8",
  none: "",
};

export function GlassCard({
  children,
  className,
  hover = false,
  gradient = "none",
  padding = "lg",
  bento = false,
}: GlassCardProps) {
  if (bento) {
    return (
      <div
        className={clsx(
          "bento-card",
          paddingClasses[padding],
          gradient !== "none" && `bg-linear-to-br ${gradientClasses[gradient]}`,
          hover && "cursor-pointer",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-2xl",
        paddingClasses[padding],
        "bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80",
        "border border-neutral-200/60 dark:border-neutral-800/60",
        "shadow-sm",
        gradient !== "none" && `bg-linear-to-br ${gradientClasses[gradient]}`,
        hover && "cursor-pointer transition-all duration-300 hover:shadow-glow-card-hover hover:-translate-y-0.5 hover:border-neutral-300 dark:hover:border-neutral-700",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardPremiumProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: GlassCardProps["gradient"];
  iconColor?: string;
  iconBg?: string;
  className?: string;
  href?: string;
}

// Helper to detect if value is a percentage
function isPercentageValue(value: string | number): number | null {
  if (typeof value === "string") {
    const match = value.match(/^(\d+(?:\.\d+)?)%$/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

// Progress bar color based on percentage
function getProgressColor(percentage: number): string {
  if (percentage >= 70) return "bg-emerald-500";
  if (percentage >= 40) return "bg-amber-500";
  return "bg-rose-400";
}

export function StatCardPremium({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = "none",
  iconColor = "text-primary-600 dark:text-primary-400",
  iconBg = "bg-primary-100 dark:bg-primary-900/30",
  className,
  href,
}: StatCardPremiumProps) {
  const percentageValue = isPercentageValue(value);
  const showProgress = percentageValue !== null;

  const content = (
    <GlassCard className={clsx("group/stat", className)} gradient={gradient} hover={!!href} padding="md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {showProgress && percentageValue === 0 && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500">No data</span>
            )}
          </div>
          {showProgress && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  getProgressColor(percentageValue ?? 0)
                )}
                style={{ width: `${Math.min(percentageValue ?? 0, 100)}%` }}
              />
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
                  trend.isPositive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx(
            "shrink-0 rounded-lg p-2.5 transition-transform duration-200 group-hover/stat:scale-105",
            iconBg
          )}>
            <Icon className={clsx("h-5 w-5", iconColor)} />
          </div>
        )}
      </div>
    </GlassCard>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "purple" | "brand";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string; // Add className prop
}

const badgeVariants = {
  default: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  error: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  info: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  brand: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
};

const dotVariants = {
  default: "bg-neutral-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
  info: "bg-primary-500",
  purple: "bg-purple-500",
  brand: "bg-primary-500",
};

export function Badge({ children, variant = "default", size = "sm", dot, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        badgeVariants[variant],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className
      )}
    >
      {dot && <span className={clsx("h-1.5 w-1.5 rounded-full", dotVariants[variant])} />}
      {children}
    </span>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-neutral-100 p-4 dark:bg-neutral-800">
          <Icon className="h-8 w-8 text-neutral-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800", className)} />
  );
}

export function SkeletonCard() {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </GlassCard>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
  /** Icon to display alongside title */
  icon?: LucideIcon;
  /** Semantic color for icon */
  iconColor?: "primary" | "success" | "warning" | "insight";
}

const iconColorClasses = {
  primary: "text-primary-500",
  success: "text-success-500",
  warning: "text-warning-500",
  insight: "text-insight-500",
};

export function PageHeader({ title, description, action, breadcrumbs, className, icon: Icon, iconColor = "primary" }: PageHeaderProps) {
  return (
    <div className={clsx("mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-neutral-300 dark:text-neutral-600">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-neutral-700 dark:text-neutral-200">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className={clsx("icon-container", `icon-container-${iconColor}`)}>
              <Icon className={clsx("h-6 w-6", iconColorClasses[iconColor])} />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  gradient?: GlassCardProps["gradient"];
  iconBg?: string;
  iconColor?: string;
  /** Semantic color variant */
  semantic?: "primary" | "success" | "warning" | "insight";
}

const semanticIconClasses = {
  primary: { bg: "icon-container-primary", color: "text-primary-600 dark:text-primary-400" },
  success: { bg: "icon-container-success", color: "text-success-600 dark:text-success-400" },
  warning: { bg: "icon-container-warning", color: "text-warning-600 dark:text-warning-400" },
  insight: { bg: "icon-container-insight", color: "text-insight-600 dark:text-insight-400" },
};

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  gradient = "none",
  iconBg,
  iconColor,
  semantic = "primary",
}: QuickActionCardProps) {
  const iconClasses = semanticIconClasses[semantic];
  
  return (
    <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 rounded-2xl block group">
      <div className="bento-card p-5 h-full group-hover:-translate-y-1 group-hover:shadow-glow-card-hover transition-all duration-300">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className={clsx(
            "icon-container rounded-xl p-4 transition-transform duration-300 group-hover:scale-110",
            iconBg || iconClasses.bg
          )}>
            <Icon className={clsx("h-6 w-6", iconColor || iconClasses.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** 
 * Section Header - Used to divide dashboard sections
 */
interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: "primary" | "success" | "warning" | "insight";
  action?: React.ReactNode;
  className?: string;
  count?: number;
}

const sectionIconColors = {
  primary: "text-primary-500",
  success: "text-success-500",
  warning: "text-warning-500",
  insight: "text-insight-500",
};

export function SectionHeader({ title, icon: Icon, iconColor = "primary", action, className, count }: SectionHeaderProps) {
  return (
    <div className={clsx("flex items-center justify-between mb-5", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={clsx("h-5 w-5", sectionIconColors[iconColor])} />}
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
        {count !== undefined && (
          <Badge variant="purple" size="sm">{count}</Badge>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Data Table Container - Premium wrapper for tables
 */
interface DataTableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableContainer({ children, className }: DataTableContainerProps) {
  return (
    <div className={clsx(
      "overflow-hidden rounded-2xl",
      "bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80",
      "border border-neutral-200/60 dark:border-neutral-800/60",
      "shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Table styles for consistent data display
 */
export function DataTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("min-w-full", className)}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={clsx(
      "bg-neutral-50/80 dark:bg-neutral-800/50",
      "border-b border-neutral-200/80 dark:border-neutral-700/80",
      className
    )}>
      {children}
    </thead>
  );
}

export function DataTableHeadCell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={clsx(
      "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider",
      "text-neutral-500 dark:text-neutral-400",
      className
    )}>
      {children}
    </th>
  );
}

export function DataTableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={clsx(
      "divide-y divide-neutral-100 dark:divide-neutral-800",
      className
    )}>
      {children}
    </tbody>
  );
}

export function DataTableRow({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr 
      className={clsx(
        "group transition-colors duration-150",
        "hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={clsx(
      "px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300",
      className
    )}>
      {children}
    </td>
  );
}
