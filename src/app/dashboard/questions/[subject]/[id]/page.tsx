import { getQuestionById, getSubjectWithParent, getChaptersBySubject } from "@/client/services";
import { QuestionEditor } from '@/client/components/features/questions/question-editor';
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Question - The Stack Hub Admin",
};

// Map of valid question table slugs to their display names
// Note: Some question tables (like 'english') may not have a corresponding entry in the subjects table
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

    // Fetch question first - this is required
    const question = await getQuestionById(subject, id);
    if (!question) {
        notFound();
    }

    // Fetch chapters and subject data (these might fail for subjects not in the subjects table)
    const [chapters, subjectData] = await Promise.all([
        getChaptersBySubject(subject).catch(() => []),
        getSubjectWithParent(subject).catch(() => null),
    ]);

    // Use subjectData if available, otherwise use the display map fallback
    const subjectName = subjectData?.name_en || displayName;

    return (
        <div className="space-y-6">
            <QuestionEditor 
                subjectSlug={subject} 
                subjectName={subjectName}
                subjectDisplaySlug={subject}
                chapters={chapters} 
                mode="edit" 
                initialData={question} 
            />
        </div>
    );
}
