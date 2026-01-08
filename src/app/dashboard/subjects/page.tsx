import type { Metadata } from "next";
import { SubjectsClient } from '@/client/components/features/subjects/subjects-client';

export const metadata: Metadata = {
  title: "Subjects - The Stack Hub Admin",
  description: "Manage curriculum subjects, categories, and their content",
};

export default function SubjectsPage() {
  return <SubjectsClient />;
}
