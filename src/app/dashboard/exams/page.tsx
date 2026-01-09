import { getCurrentUser, getExamAttempts, getSubjects } from "@/client/services";
import { ExamsPageClient } from '@/client/components/features/exams/exams-page-client';
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
    <ExamsPageClient 
      exams={exams} 
      subjects={subjects}
      isStudent={isStudent} 
    />
  );
}
