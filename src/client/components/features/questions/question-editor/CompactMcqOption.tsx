// Client-side only — no server secrets or database access here

"use client";

/**
 * Compact MCQ Option Component
 * Simple textarea with modal for rich text editing
 */

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { CheckCircle2, Circle, Trash2, PenTool } from "lucide-react";
import { stringToJson, jsonToPlainText, plainTextToJson } from '@/client/utils/editor-utils';
import { McqOptionEditorModal } from "./McqOptionEditorModal";

interface CompactMcqOptionProps {
  optionIndex: number;
  optionLabel: string;
  optionContent: any; // TipTap JSON
  isCorrect: boolean;
  onContentChange: (content: any) => void;
  onToggleCorrect: () => void;
  onRemove: () => void;
  canRemove: boolean;
  language?: "en" | "mr";
}

export function CompactMcqOption({
  optionIndex: _optionIndex,
  optionLabel,
  optionContent,
  isCorrect,
  onContentChange,
  onToggleCorrect,
  onRemove,
  canRemove,
  language = "en",
}: CompactMcqOptionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ensure content is TipTap JSON format
  const normalizedContent =
    typeof optionContent === "string" ? stringToJson(optionContent) : optionContent;

  // Extract plain text for textarea display
  const [plainText, setPlainText] = useState(jsonToPlainText(normalizedContent));

  // Update plain text when content changes from modal
  useEffect(() => {
    const currentPlainText = jsonToPlainText(normalizedContent);
    setPlainText(currentPlainText);
  }, [normalizedContent]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPlainText(newText);
    // Convert plain text to TipTap JSON and update
    const jsonContent = plainTextToJson(newText);
    onContentChange(jsonContent);
  };

  const handleModalChange = (content: any) => {
    onContentChange(content);
    // Update plain text when modal content changes
    const newPlainText = jsonToPlainText(content);
    setPlainText(newPlainText);
  };

  return (
    <>
      <div
        className={clsx(
          "group relative flex items-start gap-3 rounded-xl bg-white p-4 transition-all",
          isCorrect
            ? "ring-2 ring-green-500/50 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900"
            : "ring-1 ring-neutral-200 dark:ring-neutral-800"
        )}
      >
        {/* Correct Answer Toggle */}
        <button
          onClick={onToggleCorrect}
          className={clsx(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
            isCorrect
              ? "bg-green-500 text-white"
              : "border-2 border-neutral-300 bg-white hover:border-green-400 dark:border-neutral-600 dark:bg-neutral-800"
          )}
          title={isCorrect ? "Mark as incorrect" : "Mark as correct"}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Circle className="h-3 w-3 text-neutral-400" />
          )}
        </button>

        {/* Option Label */}
        <div
          className={clsx(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold",
            isCorrect
              ? "bg-green-500 text-white"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
          )}
        >
          {optionLabel}
        </div>

        {/* Textarea with Icon Button */}
        <div className="min-w-0 flex-1 flex items-start gap-2">
          <textarea
            value={plainText}
            onChange={handleTextareaChange}
            placeholder={`Option ${optionLabel}...`}
            className={clsx(
              "min-h-[70px] w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors",
              isCorrect
                ? "border-green-200 dark:border-green-900/50 dark:bg-neutral-800 dark:text-neutral-100"
                : "border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            )}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-primary-500 to-purple-600 text-white transition-all hover:from-primary-600 hover:to-purple-700 hover:shadow-md hover:shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            title="Edit with rich text editor (for formulas, images, tables)"
            type="button"
          >
            <PenTool className="h-4 w-4" />
          </button>
        </div>

        {/* Remove Button */}
        {canRemove && (
          <button
            onClick={onRemove}
            className="mt-0.5 rounded-lg p-1.5 text-neutral-400 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/40 dark:hover:text-red-400"
            title="Remove option"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Rich Text Editor Modal */}
      <McqOptionEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={normalizedContent}
        onChange={handleModalChange}
        optionLabel={optionLabel}
        language={language}
      />
    </>
  );
}

