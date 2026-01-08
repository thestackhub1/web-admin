import type { Metadata } from "next";
import { ScheduledExamsClient } from '@/client/components/features/exams/scheduled-exams-client';
import { PageHeader } from '@/client/components/ui/premium';

export const metadata: Metadata = {
  title: "Scheduled Exams - The Stack Hub Admin",
  description: "Manage all scheduled exams across class levels and subjects",
};

export default function ScheduledExamsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduled Exams"
        description="Manage all scheduled exams across class levels and subjects"
      />
      <ScheduledExamsClient />
    </div>
  );
}
