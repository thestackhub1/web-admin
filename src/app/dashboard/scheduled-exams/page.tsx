import type { Metadata } from "next";
import { ScheduledExamsClient } from '@/client/components/features/exams/scheduled-exams-client';

export const metadata: Metadata = {
  title: "Scheduled Exams - The Stack Hub Admin",
  description: "Manage all scheduled exams across class levels and subjects",
};

export default function ScheduledExamsPage() {
  return <ScheduledExamsClient />;
}
