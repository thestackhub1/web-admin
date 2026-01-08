/**
 * PDF Generation Types
 */

export type PdfLanguage = "en" | "mr";

export interface ExamPdfConfig {
    examName: string;
    examNameMr?: string;
    subjectName?: string;
    subjectNameMr?: string;
    classLevelName?: string;
    classLevelNameMr?: string;
    totalMarks: number;
    durationMinutes: number;
    instituteName?: string;
    instituteNameMr?: string;
    instructions?: string[];
    instructionsMr?: string[];
    language?: PdfLanguage;
}

export interface ExamPdfSection {
    id: string;
    code: string;
    name_en: string;
    name_mr?: string;
    question_type: string;
    question_count: number;
    marks_per_question: number;
    total_marks: number;
    instructions_en?: string;
    instructions_mr?: string;
    order_index: number;
    questions: ExamPdfQuestion[];
}

export interface ExamPdfQuestion {
    id: string;
    question_text: string;
    question_language: "en" | "mr";
    question_text_secondary?: string | null;
    secondary_language?: "en" | "mr" | null;
    question_type: string;
    difficulty?: string;
    answer_data?: {
        options?: string[];
        type?: string;
        left_column?: string[];
        right_column?: string[];
        blank_count?: number;
    };
}

export interface PdfMargins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface PdfFonts {
    normal: string;
    bold: string;
    italic: string;
}

export const DEFAULT_MARGINS: PdfMargins = {
    top: 20,
    right: 20,
    bottom: 25,
    left: 20,
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
    mcq_single: "Multiple Choice Questions",
    mcq_multiple: "Multiple Choice (Multi-Select)",
    true_false: "True or False",
    fill_blank: "Fill in the Blanks",
    short_answer: "Short Answer Questions",
    long_answer: "Long Answer Questions",
    match: "Match the Following",
    programming: "Programming Questions",
};
