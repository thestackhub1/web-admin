import type { Metadata } from "next";
import { CreateQuestionClient } from "./create-question-client";

export const metadata: Metadata = {
  title: "Create Question - The Stack Hub Admin",
  description: "Create a new question for your question bank",
};

export default function CreateQuestionPage() {
  return <CreateQuestionClient />;
}
