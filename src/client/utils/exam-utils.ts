// Client-side only — no server secrets or database access here

/**
 * Exam Utilities - Single Source of Truth for Answer Checking & Result Handling
 * 
 * This module provides consistent answer checking logic across the application.
 * Use these utilities in both API routes and client-side components.
 * 
 * SUPPORTED QUESTION TYPES:
 * ─────────────────────────
 * 1. mcq_single/mcq - Single choice MCQ
 *    Answer Data: { options: ["A", "B", "C", "D"], correct: 0 }
 *    User Answer: number (index) or string (option text)
 * 
 * 2. mcq_two - MCQ with exactly 2 correct answers
 *    Answer Data: { options: ["A", "B", "C", "D"], correct: [0, 2] }
 *    User Answer: number[] (array of indices)
 * 
 * 3. mcq_three - MCQ with exactly 3 correct answers
 *    Answer Data: { options: ["A", "B", "C", "D", "E"], correct: [0, 1, 3] }
 *    User Answer: number[] (array of indices)
 * 
 * 4. mcq_multiple - MCQ with multiple correct answers
 *    Answer Data: { options: [...], correct: number[] }
 *    User Answer: number[] (array of indices)
 * 
 * 5. true_false/tf - True/False question
 *    Answer Data: { correct: true/false }
 *    User Answer: boolean or string ("true"/"false")
 * 
 * 6. fill_blank - Fill in the blank (single or multiple blanks)
 *    Answer Data: { blanks: ["answer1", "answer2"] } or { blanks: [["ans1a", "ans1b"], ["ans2"]] }
 *    User Answer: string (single) or string[] (multiple blanks)
 * 
 * 7. match - Match the following
 *    Answer Data: { pairs: [{left: "A", right: "1"}, {left: "B", right: "2"}] }
 *    User Answer: { "A": "1", "B": "2" } (object mapping left to right)
 * 
 * 8. short_answer - Short text answer (requires manual grading)
 *    Answer Data: { keywords: [...], sampleAnswer: "..." }
 *    User Answer: string
 * 
 * 9. long_answer - Long text answer (requires manual grading)
 *    Answer Data: { keywords: [...], sampleAnswer: "..." }
 *    User Answer: string
 * 
 * 10. programming - Code answer (requires manual grading)
 *     Answer Data: { answer: "..." }
 *     User Answer: string (code)
 * 
 * KEY FEATURES:
 * - Handles JSON string answer_data (auto-parsing)
 * - Type coercion for flexible input handling (string "0" == number 0)
 * - Case-insensitive string comparisons for fill_blank
 * - Support for multiple acceptable answers per blank
 */

// ============================================
// Types
// ============================================

export type QuestionType = 
  | 'mcq_single' 
  | 'mcq' 
  | 'mcq_multiple' 
  | 'mcq_two' 
  | 'mcq_three'
  | 'true_false' 
  | 'tf'
  | 'fill_blank'
  | 'match'
  | 'short_answer'
  | 'long_answer'
  | 'programming';

export interface AnswerData {
  // MCQ types
  options?: string[];
  correct?: number | number[] | boolean;
  // Fill in the blank
  blanks?: string[] | string[][];
  // Match type
  pairs?: Array<{ left: string; right: string; left_en?: string; right_en?: string }>;
  // Short/Long answer
  answer?: string;
  sampleAnswer?: string;
  keywords?: string[];
}

export interface Question {
  id: string;
  question_type: QuestionType | string;
  answer_data: AnswerData | string; // Can be JSON string or parsed object
  marks?: number;
}

export interface AnswerCheckResult {
  isCorrect: boolean;
  userAnswerFormatted: string | null;
  correctAnswerFormatted: string;
  requiresManualGrading: boolean;
}

// ============================================
// Type Conversion Helpers
// ============================================

/**
 * Convert a value to a number (for index-based answers)
 * Handles: number, string (numeric), returns null for invalid
 */
