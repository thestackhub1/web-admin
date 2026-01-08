"use client";

import Link from "next/link";
import { Users, FileQuestion, ClipboardList, Target } from "lucide-react";
import { BentoStatCard, StaggerContainer, StaggerItem, SectionHeader } from "@/client/components/ui";

interface DashboardStatsGridProps {
  totalUsers: number;
  activeStudents: number;
  totalQuestions: number;
  questionsBySubjectCount: number;
  totalExams: number;
  completedExams: number;
  averageScore: number;
  passRate: number;
  monthlyEnrollmentGrowth?: number;
  monthlyExamGrowth?: number;
}

/**
 * Dashboard Stats Grid
 * Displays key metrics in a Bento Grid layout
 */
export function DashboardStatsGrid({
  totalUsers,
  activeStudents,
  totalQuestions,
  questionsBySubjectCount,
  totalExams,
  completedExams,
  averageScore,
  passRate,
  monthlyEnrollmentGrowth = 0,
  monthlyExamGrowth = 0,
}: DashboardStatsGridProps) {
  return (
    <section>
      <SectionHeader 
        title="System Overview" 
        icon={Target} 
        iconColor="primary"
      />
      <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
        <StaggerItem className="h-full">
          <Link href="/dashboard/users" className="block h-full">
            <BentoStatCard
              title="Total Users"
              value={totalUsers}
              icon={Users}
              semantic="primary"
              subtitle={`${activeStudents} active students`}
              change={monthlyEnrollmentGrowth >= 0 ? Number(monthlyEnrollmentGrowth.toFixed(1)) : undefined}
            />
          </Link>
        </StaggerItem>
        <StaggerItem className="h-full">
          <Link href="/dashboard/questions" className="block h-full">
            <BentoStatCard
              title="Question Bank"
              value={totalQuestions}
              icon={FileQuestion}
              semantic="insight"
              subtitle={`${questionsBySubjectCount} subjects`}
            />
          </Link>
        </StaggerItem>
        <StaggerItem className="h-full">
          <Link href="/dashboard/exams" className="block h-full">
            <BentoStatCard
              title="Exams Conducted"
              value={totalExams}
              icon={ClipboardList}
              semantic="success"
              subtitle={`${completedExams} completed`}
              change={monthlyExamGrowth >= 0 ? Number(monthlyExamGrowth.toFixed(1)) : undefined}
            />
          </Link>
        </StaggerItem>
        <StaggerItem className="h-full">
          <Link href="/dashboard/analytics" className="block h-full">
            <BentoStatCard
              title="Average Score"
              value={averageScore}
              suffix="%"
              icon={Target}
              semantic="warning"
              subtitle={`Pass rate: ${passRate}%`}
            />
          </Link>
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
}

