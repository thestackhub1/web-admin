// Client-side only — no server secrets or database access here

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  BookOpen,
  GraduationCap,
  Globe,
  Monitor,
  CheckCircle2,
  AlertCircle,

  ChevronDown,
  Folder,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { useAddSubjectToClassLevel, useRemoveSubjectFromClassLevel } from "@/client/hooks";

interface Subject {
  id: string;
  name_en: string;
  name_mr?: string;
  slug: string;
  description_en?: string;
  isAssigned?: boolean;
}

interface CategoryWithSubjects {
  id: string;
  name_en: string;
  name_mr?: string;
  slug: string;
  description_en?: string;
  subjects: Subject[];
}

interface ClassLevelSubjectEditorProps {
  classLevelId: string;
  classLevelName: string;
  classLevelSlug: string;
  assignedSubjects: Subject[];
  categoriesWithSubjects: CategoryWithSubjects[];
  standaloneSubjects: Subject[];
}

// Subject color and icon mapping
const subjectStyles: Record<string, { bg: string; text: string; border: string; icon: React.ComponentType<any> }> = {
  scholarship: {
    bg: "bg-insight-100 dark:bg-insight-900/30",
    text: "text-insight-600 dark:text-insight-400",
    border: "border-insight-200 dark:border-insight-800",
    icon: GraduationCap,
  },
  english: {
    bg: "bg-primary-100 dark:bg-primary-900/30",
    text: "text-primary-600 dark:text-primary-400",
    border: "border-primary-200 dark:border-primary-800",
    icon: Globe,
  },
  information_technology: {
    bg: "bg-success-100 dark:bg-success-900/30",
    text: "text-success-600 dark:text-success-400",
    border: "border-success-200 dark:border-success-800",
    icon: Monitor,
  },
};

const defaultSubjectStyle = {
  bg: "bg-neutral-100 dark:bg-neutral-800",
  text: "text-neutral-600 dark:text-neutral-400",
  border: "border-neutral-200 dark:border-neutral-700",
  icon: BookOpen,
};

