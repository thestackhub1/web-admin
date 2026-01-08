import { isAuthenticated } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { SchoolDetailsClient } from '@/client/components/features/schools/school-details-client';
import { getSchoolById, getProfile } from "@/client/services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Details - The Stack Hub Admin",
  description: "View and manage school details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolDetailsPage({ params }: PageProps) {
  const { id } = await params;

  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const profile = await getProfile();
  const isAdmin = profile !== null && ["admin", "super_admin"].includes(profile.role);

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const school = await getSchoolById(id);

  if (!school) {
    notFound();
  }

  return <SchoolDetailsClient school={school} />;
}
