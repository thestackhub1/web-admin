// Client-side only — no server secrets or database access here

"use client";

/**
 * Reusable Section Card Component
 * Provides consistent styling and layout for form sections
 */

import { clsx } from "clsx";
import { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  required = false,
  collapsible: _collapsible = false,
  defaultCollapsed: _defaultCollapsed = false,
}: SectionCardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white p-8",
        "dark:bg-neutral-900/40",
        className
      )}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="mb-2 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
              {title}
              {required && <span className="ml-1.5 text-red-500">*</span>}
            </h3>
          )}
          {description && (
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

