// Client-side only — no server secrets or database access here

"use client";

import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info } from "lucide-react";

// ============================================
// KPI Card - Premium Key Performance Indicator
// ============================================
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  status?: "success" | "warning" | "danger" | "info";
  gradient?: "purple" | "primary" | "emerald" | "amber" | "rose" | "cyan" | "none";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const kpiGradients = {
  purple: "from-purple-500/10 via-purple-500/5 to-transparent",
  primary: "from-primary-500/10 via-primary-500/5 to-transparent",
  emerald: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  amber: "from-amber-500/10 via-amber-500/5 to-transparent",
  rose: "from-rose-500/10 via-rose-500/5 to-transparent",
  cyan: "from-cyan-500/10 via-cyan-500/5 to-transparent",
  none: "",
};

const kpiStatusColors = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-rose-500",
  info: "text-primary-500",
};

const kpiStatusBg = {
  success: "bg-emerald-100 dark:bg-emerald-900/30",
  warning: "bg-amber-100 dark:bg-amber-900/30",
  danger: "bg-rose-100 dark:bg-rose-900/30",
  info: "bg-primary-100 dark:bg-primary-900/30",
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status,
  gradient = "none",
  size = "md",
  className,
}: KpiCardProps) {
  const TrendIcon = trend?.direction === "up" ? ArrowUp : trend?.direction === "down" ? ArrowDown : Minus;

  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-2xl p-5",
        "bg-white/80 backdrop-blur-xl dark:bg-neutral-900/80",
        "border border-neutral-200/50 dark:border-neutral-700/50",
        "shadow-lg shadow-neutral-900/5 dark:shadow-black/20",
        "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        gradient !== "none" && `bg-linear-to-br ${kpiGradients[gradient]}`,
        className
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/5" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className={clsx(
            "font-medium text-neutral-500 dark:text-neutral-400",
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          )}>
            {title}
          </p>

          <div className="flex items-baseline gap-2">
            <p className={clsx(
              "font-bold tracking-tight text-neutral-900 dark:text-white",
              size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-3xl"
            )}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>

            {trend && (
              <span
                className={clsx(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  trend.direction === "up"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : trend.direction === "down"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>

          {subtitle && (
            <p className={clsx(
              "text-neutral-500 dark:text-neutral-400",
              size === "sm" ? "text-xs" : "text-sm"
            )}>
              {subtitle}
            </p>
          )}

          {trend?.label && (
            <p className="text-xs text-neutral-400">{trend.label}</p>
          )}
        </div>

        {Icon && (
          <div
            className={clsx(
              "shrink-0 rounded-xl p-3",
              status ? kpiStatusBg[status] : "bg-neutral-100/80 dark:bg-neutral-800/80"
            )}
          >
            <Icon className={clsx("h-6 w-6", status ? kpiStatusColors[status] : "text-neutral-600 dark:text-neutral-400")} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Metric Comparison Card
// ============================================
interface MetricComparisonProps {
  title: string;
  current: number;
  previous: number;
  format?: "number" | "percentage" | "currency";
  icon?: LucideIcon;
  invertTrend?: boolean; // e.g., for "churn rate" where down is good
  className?: string;
}

export function MetricComparison({
  title,
  current,
  previous,
  format = "number",
  icon: Icon,
  invertTrend = false,
  className,
}: MetricComparisonProps) {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = invertTrend ? change < 0 : change > 0;

  const formatValue = (val: number) => {
    switch (format) {
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "currency":
        return `₹${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div
      className={clsx(
        "rounded-xl border border-neutral-200/50 bg-white/60 p-4 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            {formatValue(current)}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={clsx(
                "inline-flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-neutral-400">vs last period</span>
          </div>
        </div>
        {Icon && (
          <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
            <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Insight Panel - AI-like recommendations
// ============================================
interface InsightItem {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

interface InsightPanelProps {
  title?: string;
  insights: InsightItem[];
  className?: string;
}

const insightIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
};

const insightColors = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-500",
    text: "text-emerald-800 dark:text-emerald-200",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-500",
    text: "text-amber-800 dark:text-amber-200",
  },
  danger: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    icon: "text-rose-500",
    text: "text-rose-800 dark:text-rose-200",
  },
  info: {
    bg: "bg-primary-50 dark:bg-primary-900/20",
    border: "border-primary-200 dark:border-primary-800",
    icon: "text-primary-500",
    text: "text-primary-800 dark:text-primary-200",
  },
};

export function InsightPanel({ title = "Insights & Recommendations", insights, className }: InsightPanelProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-neutral-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/80",
        "shadow-lg shadow-neutral-900/5 dark:shadow-black/20",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insightIcons[insight.type];
          const colors = insightColors[insight.type];

          return (
            <div
              key={index}
              className={clsx(
                "rounded-xl border p-4",
                colors.bg,
                colors.border
              )}
            >
              <div className="flex gap-3">
                <Icon className={clsx("h-5 w-5 shrink-0 mt-0.5", colors.icon)} />
                <div className="flex-1">
                  <p className={clsx("font-medium", colors.text)}>{insight.title}</p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{insight.description}</p>
                  {insight.action && (
                    <a
                      href={insight.action.href}
                      className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                      {insight.action.label} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Progress Ring KPI
// ============================================
interface ProgressRingProps {
  value: number;
  maxValue?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "emerald" | "purple" | "amber" | "rose";
  label?: string;
  sublabel?: string;
  className?: string;
}

const ringColors = {
  primary: "stroke-primary-500",
  emerald: "stroke-emerald-500",
  purple: "stroke-purple-500",
  amber: "stroke-amber-500",
  rose: "stroke-rose-500",
};

const ringSizes = {
  sm: { size: 60, stroke: 6, text: "text-sm" },
  md: { size: 80, stroke: 8, text: "text-lg" },
  lg: { size: 100, stroke: 10, text: "text-xl" },
};

export function ProgressRing({
  value,
  maxValue = 100,
  size = "md",
  color = "primary",
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const { size: svgSize, stroke, text } = ringSizes[size];
  const radius = (svgSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={clsx("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg className="-rotate-90 transform" width={svgSize} height={svgSize}>
          {/* Background ring */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className="stroke-neutral-200 dark:stroke-neutral-700"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress ring */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className={clsx(ringColors[color], "transition-all duration-700 ease-out")}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx("font-bold text-neutral-900 dark:text-white", text)}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {label && (
        <p className="mt-2 text-center text-sm font-medium text-neutral-900 dark:text-white">{label}</p>
      )}
      {sublabel && (
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">{sublabel}</p>
      )}
    </div>
  );
}

// ============================================
// Stats Grid - Compact horizontal stats
// ============================================
interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div className={clsx("grid grid-cols-2 gap-4 sm:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border border-neutral-200/50 bg-white/60 p-4 text-center backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60"
        >
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Alert Banner
// ============================================
interface AlertBannerProps {
  type: "info" | "warning" | "success" | "danger";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  onDismiss?: () => void;
  className?: string;
}

const alertStyles = {
  info: "bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800",
  warning: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
  success: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
  danger: "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800",
};

export function AlertBanner({ type, title, description, action, onDismiss, className }: AlertBannerProps) {
  const Icon = type === "success" ? CheckCircle2 : type === "warning" || type === "danger" ? AlertTriangle : Info;
  const colors = insightColors[type];

  return (
    <div className={clsx("rounded-xl border p-4", alertStyles[type], className)}>
      <div className="flex gap-3">
        <Icon className={clsx("h-5 w-5 shrink-0", colors.icon)} />
        <div className="flex-1">
          <p className={clsx("font-medium", colors.text)}>{title}</p>
          {description && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-start gap-2">
          {action && (
            action.href ? (
              <a
                href={action.href}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                {action.label}
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                {action.label}
              </button>
            )
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
