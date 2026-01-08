// Client-side only — no server secrets or database access here

"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from '@/client/components/ui/button';
import { TextInput } from '@/client/components/ui/input';
import { Select } from '@/client/components/ui/select';
import { useChaptersBySubject, useCreateQuestion, useUpdateQuestion } from "@/client/hooks";
import { QuestionEditor as PremiumQuestionEditor } from '@/client/components/shared/rich-text-editor';
import { jsonToString, stringToJson } from '@/client/utils/editor-utils';
import {
  type QuestionType,
  type Difficulty,
  type QuestionFormValues,
  type AnswerData,
  questionTypes,
  questionTypeLabels,
  difficulties,
  difficultyLabels,
  getDefaultAnswerData,
  getDefaultLanguageForSubject,
  type FillBlankAnswerData,
  type TrueFalseAnswerData,
  type McqSingleAnswerData,
  type McqTwoAnswerData,
  type McqThreeAnswerData,
  type MatchAnswerData,
  type ShortAnswerData,
  type ProgrammingAnswerData,
} from "@/client/types/questions";

interface QuestionFormProps {
  subjectSlug: string;
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuestionForm({ subjectSlug, initialData, onClose, onSuccess }: QuestionFormProps) {
  const isEditing = !!initialData;

  // Use hooks for API calls
  const { data: chaptersData } = useChaptersBySubject(subjectSlug);
  const { mutate: createQuestion, loading: isCreating } = useCreateQuestion(subjectSlug);
  const { mutate: updateQuestion, loading: isUpdating } = useUpdateQuestion(subjectSlug);

  const chapters = chaptersData || [];
  const isLoading = isCreating || isUpdating;

  // Get default language for subject
  const defaultLanguage = getDefaultLanguageForSubject(subjectSlug);

  // Form state - Parse initial content from database (JSON string or HTML) to TipTap JSON
  const [questionContent, setQuestionContent] = useState(
    stringToJson(initialData?.question_text ||
      (initialData?.question_text_en || initialData?.question_text_mr || ""))
  );
  const [questionLanguage, setQuestionLanguage] = useState<"en" | "mr">(
    initialData?.question_language || defaultLanguage
  );
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialData?.question_type || "mcq_single"
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || "medium");
  const [chapterId, setChapterId] = useState<string>(initialData?.chapter_id || "");
  const [explanationContent, setExplanationContent] = useState(
    stringToJson(initialData?.explanation || "")
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [classLevel, setClassLevel] = useState(initialData?.class_level || "");
  const [marks, setMarks] = useState<number>(initialData?.marks || 1);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [answerData, setAnswerData] = useState<AnswerData>(
    initialData?.answer_data || getDefaultAnswerData(questionType)
  );

  // Reset answer data when question type changes
  const handleTypeChange = (newType: QuestionType) => {
    setQuestionType(newType);
    if (!initialData || initialData.question_type !== newType) {
      setAnswerData(getDefaultAnswerData(newType));
    }
  };

  // Tag handlers
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Auto-set language based on subject if not explicitly set
    const finalLanguage = questionLanguage || defaultLanguage;

    // Validate required fields
    if (!classLevel) {
      toast.error("Class level is required");
      return;
    }

    const values: QuestionFormValues = {
      questionText: jsonToString(questionContent), // Convert TipTap JSON to JSON string for database
      questionLanguage: finalLanguage,
      questionType,
      difficulty,
      chapterId: chapterId || null,
      explanation: jsonToString(explanationContent), // Single explanation field
      tags,
      classLevel, // Required
      isActive,
      answerData,
      marks,
    };

    const apiData = {
      question_text: values.questionText,
      question_language: values.questionLanguage,
      question_type: values.questionType,
      difficulty: values.difficulty,
      chapter_id: values.chapterId,
      answer_data: values.answerData,
      explanation: values.explanation,
      tags: values.tags,
      class_level: values.classLevel,
      marks: values.marks,
      is_active: values.isActive,
    };

    if (isEditing && initialData.id) {
      const result = await updateQuestion({ id: initialData.id, subject: subjectSlug, ...apiData });
      if (result) {
        onSuccess();
        onClose();
      }
    } else {
      const result = await createQuestion(apiData);
      if (result) {
        onSuccess();
        onClose();
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Text - Premium Rich Text Editor */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-950 dark:text-white">
            Question Text <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Language:</span>
            <select
              value={questionLanguage}
              onChange={(e) => setQuestionLanguage(e.target.value as "en" | "mr")}
              className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              disabled={subjectSlug !== "scholarship"} // Auto-set for IT/English
            >
              <option value="en">English</option>
              <option value="mr">Marathi</option>
            </select>
            {questionLanguage === "mr" && (
              <span className="text-xs text-neutral-400">(Default for {subjectSlug})</span>
            )}
          </div>
        </div>
        <PremiumQuestionEditor
          content={questionContent}
          onChange={setQuestionContent}
          placeholder={
            questionLanguage === "mr"
              ? "प्रश्न मराठीत लिहा..."
              : "Enter question in English..."
          }
          language={questionLanguage}
          required
        />
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {subjectSlug === "scholarship"
            ? "Primary language: Marathi (default)"
            : "Primary language: English (default)"}
        </p>
      </div>


      {/* Question Type & Difficulty Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-950 dark:text-white">
            Question Type
          </label>
          <Select
            value={questionType}
            onChange={(val) => handleTypeChange(val as QuestionType)}
            options={questionTypes.map((type) => ({
              value: type,
              label: questionTypeLabels[type],
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-950 dark:text-white">
            Difficulty
          </label>
          <div className="mt-2 flex gap-4">
            {difficulties.map((d) => (
              <label key={d} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  checked={difficulty === d}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-neutral-700 capitalize dark:text-neutral-300">
                  {difficultyLabels[d]}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Chapter, Class Level & Marks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-neutral-950 dark:text-white">
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

        <div>
          <label className="block text-sm font-medium text-neutral-950 dark:text-white">
            Class Level <span className="text-red-500">*</span>
          </label>
          <TextInput
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            placeholder="e.g., 5, 8, 12"
            className="mt-2"
            required
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Required for better readability and filtering
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-950 dark:text-white">
            Marks
          </label>
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
            min={1}
            max={100}
            className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Points for correct answer
          </p>
        </div>
      </div>

      {/* Dynamic Answer Data Section */}
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <h4 className="mb-4 text-sm font-medium text-neutral-950 dark:text-white">
          Answer Configuration
        </h4>
        <AnswerDataEditor type={questionType} data={answerData} onChange={setAnswerData} />
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-neutral-950 dark:text-white">
          Explanation ({questionLanguage === "mr" ? "Marathi" : "English"})
        </label>
        <PremiumQuestionEditor
          content={explanationContent}
          onChange={setExplanationContent}
          placeholder={
            questionLanguage === "mr"
              ? "योग्य उत्तराचे स्पष्टीकरण द्या..."
              : "Explain the correct answer..."
          }
          language={questionLanguage}
          minHeight="150px"
        />
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Explanation language matches the question language
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-neutral-950 dark:text-white">Tags</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <TextInput
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>

      {/* Active Toggle */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded text-blue-600"
        />
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          Active (visible to students)
        </span>
      </label>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        <Button
          type="button"
          onClick={onClose}
          className="bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditing ? "Update Question" : "Create Question"}
        </Button>
      </div>
    </form>
  );
}

// Dynamic Answer Data Editor based on question type
function AnswerDataEditor({
  type,
  data,
  onChange,
}: {
  type: QuestionType;
  data: AnswerData;
  onChange: (data: AnswerData) => void;
}) {
  switch (type) {
    case "fill_blank":
      return <FillBlankEditor data={data as FillBlankAnswerData} onChange={onChange} />;
    case "true_false":
      return <TrueFalseEditor data={data as TrueFalseAnswerData} onChange={onChange} />;
    case "mcq_single":
      return <McqEditor data={data as McqSingleAnswerData} onChange={onChange} correctCount={1} />;
    case "mcq_two":
      return <McqEditor data={data as McqTwoAnswerData} onChange={onChange} correctCount={2} />;
    case "mcq_three":
      return <McqEditor data={data as McqThreeAnswerData} onChange={onChange} correctCount={3} />;
    case "match":
      return <MatchEditor data={data as MatchAnswerData} onChange={onChange} />;
    case "short_answer":
      return <ShortAnswerEditor data={data as ShortAnswerData} onChange={onChange} />;
    case "programming":
      return <ProgrammingEditor data={data as ProgrammingAnswerData} onChange={onChange} />;
    default:
      return null;
  }
}

// Fill Blank Editor
function FillBlankEditor({
  data,
  onChange,
}: {
  data: FillBlankAnswerData;
  onChange: (data: AnswerData) => void;
}) {
  const blanks = data.blanks || [""];

  const updateBlank = (index: number, value: string) => {
    const newBlanks = [...blanks];
    newBlanks[index] = value;
    onChange({ blanks: newBlanks });
  };

  const addBlank = () => onChange({ blanks: [...blanks, ""] });
  const removeBlank = (index: number) => {
    if (blanks.length > 1) {
      onChange({ blanks: blanks.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        Enter the correct answers for each blank (use ___ in question text for blanks)
      </p>
      {blanks.map((blank, i) => (
        <div key={i} className="flex gap-2">
          <TextInput
            value={blank}
            onChange={(e) => updateBlank(i, e.target.value)}
            placeholder={`Blank ${i + 1} answer`}
            className="flex-1"
          />
          {blanks.length > 1 && (
            <button type="button" onClick={() => removeBlank(i)} className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addBlank}
        className="flex items-center gap-1 text-sm text-blue-600"
      >
        <Plus className="h-4 w-4" /> Add blank
      </button>
    </div>
  );
}

// True/False Editor
function TrueFalseEditor({
  data,
  onChange,
}: {
  data: TrueFalseAnswerData;
  onChange: (data: AnswerData) => void;
}) {
  return (
    <div className="flex gap-6">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={data.correct === true}
          onChange={() => onChange({ correct: true })}
          className="h-4 w-4 text-blue-600"
        />
        <span className="text-sm text-neutral-700 dark:text-neutral-300">True</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={data.correct === false}
          onChange={() => onChange({ correct: false })}
          className="h-4 w-4 text-blue-600"
        />
        <span className="text-sm text-neutral-700 dark:text-neutral-300">False</span>
      </label>
    </div>
  );
}

// MCQ Editor (works for single, two, three)
function McqEditor({
  data,
  onChange,
  correctCount,
}: {
  data: McqSingleAnswerData | McqTwoAnswerData | McqThreeAnswerData;
  onChange: (data: AnswerData) => void;
  correctCount: 1 | 2 | 3;
}) {
  const options = data.options || ["", "", "", ""];
  const correctIndices = Array.isArray(data.correct) ? data.correct : [data.correct];

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange({ ...data, options: newOptions });
  };

  const toggleCorrect = (index: number) => {
    let newCorrect: number | number[];

    if (correctCount === 1) {
      newCorrect = index;
    } else {
      const current = [...correctIndices];
      if (current.includes(index)) {
        current.splice(current.indexOf(index), 1);
      } else if (current.length < correctCount) {
        current.push(index);
      }
      newCorrect = current.sort();
    }

    onChange({ ...data, correct: newCorrect as any });
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        Select {correctCount} correct answer{correctCount > 1 ? "s" : ""}
      </p>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-3">
          <input
            type={correctCount === 1 ? "radio" : "checkbox"}
            checked={correctIndices.includes(i)}
            onChange={() => toggleCorrect(i)}
            className="h-4 w-4 text-blue-600"
          />
          <span className="w-6 text-sm font-medium text-neutral-500">{optionLabels[i]}.</span>
          <TextInput
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            placeholder={`Option ${optionLabels[i]}`}
            className="flex-1"
          />
        </div>
      ))}
    </div>
  );
}

// Match Editor
function MatchEditor({
  data,
  onChange,
}: {
  data: MatchAnswerData;
  onChange: (data: AnswerData) => void;
}) {
  const left = data.left || ["", ""];
  const right = data.right || ["", ""];
  const pairs = data.pairs || {};

  const updateLeft = (index: number, value: string) => {
    const newLeft = [...left];
    newLeft[index] = value;
    onChange({ ...data, left: newLeft });
  };

  const updateRight = (index: number, value: string) => {
    const newRight = [...right];
    newRight[index] = value;
    onChange({ ...data, right: newRight });
  };

  const updatePair = (leftIndex: string, rightIndex: string) => {
    onChange({ ...data, pairs: { ...pairs, [leftIndex]: rightIndex } });
  };

  const addRow = () => {
    const newLeft = [...left, ""];
    const newRight = [...right, ""];
    const newPairs = { ...pairs, [String(left.length)]: String(right.length) };
    onChange({ left: newLeft, right: newRight, pairs: newPairs });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">Match items from left to right</p>
      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-neutral-500">
        <div>Left Items</div>
        <div>Matches To</div>
        <div>Right Items</div>
      </div>
      {left.map((_, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <TextInput
            value={left[i]}
            onChange={(e) => updateLeft(i, e.target.value)}
            placeholder={`Item ${i + 1}`}
          />
          <Select
            value={pairs[String(i)] || String(i)}
            onChange={(val) => updatePair(String(i), val)}
            options={right.map((_, j) => ({
              value: String(j),
              label: `→ ${j + 1}`,
            }))}
          />
          <TextInput
            value={right[i]}
            onChange={(e) => updateRight(i, e.target.value)}
            placeholder={`Definition ${i + 1}`}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-sm text-blue-600"
      >
        <Plus className="h-4 w-4" /> Add pair
      </button>
    </div>
  );
}

// Short Answer Editor
function ShortAnswerEditor({
  data,
  onChange,
}: {
  data: ShortAnswerData;
  onChange: (data: AnswerData) => void;
}) {
  const answers = data.answers || [""];

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    onChange({ answers: newAnswers });
  };

  const addAnswer = () => onChange({ answers: [...answers, ""] });
  const removeAnswer = (index: number) => {
    if (answers.length > 1) {
      onChange({ answers: answers.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">Enter acceptable answers (case-insensitive matching)</p>
      {answers.map((ans, i) => (
        <div key={i} className="flex gap-2">
          <TextInput
            value={ans}
            onChange={(e) => updateAnswer(i, e.target.value)}
            placeholder={i === 0 ? "Primary answer" : "Alternative answer"}
            className="flex-1"
          />
          {answers.length > 1 && (
            <button type="button" onClick={() => removeAnswer(i)} className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addAnswer}
        className="flex items-center gap-1 text-sm text-blue-600"
      >
        <Plus className="h-4 w-4" /> Add alternative
      </button>
    </div>
  );
}

// Programming Editor
function ProgrammingEditor({
  data,
  onChange,
}: {
  data: ProgrammingAnswerData;
  onChange: (data: AnswerData) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          Starter Code (optional)
        </label>
        <textarea
          value={data.starter_code || ""}
          onChange={(e) => onChange({ ...data, starter_code: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-lg bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-950 outline -outline-offset-1 outline-neutral-950/15 dark:bg-neutral-900 dark:text-white dark:outline-white/15"
          placeholder="// Starter code for students..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          Expected Output
        </label>
        <TextInput
          value={data.expected_output || ""}
          onChange={(e) => onChange({ ...data, expected_output: e.target.value })}
          placeholder="Expected program output..."
          className="mt-1"
        />
      </div>
    </div>
  );
}
