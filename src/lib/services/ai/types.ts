/**
 * AI Service Types
 * Standardized types for question extraction from PDFs
 */

import { z } from 'zod';

/**
 * Supported AI models for extraction
 */
export type AIModel = 
  | 'gpt-4o' 
  | 'gpt-4o-mini' 
  | 'claude-3-5-sonnet-20241022'
  | 'llama-3.1-70b-versatile';

/**
 * Model configuration
 */
export interface ModelConfig {
  id: AIModel;
  name: string;
  provider: 'openai' | 'anthropic' | 'groq';
  description: string;
  costPer1kTokens?: number;
  maxTokens?: number;
}

/**
 * Question type enum for extraction
 */
export const QuestionTypeEnum = z.enum([
  'mcq_single',
  'mcq_multiple',
  'mcq_two',
  'mcq_three',
  'fill_blank',
  'true_false',
  'match',
  'short_answer',
  'long_answer',
  'programming',
]);

/**
 * Zod schema for extracted question (Maharashtra Scholarship format)
 * Making optional fields nullable but required to satisfy OpenAI's strict JSON Schema validator
 * OpenAI requires all properties to be in the required array, so we make them required but nullable
 */
export const ExtractedQuestionSchema = z.object({
  number: z.number().int().positive(),
  text_mr: z.string().min(1, 'Marathi question text is required'),
  type: QuestionTypeEnum,
  marks: z.number().int().positive(),
  // Optional fields - making them required but nullable to satisfy OpenAI's JSON Schema requirements
  text_en: z.string().nullable(),
  options: z.array(z.string()).nullable(),
  correct_answers: z.array(z.union([
    z.number().int().nonnegative(),
    z.string(),
  ])).nullable(),
  correct_answer: z.union([
    z.number().int().nonnegative(),
    z.array(z.number().int().nonnegative()),
    z.string(),
    z.boolean(),
  ]).nullable(),
  section: z.string().nullable(),
  explanation_mr: z.string().nullable(),
  explanation_en: z.string().nullable(),
});

/**
 * Zod schema for extraction metadata (Maharashtra Scholarship format)
 * Making optional fields nullable but required to satisfy OpenAI's strict JSON Schema validator
 */
export const ExtractionMetadataSchema = z.object({
  total_questions: z.number().int().nonnegative(),
  paper_number: z.enum(['I', 'II']).nullable(),
  subject: z.string().nullable(),
  paper_name: z.string().nullable(),
  exam_type: z.string().nullable(),
  class_level: z.string().nullable(),
  instructions: z.string().nullable(),
  sections: z.array(z.object({
    name: z.string(),
    question_range: z.string(),
  })).nullable(),
});

/**
 * Zod schema for complete extraction result
 */
export const ExtractionResultSchema = z.object({
  questions: z.array(ExtractedQuestionSchema),
  metadata: ExtractionMetadataSchema,
});

/**
 * TypeScript types derived from Zod schemas
 */
export type ExtractedQuestion = z.infer<typeof ExtractedQuestionSchema>;
export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

/**
 * Extraction options
 */
export interface ExtractionOptions {
  model: AIModel;
  includeEnglish?: boolean;
  strictMode?: boolean;
  maxQuestions?: number;
  timeout?: number;
  scholarshipMode?: boolean; // Enable Maharashtra Scholarship Exam specific extraction
}

/**
 * Extraction progress callback
 */
export type ProgressCallback = (progress: {
  stage: 'uploading' | 'processing' | 'extracting' | 'complete';
  message: string;
  percentage?: number;
  currentQuestion?: number;
  totalQuestions?: number;
}) => void;

