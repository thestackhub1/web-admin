import type { Metadata } from "next";
import { DashboardClient } from '@/client/components/features/dashboard';

export const metadata: Metadata = {
  title: "Dashboard - The Stack Hub Admin",
  description: "EdTech platform analytics and management dashboard",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