export function ClassLevelSubjectEditor({
  classLevelId,
  classLevelName,
  classLevelSlug,
  assignedSubjects,
  categoriesWithSubjects,
  standaloneSubjects,
}: ClassLevelSubjectEditorProps) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [actionSubjectId, setActionSubjectId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-expand categories that have assigned subjects
  useEffect(() => {
    const categoriesWithAssigned = new Set<string>();
    categoriesWithSubjects.forEach((category) => {
      if (category.subjects.some((s) => s.isAssigned)) {
        categoriesWithAssigned.add(category.id);
      }
    });
    setExpandedCategories(categoriesWithAssigned);
  }, [categoriesWithSubjects]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

  const addSubjectMutation = useAddSubjectToClassLevel();
  const removeSubjectMutation = useRemoveSubjectFromClassLevel();
  const isPending = addSubjectMutation.isLoading || removeSubjectMutation.isLoading;

  const handleAddSubject = async (subject: Subject) => {
    setActionSubjectId(subject.id);
    const result = await addSubjectMutation.mutateAsync({
      classLevelSlug: classLevelSlug,
      subjectId: subject.id,
    });
    if (result) {
      setNotification({ type: "success", message: `${subject.name_en} added to ${classLevelName}` });
      router.refresh();
    } else {
      setNotification({ type: "error", message: addSubjectMutation.error || "Failed to add subject" });
    }
    setActionSubjectId(null);
  };

  const handleRemoveSubject = async (subject: Subject) => {
    if (!confirm(`Remove "${subject.name_en}" from ${classLevelName}?`)) return;

    setActionSubjectId(subject.id);
    const result = await removeSubjectMutation.mutateAsync({
      classLevelSlug: classLevelSlug,
      subjectId: subject.id,
    });
    if (result) {
      setNotification({ type: "success", message: `${subject.name_en} removed` });
      router.refresh();
    } else {
      setNotification({ type: "error", message: removeSubjectMutation.error || "Failed to remove subject" });
    }
    setActionSubjectId(null);
  };

  const getSubjectStyle = (slug: string) => subjectStyles[slug] || defaultSubjectStyle;

  // Get all available subjects (from categories and standalone)


  return (
    <div className="relative">
      {/* Notification Toast */}
      {notification && (
        <div
          className={clsx(
            "absolute -top-2 left-0 right-0 z-30 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg transition-all duration-300",
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          )}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {notification.message}
        </div>
      )}

      {/* Assigned Subjects Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        {assignedSubjects.length === 0 ? (
          <div className="w-full rounded-xl border-2 border-dashed border-neutral-200 py-8 text-center dark:border-neutral-700">
            <BookOpen className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-600" />
            <p className="mt-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              No subjects assigned yet
            </p>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              Add subjects to enable exam scheduling for this class
            </p>
          </div>
        ) : (
          assignedSubjects.map((subject) => {
            const style = getSubjectStyle(subject.slug);
            const Icon = style.icon;
            const isRemoving = isPending && actionSubjectId === subject.id;

            return (
              <div
                key={subject.id}
                className={clsx(
                  "group flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-1.5 transition-all duration-200",
                  style.border,
                  style.bg,
                  isRemoving && "opacity-50"
                )}
              >
                <Link href={`/dashboard/subjects/${subject.id}`} className="flex items-center gap-2">
                  <Icon className={clsx("h-4 w-4", style.text)} />
                  <span className={clsx("text-sm font-medium", style.text)}>{subject.name_en}</span>
                </Link>
                <button
                  onClick={() => handleRemoveSubject(subject)}
                  disabled={isPending}
                  className={clsx(
                    "ml-1 rounded-full p-1.5 transition-colors disabled:opacity-50",
                    style.text,
                    "hover:bg-danger-100 hover:text-danger-600 dark:hover:bg-danger-900/30 dark:hover:text-danger-400"
                  )}
                  title={`Remove ${subject.name_en}`}
                >
                  {isRemoving ? (
                    <LoaderSpinner size="sm" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Categories Section */}
      {categoriesWithSubjects.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Categories</h3>
          {categoriesWithSubjects.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const assignedCount = category.subjects.filter((s) => s.isAssigned).length;
            const totalCount = category.subjects.length;

            return (
              <div
                key={category.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <FolderOpen className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <Folder className="h-5 w-5 text-neutral-400" />
                    )}
                    <div className="text-left">
                      <h4 className="font-semibold text-neutral-900 dark:text-white">{category.name_en}</h4>
                      {category.name_mr && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{category.name_mr}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {assignedCount}/{totalCount} assigned
                    </span>
                    <ChevronDown
                      className={clsx(
                        "h-5 w-5 text-neutral-400 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {/* Category Subjects */}
                {isExpanded && (
                  <div className="border-t border-neutral-200 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-800/50">
                    <div className="p-4 space-y-2">
                      {category.subjects.length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                          No subjects in this category
                        </p>
                      ) : (
                        category.subjects.map((subject) => {
                          const style = getSubjectStyle(subject.slug);
                          const Icon = style.icon;
                          const isAssigned = subject.isAssigned;
                          const isProcessing = isPending && actionSubjectId === subject.id;

                          return (
                            <div
                              key={subject.id}
                              className={clsx(
                                "flex items-center justify-between rounded-lg border p-3 transition-all",
                                isAssigned
                                  ? clsx("border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20", style.border)
                                  : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={clsx("rounded-lg p-2", isAssigned ? style.bg : "bg-neutral-100 dark:bg-neutral-800")}>
                                  {isProcessing ? (
                                    <LoaderSpinner size="sm" />
                                  ) : (
                                    <Icon className={clsx("h-4 w-4", isAssigned ? style.text : "text-neutral-400")} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/dashboard/subjects/${subject.id}`} className="block">
                                    <p className={clsx(
                                      "font-medium truncate hover:underline",
                                      isAssigned ? "text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-neutral-400"
                                    )}>
                                      {subject.name_en}
                                    </p>
                                  </Link>
                                  {subject.name_mr && (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                      {subject.name_mr}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isAssigned ? (
                                  <button
                                    onClick={() => handleRemoveSubject(subject)}
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 rounded-lg bg-danger-50 px-3 py-1.5 text-sm font-medium text-danger-700 transition-colors hover:bg-danger-100 disabled:opacity-50 dark:bg-danger-900/30 dark:text-danger-400 dark:hover:bg-danger-900/50"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Remove
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAddSubject(subject)}
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-1.5 text-sm font-medium text-success-700 transition-colors hover:bg-success-100 disabled:opacity-50 dark:bg-success-900/30 dark:text-success-400 dark:hover:bg-success-900/50"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Standalone Subjects Section */}
      {standaloneSubjects.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Other Subjects</h3>
          <div className="space-y-2">
            {standaloneSubjects.map((subject) => {
              const style = getSubjectStyle(subject.slug);
              const Icon = style.icon;
              const isAssigned = subject.isAssigned;
              const isProcessing = isPending && actionSubjectId === subject.id;

              return (
                <div
                  key={subject.id}
                  className={clsx(
                    "flex items-center justify-between rounded-lg border p-3 transition-all",
                    isAssigned
                      ? clsx("border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20", style.border)
                      : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={clsx("rounded-lg p-2", isAssigned ? style.bg : "bg-neutral-100 dark:bg-neutral-800")}>
                      {isProcessing ? (
                        <LoaderSpinner size="sm" />
                      ) : (
                        <Icon className={clsx("h-4 w-4", isAssigned ? style.text : "text-neutral-400")} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/subjects/${subject.id}`} className="block">
                        <p className={clsx(
                          "font-medium truncate hover:underline",
                          isAssigned ? "text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-neutral-400"
                        )}>
                          {subject.name_en}
                        </p>
                      </Link>
                      {subject.name_mr && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {subject.name_mr}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAssigned ? (
                      <button
                        onClick={() => handleRemoveSubject(subject)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 rounded-lg bg-danger-50 px-3 py-1.5 text-sm font-medium text-danger-700 transition-colors hover:bg-danger-100 disabled:opacity-50 dark:bg-danger-900/30 dark:text-danger-400 dark:hover:bg-danger-900/50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddSubject(subject)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-1.5 text-sm font-medium text-success-700 transition-colors hover:bg-success-100 disabled:opacity-50 dark:bg-success-900/30 dark:text-success-400 dark:hover:bg-success-900/50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {categoriesWithSubjects.length === 0 && standaloneSubjects.length === 0 && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-success-50 px-4 py-3 dark:bg-success-900/20">
          <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400" />
          <p className="text-sm font-medium text-success-700 dark:text-success-400">
            All available subjects have been assigned!
          </p>
        </div>
      )}
    </div>
  );
}
