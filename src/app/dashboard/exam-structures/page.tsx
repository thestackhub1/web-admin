import type { Metadata } from "next";
import { ExamStructuresClient } from '@/client/components/features/exam-structures/exam-structures-client';

export const metadata: Metadata = {
  title: "Exam Structures - The Stack Hub Admin",
};

export default function ExamStructuresPage() {
  return <ExamStructuresClient />;
}
