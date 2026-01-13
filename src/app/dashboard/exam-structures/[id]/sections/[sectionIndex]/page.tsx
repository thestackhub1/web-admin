import { getSubjects, getExamStructureById } from "@/client/services";
import type { ExamSection } from "@/client/types/exam-structures";
import { SectionEditor } from '@/client/components/features/exams/section-editor';
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string; sectionIndex: string }>;
}): Promise<Metadata> {
    const { id, sectionIndex } = await params;
    const structure = await getExamStructureById(id);
    const sectionIdx = parseInt(sectionIndex, 10);
    const section = structure?.sections?.[sectionIdx] as ExamSection | undefined;
    
    return {
        title: structure && section
            ? `${section.name_en} - ${structure.name_en} - Edit Section`
            : "Edit Section - The Stack Hub Admin",
    };
}

export default async function EditSectionPage({
    params,
}: {
    params: Promise<{ id: string; sectionIndex: string }>;
}) {
    const { id, sectionIndex } = await params;
    const sectionIdx = parseInt(sectionIndex, 10);
    
    const [subjects, structure] = await Promise.all([
        getSubjects(),
        getExamStructureById(id),
    ]);

    if (!structure) {
        notFound();
    }

    const sections = (structure.sections || []) as ExamSection[];
    const section = sections[sectionIdx];

    if (!section) {
        notFound();
    }

    // Find the subject for fetching chapters
    const subject = subjects.find(s => s.id === structure.subject_id);

    return (
        <div className="animate-in fade-in duration-500">
            <SectionEditor
                examStructureId={id}
                examStructureName={structure.name_en}
                subjectId={structure.subject_id}
                subjectName={subject?.name_en || "Unknown Subject"}
                classLevelId={structure.class_level_id ?? undefined}
                section={section}
                sectionIndex={sectionIdx}
            />
        </div>
    );
}
