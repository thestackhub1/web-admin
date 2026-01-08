// Class Levels Types

export interface ClassLevel {
  id: string;
  name_en: string;
  name_mr: string;
  slug: string;
  description_en?: string | null;
  description_mr?: string | null;
  icon: string;
  color: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassLevelWithStats extends ClassLevel {
  subject_count: number;
  scheduled_exam_count: number;
  student_count?: number;
}

export interface SubjectClassMapping {
  id: string;
  subject_id: string;
  class_level_id: string;
  is_active: boolean;
  created_at: string;
}

export interface SubjectClassMappingWithDetails extends SubjectClassMapping {
  subject?: {
    id: string;
    name_en: string;
    name_mr: string;
    slug: string;
  };
  class_level?: ClassLevel;
}

// Scheduled Exam Status
export const scheduledExamStatuses = [
  "draft",
  "published",
  "in_progress",
  "completed",
  "archived",
] as const;

export type ScheduledExamStatus = (typeof scheduledExamStatuses)[number];

export const scheduledExamStatusLabels: Record<ScheduledExamStatus, string> = {
  draft: "Draft",
  published: "Published",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
};

export const scheduledExamStatusColors: Record<ScheduledExamStatus, string> = {
  draft: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  archived: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export interface ScheduledExam {
  id: string;
  class_level_id: string;
  subject_id: string;
  exam_structure_id?: string | null;
  name_en: string;
  name_mr: string;
  description_en?: string | null;
  description_mr?: string | null;
  total_marks: number;
  duration_minutes: number;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  status: ScheduledExamStatus;
  order_index: number;
  is_active: boolean;
  publish_results: boolean;
  max_attempts: number; // 0 = unlimited
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledExamWithDetails extends ScheduledExam {
  class_level?: ClassLevel;
  subject?: {
    id: string;
    name_en: string;
    name_mr: string;
    slug: string;
  };
  exam_structure?: {
    id: string;
    name_en: string;
    name_mr: string;
    sections: ExamSection[];
  };
  attempt_count?: number;
  avg_score?: number;
}

// Import type for ExamSection
import type { ExamSection } from "./exam-structures";

// Form values for creating/editing scheduled exams
export interface ScheduledExamFormValues {
  id?: string;
  name_en: string;
  name_mr: string;
  description_en?: string;
  description_mr?: string;
  class_level_id: string;
  subject_id: string;
  exam_structure_id?: string;
  total_marks: number;
  duration_minutes: number;
  scheduled_date?: string;
  scheduled_time?: string;
  status: ScheduledExamStatus;
  order_index?: number;
  is_active: boolean;
  publish_results: boolean;
  max_attempts?: number; // 0 = unlimited
}

// Class Level Form Values
export interface ClassLevelFormValues {
  id?: string;
  name_en: string;
  name_mr: string;
  slug: string;
  description_en?: string;
  description_mr?: string;
  icon: string;
  color: string;
  order_index?: number;
  is_active: boolean;
}

// Color options for class levels
export const classLevelColors = [
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "amber", label: "Amber", class: "bg-amber-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
] as const;

export type ClassLevelColor = (typeof classLevelColors)[number]["value"];

// Gradient map for class level cards
export const classLevelGradients: Record<string, string> = {
  purple: "from-purple-500/20 via-purple-400/10 to-pink-500/20",
  blue: "from-blue-500/20 via-blue-400/10 to-cyan-500/20",
  green: "from-green-500/20 via-green-400/10 to-emerald-500/20",
  amber: "from-amber-500/20 via-amber-400/10 to-amber-500/20",
  red: "from-red-500/20 via-red-400/10 to-rose-500/20",
  pink: "from-pink-500/20 via-pink-400/10 to-rose-500/20",
  cyan: "from-cyan-500/20 via-cyan-400/10 to-teal-500/20",
};

// Icon options for class levels
export const classLevelIcons = [
  { value: "📚", label: "Books" },
  { value: "🎓", label: "Graduate" },
  { value: "📖", label: "Open Book" },
  { value: "✏️", label: "Pencil" },
  { value: "🔬", label: "Science" },
  { value: "💻", label: "Computer" },
  { value: "🧮", label: "Math" },
  { value: "8️⃣", label: "Number 8" },
  { value: "9️⃣", label: "Number 9" },
  { value: "🔟", label: "Number 10" },
  { value: "1️⃣1️⃣", label: "Number 11" },
  { value: "1️⃣2️⃣", label: "Number 12" },
] as const;
