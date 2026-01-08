import { getSubjects } from "@/client/services";
import { getQuestionStats } from "@/client/services";
import { PageHeader, GlassCard, Badge } from '@/client/components/ui/premium';
import { FileQuestion, Plus, TrendingUp, BookOpen, ArrowRight, Upload, GraduationCap, Monitor } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/client/components/ui/button';

export const metadata: Metadata = {
  title: "Question Bank - The Stack Hub Admin",
  description: "Centralized repository for all exam questions",
};

// Subject with question stats interface
interface SubjectWithQuestionStats {
  id: string;
  slug: string;
  name_en: string;
  name_mr?: string | null;
  is_category?: boolean;
  is_active?: boolean;
  stats: {
    total: number;
    active: number;
    easy: number;
    medium: number;
    hard: number;
  };
}

const subjectConfig: Record<string, { icon: React.ElementType; slug: string; color: string }> = {
  scholarship: {
    icon: GraduationCap,
    slug: "scholarship",
    color: "amber",
  },
  english: {
    icon: BookOpen,
    slug: "english",
    color: "blue",
  },
  information_technology: {
    icon: Monitor,
    slug: "information-technology",
    color: "purple",
  },
};

function getSubjectSlug(slug: string): string {
  return slug === "information_technology" ? "information-technology" : slug;
}

export default async function QuestionsHubPage() {
  // Fetch subjects and their stats in parallel
  const subjects = await getSubjects();
  
  // Fetch stats for each subject
  const subjectsWithStats: SubjectWithQuestionStats[] = await Promise.all(
    subjects.map(async (subject) => {
      const stats = await getQuestionStats(subject.slug);
      const byDifficulty = stats?.byDifficulty || {};
      return {
        id: subject.id,
        slug: subject.slug,
        name_en: subject.name_en,
        name_mr: subject.name_mr,
        is_category: (subject as { is_category?: boolean }).is_category,
        is_active: (subject as { is_active?: boolean }).is_active ?? true,
        stats: {
          total: stats?.total || 0,
          active: stats?.total || 0, // API doesn't distinguish active/inactive questions in stats
          easy: byDifficulty.easy || 0,
          medium: byDifficulty.medium || 0,
          hard: byDifficulty.hard || 0,
        },
      };
    })
  );

  const totalQuestions = subjectsWithStats.reduce((sum, s) => sum + s.stats.total, 0);
  const totalActive = subjectsWithStats.reduce((sum, s) => sum + s.stats.active, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Question Bank"
        description="Centralized repository for all exam questions across subjects"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Questions" }]}
        action={
          <Link href="/dashboard/questions/import">
            <Button className="gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white border-0 shadow-lg shadow-brand-blue-600/20">
              <Upload className="h-4 w-4" />
              Import Questions
            </Button>
          </Link>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileQuestion className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalQuestions.toLocaleString()}</p>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Questions</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-green-500">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalActive.toLocaleString()}</p>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Questions</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-purple-500">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{subjects.length}</p>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Question Categories</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {subjectsWithStats.map((subject) => {
          const config = subjectConfig[subject.slug] || subjectConfig.scholarship;
          const total = subject.stats.total || 1;
          const easyPercent = Math.round((subject.stats.easy / total) * 100);
          const mediumPercent = Math.round((subject.stats.medium / total) * 100);
          const hardPercent = Math.round((subject.stats.hard / total) * 100);
          const isCategory = subject.is_category === true;
          const subjectSlug = getSubjectSlug(subject.slug);

          return (
            <GlassCard key={subject.id} className="group flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:border-brand-blue-200 dark:hover:border-brand-blue-900/50">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-inner">
                    <config.icon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors truncate">
                      {subject.name_en}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      {subject.name_mr}
                    </p>
                  </div>
                </div>
                <Badge variant={subject.is_active ? "success" : "default"} size="sm" dot>
                  {subject.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Stats Section */}
              <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-5 mb-5 border border-neutral-200 dark:border-neutral-800">
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Total Questions
                    </span>
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {subject.stats.total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {subject.stats.active} active
                  </p>
                </div>

                {/* Difficulty Split Progress Bar */}
                {subject.stats.total > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">Difficulty Distribution</span>
                    </div>
                    <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
                      {easyPercent > 0 && (
                        <div
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${easyPercent}%` }}
                          title={`Easy: ${subject.stats.easy} (${easyPercent}%)`}
                        />
                      )}
                      {mediumPercent > 0 && (
                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{ width: `${mediumPercent}%` }}
                          title={`Medium: ${subject.stats.medium} (${mediumPercent}%)`}
                        />
                      )}
                      {hardPercent > 0 && (
                        <div
                          className="bg-red-500 h-full transition-all duration-300"
                          style={{ width: `${hardPercent}%` }}
                          title={`Hard: ${subject.stats.hard} (${hardPercent}%)`}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        {subject.stats.easy} Easy
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        {subject.stats.medium} Medium
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        {subject.stats.hard} Hard
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                  href={`/dashboard/questions/${subjectSlug}`}
                  className="flex-1 rounded-xl bg-linear-to-r from-primary-500 to-purple-600 text-white py-2.5 px-4 text-sm font-semibold shadow-md shadow-primary-500/20 hover:from-primary-600 hover:to-purple-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 flex items-center justify-center gap-2 group/button"
                >
                  View Questions
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
                </Link>
                {!isCategory && (
                  <Link
                    href={`/dashboard/questions/${subjectSlug}/new`}
                    className="h-10 w-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 flex items-center justify-center transition-all hover:shadow-md"
                    title="Add Question"
                  >
                    <Plus className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
