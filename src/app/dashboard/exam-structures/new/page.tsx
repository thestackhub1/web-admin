import { getSubjects } from "@/client/services";
import { ExamStructureEditor } from '@/client/components/features/exams/exam-structure-editor';
import { PageHeader } from '@/client/components/ui/premium';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Exam Structure - The Stack Hub Admin",
};

export default async function NewExamStructurePage() {
    const subjects = await getSubjects();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Exam Structure"
                description="Define a new exam blueprint with sections and rules"
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Exam Structures", href: "/dashboard/exam-structures" },
                    { label: "New" },
                ]}
            />

            <ExamStructureEditor subjects={subjects} mode="create" />
        </div>
    );
}
