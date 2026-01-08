import { authServerApi, isAuthenticated } from "@/lib/api";
import { PageHeader, EmptyState, GlassCard, Badge } from '@/client/components/ui/premium';
import { BookOpen, FileQuestion, Layers, Plus, Folder, Edit } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/client/components/ui/button';
import { Breadcrumbs } from '@/client/components/ui/breadcrumbs';
import { ChapterAccordion, SubjectCard } from "@/client/components/features/subjects";
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

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <Breadcrumbs items={breadcrumbs} className="mb-4" />
          <PageHeader
            title={subject.name_en}
            description={subject.description_en || undefined}
            action={
              <Link href={`/dashboard/subjects/${id}/edit`}>
                <Button variant="secondary" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Category
                </Button>
              </Link>
            }
          />
        </div>

        {/* Category Header */}
        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
              {subject.icon ? (
                <span className="text-3xl">{subject.icon}</span>
              ) : (
                <Folder className="h-8 w-8" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {subject.name_en}
                </h2>
                <Badge variant="purple" size="md">Category</Badge>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 italic mb-4">
                {subject.name_mr}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Folder className="h-4 w-4" />
                  <span className="font-medium">{childSubjects.length} Subjects</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Add New Subject Button */}
        <div className="flex justify-end">
          <Link href={`/dashboard/subjects/new?parent=${id}`}>
            <Button className="gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white border-0 shadow-lg shadow-brand-blue-600/20">
              <Plus className="h-4 w-4" />
              Add New Subject
            </Button>
          </Link>
        </div>

        {/* Child Subjects Grid */}
        {childSubjects.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {childSubjects.map((child) => (
              <SubjectCard
                key={child.id}
                subject={child}
                chapterCount={chapterCounts[child.id] || 0}
                questionCount={questionCounts[child.id] || 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No Subjects Yet"
            description="This category doesn't have any subjects yet. Add your first subject to get started."
          />
        )}
      </div>
    );
  }

  // It's a subject, show chapters
  const chapters = await getChaptersWithQuestionCounts(id, subject.slug);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
        <PageHeader
          title={subject.name_en}
          description={subject.description_en || undefined}
          action={
            <Link href={`/dashboard/subjects/${id}/edit`}>
              <Button variant="secondary" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Subject
              </Button>
            </Link>
          }
        />
      </div>

      {/* Subject Header */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg">
            {subject.icon ? (
              <span className="text-3xl">{subject.icon}</span>
            ) : (
              <BookOpen className="h-8 w-8" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              {subject.name_en}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic mb-4">
              {subject.name_mr}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Layers className="h-4 w-4" />
                <span className="font-medium">{stats.totalChapters} Chapters</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <FileQuestion className="h-4 w-4" />
                <span className="font-medium">{stats.totalQuestions} Questions</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/dashboard/questions/${subject.slug.replace(/_/g, "-")}`}>
          <Button className="gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white border-0 shadow-lg shadow-brand-blue-600/20">
            <FileQuestion className="h-4 w-4" />
            View All Questions
          </Button>
        </Link>
        <Link href={`/dashboard/subjects/${id}/chapters/new`}>
          <Button variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Chapter
          </Button>
        </Link>
      </div>

      {/* Chapters Section */}
      {chapters.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Chapters</h3>
          <ChapterAccordion chapters={chapters} subjectId={id} subjectSlug={subject.slug} />
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Chapters Yet"
          description="This subject doesn't have any chapters yet. Add your first chapter to get started."
        />
      )}
    </div>
  );
}
