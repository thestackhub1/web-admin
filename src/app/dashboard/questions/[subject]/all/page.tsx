import { QuestionsClientPage } from '@/client/components/features/questions/questions-client-page';
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { subjectDisplayMap } from "@/client/types/questions";
import { getQuestionsBySubject } from "@/client/services/questions.service";
import { getSubjectBySlug, getChaptersBySubject } from "@/client/services";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subject: string }>;
}): Promise<Metadata> {
    const { subject } = await params;
    const displayName = subjectDisplayMap[subject] || subject;
    return {
        title: `All ${displayName} Questions - The Stack Hub Admin`,
    };
}

export default async function AllQuestionsPage({
    params,
}: {
    params: Promise<{ subject: string }>;
}) {
    const { subject } = await params;

    const subjectData = await getSubjectBySlug(subject);
    if (!subjectData) {
        notFound();
    }

    // Prevent viewing all questions for categories
    if (subjectData.is_category === true) {
        notFound();
    }

    const [questions, chapters] = await Promise.all([
        getQuestionsBySubject(subject),
        getChaptersBySubject(subject),
    ]);

    return (
        <QuestionsClientPage
            subject={subject}
            initialQuestions={questions}
            chapters={chapters}
            showAllQuestions={true}
        />
    );
}
