/**
 * Class Levels Constants
 *
 * Static class level options for forms and selects.
 * Previously hard-coded in exam-structure-editor.tsx
 */

/**
 * Static class level options (fallback when dynamic data not available)
 */
export const STATIC_CLASS_LEVELS = [
    { value: "class_8", label: "Class 8" },
    { value: "class_9", label: "Class 9" },
    { value: "class_10", label: "Class 10" },
    { value: "class_11", label: "Class 11" },
    { value: "class_12", label: "Class 12" },
] as const;

/**
 * Question type options for exam section creation
 */
export const QUESTION_TYPE_OPTIONS = [
    { value: "mcq_single", label: "MCQ (Single)", icon: "①" },
    { value: "mcq_two", label: "MCQ (2 Correct)", icon: "②" },
    { value: "mcq_three", label: "MCQ (3 Correct)", icon: "③" },
    { value: "true_false", label: "True/False", icon: "✓✗" },
    { value: "fill_blank", label: "Fill in the Blank", icon: "✏" },
    { value: "match", label: "Match the Pairs", icon: "⇄" },
    { value: "short_answer", label: "Short Answer", icon: "✍" },
    { value: "long_answer", label: "Long Answer", icon: "☰" },
    { value: "programming", label: "Programming", icon: "</>" },
] as const;

/**
 * Default exam duration options (in minutes)
 */
export const EXAM_DURATION_OPTIONS = [
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1 hour 30 minutes" },
    { value: 120, label: "2 hours" },
    { value: 150, label: "2 hours 30 minutes" },
    { value: 180, label: "3 hours" },
] as const;

/**
 * Passing percentage options
 */
export const PASSING_PERCENTAGE_OPTIONS = [
    { value: 33, label: "33%" },
    { value: 35, label: "35%" },
    { value: 40, label: "40%" },
    { value: 50, label: "50%" },
    { value: 60, label: "60%" },
] as const;
