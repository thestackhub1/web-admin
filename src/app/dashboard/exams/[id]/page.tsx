import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, User, BookOpen, Award, CheckCircle2, XCircle, Timer, FileText, Layers, TrendingUp, AlertTriangle } from "lucide-react";
import { authServerApi, isAuthenticated } from "@/lib/api";
import { GlassCard, PageHeader, Badge } from '@/client/components/ui/premium';
import { ExamAttemptDetailsClient } from "@/client/components/features/exams";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!(await isAuthenticated())) {
    return { title: "Exam Not Found - The Stack Hub Admin" };
  }

  const { data: exam } = await authServerApi.get<{
    profiles?: { name: string | null; email: string } | null;
  }>(`/api/v1/exams/${id}`);
  
  if (!exam) {
    return { title: "Exam Not Found - The Stack Hub Admin" };
  }

  const studentName = exam.profiles?.name || exam.profiles?.email || "Student";
  return {
    title: `${studentName}'s Exam Attempt - The Stack Hub Admin`,
    description: `View detailed results for ${studentName}'s exam attempt`,
  };
}

export default async function ExamAttemptDetailsPage({ params }: PageProps) {
  const { id } = await params;
  if (!(await isAuthenticated())) {
    notFound();
  }
  
  const [examResult, answersResult] = await Promise.all([
    authServerApi.get<{
      id: string;
      user_id: string;
      status: string;
      score: number | null;
      total_marks: number | null;
      percentage: number | null;
      started_at: string | null;
      completed_at: string | null;
      profiles: {
        id: string;
        name: string | null;
        email: string;
        avatar_url: string | null;
        phone: string | null;
      } | null;
      subjects: {
        id: string;
        name_en: string;
        slug: string;
      } | null;
      exam_structures: {
        id: string;
        name_en: string;
        passing_percentage: number;
      } | null;
      scheduled_exams: {
        id: string;
        name_en: string;
        class_levels: {
          id: string;
          name_en: string;
          name_mr: string | null;
        } | null;
      } | null;
    }>(`/api/v1/exams/${id}`),
    authServerApi.get<Array<{
      id: string;
      exam_id: string;
      question_id: string;
      question_table: string;
      user_answer: Record<string, unknown> | string | null;
      is_correct: boolean | null;
      marks_obtained: number;
      created_at: string;
      question?: {
        id: string;
        question_text: string;
        question_language: 'en' | 'mr';
        question_text_secondary?: string | null;
        secondary_language?: 'en' | 'mr' | null;
        question_type: string;
        answer_data: Record<string, unknown> | null;
        marks: number;
        explanation_en?: string;
        explanation_mr?: string;
        chapter?: {
          name_en: string;
          name_mr: string;
        };
      };
    }>>(`/api/v1/exams/${id}/answers`),
  ]);
  
  if (examResult.error || !examResult.data) {
    notFound();
  }

  const exam = examResult.data;
  const answers = answersResult.data || [];

  // Calculate statistics
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter((a) => a.is_correct === true).length;
  const wrongAnswers = answers.filter((a) => a.is_correct === false).length;
  const unanswered = answers.filter((a) => a.is_correct === null).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Calculate duration
  let durationMinutes = 0;
  if (exam.completed_at && exam.started_at) {
    const startTime = new Date(exam.started_at).getTime();
    const endTime = new Date(exam.completed_at).getTime();
    durationMinutes = Math.floor((endTime - startTime) / 60000);
  }

  // Determine pass/fail
  const passingPercentage = exam.exam_structures?.passing_percentage || 35;
  const percentage = exam.percentage ? parseFloat(String(exam.percentage)) : 0;
  const isPassing = percentage >= passingPercentage;

  const studentName = exam.profiles?.name || exam.profiles?.email?.split('@')[0] || "Student";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`${studentName}'s Exam Attempt`}
        description={exam.scheduled_exams?.name_en || "View detailed exam results and answers"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exam Attempts", href: "/dashboard/exams" },
          { label: studentName },
        ]}
        action={
          <div className="flex items-center gap-3">
            {exam.subjects && (
              <Badge variant="default" size="md">
                {exam.subjects.name_en}
              </Badge>
            )}
            <Badge 
              variant={isPassing ? "success" : "error"} 
              size="md"
              dot
            >
              {isPassing ? "Passed" : "Failed"}
            </Badge>
          </div>
        }
      />

      {/* Stats Grid - Clickable Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="flex items-center gap-4 p-5">
          <div className="rounded-xl p-3 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {Math.round(percentage)}%
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Score</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-5">
          <div className="rounded-xl p-3 bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {correctAnswers}/{totalQuestions}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Correct</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-5">
          <div className="rounded-xl p-3 bg-insight-100 text-insight-600 dark:bg-insight-900/30 dark:text-insight-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {durationMinutes} min
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Duration</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-5">
          <div className="rounded-xl p-3 bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {exam.score || 0}/{exam.total_marks || 0}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Marks</p>
          </div>
        </GlassCard>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student & Exam Info Card */}
          <GlassCard>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* Student Info */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  {exam.profiles?.avatar_url ? (
                    <img
                      src={exam.profiles.avatar_url}
                      alt=""
                      className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white dark:ring-neutral-800"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-blue-400 to-brand-purple-500 text-2xl font-bold text-white shadow-lg">
                      {(exam.profiles?.name || exam.profiles?.email || "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full ${
                    isPassing ? "bg-green-500" : "bg-red-500"
                  } ring-2 ring-white dark:ring-neutral-900`}>
                    {isPassing ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <XCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <Link 
                    href={`/dashboard/users/${exam.user_id}`}
                    className="text-xl font-bold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {exam.profiles?.name || "Student"}
                  </Link>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {exam.profiles?.email}
                  </p>
                  {exam.profiles?.phone && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {exam.profiles.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Score Display */}
              {exam.status === "completed" && exam.score !== null && (
                <div className={`flex flex-col items-center rounded-2xl p-4 ${
                  isPassing 
                    ? "bg-linear-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20" 
                    : "bg-linear-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-900/20"
                }`}>
                  <div className={`text-4xl font-black ${
                    isPassing ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {Math.round(percentage)}%
                  </div>
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {exam.score}/{exam.total_marks} marks
                  </div>
                  <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    isPassing 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                  }`}>
                    {isPassing ? (
                      <>
                        <Award className="h-3 w-3" />
                        PASSED
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        FAILED
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* In Progress Status */}
              {exam.status === "in_progress" && (
                <div className="flex flex-col items-center rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
                  <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
                  <div className="mt-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                    In Progress
                  </div>
                </div>
              )}
            </div>

            {/* Exam Meta Info */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Subject</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {exam.subjects?.name_en || "Unknown"}
                  </p>
                </div>
              </div>

              {exam.scheduled_exams && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Exam</p>
                    <Link 
                      href={`/dashboard/scheduled-exams/${exam.scheduled_exams.id}`}
                      className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {exam.scheduled_exams.name_en}
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Started</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {exam.started_at ? new Date(exam.started_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }) : "Not started"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-100 dark:bg-brand-blue-900/30">
                  <Timer className="h-5 w-5 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Duration</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {durationMinutes > 0 ? `${durationMinutes} mins` : "In progress"}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Answers Section */}
          <ExamAttemptDetailsClient 
            examId={exam.id}
            answers={answers}
            status={exam.status}
          />
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <GlassCard>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              <TrendingUp className="h-5 w-5 text-brand-blue-500" />
              Performance Analysis
            </h3>

            <div className="space-y-4">
              {/* Accuracy Meter */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-600 dark:text-neutral-400">Accuracy</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{accuracy}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      accuracy >= 70 ? "bg-green-500" : accuracy >= 40 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">{correctAnswers}</p>
                  <p className="text-xs text-neutral-500">Correct</p>
                </div>
                <div className="text-center">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{wrongAnswers}</p>
                  <p className="text-xs text-neutral-500">Wrong</p>
                </div>
                <div className="text-center">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <AlertTriangle className="h-6 w-6 text-neutral-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-neutral-600 dark:text-neutral-400">{unanswered}</p>
                  <p className="text-xs text-neutral-500">Skipped</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Info */}
          <GlassCard>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              <Layers className="h-5 w-5 text-blue-500" />
              Exam Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Total Questions</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{totalQuestions}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Total Marks</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{exam.total_marks}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Passing %</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{passingPercentage}%</span>
              </div>
              {exam.exam_structures && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Blueprint</span>
                  <Link 
                    href={`/dashboard/exam-structures/${exam.exam_structures.id}`}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {exam.exam_structures.name_en}
                  </Link>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Class Level Info */}
          {exam.scheduled_exams?.class_levels && (
            <GlassCard>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                <User className="h-5 w-5 text-purple-500" />
                Class Info
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-400 to-pink-500 text-white font-bold">
                  {exam.scheduled_exams.class_levels.name_en.replace(/[^0-9]/g, "") || "C"}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {exam.scheduled_exams.class_levels.name_en}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {exam.scheduled_exams.class_levels.name_mr}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
