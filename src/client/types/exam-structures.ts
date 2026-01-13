/**
 * Exam Structure Types
 * 
 * TypeScript interfaces for exam structures and sections.
 * The sections array is stored as JSONB in the database.
 */

import type { QuestionType } from "./questions";

/**
 * Configuration for how many questions to pick from a specific chapter.
 * Used when admins want precise control over question distribution.
 */
export interface ChapterQuestionConfig {
    /** UUID of the chapter */
    chapter_id: string;
    /** Number of questions to pick from this chapter */
    question_count: number;
}

/**
 * Section within an exam structure.
 * Defines a group of questions with specific type, count, and marks.
 */
export interface ExamSection {
    /** Unique identifier for the section */
    id: string;
    /** Section code (e.g., "q1", "q2") */
    code: string;
    /** Section name in English */
    name_en: string;
    /** Section name in Marathi */
    name_mr: string;
    /** Type of questions in this section */
    question_type: QuestionType;
    /** Number of questions to include */
    question_count: number;
    /** Marks awarded per question */
    marks_per_question: number;
    /** Total marks for this section (question_count × marks_per_question) */
    total_marks: number;
    /** Instructions shown to students (English) */
    instructions_en: string;
    /** Instructions shown to students (Marathi) */
    instructions_mr: string;
    /** Order of this section in the exam */
    order_index: number;
    /**
     * Per-chapter question allocation.
     * Specifies exactly how many questions to pick from each chapter.
     * If undefined or empty, questions are pulled randomly from all chapters.
     * 
     * Example: [
     *   { chapter_id: "uuid1", question_count: 3 },
     *   { chapter_id: "uuid2", question_count: 2 }
     * ]
     */
    chapter_configs?: ChapterQuestionConfig[];
    /**
     * Manually selected question IDs for this section.
     * When provided, these specific questions will be used instead of random selection.
     * Takes precedence over chapter_configs for question selection.
     * 
     * Example: ["question-uuid-1", "question-uuid-2", "question-uuid-3"]
     */
    selected_question_ids?: string[];
    /**
     * @deprecated Use chapter_configs instead for per-chapter control.
     * Legacy: Array of chapter IDs (pulls random questions from these chapters).
     */
    chapter_ids?: string[];
}

/**
 * Exam Structure (Blueprint)
 * Defines the template for generating exams.
 */
export interface ExamStructure {
    id: string;
    name_en: string;
    name_mr: string;
    description_en?: string;
    description_mr?: string;
    subject_id: string;
    class_level?: string;
    class_level_id?: string | null;
    is_template?: boolean;
    duration_minutes: number;
    total_questions: number;
    total_marks: number;
    passing_percentage: number;
    sections: ExamSection[];
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Data required to create a new exam structure
 */
export interface CreateExamStructureData {
    name_en: string;
    name_mr: string;
    description_en?: string;
    description_mr?: string;
    subject_id: string;
    class_level?: string;
    class_level_id?: string | null;
    is_template?: boolean;
    duration_minutes: number;
    total_questions?: number;
    total_marks: number;
    passing_percentage: number;
    sections?: ExamSection[];
    is_active?: boolean;
}

/**
 * Data for updating an exam structure
 */
export type UpdateExamStructureData = Partial<CreateExamStructureData>;
