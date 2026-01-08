/**
 * Rich Content Types
 * 
 * Support for questions containing images, mathematical formulas, and special symbols.
 * Uses LaTeX for mathematical expressions (more universal than MathML).
 */

/**
 * Rich content block - represents a piece of content that can be text, image, or formula
 */
export type RichContentBlock =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; alt?: string; width?: number; height?: number }
  | { type: 'formula'; latex: string; inline?: boolean }
  | { type: 'break' }; // Line break

/**
 * Rich content - array of blocks that form the complete content
 */
export type RichContent = RichContentBlock[];

/**
 * Helper functions to create rich content blocks
 */
// eslint-disable-next-line no-redeclare
export const RichContent = {
  /**
   * Create a simple text block
   */
  text: (content: string): RichContentBlock => ({ type: 'text', content }),

  /**
   * Create an image block
   */
  image: (url: string, alt?: string, width?: number, height?: number): RichContentBlock => ({
    type: 'image',
    url,
    alt,
    width,
    height,
  }),

  /**
   * Create a formula block (LaTeX)
   */
  formula: (latex: string, inline = false): RichContentBlock => ({
    type: 'formula',
    latex,
    inline,
  }),

  /**
   * Create a line break
   */
  break: (): RichContentBlock => ({ type: 'break' }),

  /**
   * Parse plain text to rich content (backward compatibility)
   */
  fromPlainText: (text: string): RichContent => {
    if (!text) return [];
    // For backward compatibility, return as text block
    return [{ type: 'text', content: text }];
  },

  /**
   * Convert rich content to plain text (for search/export)
   */
  toPlainText: (content: RichContent): string => {
    return content
      .map((block) => {
        if (block.type === 'text') return block.content;
        if (block.type === 'formula') return `[${block.latex}]`;
        if (block.type === 'image') return `[Image: ${block.alt || block.url}]`;
        if (block.type === 'break') return '\n';
        return '';
      })
      .join('');
  },

  /**
   * Check if content contains rich elements (images or formulas)
   */
  isRich: (content: RichContent): boolean => {
    return content.some((block) => block.type === 'image' || block.type === 'formula');
  },
};

/**
 * Question with rich content support
 */
export interface QuestionWithRichContent {
  question_text?: string | RichContent; // Question text (language matches question_language)
  question_language?: "en" | "mr";
  explanation?: string | RichContent; // Single explanation field (language matches question_language)
  // For options in MCQ
  options?: Array<string | RichContent>;
}

/**
 * Parse question text (supports both legacy string and RichContent)
 */
export function parseQuestionText(
  text: string | RichContent | undefined
): RichContent {
  if (!text) return [];
  if (typeof text === 'string') {
    return RichContent.fromPlainText(text);
  }
  return text;
}




