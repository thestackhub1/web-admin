// Client-side only — no server secrets or database access here

/**
 * UI Components Index
 *
 * Barrel export for all primitive UI components.
 * Import from '@/client/components/ui' or '@/ui' instead of individual files.
 */

// Buttons
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

// Form inputs
export { Input, TextInput } from "./input";
export { Select } from "./select";
export { PasscodeInput } from "./passcode-input";

// Cards and containers
export {
    GlassCard,
    StatCardPremium,
    QuickActionCard,
    Badge,
    EmptyState,
    PageHeader,
    SectionHeader,
    Skeleton,
    SkeletonCard,
    SkeletonTable,
} from "./premium";

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "./card";

// Charts
export * from "./charts";
export * from "./analytics-charts";

// Loading states - Consolidated into loader.tsx
export {
    Loader,
    LoaderSpinner,
    LoadingOverlay,
    PageLoader,
    FullscreenLoader,
    LoadingComponent
} from "./loader";

// Question display components
export * from "./question-components";

// Filters
export * from "./smart-filters";

// Navigation
export { Breadcrumbs } from "./breadcrumbs";

// Icons
export { Icon } from "./icon";
export { IconPicker } from "./icon-picker";

// KPI Cards
export * from "./kpi-cards";

// Motion animations
export * from "./motion";

// Bento Stat Card
export { BentoStatCard } from "./bento-stat-card";
export type { BentoStatCardProps } from "./bento-stat-card";
