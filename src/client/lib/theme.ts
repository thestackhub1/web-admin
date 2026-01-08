// Client-side only — no server secrets or database access here
/**
 * Admin Portal Design System
 * Brand colors derived from logo.svg gradients (aligned with student-portal)
 *
 * Following Open/Closed Principle - extend via CSS variables, don't modify
 */

export const theme = {
  colors: {
    // Primary Blue - Trust, education (from stackBlue gradient)
    primary: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A",
      950: "#172554",
    },
    // Success/Emerald - Correct, growth, positive (from stackEmerald gradient)
    success: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B",
    },
    // Warning/Amber - Warnings, attention, highlights (from stackAmber gradient)
    warning: {
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F",
    },
    // Insight/Purple - Analytics, AI, insights (from stackPurple gradient)
    insight: {
      50: "#F5F3FF",
      100: "#EDE9FE",
      200: "#DDD6FE",
      300: "#C4B5FD",
      400: "#A78BFA",
      500: "#8B5CF6",
      600: "#7C3AED",
      700: "#6D28D9",
      800: "#5B21B6",
      900: "#4C1D95",
    },
    // Danger/Error states
    danger: {
      50: "#FEF2F2",
      100: "#FEE2E2",
      200: "#FECACA",
      300: "#FCA5A5",
      400: "#F87171",
      500: "#EF4444",
      600: "#DC2626",
      700: "#B91C1C",
      800: "#991B1B",
      900: "#7F1D1D",
    },
    // Neutral - Text, backgrounds
    neutral: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
      950: "#030712",
    },
  },

  // Gradient definitions (matching student-portal)
  gradients: {
    primary: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)",
    success: "linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)",
    warning: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)",
    insight: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%)",
    brand: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
    admin: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
  },

  // Chart color palettes (for analytics)
  charts: {
    // Single color shade progressions
    primary: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"],
    success: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"],
    warning: ["#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A", "#FEF3C7"],
    insight: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"],
    danger: ["#EF4444", "#F87171", "#FCA5A5", "#FECACA", "#FEE2E2"],
    neutral: ["#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB", "#F3F4F6"],
    // Multi-color palettes for diverse data
    rainbow: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899"],
    pastel: ["#C4B5FD", "#93C5FD", "#6EE7B7", "#FDE68A", "#FECACA", "#FBCFE8"],
  },

  // Semantic chart colors
  semanticColors: {
    exams: "#3B82F6",        // Primary blue
    enrollments: "#10B981",  // Success green
    completions: "#10B981",  // Success green
    correct: "#10B981",      // Success green
    incorrect: "#EF4444",    // Danger red
    easy: "#10B981",         // Success green
    medium: "#F59E0B",       // Warning amber
    hard: "#EF4444",         // Danger red
    previous: "#9CA3AF",     // Neutral gray
    current: "#3B82F6",      // Primary blue
    axis: "#9CA3AF",         // Neutral gray for chart axes
  },
} as const;

/**
 * Get color class for percentage/score display
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return "text-success-600 dark:text-success-400";
  if (score >= 75) return "text-success-500 dark:text-success-400";
  if (score >= 60) return "text-warning-600 dark:text-warning-400";
  if (score >= 40) return "text-warning-500 dark:text-warning-400";
  return "text-danger-600 dark:text-danger-400";
}

/**
 * Get chart color by semantic name
 */
export function getSemanticColor(name: string): string {
  const lowercaseName = name.toLowerCase();
  return theme.semanticColors[lowercaseName as keyof typeof theme.semanticColors] 
    || theme.colors.primary[500];
}

/**
 * Get chart colors array by palette name
 */
export function getChartPalette(palette: keyof typeof theme.charts = 'rainbow'): readonly string[] {
  return theme.charts[palette];
}

export type Theme = typeof theme;
