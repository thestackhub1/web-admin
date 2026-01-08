/**
 * AI Service - Main Service Layer
 * Handles PDF-to-question extraction using Vercel AI SDK
 */

import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createGroq } from '@ai-sdk/groq';
import { generateObject, streamObject } from 'ai';
import type { AIModel, ExtractionOptions, ExtractionResult, ProgressCallback } from './types';
import { ExtractionResultSchema } from './types';
import { getModelConfig, isModelAvailable } from './providers';
import { createEnhancedExtractionPrompt } from './prompts';
import { extractPdfText } from '@/lib/pdf/pdf-parser';

/**
 * Get AI provider instance based on model
 */
function getProvider(model: AIModel) {
  const config = getModelConfig(model);

  switch (config.provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
      }
      return openai(model);

    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not set');
      }
      return anthropic(model);

    case 'groq': {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not set');
      }
      const groq = createGroq({
        apiKey: process.env.GROQ_API_KEY,
      });
      // Groq uses different model names - map to their format
      const groqModelName = model === 'llama-3.1-70b-versatile' ? 'llama-3.1-70b-versatile' : model;
      return groq(groqModelName);
    }
    default:
      throw new Error(`Unsupported provider for model: ${model}`);
  }
}

/**
 * Extract questions from PDF using AI
 */
export async function extractQuestionsFromPdf(
  pdfBuffer: Buffer,
  options: ExtractionOptions,
  answerKeyBuffer?: Buffer,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  // Validate model availability
  if (!isModelAvailable(options.model)) {
    throw new Error(`Model ${options.model} is not available. Please check API keys.`);
  }

  try {
    // Stage 1: Extract text from PDF
    onProgress?.({
      stage: 'processing',
      message: 'Extracting text from PDF...',
      percentage: 10,
    });

    const pdfText = await extractPdfText(pdfBuffer);

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('No text could be extracted from PDF. The PDF may be image-based or corrupted.');
    }

    // Extract answer key if provided
    let answerKeyText: string | undefined;
    if (answerKeyBuffer) {
      onProgress?.({
        stage: 'processing',
        message: 'Extracting answer key...',
        percentage: 20,
      });
      answerKeyText = await extractPdfText(answerKeyBuffer);
    }

    // Stage 2: AI extraction
    onProgress?.({
      stage: 'extracting',
      message: `Extracting questions using ${getModelConfig(options.model).name}...`,
      percentage: 30,
    });

    const provider = getProvider(options.model);
    const prompt = createEnhancedExtractionPrompt(pdfText, {
      includeAnswerKey: !!answerKeyText,
      answerKeyText,
      scholarshipMode: options.scholarshipMode ?? true, // Default to scholarship mode
    });

    // Use structured output with Zod schema
    const result = await generateObject({
      model: provider,
      schema: ExtractionResultSchema,
      prompt,
      // maxTokens removed as it may not be supported by the current SDK version types
      temperature: 0.1, // Low temperature for consistent extraction
    });

    // Validate and transform result
    const extractionResult = ExtractionResultSchema.parse(result.object);

    // Apply options
    let questions = extractionResult.questions;

    if (options.maxQuestions) {
      questions = questions.slice(0, options.maxQuestions);
    }

    // Sort by question number
    questions.sort((a, b) => a.number - b.number);

    onProgress?.({
      stage: 'complete',
      message: `Successfully extracted ${questions.length} questions`,
      percentage: 100,
      totalQuestions: questions.length,
    });

    return {
      questions,
      metadata: {
        ...extractionResult.metadata,
        total_questions: questions.length,
      },
    };
  } catch (error: unknown) {
    console.error('[AI Service] Extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Provide user-friendly error messages
    if (errorMessage.includes('API key')) {
      throw new Error(`API key not configured for ${options.model}. Please check environment variables.`);
    }

    if (errorMessage.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }

    if (errorMessage.includes('timeout')) {
      throw new Error('Request timed out. The PDF may be too large. Please try a smaller file or different model.');
    }

    throw new Error(errorMessage || 'Failed to extract questions from PDF');
  }
}

/**
 * Stream extraction progress (for real-time UI updates)
 */
