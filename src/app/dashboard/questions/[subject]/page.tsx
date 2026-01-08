import { isAuthenticated } from "@/lib/api";
import { getSubjectWithParent as getSubjectWithParentService, getChildSubjects, type ChildSubject } from "@/client/services/subjects.service";
import { getQuestionStats, getChaptersWithCounts, type QuestionStats } from "@/client/services";
import type { Chapter } from "@/client/services/chapters.service";
import { PageHeader, GlassCard, Badge, EmptyState } from '@/client/components/ui/premium';
import { BookOpen, Book, FileQuestion, ChevronRight, Plus, Layers, AlertCircle, Folder, GraduationCap, Code } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { subjectDisplayMap } from "@/client/types/questions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject } = await params;
  const displayName = subjectDisplayMap[subject] || subject;
  return {
    title: `${displayName} - The Stack Hub Admin`,
  };
}

/**
 * Wrapper for getSubjectWithParent that handles slug normalization
 * and adds questionTableSlug property
 */
async function getSubjectWithParent(slug: string) {
  // Try with underscore slug first (URL uses dashes, DB uses underscores)
  const dbSlug = slug.replace(/-/g, "_");
  let subject = await getSubjectWithParentService(dbSlug);

  // Fallback: try original slug if underscore version failed
  if (!subject && dbSlug !== slug) {
    subject = await getSubjectWithParentService(slug);
  }

  if (!subject) return null;

  // Determine questionTableSlug - use parent's slug if subject has a parent
  let questionTableSlug = subject.slug;
  if (subject.parent_id && subject.parent) {
    questionTableSlug = subject.parent.slug;
  }

  // Normalize to use dashes for URL consistency
  return {
    ...subject,
    questionTableSlug: questionTableSlug.replace(/_/g, "-"),
  };
}

// getQuestionStats is now imported from @/client/services

// getChildSubjects is now imported from @/client/services/subjects.service

async function getCategoryAggregatedStats(categoryId: string, _categorySlug: string) {
  if (!(await isAuthenticated())) {
    return {
      total: 0,
      withChapter: 0,
      withoutChapter: 0,
      byDifficulty: {},
      byType: {},
      totalChapters: 0,
      childSubjects: [],
    };
  }

  // Use imported getChildSubjects from service
  const childSubjects = await getChildSubjects(categoryId);

  if (childSubjects.length === 0) {
    return {
      total: 0,
      withChapter: 0,
      withoutChapter: 0,
      byDifficulty: {},
      byType: {},
      totalChapters: 0,
      childSubjects: [],
    };
  }

  // Get stats for each child subject using imported services
  const childSubjectsWithStats = await Promise.all(
    childSubjects.map(async (child) => {
      const childSlug = child.slug.replace(/_/g, "-");
      // Use imported getQuestionStats
      const childStats = await getQuestionStats(childSlug);

      // Use imported getChaptersWithCounts to get chapter count
      const chapters = await getChaptersWithCounts(childSlug);

      return {
        ...child,
        stats: childStats,
        chapterCount: chapters?.length || 0,
      };
    })
  );

  // Aggregate all stats
  let total = 0;
  let withChapter = 0;
  let withoutChapter = 0;
  const byDifficulty: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let totalChapters = 0;

  childSubjectsWithStats.forEach((child: ChildSubject & { stats: QuestionStats; chapterCount: number }) => {
    total += child.stats.total;
    withChapter += child.stats.withChapter;
    withoutChapter += child.stats.withoutChapter;
    totalChapters += child.chapterCount || 0;

    Object.entries(child.stats.byDifficulty).forEach(([key, value]) => {
      byDifficulty[key] = (byDifficulty[key] || 0) + (value as number);
    });

    Object.entries(child.stats.byType).forEach(([key, value]) => {
      byType[key] = (byType[key] || 0) + (value as number);
    });
  });

  return {
    total,
    withChapter,
    withoutChapter,
    byDifficulty,
    byType,
    totalChapters,
    childSubjects: childSubjectsWithStats,
  };
}

// getChaptersWithCounts is now imported from @/client/services

const subjectConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; gradient: string }> = {
  scholarship: {
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    icon: <GraduationCap className="h-5 w-5" />,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  english: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: <BookOpen className="h-5 w-5" />,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  "information-technology": {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: <Code className="h-5 w-5" />,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
};

export default async function SubjectQuestionsPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;

  // Get subject with parent information
  const subjectData = await getSubjectWithParent(subject);
  if (!subjectData) {
    console.error(`[Questions Page] Subject not found: ${subject}`);
    notFound();
  }

  // Check if this is a category
  const isCategory = subjectData.is_category === true;

  // If it's a category, get aggregated stats from child subjects
  if (isCategory) {
    const categoryStats = await getCategoryAggregatedStats(subjectData.id, subject);
    const config = subjectConfig[subjectData.slug.replace(/_/g, "-")] || subjectConfig.scholarship;

    return (
      <div className="space-y-8">
        <PageHeader
          title={subjectData.name_en}
          description={subjectData.name_mr || undefined}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Questions", href: "/dashboard/questions" },
            { label: subjectData.name_en },
          ]}
        />

        {/* Category Badge */}
        <GlassCard className="border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
              <Folder className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Category</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Questions are managed within individual subjects in this category
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Aggregated Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlassCard className={`bg-linear-to-br ${config.gradient}`} hover>
            <div className="flex items-center gap-3">
              <div className={`rounded-xl ${config.bgColor} p-3`}>
                <FileQuestion className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{categoryStats.total}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Questions</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4" hover>
            <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{categoryStats.withChapter}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">With Chapter</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4" hover>
            <div className="rounded-xl bg-brand-blue-100 p-3 dark:bg-brand-blue-900/30">
              <AlertCircle className="h-6 w-6 text-brand-blue-600 dark:text-brand-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{categoryStats.withoutChapter}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Uncategorized</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4" hover>
            <div className={`rounded-xl ${config.bgColor} p-3`}>
              <Layers className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{categoryStats.totalChapters}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Chapters</p>
            </div>
          </GlassCard>
        </div>

        {/* Aggregated Stats Breakdown */}
        <GlassCard>
          <div className="flex items-center justify-between border-b border-neutral-200/50 pb-4 dark:border-neutral-700/50">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Category Overview</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Aggregated statistics from all subjects in this category</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* BY DIFFICULTY */}
            <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-neutral-50/50 to-white p-4 dark:border-neutral-700/50 dark:from-neutral-800/50 dark:to-neutral-900/50">
              <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-green-500 via-yellow-500 to-red-500" />
                By Difficulty
              </h4>
              <div className="space-y-3">
                {[
                  { key: "easy", label: "Easy", color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
                  { key: "medium", label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
                  { key: "hard", label: "Hard", color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
                ].map((diff) => {
                  const count = categoryStats.byDifficulty[diff.key] || 0;
                  const percent = categoryStats.total > 0 ? Math.round((count / categoryStats.total) * 100) : 0;
                  return (
                    <div key={diff.key} className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${diff.color}`} />
                      <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{diff.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <div
                            className={`h-full ${diff.color} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className={`min-w-7 text-right text-sm font-bold ${diff.textColor}`}>{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BY TYPE */}
            <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-neutral-50/50 to-white p-4 dark:border-neutral-700/50 dark:from-neutral-800/50 dark:to-neutral-900/50">
              <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                By Type
              </h4>
              <div className="space-y-2.5">
                {Object.entries(categoryStats.byType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([type, count]) => {
                    const typeIcons: Record<string, { icon: string; color: string }> = {
                      true_false: { icon: "✓✗", color: "text-emerald-500" },
                      mcq_single: { icon: "①", color: "text-blue-500" },
                      mcq_two: { icon: "②", color: "text-indigo-500" },
                      mcq_three: { icon: "③", color: "text-violet-500" },
                      fill_blank: { icon: "✎", color: "text-amber-500" },
                      match: { icon: "⇄", color: "text-pink-500" },
                      short_answer: { icon: "✍", color: "text-teal-500" },
                      long_answer: { icon: "✎", color: "text-yellow-500" },
                      programming: { icon: "⟨/⟩", color: "text-brand-blue-500" },
                    };
                    const typeConfig = typeIcons[type] || { icon: "?", color: "text-neutral-500" };
                    const label = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

                    return (
                      <div key={type} className="flex items-center gap-2.5">
                        <span className={`text-base ${typeConfig.color}`}>{typeConfig.icon}</span>
                        <span className="flex-1 truncate text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
                        <span className="min-w-7 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">{count}</span>
                      </div>
                    );
                  })}
                {Object.keys(categoryStats.byType).length === 0 && (
                  <p className="text-sm text-neutral-400 italic">No questions yet</p>
                )}
              </div>
            </div>

            {/* SUBJECTS COUNT */}
            <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-neutral-50/50 to-white p-4 dark:border-neutral-700/50 dark:from-neutral-800/50 dark:to-neutral-900/50">
              <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Subjects
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span className="flex-1 text-sm text-neutral-600 dark:text-neutral-400">Total Subjects</span>
                  <span className="min-w-7 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {categoryStats.childSubjects.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Child Subjects List */}
        <GlassCard>
          <div className="flex items-center justify-between border-b border-neutral-200/50 pb-4 dark:border-neutral-700/50">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Subjects in Category</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage questions within individual subjects</p>
            </div>
          </div>

          {categoryStats.childSubjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects yet"
              description="This category doesn't have any subjects yet. Add subjects to start managing questions."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {categoryStats.childSubjects.map((child: ChildSubject & { stats: QuestionStats; chapterCount: number; icon?: React.ReactNode }) => {
                const childSlug = child.slug.replace(/_/g, "-");
                return (
                  <Link
                    key={child.id}
                    href={`/dashboard/questions/${childSlug}`}
                    className="group flex items-center gap-4 rounded-xl bg-neutral-50/50 p-4 transition-all hover:bg-neutral-100/50 hover:shadow-md dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bgColor} text-xl font-bold ${config.color} transition-transform group-hover:scale-110`}>
                      {child.icon || <Book className="h-5 w-5" />}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {child.name_en}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {child.name_mr}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {child.stats.total}
                        </p>
                        <p className="text-xs text-neutral-500">questions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {child.chapterCount}
                        </p>
                        <p className="text-xs text-neutral-500">chapters</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    );
  }

  // Regular subject (not a category) - existing logic
  // Use the parent's slug for the question table if it's a child subject
  const questionTableSlug = subjectData.questionTableSlug || subject;
  const [stats, chapters] = await Promise.all([
    getQuestionStats(questionTableSlug),
    getChaptersWithCounts(questionTableSlug),
  ]);

  const config = subjectConfig[questionTableSlug] || subjectConfig.scholarship;

  return (
    <div className="space-y-8">
      <PageHeader
        title={subjectData.name_en}
        description={subjectData.name_mr || undefined}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Questions", href: "/dashboard/questions" },
          { label: subjectData.name_en },
        ]}
        action={
          <Link
            href={`/dashboard/questions/${subject}/new`}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-primary-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-primary-500/40 hover:from-primary-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Link>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className={`bg-linear-to-br ${config.gradient}`} hover>
          <Link href={`/dashboard/questions/${subject}/all`} className="block">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl ${config.bgColor} p-3`}>
                <FileQuestion className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Questions</p>
              </div>
            </div>
          </Link>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hover>
          <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
            <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.withChapter}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">With Chapter</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hover>
          <div className="rounded-xl bg-primary-100 p-3 dark:bg-primary-900/30">
            <AlertCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.withoutChapter}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Uncategorized</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hover>
          <div className={`rounded-xl ${config.bgColor} p-3`}>
            <Layers className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{chapters.length}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Chapters</p>
          </div>
        </GlassCard>
      </div>

      {/* All Questions Section */}
      <GlassCard>
        <div className="flex items-center justify-between border-b border-neutral-200/50 pb-4 dark:border-neutral-700/50">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">All Questions</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">View all questions in this subject</p>
          </div>
          <Link
            href={`/dashboard/questions/${subject}/all`}
            className="flex items-center gap-2 rounded-lg bg-linear-to-r from-primary-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/20 transition-all hover:shadow-lg hover:from-primary-600 hover:to-purple-700"
          >
            <FileQuestion className="h-4 w-4" />
            View All ({stats.total})
          </Link>
        </div>

        {/* Premium Stats Breakdown - Three Column */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* BY DIFFICULTY */}
          <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-neutral-50/50 to-white p-4 dark:border-neutral-700/50 dark:from-neutral-800/50 dark:to-neutral-900/50">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-green-500 via-yellow-500 to-red-500" />
              By Difficulty
            </h4>
            <div className="space-y-3">
              {[
                { key: "easy", label: "Easy", color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
                { key: "medium", label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
                { key: "hard", label: "Hard", color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
              ].map((diff) => {
                const count = stats.byDifficulty[diff.key] || 0;
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={diff.key} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${diff.color}`} />
                    <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{diff.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <div
                          className={`h-full ${diff.color} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className={`min-w-7 text-right text-sm font-bold ${diff.textColor}`}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BY TYPE */}
          <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-neutral-50/50 to-white p-4 dark:border-neutral-700/50 dark:from-neutral-800/50 dark:to-neutral-900/50">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              By Type
            </h4>
            <div className="space-y-2.5">
              {(Object.entries(stats.byType) as [string, number][])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([type, count]) => {
                  const typeIcons: Record<string, { icon: string; color: string }> = {
                    true_false: { icon: "✓✗", color: "text-emerald-500" },
                    mcq_single: { icon: "①", color: "text-blue-500" },
                    mcq_two: { icon: "②", color: "text-indigo-500" },
                    mcq_three: { icon: "③", color: "text-violet-500" },
                    fill_blank: { icon: "✎", color: "text-amber-500" },
                    match: { icon: "⇄", color: "text-pink-500" },
                    short_answer: { icon: "✍", color: "text-teal-500" },
                    long_answer: { icon: "✎", color: "text-yellow-500" },
                    programming: { icon: "⟨/⟩", color: "text-brand-blue-500" },
                  };
                  const typeConfig = typeIcons[type] || { icon: "?", color: "text-neutral-500" };
                  const label = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

                  return (
                    <div key={type} className="flex items-center gap-2.5">
                      <span className={`text-base ${typeConfig.color}`}>{typeConfig.icon}</span>
                      <span className="flex-1 truncate text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
                      <span className="min-w-7 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">{count}</span>
                    </div>
                  );
                })}
              {Object.keys(stats.byType).length === 0 && (
                <p className="text-sm text-neutral-400 italic">No questions yet</p>
              )}
            </div>
          </div>

          {/* BY CHAPTER */}
          <div className="rounded-xl border border-neutral-100 bg-linear-to-br from-neutral-50/50 to-white p-4 dark:border-neutral-700/50 dark:from-neutral-800/50 dark:to-neutral-900/50">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              By Chapter
            </h4>
            <div className="space-y-2.5">
              {chapters.slice(0, 4).map((chapter: Chapter & { questionCount?: number }) => (
                <div key={chapter.id} className="flex items-center gap-2.5">
                  <span className="text-neutral-400">{chapters.indexOf(chapter) + 1}.</span>
                  <span className="flex-1 truncate text-sm text-neutral-600 dark:text-neutral-400">{chapter.name_en}</span>
                  <span className="min-w-7 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">{chapter.questionCount}</span>
                </div>
              ))}
              {stats.withoutChapter > 0 && (
                <div className="flex items-center gap-2.5 rounded-lg bg-primary-50/50 px-2 py-1.5 dark:bg-primary-900/20">
                  <AlertCircle className="h-3.5 w-3.5 text-primary-500" />
                  <span className="flex-1 text-sm text-primary-600 dark:text-primary-400">Uncategorized</span>
                  <span className="min-w-7 text-right text-sm font-semibold text-primary-600 dark:text-primary-400">{stats.withoutChapter}</span>
                </div>
              )}
              {chapters.length === 0 && stats.withoutChapter === 0 && (
                <p className="text-sm text-neutral-400 italic">No chapters yet</p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Chapters Section */}
      <GlassCard>
        <div className="flex items-center justify-between border-b border-neutral-200/50 pb-4 dark:border-neutral-700/50">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Chapter-wise Questions</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Browse questions by chapter</p>
          </div>
        </div>

        {chapters.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No chapters yet"
            description="Chapters are created via database seeding"
          />
        ) : (
          <div className="mt-4 space-y-2">
            {chapters.map((chapter: Chapter & { questionCount?: number }, index: number) => (
              <Link
                key={chapter.id}
                href={`/dashboard/questions/${subject}/chapters/${chapter.id}`}
                className="group flex items-center gap-4 rounded-xl bg-neutral-50/50 p-4 transition-all hover:bg-neutral-100/50 hover:shadow-md dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50"
              >
                {/* Chapter Number */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bgColor} text-xl font-bold ${config.color} transition-transform group-hover:scale-110`}
                >
                  {index + 1}
                </div>

                {/* Chapter Info */}
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {chapter.name_en}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {chapter.name_mr}
                  </p>
                </div>

                {/* Question Count & Status */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-neutral-900 dark:text-white">
                      {chapter.questionCount}
                    </p>
                    <p className="text-xs text-neutral-500">questions</p>
                  </div>
                  <Badge variant={chapter.is_active ? "success" : "default"} size="sm" dot>
                    {chapter.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}

            {/* Uncategorized Questions Link */}
            {stats.withoutChapter > 0 && (
              <Link
                href={`/dashboard/questions/${subject}/all?chapter=uncategorized`}
                className="group flex items-center gap-4 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 p-4 transition-all hover:bg-primary-100/50 dark:border-primary-800 dark:bg-primary-900/10 dark:hover:bg-primary-900/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-xl dark:bg-primary-900/30">
                  <AlertCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary-700 dark:text-primary-400">
                    Uncategorized Questions
                  </p>
                  <p className="text-sm text-primary-600/70 dark:text-primary-500/70">
                    Questions not assigned to any chapter
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-700 dark:text-primary-400">
                      {stats.withoutChapter}
                    </p>
                    <p className="text-xs text-primary-600/70">questions</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-primary-400 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
