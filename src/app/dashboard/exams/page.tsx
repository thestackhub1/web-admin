import { getCurrentUser, getExamAttempts, getSubjects } from "@/client/services";
import { PageHeader } from '@/client/components/ui/premium';
import { ExamAttemptsClient, type ExamAttempt } from '@/client/components/features/exams/exam-attempts-client';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Attempts - The Stack Hub Admin",
};

export default async function ExamsPage() {
  const currentUser = await getCurrentUser();
  const [exams, subjects] = await Promise.all([
    getExamAttempts(currentUser?.id),
    getSubjects(),
  ]);

  const isStudent = currentUser?.role === "student";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? "My Exams" : "Exam Attempts"}
        description={isStudent ? "Track your exam history, scores, and progress" : "Monitor all student exam attempts, performance, and results"}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exam Attempts" }]}
      />

      <ExamAttemptsClient 
        exams={exams as ExamAttempt[]} 
        subjects={subjects}
        isStudent={isStudent} 
      />
    </div>
  );
}
