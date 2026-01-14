import { useState } from "react";
import { PageHeader, GlassCard, Badge, EmptyState } from '@/client/components/ui/premium';
import { Layers, BookOpen, Calendar, ChevronRight, GraduationCap, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useClassLevels, useDeleteClassLevel, ClassLevel } from '@/client/hooks/use-class-levels';
import { useSubjects } from '@/client/hooks/use-subjects';
import { useScheduledExams } from '@/client/hooks/use-scheduled-exams';
import { LoaderSpinner } from '@/client/components/ui/loader';
import { Button } from "@/client/components/ui/button";
import { ClassLevelModal } from "./class-level-modals";

export function ClassLevelsClient() {
  const { data: classLevels, loading: isLoadingLevels } = useClassLevels();
  const { data: subjects } = useSubjects();
  const { data: scheduledExams } = useScheduledExams({ status: 'all' });
  const { mutate: deleteClassLevel, loading: isDeleting } = useDeleteClassLevel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassLevel, setSelectedClassLevel] = useState<ClassLevel | null>(null);

  const handleCreate = () => {
    setSelectedClassLevel(null);
    setIsModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, level: ClassLevel) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClassLevel(level);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this class level?")) {
      await deleteClassLevel(id);
      window.location.reload(); // Temporary reload
    }
  };

  if (isLoadingLevels) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderSpinner />
      </div>
    );
  }

  // Calculate stats
  const stats = {
    classLevels: classLevels?.length || 0,
    subjects: subjects?.length || 0,
    scheduledExams: scheduledExams?.length || 0,
  };

  // Enhance class levels with subject and exam counts
  const classLevelsWithDetails = (classLevels || []).map((level) => {
    const levelExams = scheduledExams?.filter((exam) =>
      exam.class_level_id === level.id
    ) || [];

    return {
      ...level,
      subject_class_mappings: (level.subjects || []).map((s: any) => ({
        subject_id: s.id,
        subjects: s,
      })),
      scheduled_exams: [{ count: levelExams.length }],
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Class Levels"
          description="Manage academic cohorts and subject mappings"
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Class Levels" }]}
        />
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Class Level
        </Button>
      </div>

      {/* Quick Stats - Premium Style */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* ... Stats cards ... */}
        <GlassCard className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="rounded-xl bg-brand-blue-100 p-3 dark:bg-brand-blue-900/30 shadow-inner">
            <Layers className="h-6 w-6 text-brand-blue-600 dark:text-brand-blue-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.classLevels}</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Class Levels</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30 shadow-inner">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.subjects}</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Subjects</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30 shadow-inner">
            <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              {stats.scheduledExams}
            </p>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Scheduled Exams</p>
          </div>
        </GlassCard>
      </div>

      {/* Class Levels Grid */}
      {classLevelsWithDetails.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No class levels found"
          description="Class levels will appear here once configured"
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Create Class Level
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classLevelsWithDetails.map((level: any) => {
            // Get unique subjects count
            const subjectsMap = new Map();
            level.subject_class_mappings?.forEach((m: any) => {
              if (m.subjects) subjectsMap.set(m.subjects.id, m.subjects);
            });
            const subjectCount = subjectsMap.size;
            const examCount = level.scheduled_exams?.[0]?.count || 0;

            return (
              <GlassCard
                key={level.id}
                hover
                className="group relative h-full bg-white dark:bg-slate-800 border-neutral-200 dark:border-neutral-700 hover:border-brand-blue-300 dark:hover:border-brand-blue-700/50 transition-all duration-300 flex flex-col"
              >
                <Link href={`/dashboard/class-levels/${level.slug}`} className="absolute inset-0 z-0" />

                {/* Decorative Header */}
                <div className="absolute top-0 right-0 p-4 opacity-50 z-0">
                  <div className="h-20 w-20 rounded-full bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-slate-700 dark:to-slate-800 -mr-10 -mt-10 blur-2xl group-hover:from-brand-blue-50 group-hover:to-brand-purple-50 dark:group-hover:from-brand-blue-900/20 dark:group-hover:to-brand-purple-900/20 transition-colors duration-500"></div>
                </div>

                {/* Header */}
                <div className="mb-6 flex items-start justify-between relative z-10">
                  <div className="rounded-xl bg-neutral-50 dark:bg-slate-900/50 p-3 border border-neutral-100 dark:border-slate-700 group-hover:border-brand-blue-200 dark:group-hover:border-brand-blue-800/30 transition-colors">
                    <GraduationCap className="h-8 w-8 text-neutral-700 dark:text-neutral-300 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={level.is_active ? "success" : "default"} dot>
                      {level.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    {level.name_en}
                  </h3>
                  {level.name_mr && (
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                      {level.name_mr}
                    </p>
                  )}

                  {level.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400/80">
                      {level.description}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 relative z-10">
                  <div className="rounded-lg bg-neutral-50 dark:bg-slate-900/50 p-3 text-center border border-neutral-100 dark:border-slate-700">
                    <p className="text-xl font-bold text-neutral-900 dark:text-white">{subjectCount}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Subjects</p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 dark:bg-slate-900/50 p-3 text-center border border-neutral-100 dark:border-slate-700">
                    <p className="text-xl font-bold text-neutral-900 dark:text-white">{examCount}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Exams</p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 dark:border-slate-700 pt-4 group-hover:border-brand-blue-100 dark:group-hover:border-brand-blue-900/30 transition-colors relative z-20">
                  <span className="text-sm font-medium text-neutral-500 group-hover:text-brand-blue-600 dark:text-neutral-400 dark:group-hover:text-brand-blue-400 transition-colors flex items-center gap-1">
                    View details <ChevronRight className="h-4 w-4" />
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(e, level as ClassLevel)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, level.id)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <ClassLevelModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        classLevel={selectedClassLevel}
      />
    </div>
  );
}

