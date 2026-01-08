import type { Metadata } from 'next';
import { AnalyticsClient } from '@/client/components/features/analytics/analytics-client';

export const metadata: Metadata = {
  title: "Analytics - The Stack Hub Admin",
  description: "Detailed platform analytics and performance insights",
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
