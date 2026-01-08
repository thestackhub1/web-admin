// Client-side only — no server secrets or database access here

"use client";

/**
 * MCQ Option Editor Component
 * Rich text editor for individual MCQ options with correct answer selection
 */

import { clsx } from "clsx";
import { Check, Circle, Trash2, Plus } from "lucide-react";
import { QuestionEditor } from '@/client/components/shared/rich-text-editor';

import { Button } from '@/client/components/ui/button';

interface McqOptionEditorProps {
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

export function McqOptionEditor({
  optionIndex: _optionIndex,
  optionLabel,
  optionContent,
  isCorrect,
  onContentChange,
  onToggleCorrect,
  onRemove,
  canRemove,
  language = "en",
}: McqOptionEditorProps) {
  return (
    <div
      className={clsx(
        "group relative rounded-lg border-2 transition-all",
        isCorrect
          ? "border-green-500 bg-green-50/50 dark:border-green-400 dark:bg-green-900/10"
          : "border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/30 dark:hover:border-neutral-600"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Correct Answer Toggle */}
        <button
          onClick={onToggleCorrect}
          className={clsx(
            "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
            isCorrect
              ? "bg-green-500 text-white shadow-md shadow-green-500/30"
              : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          )}
          title={isCorrect ? "Mark as incorrect" : "Mark as correct"}
        >
          {isCorrect ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>

        {/* Option Label */}
        <div
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-sm transition-colors",
            isCorrect
              ? "bg-green-500 text-white"
              : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
          )}
        >
          {optionLabel}
        </div>

        {/* Rich Text Editor */}
        <div className="min-w-0 flex-1">
          <QuestionEditor
            content={optionContent}
            onChange={onContentChange}
            placeholder={`Enter option ${optionLabel}...`}
            language={language}
            minHeight="80px"
            className="[&_.ProseMirror]:min-h-20"
          />
        </div>

        {/* Remove Button */}
        {canRemove && (
          <button
            onClick={onRemove}
            className="mt-1 rounded-lg p-2 text-neutral-400 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/30"
            title="Remove option"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface McqOptionsEditorProps {
  options: any[]; // Array of TipTap JSON content
  correctIndices: number[];
  correctCount: 1 | 2 | 3;
  onChange: (options: any[], correctIndices: number[]) => void;
  language?: "en" | "mr";
}

export function McqOptionsEditor({
  options,
  correctIndices,
  correctCount,
  onChange,
  language = "en",
}: McqOptionsEditorProps) {
  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  const updateOption = (index: number, content: any) => {
    const newOptions = [...options];
    newOptions[index] = content;
    onChange(newOptions, correctIndices);
  };

  const toggleCorrect = (index: number) => {
    let newCorrect = [...correctIndices];

    if (correctCount === 1) {
      // Radio behavior - single selection
      newCorrect = [index];
    } else {
      // Checkbox behavior - multiple selection
      if (newCorrect.includes(index)) {
        newCorrect = newCorrect.filter((i) => i !== index);
      } else if (newCorrect.length < correctCount) {
        newCorrect.push(index);
      } else {
        // Replace oldest selection
        newCorrect.shift();
        newCorrect.push(index);
      }
    }

    onChange(options, newCorrect);
  };

  const addOption = () => {
    if (options.length < 6) {
      const emptyContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [],
          },
        ],
      };
      onChange([...options, emptyContent], correctIndices);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      const newCorrect = correctIndices
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i));
      onChange(newOptions, newCorrect);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Select {correctCount} correct answer{correctCount > 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Click the circle icon to mark an option as correct
          </p>
        </div>
        <div
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            correctIndices.length === correctCount
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          )}
        >
          {correctIndices.length}/{correctCount} selected
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <McqOptionEditor
            key={index}
            optionIndex={index}
            optionLabel={optionLabels[index]}
            optionContent={option}
            isCorrect={correctIndices.includes(index)}
            onContentChange={(content) => updateOption(index, content)}
            onToggleCorrect={() => toggleCorrect(index)}
            onRemove={() => removeOption(index)}
            canRemove={options.length > 2}
            language={language}
          />
        ))}
      </div>

      {/* Add Option Button */}
      {options.length < 6 && (
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          className="w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      )}
    </div>
  );
}


