import { authServerApi, isAuthenticated } from "@/lib/api";
import { QuestionsClientPage } from '@/client/components/features/questions/questions-client-page';
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { subjectDisplayMap } from "@/client/types/questions";
import { getQuestionTableName } from "@/lib/services/questions.service";
import { getChapterById, getQuestionsByChapter, getChaptersBySubject } from "@/client/services";

interface PageProps {
    params: Promise<{ subject: string; chapterId: string }>;
    searchParams: Promise<{ classLevelId?: string }>;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subject: string; chapterId: string }>;
}): Promise<Metadata> {
    const { subject, chapterId } = await params;
    const chapter = await getChapterById(chapterId);

    const displayName = subjectDisplayMap[subject] || subject;
    const chapterName = chapter?.name_en || "Chapter";
    return {
        title: `${chapterName} - ${displayName} Questions - The Stack Hub Admin`,
    };
}

export default async function ChapterQuestionsPage({ params, searchParams }: PageProps) {
    const { subject, chapterId } = await params;
    const { classLevelId } = await searchParams;
    
    // Get chapter info first to find the actual subject
    const chapter = await getChapterById(chapterId);
    if (!chapter || !chapter.subjects) {
        notFound();
    }
    
    const chapterSubject = chapter.subjects;
    
    // Determine which question table to use
    // Child subjects (like scholarship-marathi) use their parent's question table
    let questionTableSlug = chapterSubject.slug.replace(/_/g, "-");
    
    // If the chapter's subject has a parent, use the parent's slug for the question table
    if (chapterSubject.parent_subject_id) {
        if (await isAuthenticated()) {
            const { data: parentSubject } = await authServerApi.get<{ slug: string }>(
                `/api/v1/subjects/${chapterSubject.parent_subject_id}`
            );
            
            if (parentSubject) {
                questionTableSlug = parentSubject.slug.replace(/_/g, "-");
            }
        }
    }
    
    // Get the question table name using the API constants function
    const tableName = getQuestionTableName(questionTableSlug);
    
    if (!tableName) {
        console.error(`No question table found for slug: ${questionTableSlug} or ${subject}`);
        notFound();
    }

    const [questions, chapters] = await Promise.all([
        getQuestionsByChapter(questionTableSlug, chapterId),
        getChaptersBySubject(chapterSubject.slug),
    ]);

    return (
        <QuestionsClientPage
            subject={subject}
            initialQuestions={questions}
            chapters={chapters}
            currentChapter={{
                id: chapterId,
                name_en: chapter.name_en,
                name_mr: chapter.name_mr ?? undefined,
            }}
        />
    );
}
