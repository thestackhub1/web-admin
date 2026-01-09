import type { Metadata } from "next";
import QuestionsDashboard from "@/client/components/features/questions/questions-dashboard";

export const metadata: Metadata = {
  title: "Question Bank - The Stack Hub Admin",
  description: "Centralized repository for all exam questions",
};

export default function QuestionsHubPage() {
  return <QuestionsDashboard />;
}
