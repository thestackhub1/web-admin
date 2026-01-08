import { getQuestionById, getSubjectWithParent, getChaptersBySubject } from "@/client/services";
import { QuestionEditor } from '@/client/components/features/questions/question-editor';
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Question - The Stack Hub Admin",
};

const subjectDisplayMap: Record<string, string> = {
    scholarship: "Scholarship",
    english: "English",
    "information-technology": "Information Technology",
};

export default async function EditQuestionPage({
    params,
}: {
    params: Promise<{ subject: string; id: string }>;
}) {
    const { subject, id } = await params;
    const displayName = subjectDisplayMap[subject];

    if (!displayName) {
        notFound();
    }

    const [question, chapters, subjectData] = await Promise.all([
        getQuestionById(subject, id), 
        getChaptersBySubject(subject),
        getSubjectWithParent(subject)
    ]);

    if (!question || !subjectData) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <QuestionEditor 
                subjectSlug={subject} 
                subjectName={subjectData.name_en}
                subjectDisplaySlug={subject}
                chapters={chapters} 
                mode="edit" 
                initialData={question} 
            />
        </div>
    );
}
