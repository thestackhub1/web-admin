import { isAuthenticated } from "@/lib/api";
import { getProfile } from "@/client/services";
import { redirect } from "next/navigation";
import { SchoolsClient } from '@/client/components/features/schools/schools-client';
import { PageHeader } from '@/client/components/ui/premium';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schools Management - The Stack Hub Admin",
  description: "Manage schools and prevent duplicates",
};

export default async function SchoolsPage() {
  // Check authentication
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  // Check if user is admin via API
  const profile = await getProfile();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Schools"
        description="Manage schools, verify entries, and prevent duplicates"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Schools" }]}
      />

      <SchoolsClient />
    </div>
  );
}
