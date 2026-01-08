// Client-side only — no server secrets or database access here

"use client";

import { useState, useRef, useEffect } from "react";
import { GlassCard, Badge } from '@/client/components/ui/premium';
import {
  X,
  Plus,
  BookOpen,
  ChevronDown,
  Calendar,
  GraduationCap,
  Globe,
  Monitor,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import Link from "next/link";
import { useAddSubjectToClassLevel, useRemoveSubjectFromClassLevel } from "@/client/hooks";

interface Subject {
  id: string;
  name_en: string;
  slug: string;
}

interface ClassLevel {
  id: string;
  name_en: string;
  name_mr?: string;
  slug: string;
  is_active: boolean;
  subject_class_mappings?: Array<{
    subject_id: string;
    subjects: Subject;
  }>;
  scheduled_exams?: Array<{ count: number }>;
}

interface ClassLevelSubjectsManagerProps {
  classLevel: ClassLevel;
  allSubjects: Subject[];
  gradient: string;
  colorClass: string;
}

// Subject color and icon mapping
const subjectStyles: Record<string, { bg: string; text: string; icon: React.ComponentType<any> }> = {
  scholarship: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    icon: GraduationCap,
  },
  english: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    icon: Globe,
  },
  information_technology: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
    icon: Monitor,
  },
};

const defaultSubjectStyle = {
  bg: "bg-neutral-100 dark:bg-neutral-800",
  text: "text-neutral-600 dark:text-neutral-400",
  icon: BookOpen,
};

export function ClassLevelSubjectsManager({
  classLevel,
  allSubjects,
  gradient,
  colorClass,
}: ClassLevelSubjectsManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [actionSubjectId, setActionSubjectId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current subjects for this class level
  const currentSubjects =
    classLevel.subject_class_mappings?.map((m) => m.subjects).filter(Boolean) || [];

  const currentSubjectIds = new Set(currentSubjects.map((s) => s.id));

  // Get available subjects (not already added)
  const availableSubjects = allSubjects.filter((s) => !currentSubjectIds.has(s.id));

  const subjectCount = currentSubjects.length;
  const examCount = classLevel.scheduled_exams?.[0]?.count || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddDropdown(false);
      }
    }
    if (showAddDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAddDropdown]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addSubjectMutation = useAddSubjectToClassLevel();
  const removeSubjectMutation = useRemoveSubjectFromClassLevel();
  const isPending = addSubjectMutation.isLoading || removeSubjectMutation.isLoading;

  const handleAddSubject = async (subject: Subject) => {
    setActionSubjectId(subject.id);
    const result = await addSubjectMutation.mutateAsync({
      classLevelSlug: classLevel.slug,
      subjectId: subject.id,
    });
    if (result) {
      setNotification({ type: "success", message: `${subject.name_en} added successfully` });
    } else {
      setNotification({ type: "error", message: addSubjectMutation.error || "Failed to add subject" });
    }
    setActionSubjectId(null);
    setShowAddDropdown(false);
  };

  const handleRemoveSubject = async (subject: Subject) => {
    if (!confirm(`Remove ${subject.name_en} from ${classLevel.name_en}?`)) return;

    setActionSubjectId(subject.id);
    const result = await removeSubjectMutation.mutateAsync({
      classLevelSlug: classLevel.slug,
      subjectId: subject.id,
    });
    if (result) {
      setNotification({ type: "success", message: `${subject.name_en} removed` });
    } else {
      setNotification({ type: "error", message: removeSubjectMutation.error || "Failed to remove subject" });
    }
    setActionSubjectId(null);
  };

  const getSubjectStyle = (slug: string) => {
    return subjectStyles[slug] || defaultSubjectStyle;
  };

  return (
    <GlassCard
      className={`group relative overflow-hidden bg-linear-to-br ${gradient} transition-all duration-300`}
    >
      {/* Notification Toast */}
      {notification && (
        <div
          className={`absolute left-4 right-4 top-4 z-20 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-xl p-3 ${colorClass}`}>
          <span className="text-2xl font-bold">{classLevel.name_en}</span>
          {classLevel.name_mr && (
            <span className="ml-2 text-sm opacity-70">({classLevel.name_mr})</span>
          )}
        </div>
        <Badge variant={classLevel.is_active ? "success" : "warning"} size="sm">
          {classLevel.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="mb-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">{subjectCount}</p>
            <p className="text-xs">Subjects</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/30">
            <Calendar className="h-4 w-4 text-brand-blue-600 dark:text-brand-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">{examCount}</p>
            <p className="text-xs">Exams</p>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all duration-200 ${
          isExpanded
            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            : "border-neutral-200 bg-white/60 text-neutral-700 hover:bg-white/80 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800/80"
        }`}
      >
        <Sparkles className="h-4 w-4" />
        {isExpanded ? "Hide Subjects" : "Manage Subjects"}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded Section with Animation */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "mt-4 max-h-125 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Assigned Subjects
            </h4>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {subjectCount} of {allSubjects.length}
            </span>
          </div>

          {/* Current Subjects */}
          {currentSubjects.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-6 text-center dark:border-neutral-700 dark:bg-neutral-800/30">
              <BookOpen className="mx-auto h-8 w-8 text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                No subjects assigned yet
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Add subjects to enable scheduling exams
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentSubjects.map((subject) => {
                const style = getSubjectStyle(subject.slug);
                const Icon = style.icon;
                const isRemoving = isPending && actionSubjectId === subject.id;

                return (
                  <div
                    key={subject.id}
                    className={`group/item flex items-center justify-between rounded-xl border border-neutral-200 bg-white/80 p-3 transition-all duration-200 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/80 ${
                      isRemoving ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${style.bg}`}>
                        <Icon className={`h-4 w-4 ${style.text}`} />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {subject.name_en}
                        </p>
                        <Link
                          href={`/dashboard/scheduling/${subject.slug.replace(/_/g, "-")}/${classLevel.slug}`}
                          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View schedules →
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSubject(subject)}
                      disabled={isPending}
                      className="rounded-lg p-2 text-neutral-400 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover/item:opacity-100 disabled:opacity-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      title="Remove subject"
                    >
                      {isRemoving ? (
                        <LoaderSpinner size="sm" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Subject Section */}
          <div ref={dropdownRef} className="relative">
            {availableSubjects.length > 0 ? (
              <>
                <button
                  onClick={() => setShowAddDropdown(!showAddDropdown)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-all duration-200 ${
                    showAddDropdown
                      ? "border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "border-neutral-300 text-neutral-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Add Subject ({availableSubjects.length} available)
                </button>

                {/* Dropdown */}
                {showAddDropdown && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900/50">
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Select a subject to add
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {availableSubjects.map((subject) => {
                        const style = getSubjectStyle(subject.slug);
                        const Icon = style.icon;
                        const isAdding = isPending && actionSubjectId === subject.id;

                        return (
                          <button
                            key={subject.id}
                            onClick={() => handleAddSubject(subject)}
                            disabled={isPending}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:hover:bg-neutral-700/50"
                          >
                            <div className={`rounded-lg p-2 ${style.bg}`}>
                              {isAdding ? (
                                <LoaderSpinner size="sm" />
                              ) : (
                                <Icon className={`h-4 w-4 ${style.text}`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900 dark:text-white">
                                {subject.name_en}
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-center dark:bg-green-900/20">
                <CheckCircle2 className="mx-auto h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="mt-1 text-sm font-medium text-green-700 dark:text-green-400">
                  All subjects added!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