export async function* streamExtractionFromPdf(
  pdfBuffer: Buffer,
  options: ExtractionOptions,
  answerKeyBuffer?: Buffer
): AsyncGenerator<{
  stage: 'processing' | 'extracting' | 'complete';
  message: string;
  percentage?: number;
  result?: ExtractionResult;
  error?: string;
}> {
  try {
    // Stage 1: Extract text
    yield {
      stage: 'processing',
      message: 'Extracting text from PDF...',
      percentage: 10,
    };

    const pdfText = await extractPdfText(pdfBuffer);

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('No text could be extracted from PDF');
    }

    let answerKeyText: string | undefined;
    if (answerKeyBuffer) {
      yield {
        stage: 'processing',
        message: 'Extracting answer key...',
        percentage: 20,
      };
      answerKeyText = await extractPdfText(answerKeyBuffer);
    }

    // Stage 2: AI extraction with streaming
    yield {
      stage: 'extracting',
      message: `Extracting questions using ${getModelConfig(options.model).name}...`,
      percentage: 30,
    };

    const provider = getProvider(options.model);
    const prompt = createEnhancedExtractionPrompt(pdfText, {
      includeAnswerKey: !!answerKeyText,
      answerKeyText,
      scholarshipMode: options.scholarshipMode ?? true, // Default to scholarship mode
    });

    // Stream the object generation
    const stream = await streamObject({
      model: provider,
      schema: ExtractionResultSchema,
      prompt,
      // maxTokens removed
      temperature: 0.1,
    });

    let fullResult: ExtractionResult | null = null;

    for await (const chunk of stream.partialObjectStream) {
      // Yield progress updates
      if (chunk.questions && chunk.questions.length > 0) {
        yield {
          stage: 'extracting',
          message: `Extracted ${chunk.questions.length} questions so far...`,
          percentage: 30 + Math.min(60, (chunk.questions.length / 75) * 60),
          result: chunk as ExtractionResult,
        };
      }
    }

    // Get final result
    const finalResult = await stream.object;
    fullResult = ExtractionResultSchema.parse(finalResult);

    // Apply options
    let questions = fullResult.questions;
    if (options.maxQuestions) {
      questions = questions.slice(0, options.maxQuestions);
    }
    questions.sort((a, b) => a.number - b.number);

    yield {
      stage: 'complete',
      message: `Successfully extracted ${questions.length} questions`,
      percentage: 100,
      result: {
        questions,
        metadata: {
          ...fullResult.metadata,
          total_questions: questions.length,
        },
      },
    };
  } catch (error: unknown) {
    console.error('[AI Service] Streaming extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract questions';
    yield {
      stage: 'complete',
      message: 'Extraction failed',
      percentage: 0,
      error: errorMessage,
    };
  }
}

/**
 * Convert extracted questions to ParsedQuestion format (for compatibility)
 * Handles both single and multiple correct answers
 */
export function convertToParsedQuestions(
  extracted: ExtractionResult
): import('@/lib/pdf/pdf-parser').ParsedQuestion[] {
  return extracted.questions.map((q) => {
    // Determine correct answer - prioritize correct_answers array, fallback to correct_answer
    let correctAnswer: number | undefined;

    // Handle new correct_answers array format (for mcq_two, mcq_multiple)
    if (q.correct_answers && Array.isArray(q.correct_answers) && q.correct_answers.length > 0) {
      // For single answer questions, use first index
      if (q.type === 'mcq_single') {
        const firstAnswer = q.correct_answers[0];
        correctAnswer = typeof firstAnswer === 'number' ? firstAnswer : undefined;
      } else if (q.type === 'mcq_two' || q.type === 'mcq_multiple') {
        // For multiple answer questions, use first for compatibility
        // The full array is stored in answer_data
        const firstAnswer = q.correct_answers[0];
        correctAnswer = typeof firstAnswer === 'number' ? firstAnswer : undefined;
      }
    }
    // Fallback to legacy correct_answer field
    else if (q.correct_answer !== undefined) {
      if (typeof q.correct_answer === 'number') {
        correctAnswer = q.correct_answer;
      } else if (Array.isArray(q.correct_answer) && q.correct_answer.length > 0) {
        correctAnswer = q.correct_answer[0]; // Use first for single-choice compatibility
      }
    }

    // Build answer_data for questions with multiple correct answers
    // Note: This logic was removing unused answerData to satisfy linter
    // The correct_answers array in metadata handles the indices


    return {
      questionNumber: q.number,
      questionTextMr: q.text_mr,
      questionTextEn: q.text_en || undefined, // Convert null/empty to undefined
      options: q.options || [], // Convert null/undefined to empty array
      correctAnswer,
      questionType: q.type,
      marks: q.marks || 2, // Default to 2 if not provided
      difficulty: 'medium', // Default
      explanation: q.explanation_en || q.explanation_mr || undefined, // Single explanation field (language matches question_language)
      // Note: For mcq_two and mcq_multiple, the correct_answers array is stored
      // in the extraction metadata and can be accessed during review/editing
    };
  });
}

