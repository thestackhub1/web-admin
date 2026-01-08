import { authServerApi, isAuthenticated } from "@/lib/api";
import type { Metadata } from "next";
import { ClassLevelDetailClient } from '@/client/components/features/class-levels/class-level-detail-client';

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

  const { data: classLevel } = await authServerApi.get<{ name_en: string }>(
    `/api/v1/class-levels/${slug}`
  );

  return {
    title: classLevel ? `${classLevel.name_en} - The Stack Hub Admin` : "Class Not Found",
  };
}

export default async function ClassLevelDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ClassLevelDetailClient slug={slug} />;
}
