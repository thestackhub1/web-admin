import { notFound } from "next/navigation";
import { authServerApi, isAuthenticated } from "@/lib/api";
import { PageHeader } from '@/client/components/ui/premium';
import { ScheduledExamsDashboard } from '@/client/components/features/exams/scheduled-exams-dashboard';
import { getSubjectBySlug, getAvailableStructures } from "@/client/services";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ subject: string; classLevel: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject, classLevel } = await params;
  const subjectName = subject.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const className = classLevel.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${className} - ${subjectName} Exams | The Stack Hub Admin`,
  };
}

async function getClassLevel(slug: string) {
  if (!(await isAuthenticated())) return null;

  const { data, error } = await authServerApi.get<{
    id: string;
    name_en: string;
    name_mr: string;
    slug: string;
    description_en?: string | null;
    description_mr?: string | null;
    icon: string;
    color: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>(`/api/v1/class-levels/${slug}`);

  if (error || !data) {
    console.error("Failed to fetch class level:", error);
    return null;
  }

  return data;
}

async function getScheduledExams(classLevelSlug: string, subjectSlug: string) {
  if (!(await isAuthenticated())) return { exams: [] };

  const dbSubjectSlug = subjectSlug.replace(/-/g, "_");
  const { data: subjectData } = await authServerApi.get<{ id: string }>(`/api/v1/subjects/${dbSubjectSlug}`);

  if (!subjectData) return { exams: [] };

  const { data, error } = await authServerApi.get<Array<{
    id: string;
    name_en: string;
    name_mr: string;
    status: "draft" | "in_progress" | "completed" | "published" | "archived";
    scheduled_date: string | null;
    scheduled_time?: string | null;
    duration_minutes: number;
    total_marks: number;
    class_level_id: string;
    subject_id: string;
    exam_structure_id: string | null;
    order_index: number;
    is_active: boolean;
    publish_results: boolean;
    max_attempts: number;
    created_at: string;
    updated_at: string;
    exam_structures?: {
      id: string;
      name_en: string;
      total_marks: number;
    };
  }>>(`/api/v1/class-levels/${classLevelSlug}/scheduled-exams?subject_id=${subjectData.id}`);

  if (error || !data) {
    console.error("Failed to fetch scheduled exams:", error);
    return { exams: [] };
  }

  return { exams: data };
}

export default async function ClassScheduledExamsPage({ params }: PageProps) {
  const { subject: subjectSlug, classLevel: classLevelSlug } = await params;
  
  const [classLevel, subject, examData] = await Promise.all([
    getClassLevel(classLevelSlug),
    getSubjectBySlug(subjectSlug),
    getScheduledExams(classLevelSlug, subjectSlug),
  ]);

  if (!classLevel || !subject) {
    notFound();
  }

  // Get available structures for this class/subject
  const availableStructures = await getAvailableStructures(classLevel.id, subject.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${subject.name_en} Exams`}
        description={`Manage scheduled exams for ${classLevel.name_en} - ${subject.name_en}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Class Levels", href: "/dashboard/class-levels" },
          { label: classLevel.name_en, href: `/dashboard/class-levels/${classLevelSlug}` },
          { label: subject.name_en },
        ]}
      />

      <ScheduledExamsDashboard
        exams={examData.exams}
        classLevel={classLevel}
        subject={{
          id: subject.id,
          name_en: subject.name_en,
          name_mr: subject.name_mr ?? "",
          slug: subject.slug,
        }}
        availableStructures={availableStructures}
      />
    </div>
  );
}
