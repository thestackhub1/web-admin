import { getCurrentUser, getUserById } from "@/client/services";
import { PageHeader, GlassCard, EmptyState } from '@/client/components/ui/premium';
import { 
  Mail, 
  Phone, 
  School, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Shield, 
  BookOpen,
  CheckCircle2,
  XCircle,
  Target,
  Award,
  TrendingUp,
  ClipboardList,
  Globe,
  ArrowLeft,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";

export const metadata: Metadata = {
  title: "User Details - The Stack Hub Admin",
};

const roleConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  admin: { icon: Shield, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  teacher: { icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  student: { icon: GraduationCap, color: "text-brand-blue-600 dark:text-brand-blue-400", bgColor: "bg-brand-blue-100 dark:bg-brand-blue-900/30" },
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/30", label: "Completed" },
  in_progress: { icon: Clock, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-900/30", label: "In Progress" },
  abandoned: { icon: XCircle, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-900/30", label: "Abandoned" },
};

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (currentUser?.role !== "admin") {
    redirect("/dashboard");
  }

  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const roleInfo = roleConfig[user.role] || roleConfig.student;
  const RoleIcon = roleInfo.icon;

  const getInitials = (name: string | null | undefined, email: string | null) => {
    if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const getGradient = (name: string | null | undefined) => {
    const gradients = [
      "from-blue-400 to-indigo-500",
      "from-purple-400 to-pink-500",
      "from-green-400 to-teal-500",
      "from-brand-blue-400 to-red-500",
      "from-cyan-400 to-blue-500",
    ];
    const index = (name?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  const stats = user.exam_stats;
  const exams = user.recent_exams;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/dashboard/users"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <PageHeader
        title="User Details"
        description="View complete user profile and activity"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users", href: "/dashboard/users" },
          { label: user.name || user.email || "User" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <GlassCard className="text-center">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || ""}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-neutral-800 shadow-lg"
                />
              ) : (
                <div className={clsx(
                  "flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white",
                  "bg-linear-to-br shadow-lg ring-4 ring-white dark:ring-neutral-800",
                  getGradient(user.name)
                )}>
                  {getInitials(user.name, user.email)}
                </div>
              )}
            </div>

            {/* Name & Email */}
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {user.name || "No name set"}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {user.email}
            </p>

            {/* Role Badge */}
            <div className="mt-4 flex justify-center">
              <div className={clsx(
                "inline-flex items-center gap-2 rounded-full px-4 py-2",
                roleInfo.bgColor
              )}>
                <RoleIcon className={clsx("h-4 w-4", roleInfo.color)} />
                <span className={clsx("font-medium capitalize", roleInfo.color)}>{user.role}</span>
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 flex justify-center">
              {user.is_active ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Active Account</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Inactive Account</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Contact Info */}
          <GlassCard>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Email</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {user.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Phone className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Phone</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Globe className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Language</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white uppercase">
                    {user.preferred_language || "EN"}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Academic Info (for students) */}
          {user.role === "student" && (
            <GlassCard>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Academic Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <School className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">School</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {user.school_id || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <GraduationCap className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Class Level</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {user.class_level_id || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Account Dates */}
          <GlassCard>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Account Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Joined</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {new Date(user.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Last Updated</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {new Date(user.updated_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Stats & Exams */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <GlassCard className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Exams</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.completed}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Completed</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.passed}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Passed</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue-100 dark:bg-brand-blue-900/30">
                <TrendingUp className="h-6 w-6 text-brand-blue-600 dark:text-brand-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.avg_score}%</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Avg Score</p>
              </div>
            </GlassCard>
          </div>

          {/* Recent Exams */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Recent Exam Attempts</h3>
              <Link 
                href={`/dashboard/exams?user=${user.id}`}
                className="text-sm text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400 dark:hover:text-brand-blue-300"
              >
                View all →
              </Link>
            </div>

            {exams.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No exam attempts yet"
                description="This user hasn't taken any exams"
              />
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => {
                  const status = statusConfig[exam.status] || statusConfig.in_progress;
                  const StatusIcon = status.icon;
                  const scorePercentage = exam.total_marks && exam.total_marks > 0 && exam.score !== null
                    ? Math.round((exam.score / exam.total_marks) * 100)
                    : null;
                  const isPassing = scorePercentage !== null && scorePercentage >= 35;

                  return (
                    <Link
                      key={exam.id}
                      href={`/dashboard/exams/${exam.id}`}
                      className={clsx(
                        "relative flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between",
                        "bg-neutral-50/50 hover:bg-neutral-100/50 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50",
                        "border-neutral-200/50 dark:border-neutral-700/50",
                        "hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm cursor-pointer group"
                      )}
                    >
                      {/* Score indicator */}
                      {exam.status === "completed" && scorePercentage !== null && (
                        <div className={clsx(
                          "absolute left-0 top-0 h-full w-1 rounded-l-xl",
                          isPassing ? "bg-green-500" : "bg-red-500"
                        )} />
                      )}

                      <div className="pl-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-neutral-400" />
                          <span className="font-medium text-neutral-900 dark:text-white">
                            Exam #{exam.id.slice(0, 8)}
                          </span>
                        </div>
                        {exam.started_at && (
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Started: {new Date(exam.started_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {/* Score */}
                        {exam.status === "completed" && exam.score !== null && exam.total_marks && (
                          <div className={clsx(
                            "flex items-center gap-2 rounded-lg px-3 py-1",
                            isPassing ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                          )}>
                            <span className={clsx(
                              "text-lg font-bold",
                              isPassing ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                              {scorePercentage}%
                            </span>
                            <span className="text-sm text-neutral-500">
                              ({exam.score}/{exam.total_marks})
                            </span>
                          </div>
                        )}

                        {/* Date */}
                        {exam.started_at && (
                          <div className="flex items-center gap-1 text-sm text-neutral-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(exam.started_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}

                        {/* Status */}
                        <div className={clsx(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
                          status.bgColor, status.color
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
