"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubjects, Subject } from "@/client/hooks/use-subjects";
import { EmptyState } from "@/client/components/ui/premium";
import { Loader } from "@/client/components/ui/loader";
import {
  BookOpen,
  ArrowRight,
  AlertCircle,
  Laptop,
  Trophy,
  Sparkles,
  Lightbulb,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Calculator,
  Brain,
  Globe,
  Languages,
} from "lucide-react";
import { clsx } from "clsx";

// Subject/child configuration with icons and colors
const subjectConfig: Record<string, {
  icon: React.ReactNode;
  iconBg: string;
  hoverBg: string;
  accentColor: string;
  badge?: string;
}> = {
  scholarship: {
    icon: <Trophy className="h-6 w-6" />,
    iconBg: "bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40",
    hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
    accentColor: "text-amber-600 dark:text-amber-400",
    badge: "Most Popular",
  },
  "scholarship-marathi": {
    icon: <Languages className="h-5 w-5" />,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
    accentColor: "text-amber-600 dark:text-amber-400",
  },
  "scholarship-mathematics": {
    icon: <Calculator className="h-5 w-5" />,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
    accentColor: "text-amber-600 dark:text-amber-400",
  },
  "scholarship-intelligence-test": {
    icon: <Brain className="h-5 w-5" />,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
    accentColor: "text-amber-600 dark:text-amber-400",
  },
  "scholarship-general-knowledge": {
    icon: <Globe className="h-5 w-5" />,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
    accentColor: "text-amber-600 dark:text-amber-400",
  },
  "information-technology": {
    icon: <Laptop className="h-6 w-6" />,
    iconBg: "bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40",
    hoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
    accentColor: "text-purple-600 dark:text-purple-400",
  },
  information_technology: {
    icon: <Laptop className="h-6 w-6" />,
    iconBg: "bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40",
    hoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
    accentColor: "text-purple-600 dark:text-purple-400",
  },
};

const defaultConfig = {
  icon: <BookOpen className="h-5 w-5" />,
  iconBg: "bg-neutral-100 dark:bg-neutral-800",
  hoverBg: "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
  accentColor: "text-neutral-600 dark:text-neutral-400",
};

// Get config for a subject, checking both hyphen and underscore versions
function getSubjectConfig(slug: string) {
  const hyphenSlug = slug.replace(/_/g, "-");
  return subjectConfig[slug] || subjectConfig[hyphenSlug] || defaultConfig;
}

export function CreateQuestionClient() {
  const router = useRouter();
  const { data: subjects, loading, error } = useSubjects();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["scholarship"]));

  // Get relevant subjects - categories with sub-subjects and standalone subjects
  const questionSubjects = subjects?.filter(s =>
    ["scholarship", "information-technology", "information_technology"].includes(s.slug)
  ) || [];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleSubjectSelect = (slug: string) => {
    // Convert underscores to hyphens for URL
    const urlSlug = slug.replace(/_/g, "-");
    router.push(`/dashboard/questions/${urlSlug}/new`);
  };

  // Render a subject card (either category header or clickable subject)
  const renderSubjectCard = (subject: Subject, isChild = false) => {
    const config = getSubjectConfig(subject.slug);
    const isCategory = subject.is_category;
    const isExpanded = expandedCategories.has(subject.id);
    const hasChildren = subject.sub_subjects && subject.sub_subjects.length > 0;

    if (isCategory && hasChildren) {
      // Render expandable category
      return (
        <div key={subject.id} className="space-y-2">
          <button
            onClick={() => toggleCategory(subject.id)}
            className={clsx(
              "w-full flex items-center gap-4 p-4 rounded-2xl border-2",
              "bg-white dark:bg-neutral-900",
              "border-neutral-200/80 dark:border-neutral-700/80",
              "transition-all duration-200 group text-left",
              "hover:border-neutral-300 dark:hover:border-neutral-600",
              config.hoverBg
            )}
          >
            {/* Category Icon */}
            <div className={clsx("shrink-0 p-3 rounded-xl", config.iconBg, config.accentColor)}>
              {config.icon}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {subject.name_en}
                </h3>
                {config.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    {config.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {subject.sub_subjects?.length} subjects • Click to expand
              </p>
            </div>

            {/* Expand/Collapse Icon */}
            <div className="shrink-0 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-neutral-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              )}
            </div>
          </button>

          {/* Child Subjects */}
          {isExpanded && subject.sub_subjects && (
            <div className="ml-6 space-y-2 border-l-2 border-neutral-200 dark:border-neutral-700 pl-4">
              {subject.sub_subjects.map((child) => renderSubjectCard(child, true))}
            </div>
          )}
        </div>
      );
    }

    // Render clickable subject (non-category or child subject)
    return (
      <button
        key={subject.id}
        onClick={() => handleSubjectSelect(subject.slug)}
        className={clsx(
          "w-full flex items-center gap-4 rounded-xl border transition-all duration-200 group text-left",
          isChild
            ? "p-3 border-neutral-200 dark:border-neutral-700"
            : "p-4 border-2 border-neutral-200/80 dark:border-neutral-700/80",
          "bg-white dark:bg-neutral-900",
          "hover:border-neutral-300 dark:hover:border-neutral-600",
          "hover:shadow-md hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50",
          "hover:-translate-y-0.5",
          config.hoverBg
        )}
      >
        {/* Icon */}
        <div className={clsx(
          "shrink-0 rounded-xl transition-transform duration-200 group-hover:scale-105",
          isChild ? "p-2.5" : "p-3",
          config.iconBg,
          config.accentColor
        )}>
          {config.icon}
        </div>

        {/* Subject Info */}
        <div className="flex-1 min-w-0">
          <h3 className={clsx(
            "font-semibold text-neutral-900 dark:text-white",
            isChild ? "text-base" : "text-lg"
          )}>
            {subject.name_en}
          </h3>
          {subject.description_en && !isChild && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
              {subject.description_en}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="shrink-0 p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-all duration-200 group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/questions"
            className="mt-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Create New Question
            </h1>
          </div>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Failed to load subjects"
          description="We couldn't load the available subjects. Please try again."
          action={
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/questions"
          className="mt-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Create New Question
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Choose a subject to add your question to the question bank
          </p>
        </div>
      </div>

      {questionSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects available"
          description="There are no subjects configured for question creation."
        />
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* Subject Cards */}
          <div className="space-y-3">
            {questionSubjects.map((subject) => renderSubjectCard(subject))}
          </div>

          {/* Tips Section */}
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                  Quick Tips
                </h4>
                <ul className="mt-2 space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Use the rich text editor for math formulas and images</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Add explanations to help students learn from mistakes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Tag questions with chapters for better organization</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
