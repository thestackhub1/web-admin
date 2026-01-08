/**
 * AI Prompts for Marathi Question Extraction
 * Specialized prompts optimized for Maharashtra scholarship exam PDFs
 */

/**
 * System prompt for Maharashtra Scholarship Exam (Marathi Medium) question extraction
 * Based on actual exam format: Class 5 & Class 8, Paper I & II, 75 questions, 2 marks each
 */
export const MAHARASHTRA_SCHOLARSHIP_SYSTEM_PROMPT = `You are an expert at extracting questions from Maharashtra State Scholarship Examination PDFs (पूर्व उच्च प्राथमिक शिष्यवृत्ती परीक्षा / माध्यमिक शिष्यवृत्ती परीक्षा).

EXAM FORMAT (CRITICAL - Follow exactly):
- Total: 75 questions worth 2 marks each (150 total marks, 90 minutes)
- Two papers: Paper I (प्रथम भाषा व गणित) and Paper II (तृतीय भाषा व बुद्धिमत्ता चाचणी)
- Paper I: Questions 1-25 (First Language) + 26-75 (Mathematics)
- Paper II: Questions 1-25 (Third Language) + 26-75 (Intelligence Test)
- Options labeled as: क, ख, ग, घ (Marathi) OR (1), (2), (3), (4) (numbered)
- OMR-style format: Each question has exactly 4 options
- Some questions explicitly require TWO correct answers (marked in instructions or question text)
- Instructions page (first 1-2 pages) should be IGNORED - only extract actual questions

EXTRACTION RULES:
1. SKIP the instructions page completely - look for actual question numbers (1., 2., 3., etc.)
2. Preserve exact Marathi text - do NOT translate or modify Devanagari script
3. Extract question number accurately (may be formatted as "1.", "1)", "Q1:", etc.)
4. Identify question type:
   - mcq_single: Single correct answer (most common, default)
   - mcq_two: TWO correct answers required (if question explicitly states "दोन पर्याय निवडा" or similar)
   - mcq_multiple: Multiple correct answers (3+)
   - fill_blank: Fill in the blank (_____)
   - true_false: True/False questions
5. Extract ALL 4 options - preserve exact format (क), ख), ग), घ) or (1), (2), (3), (4))
6. For questions with TWO correct answers, set type to "mcq_two" and provide both in correct_answers array
7. Default marks: 2 (unless specified otherwise)
8. Extract section/subject if visible (e.g., "विभाग I", "प्रथम भाषा", "गणित")
9. Extract paper number (I or II) from header if visible

OUTPUT FORMAT (Strict JSON Schema):
{
  "questions": [
    {
      "number": 1,
      "text_mr": "प्रश्न मराठीत (exact text)",
      "text_en": "English translation if available",
      "options": ["क) पर्याय 1", "ख) पर्याय 2", "ग) पर्याय 3", "घ) पर्याय 4"],
      "correct_answers": [0, 2], // Array for multiple answers (indices 0-3)
      "type": "mcq_single" | "mcq_two" | "mcq_multiple" | "fill_blank" | "true_false",
      "marks": 2,
      "section": "विभाग I" | "प्रथम भाषा" | "गणित" (optional)
    }
  ],
  "metadata": {
    "paper_number": "I" | "II",
    "subject": "प्रथम भाषा व गणित" | "तृतीय भाषा व बुद्धिमत्ता चाचणी",
    "class_level": "इयत्ता 5 वी" | "इयत्ता 8 वी",
    "exam_type": "पूर्व उच्च प्राथमिक शिष्यवृत्ती परीक्षा" | "माध्यमिक शिष्यवृत्ती परीक्षा",
    "total_questions": 75
  }
}

CRITICAL INSTRUCTIONS:
- IGNORE instruction pages (pages with "सूचना", "निर्देश", "Instructions")
- Extract ONLY actual questions (numbered 1-75)
- If question explicitly asks for TWO answers, use type "mcq_two" and provide both indices
- Preserve exact Marathi text - no translation or modification
- Handle scanned text artifacts gracefully
- If question number is unclear, infer from sequence
- Always return valid JSON, even if extraction is partial
- Options must be exactly 4 items (or empty array if not found)
- For questions with English text, include both text_mr and text_en`;

/**
 * Few-shot examples from real Maharashtra Scholarship Exam PDFs
 */
