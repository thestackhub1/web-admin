// Client-side only — no server secrets or database access here

"use client";

/**
 * Premium Question Editor - Completely Redesigned
 * Inspired by Linear, Notion, Figma, Vercel Dashboard
 * 
 * Features:
 * - Wide centered container with generous spacing
 * - Sticky header with actions
 * - Live preview toggle
 * - Modern question type selector
 * - Compact MCQ option editor
 * - Premium visual hierarchy
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clsx } from "clsx";
import { Save, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { LoaderSpinner } from '@/client/components/ui/loader';
import { Button } from '@/client/components/ui/button';
import { Select } from '@/client/components/ui/select';
import { PageHeader } from '@/client/components/ui/premium';
import { useCreateQuestion, useUpdateQuestion } from "@/client/hooks";
import type { QuestionType, Difficulty } from "@/client/types/questions";
import { getDefaultLanguageForSubject, subjectDisplayMap } from "@/client/types/questions";
import { QuestionEditor as PremiumQuestionEditor } from '@/client/components/shared/rich-text-editor';
import { jsonToString, stringToJson } from '@/client/utils/editor-utils';
import { SectionCard } from "./SectionCard";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { CompactMcqOption } from "./CompactMcqOption";
import { LivePreview } from "./LivePreview";
import { QuestionPreviewModal } from "./QuestionPreviewModal";

// Answer Editors
import { TrueFalseEditor } from '../answer-editors/true-false-editor';
import { FillBlankEditor } from '../answer-editors/fill-blank-editor';
import { MatchEditor } from '../answer-editors/match-editor';
import { ShortAnswerEditor } from '../answer-editors/short-answer-editor';
import { LongAnswerEditor } from '../answer-editors/long-answer-editor';
import { ProgrammingEditor } from '../answer-editors/programming-editor';

interface Chapter {
  id: string;
  name_en: string;
  name_mr?: string | null;
}

interface QuestionEditorProps {
  subjectSlug: string;
  subjectName?: string;
  subjectDisplaySlug?: string;
  chapters: Chapter[];
  mode: "create" | "edit";
  initialData?: any;
}

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  {
    value: "easy",
    label: "Easy",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  {
    value: "hard",
    label: "Hard",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
];

export function QuestionEditor({ subjectSlug, subjectName, subjectDisplaySlug, chapters, mode, initialData }: QuestionEditorProps) {
  const router = useRouter();
  const createMutation = useCreateQuestion(subjectSlug);
  const updateMutation = useUpdateQuestion(subjectSlug);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, _setShowPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(!!initialData?.explanation);

  // Get default language for subject
  const defaultLanguage = getDefaultLanguageForSubject(subjectSlug);

  // Form state
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialData?.question_type || "mcq_single"
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || "medium");
  const [chapterId, setChapterId] = useState(initialData?.chapter_id || "");
  const [questionContent, setQuestionContent] = useState(
    stringToJson(
      initialData?.question_text ||
      (initialData?.question_text_en || initialData?.question_text_mr || "")
    )
  );
  const [questionLanguage, setQuestionLanguage] = useState<"en" | "mr">(
    initialData?.question_language || defaultLanguage
  );
  const [explanationContent, setExplanationContent] = useState(
    stringToJson(initialData?.explanation || "")
  );
  const [tags, _setTags] = useState<string[]>(initialData?.tags || []);

  function getDefaultAnswerData(type: QuestionType) {
    switch (type) {
      case "true_false": {
        return { correct_answer: true };
      }
      case "mcq_single":
      case "mcq_two":
      case "mcq_three": {
        // Initialize with empty TipTap JSON for each option
        const emptyOption = {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [],
            },
          ],
        };
        return {
          options: [emptyOption, emptyOption, emptyOption, emptyOption],
          correct_indices: [],
        };
      }
      case "fill_blank": {
        return { blanks: [""] };
      }
      case "match": {
        return { pairs: [{ left: "", right: "" }] };
      }
      case "short_answer": {
        return { expected_answer: "" };
      }
      default: {
        return {};
      }
    }
  }

  // Initialize answer data with backward compatibility
  const getInitialAnswerData = () => {
    const defaultData = getDefaultAnswerData(questionType);
    if (!initialData?.answer_data) return defaultData;

    // For MCQ types, convert string options to TipTap JSON if needed
    if (["mcq_single", "mcq_two", "mcq_three"].includes(questionType)) {
      const existingOptions = initialData.answer_data.options || [];
      if (existingOptions.length === 0) return defaultData;

      const processedOptions = existingOptions.map((opt: any) => {
        if (typeof opt === "string") {
          // Try to parse as JSON first, fallback to HTML/plain text
          try {
            const parsed = JSON.parse(opt);
            return parsed;
          } catch {
            return stringToJson(opt);
          }
        }
        return opt;
      });
      return {
        ...initialData.answer_data,
        options: processedOptions,
      };
    }

    return initialData.answer_data;
  };

  const [answerData, setAnswerData] = useState(getInitialAnswerData());
  const [isActive, _setIsActive] = useState(initialData?.is_active ?? true);

  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    setAnswerData(getDefaultAnswerData(type));
  };

  const handleSave = async (publish: boolean) => {
    // Check if question content has text
    const hasTextContent = (content: any): boolean => {
      if (!content || !content.content || content.content.length === 0) return false;

      return content.content.some((node: any) => {
        if (node.type === "paragraph" && node.content) {
          return node.content.some(
            (textNode: any) =>
              textNode.type === "text" && textNode.text && textNode.text.trim().length > 0
          );
        }
        if (node.type === "heading" && node.content) {
          return node.content.some(
            (textNode: any) =>
              textNode.type === "text" && textNode.text && textNode.text.trim().length > 0
          );
        }
        if (["image", "table", "math"].includes(node.type)) {
          return true;
        }
        return false;
      });
    };

    if (!hasTextContent(questionContent)) {
      toast.error("Question text is required");
      return;
    }

    if (!chapterId) {
      toast.error("Please select a chapter");
      return;
    }

    const isSaving = createMutation.isLoading || updateMutation.isLoading;

    const finalLanguage = questionLanguage || defaultLanguage;

    // Convert MCQ options from TipTap JSON to strings if needed
    let processedAnswerData = answerData;
    if (["mcq_single", "mcq_two", "mcq_three"].includes(questionType) && answerData.options) {
      // Convert TipTap JSON options to JSON strings
      processedAnswerData = {
        ...answerData,
        options: answerData.options.map((opt: any) => jsonToString(opt)),
      };
    }

    const formData = {
      questionText: jsonToString(questionContent),
      questionLanguage: finalLanguage,
      questionType: questionType,
      difficulty,
      chapterId: chapterId,
      answerData: processedAnswerData,
      explanation: jsonToString(explanationContent), // Single explanation field
      tags,
      isActive: publish ? true : isActive,
      classLevel: "class_10", // TODO: Get from form input
      marks: 1,
    };

    try {
      const apiData = {
        question_text: formData.questionText,
        question_language: formData.questionLanguage,
        question_type: formData.questionType,
        difficulty: formData.difficulty,
        chapter_id: formData.chapterId,
        answer_data: formData.answerData,
        explanation: formData.explanation,
        tags: formData.tags,
        class_level: formData.classLevel,
        marks: formData.marks,
        is_active: formData.isActive,
      };

      if (mode === "edit" && initialData?.id) {
        const result = await updateMutation.mutate({ subject: subjectSlug, id: initialData.id, ...apiData });
        if (result) {
          router.push(`/dashboard/questions/${subjectSlug}`);
        }
      } else {
        const result = await createMutation.mutate(apiData);
        if (result) {
          router.push(`/dashboard/questions/${subjectSlug}`);
        }
      }
    } catch (_error) {
      toast.error("An error occurred");
    }
  };

  const renderAnswerEditor = () => {
    switch (questionType) {
      case "fill_blank":
        return <FillBlankEditor value={answerData} onChange={setAnswerData} />;
      case "true_false":
        return <TrueFalseEditor value={answerData} onChange={setAnswerData} />;
      case "mcq_single":
      case "mcq_two":
      case "mcq_three": {
        // Convert string options to TipTap JSON if needed (backward compatibility)
        const options = answerData.options || [];
        const processedOptions = options.map((opt: any) => {
          if (typeof opt === "string") {
            return stringToJson(opt);
          }
          return opt;
        });
        const correctCount =
          questionType === "mcq_single" ? 1 : questionType === "mcq_two" ? 2 : 3;
        return (
          <CompactMcqOptionsEditor
            options={processedOptions}
            correctIndices={answerData.correct_indices || []}
            correctCount={correctCount}
            onChange={(newOptions, newCorrectIndices) => {
              setAnswerData({
                ...answerData,
                options: newOptions,
                correct_indices: newCorrectIndices,
              });
            }}
            language={questionLanguage}
          />
        );
      }
      case "match":
        return <MatchEditor value={answerData} onChange={setAnswerData} />;
      case "short_answer":
        return <ShortAnswerEditor value={answerData} onChange={setAnswerData} />;
      case "long_answer":
        return <LongAnswerEditor value={answerData} onChange={setAnswerData} />;
      case "programming":
        return <ProgrammingEditor value={answerData} onChange={setAnswerData} />;
      default:
        return null;
    }
  };

  // Build breadcrumbs
  const displayName = subjectName || subjectDisplayMap[subjectDisplaySlug || subjectSlug] || subjectSlug;
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Questions", href: "/dashboard/questions" },
    ...(subjectDisplaySlug ? [{ label: displayName, href: `/dashboard/questions/${subjectDisplaySlug}` }] : []),
    { label: mode === "edit" ? "Edit Question" : "Add Question" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Breadcrumbs */}
      <PageHeader
        title={mode === "edit" ? "Edit Question" : "Add Question"}
        description={mode === "edit" ? "Update question details and configuration" : "Create a new question for your question bank"}
        breadcrumbs={breadcrumbs}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setShowPreviewModal(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5"
            >
              {isSaving ? <LoaderSpinner size="sm" /> : <Save className="h-3.5 w-3.5" />}
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              size="sm"
              className="flex items-center gap-1.5 bg-linear-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 border-0 shadow-md shadow-primary-500/20"
            >
              {isSaving ? <LoaderSpinner size="sm" /> : <Save className="h-3.5 w-3.5" />}
              Publish
            </Button>
          </div>
        }
      />

      <div className={clsx("relative grid transition-all duration-300", showPreview ? "grid-cols-2 gap-6" : "grid-cols-1")}>
        {/* Main Editor Panel */}
        <div className="flex-1 transition-all duration-300">
          {/* Scrollable Content */}
          <div className="space-y-8">
            {/* Row 1: Question Type (Left) | Question Metadata (Right) */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left: Question Type Selector */}
              <SectionCard>
                <QuestionTypeSelector value={questionType} onChange={handleTypeChange} />
              </SectionCard>

              {/* Right: Question Metadata */}
              <SectionCard
                title="Question Metadata"
                description="Additional information about this question"
              >
                <div className="space-y-6">
                  {/* Chapter Selector */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Chapter <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={chapterId}
                      onChange={setChapterId}
                      placeholder="Select chapter..."
                      options={chapters.map((ch) => ({
                        value: ch.id,
                        label: ch.name_en,
                      }))}
                    />
                  </div>

                  {/* Difficulty Selector */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Difficulty Level
                    </label>
                    <div className="flex gap-2">
                      {difficulties.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setDifficulty(d.value)}
                          className={clsx(
                            "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                            difficulty === d.value
                              ? d.color + " shadow-sm"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Row 2: Question Text (Full Width) */}
            <SectionCard
              title="Question Text"
              description="Write your question. Use the toolbar for formulas, images, tables, and formatting."
              required
            >
              <div className="space-y-6">
                {/* Language Selector */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Language
                  </label>
                  <select
                    value={questionLanguage}
                    onChange={(e) => setQuestionLanguage(e.target.value as "en" | "mr")}
                    className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 transition-all hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-neutral-600"
                    disabled={subjectSlug !== "scholarship"}
                  >
                    <option value="en">English</option>
                    <option value="mr">Marathi</option>
                  </select>
                </div>

                {/* Rich Text Editor */}
                <PremiumQuestionEditor
                  content={questionContent}
                  onChange={setQuestionContent}
                  placeholder={
                    questionLanguage === "mr"
                      ? "प्रश्न मराठीत लिहा... गणित सूत्रे, चित्रे, आणि सारण्या वापरू शकता."
                      : "Enter your question here. You can use formatting, math formulas, images, and tables..."
                  }
                  language={questionLanguage}
                  required
                  minHeight="300px"
                />

              </div>
            </SectionCard>

            {/* Answer Configuration */}
            <SectionCard
              title="Answer Configuration"
              description="Configure the correct answer(s) for this question"
              required
            >
              {renderAnswerEditor()}
            </SectionCard>

            {/* Explanation Section */}
            <SectionCard
              title="Explanation (Optional)"
              description="Provide an explanation for the correct answer to help students learn"
            >
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200"
              >
                <span>{showExplanation ? "Hide Explanation" : "Add Explanation"}</span>
                {showExplanation ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showExplanation && (
                <div className="mt-4">
                  <PremiumQuestionEditor
                    content={explanationContent}
                    onChange={setExplanationContent}
                    placeholder={
                      questionLanguage === "mr"
                        ? "योग्य उत्तराचे स्पष्टीकरण द्या..."
                        : "Explain why this is the correct answer..."
                    }
                    language={questionLanguage}
                    minHeight="180px"
                  />
                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    Explanation language matches the question language ({questionLanguage === "mr" ? "Marathi" : "English"})
                  </p>
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="border-l border-neutral-200 dark:border-neutral-800">
            <LivePreview
              questionContent={questionContent}
              questionLanguage={questionLanguage}
              questionType={questionType}
              answerData={answerData}
              explanationContent={explanationContent}
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <QuestionPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        questionContent={questionContent}
        questionLanguage={questionLanguage}
        questionType={questionType}
        answerData={answerData}
        explanationContent={explanationContent}
      />
    </div>
  );
}

// Compact MCQ Options Editor Component
interface CompactMcqOptionsEditorProps {
  options: any[]; // Array of TipTap JSON content
  correctIndices: number[];
  correctCount: 1 | 2 | 3;
  onChange: (options: any[], correctIndices: number[]) => void;
  language?: "en" | "mr";
}

function CompactMcqOptionsEditor({
  options,
  correctIndices,
  correctCount,
  onChange,
  language = "en",
}: CompactMcqOptionsEditorProps) {
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
    <div className="space-y-5">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            Select {correctCount} correct answer{correctCount > 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Click the circle icon on each option to mark it as correct
          </p>
        </div>
        <div
          className={clsx(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            correctIndices.length === correctCount
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
          )}
        >
          {correctIndices.length}/{correctCount} selected
        </div>
      </div>

      {/* Options - 2 per row grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option, index) => (
          <CompactMcqOption
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
        <button
          type="button"
          onClick={addOption}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-600 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400 dark:hover:border-primary-500/60 dark:hover:bg-primary-950/20 dark:hover:text-primary-400"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Option</span>
        </button>
      )}
    </div>
  );
}
