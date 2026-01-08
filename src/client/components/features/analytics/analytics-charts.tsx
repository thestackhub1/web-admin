// Client-side only — no server secrets or database access here

"use client";

import { ChartCard, SubjectPieChart, DifficultyBarChart } from '@/client/components/ui/charts';

interface AnalyticsChartsProps {
  subjectData: { name: string; value: number; color: string }[];
  difficultyData: { name: string; value: number; color: string }[];
}

export function AnalyticsCharts({ subjectData, difficultyData }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Question Distribution" subtitle="By subject area">
        <SubjectPieChart data={subjectData} />
      </ChartCard>

      <ChartCard title="Difficulty Breakdown" subtitle="IT questions by difficulty">
        <DifficultyBarChart data={difficultyData} />
      </ChartCard>
    </div>
  );
}