export const MAHARASHTRA_FEW_SHOT_EXAMPLES = `
EXAMPLE 1 - Standard MCQ with Marathi options:
Input PDF text:
"69. 58721 मधील दशकस्थानच्या अंकाची स्थानिक किंमत हजारस्थानच्या अंकाच्या स्थानिक किंमतीच्या किती पट आहे?
(1) 400
(2) 1/400
(3) 4000
(4) 1/4000"

Output:
{
  "number": 69,
  "text_mr": "58721 मधील दशकस्थानच्या अंकाची स्थानिक किंमत हजारस्थानच्या अंकाच्या स्थानिक किंमतीच्या किती पट आहे?",
  "options": ["(1) 400", "(2) 1/400", "(3) 4000", "(4) 1/4000"],
  "type": "mcq_single",
  "marks": 2,
  "section": "गणित"
}

EXAMPLE 2 - MCQ with Marathi option labels (क, ख, ग, घ):
Input PDF text:
"1. खालीलपैकी कोणता पर्याय बरोबर आहे?
क) पर्याय 1
ख) पर्याय 2
ग) पर्याय 3
घ) पर्याय 4"

Output:
{
  "number": 1,
  "text_mr": "खालीलपैकी कोणता पर्याय बरोबर आहे?",
  "options": ["क) पर्याय 1", "ख) पर्याय 2", "ग) पर्याय 3", "घ) पर्याय 4"],
  "type": "mcq_single",
  "marks": 2,
  "section": "विभाग I"
}

EXAMPLE 3 - Question with English text (bilingual):
Input PDF text:
"73. Rashid purchased 27 kg sugar at the rate ₹ 37 per kg. If he sold all the sugar at ₹ 940 then how much was the profit or loss in the trade?
(1) Profit of ₹ 49
(2) Loss of ₹ 49
(3) Profit of ₹ 59
(4) Loss of ₹ 59"

Output:
{
  "number": 73,
  "text_mr": "Rashid purchased 27 kg sugar at the rate ₹ 37 per kg. If he sold all the sugar at ₹ 940 then how much was the profit or loss in the trade?",
  "text_en": "Rashid purchased 27 kg sugar at the rate ₹ 37 per kg. If he sold all the sugar at ₹ 940 then how much was the profit or loss in the trade?",
  "options": ["(1) Profit of ₹ 49", "(2) Loss of ₹ 49", "(3) Profit of ₹ 59", "(4) Loss of ₹ 59"],
  "type": "mcq_single",
  "marks": 2,
  "section": "गणित"
}

EXAMPLE 4 - Question requiring TWO correct answers (mcq_two):
Input PDF text:
"15. खालीलपैकी दोन पर्याय निवडा जे बरोबर आहेत:
क) पर्याय 1
ख) पर्याय 2
ग) पर्याय 3
घ) पर्याय 4"

Output:
{
  "number": 15,
  "text_mr": "खालीलपैकी दोन पर्याय निवडा जे बरोबर आहेत:",
  "options": ["क) पर्याय 1", "ख) पर्याय 2", "ग) पर्याय 3", "घ) पर्याय 4"],
  "correct_answers": [0, 2], // Two correct answers (indices)
  "type": "mcq_two",
  "marks": 2
}

EXAMPLE 5 - Fill in the blank:
Input PDF text:
"20. महाराष्ट्राची राजधानी _____ आहे."

Output:
{
  "number": 20,
  "text_mr": "महाराष्ट्राची राजधानी _____ आहे.",
  "type": "fill_blank",
  "marks": 2
}
`;

/**
 * User prompt template for PDF text extraction
 */
export function createExtractionPrompt(
  pdfText: string,
  options?: {
    includeAnswerKey?: boolean;
    answerKeyText?: string;
    scholarshipMode?: boolean;
  }
): string {
  // Remove instruction pages (first 1-2 pages typically contain instructions)
  let cleanedText = pdfText;

  if (options?.scholarshipMode) {
    // Try to identify and skip instruction sections
    // Instructions typically contain: "सूचना", "निर्देश", "Instructions", "प्रश्नपत्रिका सोडविण्यापूर्वी"

    const questionStartPattern = /(?:^|\n)\s*(?:प्रश्न\s*)?(?:क्र\.\s*)?1[.0-9)]\s+/m;
    const match = cleanedText.match(questionStartPattern);

    if (match && match.index) {
      // Start from first question, skip everything before
      cleanedText = cleanedText.substring(match.index);
    }
  }

  let prompt = `Extract all questions from the following Maharashtra Scholarship Exam PDF text. The text may contain Marathi (Devanagari) characters, English text, and may have scanning artifacts.

${options?.scholarshipMode ? 'IMPORTANT: Skip any instruction pages. Extract ONLY numbered questions (1-75).' : ''}

PDF TEXT:
${cleanedText}

`;

  if (options?.includeAnswerKey && options?.answerKeyText) {
    prompt += `ANSWER KEY:
${options.answerKeyText}

Use the answer key to populate the correct_answers field for each question. For questions requiring two answers, ensure both are included.
`;
  }

  prompt += `
Extract all questions following the format specified. Return ONLY valid JSON matching the schema, no additional text or explanation.`;

  return prompt;
}

/**
 * Enhanced prompt with Maharashtra Scholarship specific examples
 */
export function createEnhancedExtractionPrompt(
  pdfText: string,
  options?: {
    includeAnswerKey?: boolean;
    answerKeyText?: string;
    scholarshipMode?: boolean;
  }
): string {
  const systemPrompt = options?.scholarshipMode
    ? MAHARASHTRA_SCHOLARSHIP_SYSTEM_PROMPT
    : `You are an expert at extracting questions from PDFs. Extract all questions and return structured JSON.`;

  const examples = options?.scholarshipMode
    ? MAHARASHTRA_FEW_SHOT_EXAMPLES
    : '';

  return `${systemPrompt}

${examples}

${createExtractionPrompt(pdfText, options)}`;
}

/**
 * Legacy prompts (kept for backward compatibility)
 */
export const MARATHI_EXTRACTION_SYSTEM_PROMPT = MAHARASHTRA_SCHOLARSHIP_SYSTEM_PROMPT;
export const FEW_SHOT_EXAMPLES = MAHARASHTRA_FEW_SHOT_EXAMPLES;
