/**
 * Create Scheduled Exam Modal
 * 
 * A comprehensive modal for creating new scheduled exams.
 * Allows users to select class level, subject, and exam structure,
 * then fill in exam details.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  Target,
  Layers,
  BookOpen,
  FileText,
  ChevronRight,
  Sparkles,
  Check,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { LoaderSpinner } from "@/client/components/ui/loader";
import { Button } from "@/client/components/ui/button";
import { TextInput } from "@/client/components/ui/input";
import { Select } from "@/client/components/ui/select";
import {
  useClassLevels,
  useSubjects,
  useCreateScheduledExam,
} from "@/client/hooks";
import { useAvailableExamStructures } from "@/client/hooks/use-exam-structures";
import type { ScheduledExamStatus } from "@/client/types/class-levels";
import { scheduledExamStatuses, scheduledExamStatusLabels } from "@/client/types/class-levels";

interface CreateScheduledExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Pre-select class level */
  defaultClassLevelId?: string;
  /** Pre-select subject */
  defaultSubjectId?: string;
}

type Step = "select" | "details";

export function CreateScheduledExamModal({
  isOpen,
  onClose,
  onSuccess,
  defaultClassLevelId,
  defaultSubjectId,
}: CreateScheduledExamModalProps) {
  // Step state
  const [step, setStep] = useState<Step>("select");

  // Selection state
  const [selectedClassLevelId, setSelectedClassLevelId] = useState<string>(defaultClassLevelId || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubjectId || "");
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);

  // Form state
  const [nameEn, setNameEn] = useState("");
  const [nameMr, setNameMr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionMr, setDescriptionMr] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [status, setStatus] = useState<ScheduledExamStatus>("draft");
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [publishResults, setPublishResults] = useState(false);

  // Fetch data
  const { data: classLevels, loading: loadingClassLevels } = useClassLevels();
  const { data: allSubjects, loading: loadingSubjects, execute: fetchSubjects } = useSubjects(selectedClassLevelId || undefined);
  const { data: examStructures, loading: loadingStructures, execute: fetchStructures } = useAvailableExamStructures(
    selectedSubjectId,
    selectedClassLevelId
  );

  // Create mutation
  const createMutation = useCreateScheduledExam();

  // Refetch subjects when class level changes
  useEffect(() => {
    if (selectedClassLevelId) {
      fetchSubjects();
    }
  }, [selectedClassLevelId, fetchSubjects]);

  // Filter subjects based on selected class level
  const subjects = useMemo(() => {
    if (!allSubjects) return [];
    // Return all subjects (they're already filtered by class level in the hook if provided)
    return allSubjects.filter(s => !s.is_category);
  }, [allSubjects]);

  // Fetch structures when subject changes
  useEffect(() => {
    if (selectedSubjectId && selectedClassLevelId) {
      fetchStructures();
    }
  }, [selectedSubjectId, selectedClassLevelId, fetchStructures]);

  // Update form values when structure is selected
  useEffect(() => {
    if (selectedStructureId && examStructures) {
      const structure = examStructures.find((s) => s.id === selectedStructureId);
      if (structure) {
        setTotalMarks(structure.total_marks);
        setDurationMinutes(structure.duration_minutes);
      }
    }
  }, [selectedStructureId, examStructures]);

  // Get selected names for display
  const selectedClassLevel = classLevels?.find((cl) => cl.id === selectedClassLevelId);
  const selectedSubject = subjects?.find((s) => s.id === selectedSubjectId);
  const selectedStructure = examStructures?.find((s) => s.id === selectedStructureId);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(defaultClassLevelId && defaultSubjectId ? "details" : "select");
      setSelectedClassLevelId(defaultClassLevelId || "");
      setSelectedSubjectId(defaultSubjectId || "");
      setSelectedStructureId(null);
      setNameEn("");
      setNameMr("");
      setDescriptionEn("");
      setDescriptionMr("");
      setTotalMarks(100);
      setDurationMinutes(60);
      setScheduledDate("");
      setScheduledTime("");
      setStatus("draft");
      setMaxAttempts(0);
      setPublishResults(false);
    }
  }, [isOpen, defaultClassLevelId, defaultSubjectId]);

  const canProceedToDetails = selectedClassLevelId && selectedSubjectId;

  const handleProceedToDetails = () => {
    if (!canProceedToDetails) {
      toast.error("Please select a class level and subject");
      return;
    }
    setStep("details");
  };

  const handleBack = () => {
    setStep("select");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim()) {
      toast.error("Please enter an exam name");
      return;
    }

    if (!selectedClassLevelId || !selectedSubjectId) {
      toast.error("Please select a class level and subject");
      return;
    }

    const data = {
      name_en: nameEn.trim(),
      name_mr: nameMr.trim() || nameEn.trim(),
      description_en: descriptionEn.trim() || undefined,
      description_mr: descriptionMr.trim() || undefined,
      class_level_id: selectedClassLevelId,
      subject_id: selectedSubjectId,
      exam_structure_id: selectedStructureId || undefined,
      total_marks: totalMarks,
      duration_minutes: durationMinutes,
      scheduled_date: scheduledDate || undefined,
      scheduled_time: scheduledTime || undefined,
      status,
      is_active: true,
      publish_results: publishResults,
      max_attempts: maxAttempts,
    };

    const result = await createMutation.mutate(data);
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Schedule New Exam
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {step === "select"
                    ? "Select class, subject, and blueprint"
                    : "Fill in exam details"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 border-b border-neutral-200 px-6 py-3 dark:border-neutral-700">
            <div
              className={clsx(
                "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                step === "select"
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
              )}
            >
              {step === "details" ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">1</span>}
              <span>Selection</span>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            <div
              className={clsx(
                "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                step === "details"
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              )}
            >
              <span className="text-xs">2</span>
              <span>Details</span>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-6">
            {step === "select" ? (
              <div className="space-y-6">
                {/* Class Level Selection */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <Layers className="h-4 w-4" />
                    Class Level <span className="text-error-500">*</span>
                  </label>
                  {loadingClassLevels ? (
                    <div className="flex items-center justify-center py-4">
                      <LoaderSpinner size="sm" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {classLevels?.map((cl) => (
                        <button
                          key={cl.id}
                          onClick={() => {
                            setSelectedClassLevelId(cl.id);
                            setSelectedSubjectId("");
                            setSelectedStructureId(null);
                          }}
                          className={clsx(
                            "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all",
                            selectedClassLevelId === cl.id
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                          )}
                        >
                          <div
                            className={clsx(
                              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                              selectedClassLevelId === cl.id
                                ? "bg-primary-500 text-white"
                                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                            )}
                          >
                            {cl.name_en.match(/\d+/)?.[0] || cl.name_en[0]}
                          </div>
                          <span
                            className={clsx(
                              "text-sm font-medium",
                              selectedClassLevelId === cl.id
                                ? "text-primary-700 dark:text-primary-300"
                                : "text-neutral-700 dark:text-neutral-300"
                            )}
                          >
                            {cl.name_en}
                          </span>
                          {selectedClassLevelId === cl.id && (
                            <Check className="ml-auto h-4 w-4 text-primary-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subject Selection */}
                {selectedClassLevelId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <BookOpen className="h-4 w-4" />
                      Subject <span className="text-error-500">*</span>
                    </label>
                    {loadingSubjects ? (
                      <div className="flex items-center justify-center py-4">
                        <LoaderSpinner size="sm" />
                      </div>
                    ) : subjects.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-neutral-200 p-6 text-center dark:border-neutral-700">
                        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          No subjects found for this class level.
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Add subjects to this class level first.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {subjects.map((subject) => (
                          <button
                            key={subject.id}
                            onClick={() => {
                              setSelectedSubjectId(subject.id);
                              setSelectedStructureId(null);
                            }}
                            className={clsx(
                              "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all",
                              selectedSubjectId === subject.id
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                            )}
                          >
                            <span
                              className={clsx(
                                "text-sm font-medium",
                                selectedSubjectId === subject.id
                                  ? "text-primary-700 dark:text-primary-300"
                                  : "text-neutral-700 dark:text-neutral-300"
                              )}
                            >
                              {subject.name_en}
                            </span>
                            {selectedSubjectId === subject.id && (
                              <Check className="ml-auto h-4 w-4 text-primary-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Exam Structure Selection (Optional) */}
                {selectedSubjectId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <Sparkles className="h-4 w-4" />
                      Exam Blueprint
                      <span className="text-xs font-normal text-neutral-400">(Optional)</span>
                    </label>
                    {loadingStructures ? (
                      <div className="flex items-center justify-center py-4">
                        <LoaderSpinner size="sm" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* No blueprint option */}
                        <button
                          onClick={() => setSelectedStructureId(null)}
                          className={clsx(
                            "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                            selectedStructureId === null
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                          )}
                        >
                          <div
                            className={clsx(
                              "flex h-10 w-10 items-center justify-center rounded-lg",
                              selectedStructureId === null
                                ? "bg-primary-500 text-white"
                                : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                            )}
                          >
                            <HelpCircle className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-neutral-900 dark:text-white">
                              Custom Configuration
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              Set marks and duration manually
                            </p>
                          </div>
                          {selectedStructureId === null && (
                            <Check className="h-5 w-5 text-primary-500" />
                          )}
                        </button>

                        {/* Available blueprints */}
                        {examStructures?.map((structure) => (
                          <button
                            key={structure.id}
                            onClick={() => setSelectedStructureId(structure.id)}
                            className={clsx(
                              "flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                              selectedStructureId === structure.id
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                            )}
                          >
                            <div
                              className={clsx(
                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                selectedStructureId === structure.id
                                  ? "bg-primary-500 text-white"
                                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                              )}
                            >
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900 dark:text-white">
                                {structure.name_en}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                <span className="flex items-center gap-1">
                                  <Target className="h-3.5 w-3.5" />
                                  {structure.total_marks} marks
                                </span>
                                <span className="flex items-center gap-1">
                                  <HelpCircle className="h-3.5 w-3.5" />
                                  {structure.total_questions} questions
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {structure.duration_minutes} min
                                </span>
                              </div>
                            </div>
                            {selectedStructureId === structure.id && (
                              <Check className="h-5 w-5 shrink-0 text-primary-500" />
                            )}
                          </button>
                        ))}

                        {(!examStructures || examStructures.length === 0) && (
                          <p className="py-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            No blueprints available for this subject
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Selected Context Display */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-sm shadow-sm dark:bg-neutral-800">
                    <Layers className="h-3.5 w-3.5 text-neutral-400" />
                    {selectedClassLevel?.name_en}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-sm shadow-sm dark:bg-neutral-800">
                    <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
                    {selectedSubject?.name_en}
                  </span>
                  {selectedStructure && (
                    <>
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1 text-sm text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        {selectedStructure.name_en}
                      </span>
                    </>
                  )}
                </div>

                {/* Name */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Name (English) <span className="text-error-500">*</span>
                    </label>
                    <TextInput
                      value={nameEn}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameEn(e.target.value)}
                      placeholder="e.g., Unit Test 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Name (Marathi)
                    </label>
                    <TextInput
                      value={nameMr}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameMr(e.target.value)}
                      placeholder="e.g., घटक चाचणी १"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Description (English)
                    </label>
                    <TextInput
                      value={descriptionEn}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionEn(e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Description (Marathi)
                    </label>
                    <TextInput
                      value={descriptionMr}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionMr(e.target.value)}
                      placeholder="वैकल्पिक वर्णन"
                    />
                  </div>
                </div>

                {/* Marks & Duration */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <Target className="h-4 w-4" />
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)}
                      min={1}
                      disabled={!!selectedStructureId}
                      className={clsx(
                        "w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900",
                        "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                        "dark:border-neutral-700 dark:bg-neutral-800 dark:text-white",
                        selectedStructureId && "opacity-60 cursor-not-allowed"
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <Clock className="h-4 w-4" />
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                      min={1}
                      disabled={!!selectedStructureId}
                      className={clsx(
                        "w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900",
                        "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                        "dark:border-neutral-700 dark:bg-neutral-800 dark:text-white",
                        selectedStructureId && "opacity-60 cursor-not-allowed"
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Max Attempts
                      <span className="ml-1 text-xs text-neutral-400">(0 = Unlimited)</span>
                    </label>
                    <input
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <Calendar className="h-4 w-4" />
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <Clock className="h-4 w-4" />
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Status
                  </label>
                  <Select
                    value={status}
                    onChange={(value: string) => setStatus(value as ScheduledExamStatus)}
                    options={scheduledExamStatuses.map((s) => ({
                      value: s,
                      label: scheduledExamStatusLabels[s],
                    }))}
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={publishResults}
                      onChange={(e) => setPublishResults(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Publish Results
                    </span>
                  </label>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-neutral-200 p-6 dark:border-neutral-700">
            {step === "select" ? (
              <>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToDetails}
                  disabled={!canProceedToDetails}
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.loading || !nameEn.trim()}
                >
                  {createMutation.loading && <LoaderSpinner size="sm" className="mr-2" />}
                  Create Exam
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
