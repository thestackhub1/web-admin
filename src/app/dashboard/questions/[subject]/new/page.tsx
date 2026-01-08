import { getSubjectWithParent, getChaptersBySubject } from "@/client/services";
import { QuestionEditor } from '@/client/components/features/questions/question-editor';
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subject: string }>;
}): Promise<Metadata> {
    const { subject } = await params;
    return {
        title: `Add Question - ${subject} - The Stack Hub Admin`,
    };
}

/**
 * Fetches subject with parent info and computes the question table slug.
 * URL slugs use hyphens, but DB slugs use underscores.
 */
async function getSubjectForQuestionPage(slug: string) {
    // Normalize URL slug (hyphens) to DB slug (underscores)
    const dbSlug = slug.replace(/-/g, "_");
    const subject = await getSubjectWithParent(dbSlug);

    if (!subject) return null;

    // Determine question table slug: use parent's slug if this is a child subject
    const questionTableSlug = subject.parent?.slug ?? subject.slug;

    return {
        ...subject,
        questionTableSlug: questionTableSlug.replace(/_/g, "-"),
    };
}

export default async function NewQuestionPage({
    params,
}: {
    params: Promise<{ subject: string }>;
}) {
    const { subject } = await params;

    // Get subject from database (handles both parent and child subjects)
    const subjectData = await getSubjectForQuestionPage(subject);
    
    if (!subjectData) {
        notFound();
    }

    // Prevent adding questions to categories
    if (subjectData.is_category === true) {
        notFound();
    }

    // Normalize URL slug to DB slug for chapters API
    const dbSlug = subject.replace(/-/g, "_");
    const chapters = await getChaptersBySubject(dbSlug);

    return (
        <div className="space-y-6">
            <QuestionEditor 
                subjectSlug={subjectData.questionTableSlug}
                subjectName={subjectData.name_en}
                subjectDisplaySlug={subject}
                chapters={chapters} 
                mode="create" 
            />
        </div>
    );
}
