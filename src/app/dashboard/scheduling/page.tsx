import { getSubjectsWithClassCounts, getScheduledExamCountsBySubject } from "@/client/services";
import { PageHeader, GlassCard, Badge } from '@/client/components/ui/premium';
import { Calendar, BookOpen, ChevronRight, GraduationCap, Monitor, Globe } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exam Scheduling - The Stack Hub Admin",
};

interface SubjectWithMappings {
  id: string;
  name_en: string;
  name_mr?: string | null;
  slug: string;
  is_active?: boolean;
  subject_class_mappings?: Array<{ count: number }>;
}

const subjectConfig: Record<
  string,
  { icon: React.ElementType; gradient: string; color: string }
> = {
  scholarship: {
    icon: GraduationCap,
    gradient: "from-purple-500/20 to-pink-500/20",
    color: "text-purple-600 dark:text-purple-400",
  },
  english: {
    icon: Globe,
    gradient: "from-blue-500/20 to-cyan-500/20",
    color: "text-blue-600 dark:text-blue-400",
  },
  information_technology: {
    icon: Monitor,
    gradient: "from-green-500/20 to-emerald-500/20",
    color: "text-green-600 dark:text-green-400",
  },
};

export default async function SchedulingPage() {
  const [subjects, examCounts] = await Promise.all([
    getSubjectsWithClassCounts(),
    getScheduledExamCountsBySubject(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Exam Scheduling"
        description="Manage scheduled exams across subjects and class levels"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Scheduling" }]}
      />

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-4" gradient="amber">
          <div className="rounded-xl bg-brand-blue-500/20 p-3">
            <Calendar className="h-6 w-6 text-brand-blue-600 dark:text-brand-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {Object.values(examCounts).reduce((a: number, b: number) => a + b, 0)}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Scheduled Exams</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4" gradient="blue">
          <div className="rounded-xl bg-blue-500/20 p-3">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{subjects.length}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Active Subjects</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4" gradient="green">
          <div className="rounded-xl bg-green-500/20 p-3">
            <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {(subjects as SubjectWithMappings[]).reduce((sum: number, s) => sum + (s.subject_class_mappings?.[0]?.count || 0), 0)}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Class-Subject Mappings</p>
          </div>
        </GlassCard>
      </div>

      {/* Subject Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Select a Subject
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(subjects as SubjectWithMappings[]).map((subject) => {
            const config = subjectConfig[subject.slug] || subjectConfig.scholarship;
            const examCount = examCounts[subject.id] || 0;
            const classCount = subject.subject_class_mappings?.[0]?.count || 0;
            const subjectSlug = subject.slug.replace(/_/g, "-");

            return (
              <Link
                key={subject.id}
                href={`/dashboard/scheduling/${subjectSlug}`}
                className="group"
              >
                <GlassCard
                  className={`relative overflow-hidden bg-linear-to-br ${config.gradient} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`mb-2 ${config.color}`}>
                        <config.icon className="h-8 w-8" />
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
                        {subject.name_en}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{subject.name_mr}</p>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-neutral-400 transition-transform duration-300 group-hover:translate-x-1 ${config.color}`}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-white/50 p-3 dark:bg-neutral-800/50">
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {classCount}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Classes</p>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3 dark:bg-neutral-800/50">
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{examCount}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Exams</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Badge variant={subject.is_active ? "success" : "default"} dot>
                      {subject.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
