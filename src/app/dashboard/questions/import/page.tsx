import type { Metadata } from "next";
import { QuestionImportClient } from "@/client/components/features/questions";

export const metadata: Metadata = {
  title: "Import Questions - Abhedya Admin",
  description: "Import questions from PDF files with answer keys",
};

export default function ImportQuestionsPage() {
  return <QuestionImportClient />;
}
