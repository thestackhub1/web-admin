import type { Metadata } from "next";
import { ClassLevelsClient } from '@/client/components/features/class-levels/class-levels-client';

export const metadata: Metadata = {
  title: "Class Levels - The Stack Hub Admin",
};

export default function ClassLevelsPage() {
  return <ClassLevelsClient />;
}
