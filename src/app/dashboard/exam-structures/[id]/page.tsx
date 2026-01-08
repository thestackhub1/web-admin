import { getSubjects, getExamStructureById } from "@/client/services";
import type { ExamSection } from "@/client/types/exam-structures";
import { ExamStructureEditor } from '@/client/components/features/exams/exam-structure-editor';
import { PageHeader } from '@/client/components/ui/premium';
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Exam Structure - The Stack Hub Admin",
};

export default async function EditExamStructurePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [subjects, structure] = await Promise.all([
        getSubjects(),
        getExamStructureById(id),
    ]);

    if (!structure) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Exam Structure"
                description="Modify exam blueprint sections and rules"
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Exam Structures", href: "/dashboard/exam-structures" },
                    { label: "Edit" },
                ]}
            />

            <ExamStructureEditor
                subjects={subjects}
                mode="edit"
                initialData={{
                    id: structure.id,
                    name_en: structure.name_en,
                    name_mr: structure.name_mr || "",
                    subject_id: structure.subject_id,
                    class_level: structure.class_level || "class_10",
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
