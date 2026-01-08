import { notFound } from "next/navigation";
import { getScheduledExamForPreview } from "@/client/services";
import { ExamPreviewClient } from "@/client/components/features/exams";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const exam = await getScheduledExamForPreview(id);
    return {
        title: exam ? `Preview: ${exam.name_en} - The Stack Hub Admin` : "Exam Preview Not Found",
    };
}

export default async function ExamPreviewPage({ params }: PageProps) {
    const { id } = await params;
    const exam = await getScheduledExamForPreview(id);

    if (!exam) {
        notFound();
    }

    return (
        <ExamPreviewClient
            examId={exam.id}
            examName={exam.name_en}
            examNameMr={exam.name_mr ?? undefined}
            subjectName={exam.subject?.name_en}
            classLevelName={exam.class_level?.name_en}
            totalMarks={exam.exam_structure?.total_marks ?? exam.total_marks}
            durationMinutes={exam.exam_structure?.duration_minutes ?? exam.duration_minutes}
            passingPercentage={exam.exam_structure?.passing_percentage}
            backUrl={`/dashboard/scheduled-exams/${id}`}
        />
    );
}