export function toNumber(val: unknown): number | null {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Convert a value to a boolean
 * Handles: boolean, string ('true'/'false'/'1'/'0'/'yes'/'no'), number (1/0)
 */
export function toBoolean(val: unknown): boolean | null {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  if (typeof val === 'number') {
    if (val === 1) return true;
    if (val === 0) return false;
  }
  return null;
}

/**
 * Normalize a string for comparison (lowercase, trimmed)
 */
export function normalizeString(val: unknown): string {
  if (typeof val === 'string') return val.toLowerCase().trim();
  if (val === null || val === undefined) return '';
  return String(val).toLowerCase().trim();
}

// ============================================
// Answer Checking Functions
// ============================================

/**
 * Option labels for MCQ questions
 */
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Convert option label (A, B, C, D) to index (0, 1, 2, 3)
 */
function labelToIndex(label: unknown): number | null {
  if (typeof label === 'string') {
    const upper = label.toUpperCase().trim();
    const idx = OPTION_LABELS.indexOf(upper);
    return idx >= 0 ? idx : null;
  }
  return null;
}

/**
 * Convert user answer to index - handles both label strings and number indices
 * Mobile sends "A", "B", "C" etc but we need indices to compare with answer_data.correct
 */
function userAnswerToIndex(userAnswer: unknown): number | null {
  // First try as number
  const num = toNumber(userAnswer);
  if (num !== null) return num;
  
  // Then try as label string
  return labelToIndex(userAnswer);
}

/**
 * Check if an MCQ single answer is correct
 * Handles user answers as both indices (0, 1, 2, 3) and labels ("A", "B", "C", "D")
 */
export function checkMcqSingle(userAnswer: unknown, correctIndex: unknown): boolean {
  const userIdx = userAnswerToIndex(userAnswer);
  const correctIdx = toNumber(correctIndex);
  if (userIdx === null || correctIdx === null) return false;
  return userIdx === correctIdx;
}

/**
 * Check if an MCQ multiple answer is correct
 * Handles user answers as both indices (0, 1, 2, 3) and labels ("A", "B", "C", "D")
 */
export function checkMcqMultiple(userAnswer: unknown, correctIndices: unknown): boolean {
  if (!Array.isArray(userAnswer) || !Array.isArray(correctIndices)) {
    return false;
  }
  
  const sortedUser = userAnswer
    .map((v) => userAnswerToIndex(v))
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);
    
  const sortedCorrect = correctIndices
    .map((v) => toNumber(v))
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);
    
  return (
    sortedUser.length === sortedCorrect.length &&
    sortedUser.every((v, i) => v === sortedCorrect[i])
  );
}

/**
 * Check if a true/false answer is correct
 */
export function checkTrueFalse(userAnswer: unknown, correctAnswer: unknown): boolean {
  const userBool = toBoolean(userAnswer);
  const correctBool = toBoolean(correctAnswer);
  if (userBool === null || correctBool === null) return false;
  return userBool === correctBool;
}

/**
 * Check if a fill-in-the-blank answer is correct
 */
export function checkFillBlank(userAnswer: unknown, blanks: string[] | string[][]): boolean {
  if (!blanks || !Array.isArray(blanks)) {
    return false;
  }
  
  // Single blank: check if userAnswer matches any acceptable answer
  if (typeof userAnswer === 'string') {
    const userNormalized = normalizeString(userAnswer);
    return blanks.some((blank) => {
      if (typeof blank === 'string') {
        return userNormalized === normalizeString(blank);
      }
      return false;
    });
  }
  
  // Multiple blanks: each answer must match the corresponding blank
  if (Array.isArray(userAnswer)) {
    return userAnswer.every((ans, i) => {
      const acceptable = Array.isArray(blanks[i]) ? blanks[i] : [blanks[i]];
      const userNormalized = normalizeString(ans);
      return acceptable.some((blank) => userNormalized === normalizeString(blank));
    });
  }
  
  return false;
}

/**
 * Check if a match answer is correct
 */
export function checkMatch(
  userAnswer: unknown, 
  pairs: Array<{ left: string; right: string; left_en?: string; right_en?: string }>
): boolean {
  if (typeof userAnswer !== 'object' || !userAnswer || !Array.isArray(pairs)) {
    return false;
  }
  
  const userMatches = userAnswer as Record<string, string>;
  
  return pairs.every((pair) => {
    const userMatch = userMatches[pair.left] || userMatches[pair.left_en || ''];
    return userMatch === pair.right || userMatch === pair.right_en;
  });
}

// ============================================
// Main Answer Checking Function
// ============================================

/**
 * Parse answer_data - handles both string and object formats
 * Database may store answer_data as JSON string or already parsed object
 */
