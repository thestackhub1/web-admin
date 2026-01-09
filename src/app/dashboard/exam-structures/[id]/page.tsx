import Link from "next/link";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";
import { getSubjects, getExamStructureById } from "@/client/services";
import type { ExamSection } from "@/client/types/exam-structures";
import { ExamStructureEditor } from '@/client/components/features/exams/exam-structure-editor';
import { GlassCard } from '@/client/components/ui/premium';
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
            {/* Premium Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white shadow-2xl">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Link
                            href="/dashboard/exam-structures"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2 text-sm font-bold text-white/80">
                            <span>Dashboard</span>
                            <ChevronRight className="h-4 w-4" />
                            <span>Exam Blueprints</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">Edit Structure</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg text-emerald-600">
                                    <FileText className="h-7 w-7" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tight">{structure.name_en}</h1>
                            </div>
                            <p className="max-w-2xl text-lg font-medium text-emerald-50 leading-relaxed">
                                {structure.name_mr || "Configure section logic, marking schemes, and question distributions for this blueprint."}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col items-center px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Total Marks</span>
                                <span className="text-2xl font-black">{structure.total_marks}</span>
                            </div>
                            <div className="flex flex-col items-center px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Sections</span>
                                <span className="text-2xl font-black">{(structure.sections as any[])?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
