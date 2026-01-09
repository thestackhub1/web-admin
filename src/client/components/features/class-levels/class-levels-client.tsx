"use client";

import { useState } from "react";
import { PageHeader, GlassCard, Badge, EmptyState } from '@/client/components/ui/premium';
import { Layers, BookOpen, Calendar, ChevronRight, GraduationCap, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useClassLevels, useDeleteClassLevel, ClassLevel } from '@/client/hooks/use-class-levels';
import { useSubjects } from '@/client/hooks/use-subjects';
import { useScheduledExams } from '@/client/hooks/use-scheduled-exams';
import { PageLoader, LoaderSpinner } from '@/client/components/ui/loader';
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
    return <PageLoader message="Loading class levels..." />;
  }

  // Calculate stats
  const stats = {
    classLevels: classLevels?.length || 0,
    subjects: subjects?.length || 0,
    scheduledExams: scheduledExams?.length || 0,
  };

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
        <GlassCard className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="rounded-xl bg-primary-100 p-3 dark:bg-primary-900/30 shadow-inner">
            <Layers className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.classLevels}</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Class Levels</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="rounded-xl bg-insight-100 p-3 dark:bg-insight-900/30 shadow-inner">
            <BookOpen className="h-6 w-6 text-insight-600 dark:text-insight-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.subjects}</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Subjects</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="rounded-xl bg-success-100 p-3 dark:bg-success-900/30 shadow-inner">
            <Calendar className="h-6 w-6 text-success-600 dark:text-success-400" />
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
      {(!classLevels || classLevels.length === 0) ? (
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {classLevels.map((level: any) => {
            const uniqueSubjects = level.subjects || [];
            const subjectCount = uniqueSubjects.length;
            const examCount = level.exam_count || 0;

            return (
              <GlassCard
                key={level.id}
                hover
                className="group relative flex flex-col justify-between overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-primary-900/20"
              >
                <Link href={`/dashboard/class-levels/${level.slug}`} className="absolute inset-0 z-0" />

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary-50 p-2.5 text-primary-600 shadow-sm transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-900/20 dark:text-primary-400 dark:group-hover:bg-primary-600 dark:group-hover:text-white">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {level.name_en}
                        </h3>
                        {level.name_mr && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{level.name_mr}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={level.is_active ? "success" : "default"} size="sm" dot className="h-6">
                      {level.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Compact Stats Row */}
                  <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-neutral-400" />
                      <span className="font-medium">{subjectCount}</span> Subjects
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <span className="font-medium">{examCount}</span> Exams
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/20 relative z-10">
                  <span className="text-xs font-medium text-neutral-500 group-hover:text-primary-600 dark:text-neutral-400 dark:group-hover:text-primary-400 transition-colors flex items-center gap-1">
                    Manage <ChevronRight className="h-3.5 w-3.5" />
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(e, level as ClassLevel)}
                      className="h-7 w-7 p-0 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, level.id)}
                      disabled={isDeleting}
                      className="h-7 w-7 p-0 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:text-danger-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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