export function parseAnswerData(answerData: unknown): AnswerData | null {
  if (!answerData) return null;
  
  // Already an object
  if (typeof answerData === 'object' && answerData !== null) {
    return answerData as AnswerData;
  }
  
  // JSON string - parse it
  if (typeof answerData === 'string') {
    try {
      return JSON.parse(answerData) as AnswerData;
    } catch {
      console.error('[exam-utils] Failed to parse answer_data string:', answerData);
      return null;
    }
  }
  
  return null;
}

/**
 * Check if an answer is correct based on question type
 * 
 * Answer data schema:
 * - mcq_single: { options: [...], correct: <index> }
 * - mcq_two/mcq_three/mcq_multiple: { options: [...], correct: [<indices>] }
 * - true_false: { correct: boolean }
 * - fill_blank: { blanks: [<acceptable answers>] }
 * - match: { pairs: [{left, right}, ...] }
 */
export function checkAnswer(question: Question | null | undefined, userAnswer: unknown): boolean {
  if (!question?.answer_data || userAnswer === undefined || userAnswer === null) {
    return false;
  }

  // Parse answer_data - handles both string and object formats
  const data = parseAnswerData(question.answer_data);
  if (!data) {
    console.error('[exam-utils] Could not parse answer_data for question:', question.id);
    return false;
  }
  
  const questionType = question.question_type;

  switch (questionType) {
    case 'mcq_single':
    case 'mcq':
      return checkMcqSingle(userAnswer, data.correct);

    case 'true_false':
    case 'tf':
      return checkTrueFalse(userAnswer, data.correct);

    case 'mcq_two':
    case 'mcq_three':
    case 'mcq_multiple':
      return checkMcqMultiple(userAnswer, data.correct);

    case 'fill_blank':
      return checkFillBlank(userAnswer, data.blanks as string[] | string[][]);

    case 'match':
      return checkMatch(userAnswer, data.pairs || []);

    case 'short_answer':
    case 'long_answer':
    case 'programming':
      // These require manual grading - auto-check not possible
      return false;

    default:
      return false;
  }
}

/**
 * Check if a question type requires manual grading
 */
export function requiresManualGrading(questionType: string): boolean {
  return ['short_answer', 'long_answer', 'programming'].includes(questionType);
}

// ============================================
// Answer Formatting Functions
// ============================================

/**
 * Format a user's answer for display
 */
export function formatUserAnswer(
  userAnswer: unknown, 
  questionType: string, 
  answerData: AnswerData | string | null | undefined
): string {
  if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
    return 'No answer provided';
  }

  // Parse answer_data if it's a string
  const data = parseAnswerData(answerData);
  const options = data?.options || [];

  switch (questionType) {
    case 'mcq_single':
    case 'mcq': {
      const idx = toNumber(userAnswer);
      if (idx !== null && options[idx]) {
        return options[idx];
      }
      // Could be the option text directly
      if (typeof userAnswer === 'string' && userAnswer.trim()) {
        return userAnswer;
      }
      return 'Invalid answer';
    }

    case 'mcq_multiple':
    case 'mcq_two':
    case 'mcq_three': {
      if (Array.isArray(userAnswer) && userAnswer.length > 0) {
        const formatted = userAnswer.map((ans) => {
          const idx = toNumber(ans);
          if (idx !== null && options[idx]) {
            return options[idx];
          }
          return typeof ans === 'string' ? ans : String(ans);
        });
        return formatted.join(', ');
      }
      return 'No answer provided';
    }

    case 'true_false':
    case 'tf': {
      const bool = toBoolean(userAnswer);
      if (bool !== null) {
        return bool ? 'True' : 'False';
      }
      return String(userAnswer);
    }

    case 'fill_blank': {
      if (Array.isArray(userAnswer)) {
        return userAnswer.join(', ');
      }
      return String(userAnswer);
    }

    case 'match': {
      if (typeof userAnswer === 'object' && userAnswer !== null) {
        const entries = Object.entries(userAnswer);
        if (entries.length > 0) {
          return entries.map(([left, right]) => `${left} → ${right}`).join(', ');
        }
      }
      return 'No answer provided';
    }

    case 'short_answer':
    case 'long_answer':
      return String(userAnswer);

    case 'programming':
      return String(userAnswer);

    default:
      return typeof userAnswer === 'object' ? JSON.stringify(userAnswer) : String(userAnswer);
  }
}

/**
 * Format the correct answer for display
 */
