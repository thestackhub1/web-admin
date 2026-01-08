// Client-side only — no server secrets or database access here

"use client";

/**
 * Live Preview Component
 * Shows how the question will appear in exam papers (clean, printable style)
 */

import { QuestionEditorRenderer } from '@/client/components/shared/rich-text-editor';
import { clsx } from "clsx";
import { Circle, CheckCircle2 } from "lucide-react";
import { stringToJson } from '@/client/utils/editor-utils';

interface LivePreviewProps {
  questionContent: any;
  questionLanguage: "en" | "mr";
  questionType: string;
  answerData: any;
  explanationContent?: any;
  hideHeader?: boolean;
}

export function LivePreview({
  questionContent,
  questionLanguage,
  questionType,
  answerData,
  explanationContent,
  hideHeader = false,
}: LivePreviewProps) {
  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  const renderOptions = () => {
    if (!["mcq_single", "mcq_two", "mcq_three"].includes(questionType)) {
      return null;
    }

    const options = answerData?.options || [];
    const correctIndices = answerData?.correct_indices || [];

    return (
      <div className="mt-6 space-y-3">
        {options.map((option: any, index: number) => {
          const isCorrect = correctIndices.includes(index);
          const optionContent = typeof option === "string" ? stringToJson(option) : option;

          return (
            <div
              key={index}
              className={clsx(
                "flex items-start gap-3 rounded-lg border-2 p-4 transition-colors",
                isCorrect
                  ? "border-green-500 bg-green-50/30"
                  : "border-neutral-200 bg-white"
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 bg-white">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-neutral-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="mb-1 text-xs font-semibold text-neutral-500">
                  {optionLabels[index]}
                </div>
                <QuestionEditorRenderer
                  content={optionContent}
                  language={questionLanguage}
                  className="min-h-[40px]"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={clsx("h-full overflow-y-auto", hideHeader ? "bg-white p-6 dark:bg-neutral-900" : "bg-neutral-50 p-8 dark:bg-neutral-900")}>
      <div className="mx-auto max-w-3xl">
        {/* Exam Paper Header */}
        {!hideHeader && (
          <div className="mb-8 border-b-2 border-neutral-300 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Sample Question Preview</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  This is how your question will appear to students
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {questionType.toUpperCase().replace("_", " ")}
              </div>
            </div>
          </div>
        )}
        
        {hideHeader && (
          <div className="mb-4 flex items-center justify-end">
            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {questionType.toUpperCase().replace("_", " ")}
            </div>
          </div>
        )}

        {/* Question Content */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Question
          </div>
          <QuestionEditorRenderer content={questionContent} language={questionLanguage} />
        </div>

        {/* Options */}
        {renderOptions()}

        {/* Explanation (if provided) */}
        {explanationContent && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/50 p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Explanation
            </div>
            <QuestionEditorRenderer content={explanationContent} language="en" />
          </div>
        )}
      </div>
    </div>
  );
}

