import { authServerApi, isAuthenticated } from "@/lib/api";
import { PageHeader, EmptyState, GlassCard, Badge } from '@/client/components/ui/premium';
import { BookOpen, FileQuestion, Layers, Plus, Folder, Edit2, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/client/components/ui/button';
import { notFound } from "next/navigation";
import {
  getChildSubjects as fetchChildSubjects,
  type ChildSubject,
} from "@/client/services";
import { getChaptersWithCounts } from "@/client/services";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!(await isAuthenticated())) {
    return {
      title: "Subject - The Stack Hub Admin",
    };
  }

  const { data: subject } = await authServerApi.get<{ name_en: string }>(
    `/api/v1/subjects/${id}`
  );

  return {
    title: subject ? `${subject.name_en} - Subjects` : "Subject - The Stack Hub Admin",
    description: `Manage ${subject?.name_en || "subject"} details, chapters, and questions`,
  };
}

interface Subject {
  id: string;
  name_en: string;
  name_mr: string;
  slug: string;
  description_en: string | null;
  description_mr: string | null;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  is_category: boolean;
  parent_subject_id: string | null;
}

interface Chapter {
  id: string;
  name_en: string;
  name_mr: string;
  subject_id: string;
  order_index: number;
  question_count?: number;
}

async function getSubject(id: string): Promise<Subject | null> {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<Subject>(`/api/v1/subjects/${id}`);

  if (error || !data) {
    console.error("Failed to fetch subject:", error);
    return null;
  }

  return data;
}

async function getBreadcrumbs(subject: Subject): Promise<Array<{ label: string; href?: string }>> {
  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Subjects", href: "/dashboard/subjects" },
  ];

  // If subject has a parent, build hierarchy
  if (subject.parent_subject_id) {
    if (await isAuthenticated()) {
      const { data: parent } = await authServerApi.get<{ id: string; name_en: string; parent_subject_id: string | null }>(
        `/api/v1/subjects/${subject.parent_subject_id}`
      );

      if (parent) {
        breadcrumbs.push({ label: parent.name_en, href: `/dashboard/subjects/${parent.id}` });
      }
    }
  }

  breadcrumbs.push({ label: subject.name_en });
  return breadcrumbs;
}

async function getChildSubjects(categoryId: string): Promise<ChildSubject[]> {
  return fetchChildSubjects(categoryId);
}

async function getChaptersWithQuestionCounts(subjectId: string, subjectSlug: string): Promise<Chapter[]> {
  // Normalize slug for API
  const normalizedSlug = subjectSlug.replace(/_/g, "-");
  const chapters = await getChaptersWithCounts(normalizedSlug);

  return chapters.map((ch) => ({
    id: ch.id,
    name_en: ch.name_en,
    name_mr: ch.name_mr || "",
    subject_id: subjectId,
    order_index: ch.order_index,
    question_count: ch.question_count,
  }));
}

async function getSubjectStats(subjectId: string, subjectSlug: string) {
  const chapters = await getChaptersWithQuestionCounts(subjectId, subjectSlug);
  const totalChapters = chapters.length;
  const totalQuestions = chapters.reduce((sum, ch) => sum + (ch.question_count || 0), 0);

  return { totalChapters, totalQuestions };
}