export function formatCorrectAnswer(
  questionType: string, 
  answerData: AnswerData | string | null | undefined
): string {
  // Parse answer_data if it's a string
  const data = parseAnswerData(answerData);
  if (!data) return 'N/A';

  const options = data.options || [];

  switch (questionType) {
    case 'mcq_single':
    case 'mcq': {
      const correctIdx = toNumber(data.correct);
      if (correctIdx !== null && options[correctIdx]) {
        return options[correctIdx];
      }
      return 'Answer not available';
    }

    case 'mcq_multiple':
    case 'mcq_two':
    case 'mcq_three': {
      const correctIndices = data.correct;
      if (!Array.isArray(correctIndices) || correctIndices.length === 0) {
        return 'Answer not available';
      }
      return correctIndices
        .map((idx) => {
          const i = toNumber(idx);
          return i !== null && options[i] ? options[i] : `Option ${(i || 0) + 1}`;
        })
        .join(', ');
    }

    case 'true_false':
    case 'tf': {
      const correct = toBoolean(data.correct);
      return correct === true ? 'True' : 'False';
    }

    case 'fill_blank': {
      const blanks = data.blanks || [];
      if (!Array.isArray(blanks) || blanks.length === 0) {
        return 'Answer not available';
      }
      return blanks.map((b) => (Array.isArray(b) ? b.join(' / ') : b)).join(', ');
    }

    case 'match': {
      const pairs = data.pairs || [];
      if (!Array.isArray(pairs) || pairs.length === 0) {
        return 'Answer not available';
      }
      return pairs.map((p) => `${p.left} → ${p.right}`).join(', ');
    }

    case 'short_answer':
    case 'long_answer':
    case 'programming':
      // Support both 'answer' and 'sampleAnswer' keys
      return data.answer || data.sampleAnswer || 'See explanation';

    default:
      return 'See explanation';
  }
}

// ============================================
// User Answer Selection Detection (for UI)
// ============================================

/**
 * Check if a specific option index was selected by the user (for MCQ display)
 */
export function isOptionSelected(
  userAnswer: unknown, 
  optionIndex: number, 
  options: string[]
): boolean {
  if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
    return false;
  }

  if (Array.isArray(userAnswer)) {
    // MCQ multiple - array of indices or option texts
    return userAnswer.some((ans) => {
      const idx = toNumber(ans);
      if (idx !== null) return idx === optionIndex;
      if (typeof ans === 'string') {
        return ans === options[optionIndex] || 
               normalizeString(ans) === normalizeString(options[optionIndex]);
      }
      return false;
    });
  }

  // MCQ single
  const idx = toNumber(userAnswer);
  if (idx !== null) return idx === optionIndex;
  
  if (typeof userAnswer === 'string') {
    return userAnswer === options[optionIndex] || 
           normalizeString(userAnswer) === normalizeString(options[optionIndex]);
  }

  return false;
}

/**
 * Check if a specific boolean value was selected by the user (for True/False display)
 */
export function isBooleanSelected(userAnswer: unknown, value: boolean): boolean {
  if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
    return false;
  }

  const userBool = toBoolean(userAnswer);
  return userBool === value;
}

// ============================================
// Result Calculation Helpers
// ============================================

export interface ExamResultStats {
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassing: boolean;
}

/**
 * Calculate exam result statistics
 */
export function calculateExamStats(
  answers: Array<{ 
    user_answer: unknown; 
    is_correct: boolean | null; 
    marks_obtained: number;
    question?: { marks?: number } | null;
  }>,
  totalMarks: number,
  passingPercentage: number = 35
): ExamResultStats {
  const totalQuestions = answers.length;
  let attemptedQuestions = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let obtainedMarks = 0;

  for (const answer of answers) {
    if (answer.user_answer !== null && answer.user_answer !== undefined && answer.user_answer !== '') {
      attemptedQuestions++;
    }
    
    if (answer.is_correct === true) {
      correctAnswers++;
    } else if (answer.is_correct === false) {
      wrongAnswers++;
    }
    
    obtainedMarks += answer.marks_obtained || 0;
  }

  const unanswered = totalQuestions - attemptedQuestions;
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const isPassing = percentage >= passingPercentage;

  return {
    totalQuestions,
    attemptedQuestions,
    correctAnswers,
    wrongAnswers,
    unanswered,
    totalMarks,
    obtainedMarks,
    percentage,
    isPassing,
  };
}
