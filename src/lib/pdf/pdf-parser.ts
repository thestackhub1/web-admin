/**
 * PDF Parsing Utilities
 * 
 * Handles extraction and parsing of questions from PDF files.
 * Supports both text-based PDFs and scanned PDFs (via OCR).
 */

import pdfParse from 'pdf-parse';

export interface ParsedQuestion {
  questionNumber?: number;
  questionTextMr: string;
  questionTextEn?: string;
  options: string[]; // A, B, C, D
  correctAnswer?: number; // 0-3 index
  questionType: string; // Default: 'mcq_single'
  chapterId?: string;
  marks?: number;
  difficulty?: string;
  explanation?: string; // Single explanation field (language matches question text)
  parsingErrors?: string[];
}

export interface ParsedPage {
  pageNumber: number;
  text: string;
  questions: ParsedQuestion[];
}

/**
 * Extract text from PDF buffer
 */
export async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Parse PDF text into questions
 * This is a basic parser - can be enhanced with ML/NLP for better accuracy
 */
export function parseQuestionsFromText(
  text: string,
  _options: {
    questionPattern?: RegExp;
    optionPattern?: RegExp;
    answerKeyPattern?: RegExp;
  } = {}
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  // Default patterns for Marathi scholarship exam papers


  // Split text into potential question blocks
  // Look for question numbers (1., 2., etc.)


  let currentQuestion: Partial<ParsedQuestion> | null = null;
  let questionText = '';
  let questionOptions: string[] = [];

  const lines = text.split('\n').filter(line => line.trim().length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line starts a new question (number followed by dot)
    const questionMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && questionText) {
        if (questionOptions.length === 4) {
          questions.push({
            questionTextMr: questionText.trim(),
            questionTextEn: currentQuestion.questionTextEn || '',
            options: questionOptions,
            correctAnswer: currentQuestion.correctAnswer,
            questionType: currentQuestion.questionType || 'mcq_single',
            marks: currentQuestion.marks || 1,
            difficulty: currentQuestion.difficulty || 'medium',
            parsingErrors: currentQuestion.parsingErrors,
          });
        } else {
          questions.push({
            questionTextMr: questionText.trim(),
            questionTextEn: currentQuestion.questionTextEn || '',
            options: questionOptions.length > 0 ? questionOptions : ['', '', '', ''],
            questionType: currentQuestion.questionType || 'mcq_single',
            marks: currentQuestion.marks || 1,
            difficulty: currentQuestion.difficulty || 'medium',
            parsingErrors: [
              ...(currentQuestion.parsingErrors || []),
              questionOptions.length !== 4 ? `Expected 4 options, found ${questionOptions.length}` : '',
            ].filter(Boolean),
          });
        }
      }

      // Start new question
      const questionNum = parseInt(questionMatch[1]);
      questionText = questionMatch[2];
      questionOptions = [];
      currentQuestion = {
        questionNumber: questionNum,
        questionType: 'mcq_single',
        marks: 1,
        difficulty: 'medium',
        parsingErrors: [],
      };
      continue;
    }

    // Check if line is an option (A., B., C., D.)
    const optionMatch = line.match(/^([A-D])\.\s*(.+)$/);
    if (optionMatch && currentQuestion) {
      const optionIndex = optionMatch[1].charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      questionOptions[optionIndex] = optionMatch[2].trim();
      continue;
    }

    // If we have a current question but no option yet, append to question text
    if (currentQuestion && questionOptions.length === 0) {
      questionText += ' ' + line;
    }
  }

  // Save last question
  if (currentQuestion && questionText) {
    if (questionOptions.length === 4) {
      questions.push({
        questionTextMr: questionText.trim(),
        questionTextEn: currentQuestion.questionTextEn || '',
        options: questionOptions,
        correctAnswer: currentQuestion.correctAnswer,
        questionType: currentQuestion.questionType || 'mcq_single',
        marks: currentQuestion.marks || 1,
        difficulty: currentQuestion.difficulty || 'medium',
        parsingErrors: currentQuestion.parsingErrors,
      });
    } else {
      questions.push({
        questionTextMr: questionText.trim(),
        questionTextEn: currentQuestion.questionTextEn || '',
        options: questionOptions.length > 0 ? questionOptions : ['', '', '', ''],
        questionType: currentQuestion.questionType || 'mcq_single',
        marks: currentQuestion.marks || 1,
        difficulty: currentQuestion.difficulty || 'medium',
        parsingErrors: [
          ...(currentQuestion.parsingErrors || []),
          questionOptions.length !== 4 ? `Expected 4 options, found ${questionOptions.length}` : '',
        ].filter(Boolean),
      });
    }
  }

  return questions;
}

/**
 * Parse answer key from PDF text (if separate answer key PDF provided)
 */
export function parseAnswerKey(text: string): Record<number, number> {
  const answerKey: Record<number, number> = {};

  // Pattern: "1. A" or "1) A" or "Q1: A"
  const patterns = [
    /(\d+)[.)]\s*([A-D])/gi,
    /Q(\d+)[:\s]+([A-D])/gi,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const questionNum = parseInt(match[1]);
      const answerLetter = match[2].toUpperCase();
      const answerIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      answerKey[questionNum] = answerIndex;
    }
  }

  return answerKey;
}

/**
 * Apply answer key to parsed questions
 */
export function applyAnswerKey(
  questions: ParsedQuestion[],
  answerKey: Record<number, number>
): ParsedQuestion[] {
  return questions.map((q) => {
    if (q.questionNumber && answerKey[q.questionNumber] !== undefined) {
      return {
        ...q,
        correctAnswer: answerKey[q.questionNumber],
      };
    }
    return q;
  });
}

/**
 * Main function to parse PDF and extract questions
 */
export async function parsePdfQuestions(
  pdfBuffer: Buffer,
  answerKeyBuffer?: Buffer
): Promise<ParsedQuestion[]> {
  // Extract text from main PDF
  const pdfText = await extractPdfText(pdfBuffer);

  // Parse questions
  let questions = parseQuestionsFromText(pdfText);

  // If answer key provided, parse and apply it
  if (answerKeyBuffer) {
    const answerKeyText = await extractPdfText(answerKeyBuffer);
    const answerKey = parseAnswerKey(answerKeyText);
    questions = applyAnswerKey(questions, answerKey);
  }

  return questions;
}

