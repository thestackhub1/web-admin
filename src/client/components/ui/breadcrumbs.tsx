// Client-side only — no server secrets or database access here

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      className={clsx(
        "flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400",
        className
      )}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={clsx(isLast && "text-neutral-700 dark:text-neutral-300 font-medium")}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}


