// Client-side only — no server secrets or database access here

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  BookOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Globe,
  Monitor,
} from "lucide-react";

interface Subject {
  id: string;
  name_en: string;
  name_mr?: string;
  slug: string;
  is_category: boolean;
  parent_subject_id: string | null;
  sub_subjects?: Subject[];
}

interface SubjectsSidebarMenuProps {
  subjects: Subject[];
  className?: string;
  onNavigate?: () => void;
}

// Icon mapping for known subjects
const subjectIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  scholarship: GraduationCap,
  "scholarship-marathi": BookOpen,
  "scholarship-mathematics": BookOpen,
  "scholarship-intelligence-test": BookOpen,
  "scholarship-general-knowledge": Globe,
  information_technology: Monitor,
  "information-technology": Monitor,
  english: Globe,
};

function getSubjectIcon(slug: string, isCategory: boolean) {
  if (isCategory) return Folder;
  return subjectIconMap[slug] || BookOpen;
}

export function SubjectsSidebarMenu({
  subjects,
  className,
  onNavigate,
}: SubjectsSidebarMenuProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Initialize expanded state based on active path
  useEffect(() => {
    const expanded = new Set<string>();
    subjects.forEach((subject) => {
      if (subject.is_category && subject.sub_subjects) {
        // Check if any sub-subject is active
        const hasActiveChild = subject.sub_subjects.some((child) => {
          const childSlug = child.slug.replace(/_/g, "-");
          return pathname.includes(`/questions/${childSlug}`) || pathname.includes(`/subjects/${childSlug}`);
        });
        if (hasActiveChild) {
          expanded.add(subject.id);
        }
      }
    });
    setExpandedCategories(expanded);
  }, [pathname, subjects]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getSubjectSlug = (slug: string) => slug.replace(/_/g, "-");

  return (
    <div className={clsx("space-y-1", className)}>
      {subjects.map((subject) => {
        if (subject.is_category && subject.sub_subjects && subject.sub_subjects.length > 0) {
          // Render as collapsible category
          const isExpanded = expandedCategories.has(subject.id);
          const Icon = getSubjectIcon(subject.slug, true);

          return (
            <div key={subject.id}>
              {/* Category Header */}
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleCategory(subject.id)}
                  className={clsx(
                    "group flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150",
                    "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                  <span className="flex-1 truncate text-left">{subject.name_en}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400 transition-transform" />
                  )}
                </button>

                {/* Sub-subjects */}
                {isExpanded && (
                  <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-neutral-200 pl-4 dark:border-neutral-700 animate-in fade-in slide-in-from-top-1 duration-200">
                    {subject.sub_subjects.map((child) => {
                      const childSlug = getSubjectSlug(child.slug);
                      const childPath = `/dashboard/questions/${childSlug}`;
                      const isChildActive = pathname.startsWith(childPath) || pathname.includes(`/subjects/${childSlug}`);
                      const ChildIcon = getSubjectIcon(child.slug, false);

                      return (
                        <Link
                          key={child.id}
                          href={childPath}
                          onClick={onNavigate}
                          className={clsx(
                            "group flex items-center gap-x-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                            isChildActive
                              ? "font-medium text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20"
                              : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800/50"
                          )}
                        >
                          <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{child.name_en}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        } else {
          // Render as regular subject (standalone)
          const subjectSlug = getSubjectSlug(subject.slug);
          const subjectPath = `/dashboard/questions/${subjectSlug}`;
          const isActive = pathname.startsWith(subjectPath) || pathname.includes(`/subjects/${subjectSlug}`);
          const Icon = getSubjectIcon(subject.slug, false);

          return (
            <Link
              key={subject.id}
              href={subjectPath}
              onClick={onNavigate}
              className={clsx(
                "group relative flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-linear-to-r from-primary-600 to-purple-600 text-white shadow-sm shadow-primary-500/20"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              )}
            >
              <Icon
                className={clsx(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                )}
              />
              <span className="truncate">{subject.name_en}</span>
            </Link>
          );
        }
      })}
    </div>
  );
}
