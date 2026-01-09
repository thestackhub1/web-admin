import { isAuthenticated } from "@/lib/api";
import type { Metadata } from "next";
import { ClassLevelDetailClient } from '@/client/components/features/class-levels/class-level-detail-client';
import { ClassLevelsService } from "@/lib/services/class-levels.service";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!(await isAuthenticated())) {
    return {
      title: "Class Level - The Stack Hub Admin",
    };
  }

  const classLevel = await ClassLevelsService.getBySlug(slug);

  return {
    title: classLevel ? `${classLevel.nameEn} - The Stack Hub Admin` : "Class Not Found",
  };
}

export default async function ClassLevelDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ClassLevelDetailClient slug={slug} />;
}
