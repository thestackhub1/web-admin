// Question answer_data types for all 8 question types

export interface FillBlankAnswerData {
  blanks: string[];
}

export interface TrueFalseAnswerData {
  correct: boolean;
}

export interface McqSingleAnswerData {
  options: string[];
  correct: number;
}

export interface McqTwoAnswerData {
  options: string[];
  correct: [number, number];
}

export interface McqThreeAnswerData {
  options: string[];
  correct: [number, number, number];
}

export interface MatchAnswerData {
  left: string[];
  right: string[];
  pairs: Record<string, string>;
}

export interface ShortAnswerData {
  answers: string[];
}

export interface ProgrammingAnswerData {
  expected_output?: string;
  starter_code?: string;
}

export interface LongAnswerData {
  sample_answer?: string;
  key_points?: string[];
  max_words?: number;
}

export type AnswerData =
  | FillBlankAnswerData
  | TrueFalseAnswerData
  | McqSingleAnswerData
  | McqTwoAnswerData
  | McqThreeAnswerData
  | MatchAnswerData
  | ShortAnswerData
  | ProgrammingAnswerData
  | LongAnswerData;

export const questionTypes = [
  "fill_blank",
  "true_false",
  "mcq_single",
  "mcq_two",
  "mcq_three",
  "match",
  "short_answer",
  "long_answer",
  "programming",
] as const;

export type QuestionType = (typeof questionTypes)[number];

export const questionTypeLabels: Record<QuestionType, string> = {
  fill_blank: "Fill in the Blank",
  true_false: "True / False",
  mcq_single: "MCQ (1 Correct)",
  mcq_two: "MCQ (2 Correct)",
  mcq_three: "MCQ (3 Correct)",
  match: "Match the Pairs",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  programming: "Programming",
};

export const difficulties = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof difficulties)[number];

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// Subject table mapping
export const subjectTableMap: Record<string, string> = {
  scholarship: "questions_scholarship",
  english: "questions_english",
  "information-technology": "questions_information_technology",
};

export const subjectDisplayMap: Record<string, string> = {
  scholarship: "Scholarship",
  english: "English",
  "information-technology": "Information Technology",
};

export const subjectSlugMap: Record<string, string> = {
  scholarship: "scholarship",
  english: "english",
  information_technology: "information-technology",
};

// Get default language for a subject
export function getDefaultLanguageForSubject(subjectSlug: string): "en" | "mr" {
  if (subjectSlug === "scholarship") {
    return "mr";
  }
  // english and information-technology default to English
  return "en";
}

// Question form values
export interface QuestionFormValues {
  id?: string;
  questionText: string;
  questionLanguage: "en" | "mr";
  questionType: QuestionType;
  difficulty: Difficulty;
  chapterId: string | null;
  explanation: string; // Single explanation field (language matches questionLanguage)
  tags: string[];
  classLevel: string; // Required for better readability
  isActive: boolean;
  answerData: AnswerData;
  marks: number; // Added for weighted scoring
}

// Full question type from database
export interface Question {
  id: string;
  question_text: string;
  question_language: "en" | "mr";
  question_type: QuestionType;
  difficulty: Difficulty;
  answer_data: AnswerData;
  explanation?: string | null; // Single explanation field (language matches question_language)
  tags: string[];
  class_level: string; // Required
  chapter_id?: string | null;
  marks: number;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Default answer data for each question type
export function getDefaultAnswerData(type: QuestionType): AnswerData {
  switch (type) {
    case "fill_blank":
      return { blanks: [""] };
    case "true_false":
      return { correct: true };
    case "mcq_single":
      return { options: ["", "", "", ""], correct: 0 };
    case "mcq_two":
      return { options: ["", "", "", ""], correct: [0, 1] };
    case "mcq_three":
      return { options: ["", "", "", ""], correct: [0, 1, 2] };
    case "match":
      return { left: ["", ""], right: ["", ""], pairs: { "0": "0", "1": "1" } };
    case "short_answer":
      return { answers: [""] };
    case "long_answer":
      return { sample_answer: "", key_points: [], max_words: 500 };
    case "programming":
      return { expected_output: "", starter_code: "" };
    default:
      return { blanks: [""] };
  }
}
