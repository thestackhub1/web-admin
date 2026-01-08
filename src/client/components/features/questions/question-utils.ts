// Client-side only — no server secrets or database access here

import { jsonToPlainText } from '@/client/utils/editor-utils';

interface Question {
  answer_data?: any;
}

export function getMcqOptions(question: Question): { text: string; isCorrect: boolean }[] {
  if (!question.answer_data) return [];

  const answerData = question.answer_data;
  if (!answerData.options) return [];

  const correctIndices = answerData.correct_indices || answerData.correct || [];
  const correctSet = new Set(Array.isArray(correctIndices) ? correctIndices : [correctIndices]);

  return answerData.options.map((opt: any, index: number) => {
    let text = "";
    if (typeof opt === "string") {
      try {
        const parsed = JSON.parse(opt);
        text = jsonToPlainText(parsed);
      } catch {
        text = opt;
      }
    } else if (typeof opt === "object") {
      text = jsonToPlainText(opt);
    } else {
      text = String(opt);
    }
    return {
      text,
      isCorrect: correctSet.has(index),
    };
  });
}

export function convertToCSV(questions: any[]): string {
  const headers = ["Question Text", "Language", "Type", "Difficulty", "Chapter", "Status"];
  const rows = questions.map((q) => {
    let questionText = "";
    try {
      const parsed = JSON.parse(q.question_text);
      questionText = jsonToPlainText(parsed);
    } catch {
      questionText = q.question_text;
    }
    return [
      `"${questionText.replace(/"/g, '""')}"`,
      q.question_language,
      q.question_type,
      q.difficulty,
      q.chapters?.name_en || "",
      q.is_active ? "Active" : "Inactive",
    ];
  });

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}


