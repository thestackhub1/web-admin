import { authServerApi, isAuthenticated } from "@/lib/api";
import { BookOpen, FileQuestion, Layers, Plus, Folder, Edit2, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/client/components/ui/button';
import { notFound } from "next/navigation";
import {
  getChildSubjects as fetchChildSubjects,
  type ChildSubject,
} from "@/client/services";
import { getChaptersWithCounts } from "@/client/services";
import { ClassLevelSelectFilter } from "@/client/components/features/subjects/subject-detail-filter";

// Helper to get icon component from string
function getIconComponent(iconName?: string | null, fallback: LucideIcons.LucideIcon = BookOpen) {
  if (!iconName) return fallback;
  const IconComp = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
  return IconComp || fallback;
}

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

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ classLevelId?: string }>;
}

export default async function SubjectDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { classLevelId } = await searchParams;
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

    const _categoryStats = [
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

    const CategoryIcon = getIconComponent(subject.icon, Folder);
    
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Compact Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-insight-500 text-white shadow-md">
              <CategoryIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{subject.name_en}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-insight-100 text-insight-600 dark:bg-insight-900/40 dark:text-insight-400">
                  Category
                </span>
                <div className={subject.is_active ? 'h-2 w-2 rounded-full bg-success-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'h-2 w-2 rounded-full bg-neutral-300'} />
              </div>
              {subject.name_mr && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{subject.name_mr}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClassLevelSelectFilter />
            <Link href={`/dashboard/subjects/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-primary-600 transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-neutral-900 dark:text-white font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Description if exists */}
        {subject.description_en && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">{subject.description_en}</p>
        )}

        {/* Compact Stats Strip */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500 text-white">
              <BookOpen className="h-3 w-3" />
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">{childSubjects.length}</span>
            <span className="text-xs text-neutral-500">Subjects</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-success-500 text-white">
              <Layers className="h-3 w-3" />
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">{Object.values(chapterCounts).reduce((sum, count) => sum + count, 0)}</span>
            <span className="text-xs text-neutral-500">Chapters</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-warning-500 text-white">
              <FileQuestion className="h-3 w-3" />
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">{Object.values(questionCounts).reduce((sum, count) => sum + count, 0)}</span>
            <span className="text-xs text-neutral-500">Questions</span>
          </div>
          <div className="ml-auto">
            <Link href={`/dashboard/subjects/new?parent=${id}`}>
              <Button size="sm" className="gap-1.5 h-8">
                <Plus className="h-3.5 w-3.5" />
                Add Subject
              </Button>
            </Link>
          </div>
        </div>

        {/* Hierarchy Tree View */}
        <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 overflow-hidden">
          {/* Category Header Row */}
          <div className="flex items-center gap-3 px-4 py-3 bg-insight-50/50 dark:bg-insight-900/10 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-insight-500 text-white">
              <Folder className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{subject.name_en}</span>
              <span className="ml-2 text-xs text-neutral-400">(Category)</span>
            </div>
            <span className="text-xs text-neutral-500">{childSubjects.length} subjects</span>
          </div>

          {/* Child Subjects */}
          {childSubjects.length > 0 ? (
            <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
              {childSubjects.map((child, index) => (
                <Link
                  key={child.id}
                  href={`/dashboard/subjects/${child.id}`}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Tree connector */}
                  <div className="flex items-center gap-2 pl-4">
                    <div className="relative">
                      <div className="absolute -left-4 top-1/2 w-3 h-px bg-neutral-200 dark:bg-neutral-700" />
                      {index < childSubjects.length - 1 && (
                        <div className="absolute -left-4 top-1/2 w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                      )}
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Subject Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                        {child.name_en}
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-success-500" />
                    </div>
                    {child.name_mr && (
                      <span className="text-xs text-neutral-500 truncate">{child.name_mr}</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-500 shrink-0">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      <strong className="text-neutral-700 dark:text-neutral-300">{chapterCounts[child.id] || 0}</strong>
                    </span>
                    <span className="text-neutral-200 dark:text-neutral-700">|</span>
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-3 w-3" />
                      <strong className="text-neutral-700 dark:text-neutral-300">{questionCounts[child.id] || 0}</strong>
                    </span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <BookOpen className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No subjects in this category</p>
              <p className="text-xs text-neutral-400 mt-1">Add your first subject to get started</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // It's a subject, show chapters
  const chapters = await getChaptersWithQuestionCounts(id, subject.slug);

  // Stats for this subject
  const _subjectStats = [
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

  const SubjectIcon = getIconComponent(subject.icon, BookOpen);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Compact Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-md">
            <SubjectIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{subject.name_en}</h1>
              <div className={subject.is_active ? 'h-2 w-2 rounded-full bg-success-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'h-2 w-2 rounded-full bg-neutral-300'} />
            </div>
            {subject.name_mr && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{subject.name_mr}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClassLevelSelectFilter />
          <Link href={`/dashboard/subjects/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-primary-600 transition-colors">{crumb.label}</Link>
            ) : (
              <span className="text-neutral-900 dark:text-white font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Description if exists */}
      {subject.description_en && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">{subject.description_en}</p>
      )}

      {/* Compact Stats & Actions Strip */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-success-500 text-white">
            <Layers className="h-3 w-3" />
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">{stats.totalChapters}</span>
          <span className="text-xs text-neutral-500">Chapters</span>
        </div>
        <Link href={`/dashboard/questions/${subject.slug.replace(/_/g, "-")}${classLevelId ? `?classLevelId=${classLevelId}` : ''}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50 hover:border-warning-300 transition-colors group">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-warning-500 text-white">
            <FileQuestion className="h-3 w-3" />
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">{stats.totalQuestions}</span>
          <span className="text-xs text-neutral-500">Questions</span>
          <ChevronRight className="h-3 w-3 text-neutral-300 group-hover:text-warning-500 transition-colors" />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link href={`/dashboard/questions/${subject.slug.replace(/_/g, "-")}${classLevelId ? `?classLevelId=${classLevelId}` : ''}`}>
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <FileQuestion className="h-3.5 w-3.5" />
              Questions
            </Button>
          </Link>
          <Link href={`/dashboard/subjects/${id}/chapters/new${classLevelId ? `?classLevelId=${classLevelId}` : ''}`}>
            <Button size="sm" className="gap-1.5 h-8">
              <Plus className="h-3.5 w-3.5" />
              Add Chapter
            </Button>
          </Link>
        </div>
      </div>

      {/* Chapters List */}
      <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-success-500 text-white">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">Chapters</span>
            <span className="text-xs text-neutral-400">({chapters.length})</span>
          </div>
        </div>

        {chapters.length > 0 ? (
          <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
            {chapters.map((chapter, index) => {
              // Build URL to questions page with chapter filter
              const subjectSlug = subject.slug.replace(/_/g, "-");
              const baseUrl = `/dashboard/questions/${subjectSlug}/chapters/${chapter.id}`;
              const chapterUrl = classLevelId ? `${baseUrl}?classLevelId=${classLevelId}` : baseUrl;
              
              return (
                <Link
                  key={chapter.id}
                  href={chapterUrl}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Index */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  {/* Chapter Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                        {chapter.name_en}
                      </span>
                    </div>
                    {chapter.name_mr && (
                      <span className="text-xs text-neutral-500 truncate">{chapter.name_mr}</span>
                    )}
                  </div>

                  {/* Question count */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 shrink-0">
                    <FileQuestion className="h-3 w-3" />
                    <span className="font-medium">{chapter.question_count || 0}</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Layers className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No chapters yet</p>
            <p className="text-xs text-neutral-400 mt-1">Add your first chapter to organize content</p>
          </div>
        )}
      </div>
    </div>
  );
}
