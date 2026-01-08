import { isAuthenticated } from "@/lib/api";
import { getProfile } from "@/client/services";
import { DashboardLayoutClient } from '@/client/components/layout/dashboard-layout';
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Dashboard - The Stack Hub Admin",
  description: "The Stack Hub EdTech Admin Dashboard",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Check authentication
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  // Fetch user profile via API using session access token
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  const dashboardUser = {
    id: profile.id,
    email: profile.email,
    name: profile.name || "",
    role: profile.role as "admin" | "teacher",
    avatarUrl: profile.avatar_url,
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <DashboardLayoutClient user={dashboardUser}>{children}</DashboardLayoutClient>
    </>
  );
}
