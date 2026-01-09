import { getSubjects, getClassLevels } from "@/client/services";
import { ExamStructureEditor } from '@/client/components/features/exams/exam-structure-editor';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Exam Structure - The Stack Hub Admin",
};

export default async function NewExamStructurePage() {
    const [subjects, classLevels] = await Promise.all([
        getSubjects(),
        getClassLevels(),
    ]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ExamStructureEditor 
                subjects={subjects} 
                classLevelsList={classLevels}
                mode="create" 
            />
        </div>
    );
}