async function getChildSubjectStats(childSubjects: ChildSubject[]) {
  const chapterCounts: Record<string, number> = {};
  const questionCounts: Record<string, number> = {};

  await Promise.all(
    childSubjects.map(async (child) => {
      const normalizedSlug = child.slug.replace(/_/g, "-");

      try {
        // Use service to get chapters with counts
        const chapters = await getChaptersWithCounts(normalizedSlug);
        chapterCounts[child.id] = chapters.length;
        questionCounts[child.id] = chapters.reduce(
          (sum, ch) => sum + (ch.question_count || 0),
          0
        );
      } catch (error) {
        console.error(`Failed to get stats for child subject ${child.id}:`, error);
        chapterCounts[child.id] = 0;
        questionCounts[child.id] = 0;
      }
    })
  );

  return { chapterCounts, questionCounts };
}

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = await getSubject(id);

  if (!subject) {
    notFound();
  }

  const breadcrumbs = await getBreadcrumbs(subject);
  const stats = await getSubjectStats(id, subject.slug);

  // If it's a category, show child subjects
  if (subject.is_category) {
    const childSubjects = await getChildSubjects(id);
    const { chapterCounts, questionCounts } = await getChildSubjectStats(childSubjects);

    const categoryStats = [
      {
        label: "Subjects",
        value: childSubjects.length,
        icon: BookOpen,
        color: "primary",
      },
      {
        label: "Total Chapters",
        value: Object.values(chapterCounts).reduce((sum, count) => sum + count, 0),
        icon: Layers,
        color: "insight",
      },
      {
        label: "Total Questions",
        value: Object.values(questionCounts).reduce((sum, count) => sum + count, 0),
        icon: FileQuestion,
        color: "success",
      },
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          title={subject.name_en}
          description={subject.description_en || `Manage subjects within ${subject.name_en} category`}
          breadcrumbs={breadcrumbs}
          action={
            <div className="flex items-center gap-3">
              <Badge variant="purple" size="md" dot>
                Category
              </Badge>
              <Link href={`/dashboard/subjects/${id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Category
                </Button>
              </Link>
            </div>
          }
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryStats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses: Record<string, string> = {
              primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
              success: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
              warning: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
              insight: "bg-insight-100 text-insight-600 dark:bg-insight-900/30 dark:text-insight-400",
            };

            return (
              <GlassCard key={index} className="flex items-center gap-4 p-5">
                <div className={`rounded-xl p-3 ${colorClasses[stat.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                </div>
              </GlassCard>
            );
          })}

          {/* Add Subject Action Card */}
          <Link href={`/dashboard/subjects/new?parent=${id}`}>
            <GlassCard className="group flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full border-transparent hover:border-success-200 dark:hover:border-success-800">
              <div className="rounded-xl p-3 bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-neutral-900 dark:text-white">Add Subject</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Create new subject</p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </GlassCard>
          </Link>
        </div>

        {/* Category Info Card */}
        <GlassCard>
          <div className="flex items-start gap-4 p-2">
            <div className="h-14 w-14 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg shrink-0">
              {subject.icon ? (
                <span className="text-2xl">{subject.icon}</span>
              ) : (
                <Folder className="h-7 w-7" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                {subject.name_en}
              </h2>
              {subject.name_mr && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  {subject.name_mr}
                </p>
              )}
              {subject.description_en && (
                <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                  {subject.description_en}
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Child Subjects Section */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-500" />
              Subjects
            </h2>
            <Link
              href={`/dashboard/subjects/new?parent=${id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1 hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </Link>
          </div>

          {childSubjects.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {childSubjects.map((child) => (
                <Link
                  key={child.id}
                  href={`/dashboard/subjects/${child.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-linear-to-br from-insight-500 to-insight-600 text-white flex items-center justify-center shadow">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{child.name_en}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {chapterCounts[child.id] || 0} chapters · {questionCounts[child.id] || 0} questions
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No Subjects Yet"
              description="This category doesn't have any subjects yet. Add your first subject to get started."
              size="sm"
            />
          )}
        </GlassCard>
      </div>
    );
  }

  // It's a subject, show chapters
  const chapters = await getChaptersWithQuestionCounts(id, subject.slug);

  // Stats for this subject
  const subjectStats = [
    {
      label: "Chapters",
      value: stats.totalChapters,
      icon: Layers,
      color: "primary",
    },
    {
      label: "Questions",
      value: stats.totalQuestions,
      icon: FileQuestion,
      color: "insight",
      href: `/dashboard/questions?subject=${subject.slug.replace(/_/g, "-")}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={subject.name_en}
        description={subject.description_en || `Manage chapters and questions for ${subject.name_en}`}
        breadcrumbs={breadcrumbs}
        action={
          <div className="flex items-center gap-3">
            <Badge variant={subject.is_active ? "success" : "warning"} size="md" dot>
              {subject.is_active ? "Active" : "Inactive"}
            </Badge>
            <Link href={`/dashboard/subjects/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit2 className="h-3.5 w-3.5" />
                Edit Subject
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Grid - Clickable Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjectStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses: Record<string, string> = {
            primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
            success: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
            warning: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
            insight: "bg-insight-100 text-insight-600 dark:bg-insight-900/30 dark:text-insight-400",
          };

          const cardContent = (
            <GlassCard className={`group flex items-center gap-4 p-5 transition-all duration-200 h-full ${stat.href ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer border-transparent hover:border-primary-200 dark:hover:border-primary-800' : ''}`}>
              <div className={`rounded-xl p-3 ${colorClasses[stat.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
              </div>
              {stat.href && (
                <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </GlassCard>
          );

          if (stat.href) {
            return (
              <Link key={index} href={stat.href}>
                {cardContent}
              </Link>
            );
          }

          return <div key={index}>{cardContent}</div>;
        })}

        {/* Quick Actions as Cards */}
        <Link href={`/dashboard/questions?subject=${subject.slug.replace(/_/g, "-")}`}>
          <GlassCard className="group flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full border-transparent hover:border-primary-200 dark:hover:border-primary-800">
            <div className="rounded-xl p-3 bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
              <FileQuestion className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-900 dark:text-white">View Questions</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Browse all questions</p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </GlassCard>
        </Link>

        <Link href={`/dashboard/subjects/${id}/chapters/new`}>
          <GlassCard className="group flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full border-transparent hover:border-success-200 dark:hover:border-success-800">
            <div className="rounded-xl p-3 bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
              <Plus className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-900 dark:text-white">Add Chapter</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Create new chapter</p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </GlassCard>
        </Link>
      </div>

      {/* Subject Info Card */}
      <GlassCard>
        <div className="flex items-start gap-4 p-2">
          <div className="h-14 w-14 rounded-xl bg-linear-to-br from-insight-500 to-insight-600 text-white flex items-center justify-center shadow-lg shrink-0">
            {subject.icon ? (
              <span className="text-2xl">{subject.icon}</span>
            ) : (
              <BookOpen className="h-7 w-7" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
              {subject.name_en}
            </h2>
            {subject.name_mr && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                {subject.name_mr}
              </p>
            )}
            {subject.description_en && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                {subject.description_en}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Chapters Section */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary-500" />
            Chapters
          </h2>
          <Link
            href={`/dashboard/subjects/${id}/chapters/new`}
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1 hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Chapter
          </Link>
        </div>

        {chapters.length > 0 ? (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/dashboard/subjects/${id}/chapters/${chapter.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary-100 dark:bg-primary-900/30 p-2">
                    <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{chapter.name_en}</p>
                    {chapter.name_mr && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{chapter.name_mr}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default" size="sm">
                    {chapter.question_count || 0} questions
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No Chapters Yet"
            description="This subject doesn't have any chapters yet. Add your first chapter to get started."
            size="sm"
          />
        )}
      </GlassCard>
    </div>
  );
}
