import { notFound } from "next/navigation";
import { authServerApi, isAuthenticated } from "@/lib/api";
import { getSubjectBySlug } from "@/client/services";
import { PageHeader } from '@/client/components/ui/premium';
import { ClassLevelSelector } from '@/client/components/features/class-levels/class-level-selector';
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ subject: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject } = await params;
  const subjectName = subject.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${subjectName} - Class Levels | The Stack Hub Admin`,
  };
}

export default async function SubjectClassLevelsPage({ params }: PageProps) {
  const { subject: subjectSlug } = await params;
  
  if (!(await isAuthenticated())) {
    notFound();
  }

  const [subjectResult, classLevelsResult] = await Promise.all([
    getSubjectBySlug(subjectSlug),
    authServerApi.get<Array<{
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
      subject_count: number;
      scheduled_exam_count: number;
    }>>(`/api/v1/subjects/${subjectSlug}/class-levels`),
  ]);

  const subject = subjectResult;
  const classLevels = classLevelsResult.data || [];

  if (!subject) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${subject.name_en}`}
        description={`Select a class level to manage scheduled exams for ${subject.name_en}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Scheduling", href: "/dashboard/scheduling" },
          { label: subject.name_en },
        ]}
      />

      <ClassLevelSelector
        classLevels={classLevels}
        subjectSlug={subjectSlug}
        subjectName={subject.name_en}
        basePath="/dashboard/scheduling"
      />
    </div>
  );
}
