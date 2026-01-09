import { getSubjects, getExamStructureById, getClassLevels } from "@/client/services";
import type { ExamSection } from "@/client/types/exam-structures";
import { ExamStructureEditor } from '@/client/components/features/exams/exam-structure-editor';
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const structure = await getExamStructureById(id);
    
    return {
        title: structure 
            ? `${structure.name_en} - Edit Blueprint - The Stack Hub Admin` 
            : "Edit Exam Structure - The Stack Hub Admin",
    };
}

export default async function EditExamStructurePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [subjects, structure, classLevels] = await Promise.all([
        getSubjects(),
        getExamStructureById(id),
        getClassLevels(),
    ]);

    if (!structure) {
        notFound();
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ExamStructureEditor
                subjects={subjects}
                classLevelsList={classLevels}
                mode="edit"
                initialData={{
                    id: structure.id,
                    name_en: structure.name_en,
                    name_mr: structure.name_mr || "",
                    subject_id: structure.subject_id,
                    class_level: structure.class_level || "class_10",
                    class_level_id: structure.class_level_id ?? null,
                    is_template: structure.is_template ?? false,
                    duration_minutes: structure.duration_minutes,
                    total_marks: structure.total_marks,
                    passing_percentage: structure.passing_percentage,
                    sections: (structure.sections || []) as ExamSection[],
                    is_active: structure.is_active,
                }}
            />
        </div>
    );
}
