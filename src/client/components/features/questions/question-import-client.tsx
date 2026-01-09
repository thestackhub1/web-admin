"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from "lucide-react";
import { Loader, LoadingComponent } from "@/client/components/ui/loader";
import { toast } from "sonner";
import { PageHeader, GlassCard, Badge } from '@/client/components/ui/premium';
import { Button } from '@/client/components/ui/button';
import { TextInput } from '@/client/components/ui/input';
import { Select, type SelectOption } from '@/client/components/ui/select';
import { QuestionImportReviewTable } from '@/client/components/features/questions/question-import-review-table';
import { subjectDisplayMap } from "@/client/types/questions";
import type { ParsedQuestion } from "@/lib/pdf/pdf-parser";
import { useChaptersBySubject } from "@/client/hooks";
import {
  useImportPdf,
  useImportCsv,
  useSaveImportDraft,
  useCommitImport
} from "@/client/hooks/use-question-import";

type Step = "upload" | "processing" | "review";

export function QuestionImportClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [subjectSlug, setSubjectSlug] = useState<string>("scholarship");
  const [batchName, setBatchName] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<"pdf" | "csv">("pdf");
  const [useAI, setUseAI] = useState<boolean>(true); // Toggle for AI vs legacy extraction
  const [aiModel, setAiModel] = useState<string>("gpt-4o");
  const [scholarshipMode, setScholarshipMode] = useState<boolean>(true);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [defaultChapterId, setDefaultChapterId] = useState<string>("");
  const [defaultDifficulty, setDefaultDifficulty] = useState<string>("medium");
  const [defaultMarks, setDefaultMarks] = useState<number>(1);

  // Use hook to fetch chapters based on selected subject
  const { data: chaptersData } = useChaptersBySubject(subjectSlug);
  const chapters = (chaptersData || []).map(ch => ({
    id: ch.id,
    name_en: ch.name_en,
    name_mr: ch.name_mr || ch.name_en,
  }));

  // Import hooks
  const { importPdf, loading: isPdfLoading } = useImportPdf();
  const { importCsv, loading: isCsvLoading } = useImportCsv();
  const { saveDraft, loading: isSaving } = useSaveImportDraft();
  const { commit, loading: isCommitting } = useCommitImport();

  const isProcessing = isPdfLoading || isCsvLoading;

  const subjectOptions: SelectOption[] = [
    { value: "scholarship", label: subjectDisplayMap.scholarship || "Scholarship" },
    { value: "english", label: subjectDisplayMap.english || "English" },
    { value: "information-technology", label: subjectDisplayMap["information-technology"] || "Information Technology" },
  ];

  const aiModelOptions: SelectOption[] = [
    { value: "gpt-4o", label: "GPT-4o (Best for Marathi)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Cost-effective)" },
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Excellent reasoning)" },
    { value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B (Fast, Groq)" },
  ];

  const handleSubjectChange = (value: string) => {
    setSubjectSlug(value);
    // Chapters will automatically refetch via the useChaptersBySubject hook
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "pdf" | "answerKey" | "csv") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "pdf" && file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    if (type === "csv" && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Please select a CSV or Excel file");
      return;
    }

    if (type === "pdf") setPdfFile(file);
    else if (type === "answerKey") setAnswerKeyFile(file);
    else if (type === "csv") setCsvFile(file);
  };

  const handleUpload = async () => {
    if (importType === "pdf" && !pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (importType === "csv" && !csvFile) {
      toast.error("Please select a CSV or Excel file");
      return;
    }

    setStep("processing");

    try {
      if (importType === "pdf") {
        setProcessingMessage(
          useAI
            ? `Extracting questions using ${aiModelOptions.find(m => m.value === aiModel)?.label || aiModel}...`
            : "Processing PDF with traditional parser..."
        );

        const result = await importPdf({
          subjectSlug,
          batchName: batchName || `Import ${new Date().toLocaleDateString()}`,
          pdfFile: pdfFile!,
          answerKeyFile: answerKeyFile || undefined,
          useAI,
          aiModel: useAI ? aiModel : undefined,
          scholarshipMode: useAI ? scholarshipMode : undefined,
        });

        if (result) {
          setBatchId(result.batchId);
          setParsedQuestions(result.questions || []);
          setStep("review");
          setProcessingMessage("");
          toast.success(`Successfully extracted ${result.questionsCount} questions using AI`);
        } else {
          setStep("upload");
        }
      } else {
        setProcessingMessage("Processing CSV file...");

        const result = await importCsv({
          subjectSlug,
          batchName: batchName || `Import ${new Date().toLocaleDateString()}`,
          csvFile: csvFile!,
        });

        if (result) {
          setBatchId(result.batchId);
          setParsedQuestions(result.questions || []);
          setStep("review");
          setProcessingMessage("");
          toast.success(`Successfully processed ${result.questionsCount} questions`);
        } else {
          setStep("upload");
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setStep("upload");
    }
  };

  const handleSaveDraft = async () => {
    if (!batchId) return;

    await saveDraft({
      batchId,
      questions: parsedQuestions,
      batchName: batchName || undefined,
    });
  };

  const handleCommit = async () => {
    if (!batchId || parsedQuestions.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to import ${parsedQuestions.length} questions to the database? This action cannot be undone.`
    );

    if (!confirmed) return;

    await commit(
      {
        batchId,
        defaultChapterId: defaultChapterId || undefined,
        defaultClassLevel: "class_10",
        defaultDifficulty: defaultDifficulty,
        defaultMarks: defaultMarks,
      },
      subjectSlug
    );
  };

  const handleExportExcel = () => {
    // Convert parsed questions to Excel format
    const data = parsedQuestions.map((q, idx) => ({
      "Question #": q.questionNumber || idx + 1,
      "Question (Marathi)": q.questionTextMr || "",
      "Question (English)": q.questionTextEn || "",
      "Option A": q.options?.[0] || "",
      "Option B": q.options?.[1] || "",
      "Option C": q.options?.[2] || "",
      "Option D": q.options?.[3] || "",
      "Correct Answer": q.correctAnswer !== undefined ? String.fromCharCode(65 + q.correctAnswer) : "",
      "Type": q.questionType || "mcq_single",
      "Difficulty": q.difficulty || "medium",
      "Marks": q.marks || 1,
    }));

    // Create CSV content
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header as keyof typeof row] || "";
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      ),
    ];

    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subjectSlug}-import-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Import Questions"
        description="Bulk import questions from PDF or CSV files"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Questions", href: "/dashboard/questions" },
          { label: "Import" },
        ]}
      />

      {/* Step Indicator - Compact & Modern */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-0 rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
          {[
            { key: "upload", label: "Upload", num: 1 },
            { key: "processing", label: "Processing", num: 2 },
            { key: "review", label: "Review", num: 3 },
          ].map((s, idx) => {
            const isActive = step === s.key;
            const isCompleted = idx < (step === "upload" ? 0 : step === "processing" ? 1 : 2);

            return (
              <div key={s.key} className="flex items-center">
                <div
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${isActive ? "bg-white shadow-sm text-neutral-900 dark:bg-neutral-700 dark:text-white" : ""}
                    ${isCompleted ? "text-success-600 dark:text-success-400" : "text-neutral-500"}
                    ${!isActive && !isCompleted ? "text-neutral-400" : ""}
                  `}
                >
                  <span className={`
                    flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold
                    ${isActive ? "bg-primary-500 text-white" : ""}
                    ${isCompleted ? "bg-success-500 text-white" : ""}
                    ${!isActive && !isCompleted ? "bg-neutral-300 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300" : ""}
                  `}>
                    {isCompleted ? "✓" : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Import Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setImportType("pdf")}
              className={`
                relative rounded-xl border-2 p-5 text-left transition-all
                ${importType === "pdf"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20"
                  : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
                }
              `}
            >
              {importType === "pdf" && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-primary-500" />
                </div>
              )}
              <FileText className={`h-8 w-8 ${importType === "pdf" ? "text-primary-500" : "text-neutral-400"}`} />
              <p className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">PDF Import</p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Upload PDF exam papers with AI extraction
              </p>
            </button>
            <button
              onClick={() => setImportType("csv")}
              className={`
                relative rounded-xl border-2 p-5 text-left transition-all
                ${importType === "csv"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20"
                  : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
                }
              `}
            >
              {importType === "csv" && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-primary-500" />
                </div>
              )}
              <Download className={`h-8 w-8 ${importType === "csv" ? "text-primary-500" : "text-neutral-400"}`} />
              <p className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">CSV/Excel Import</p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Upload structured spreadsheet data
              </p>
            </button>
          </div>

          {/* Main Form Card */}
          <GlassCard className="p-0! overflow-hidden">
            {/* Form Header */}
            <div className="border-b border-neutral-100 dark:border-neutral-800 px-6 py-4">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {importType === "pdf" ? "PDF Import Settings" : "CSV Import Settings"}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Configure your import options
              </p>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-5">
              {/* Subject Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={subjectSlug}
                    onChange={handleSubjectChange}
                    options={subjectOptions}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Batch Name <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <TextInput
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g., CCC_0101 Import"
                    className="w-full"
                  />
                </div>
              </div>

              {/* AI Extraction Toggle (PDF only) */}
              {importType === "pdf" && (
                <div className="space-y-4">
                  {/* AI Toggle */}
                  <div className={`
                    flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${useAI 
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }
                  `} onClick={() => setUseAI(!useAI)}>
                    <input
                      type="checkbox"
                      id="useAI"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="useAI" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                          AI-Powered Extraction
                        </span>
                        <Badge variant="success" size="sm">Recommended</Badge>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Better accuracy with Marathi text and complex formats
                      </p>
                    </label>
                  </div>

                  {/* AI Model Selection */}
                  {useAI && (
                    <div className="pl-7 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                          AI Model
                        </label>
                        <Select
                          value={aiModel}
                          onChange={setAiModel}
                          options={aiModelOptions}
                          className="w-full"
                        />
                      </div>

                      {/* Scholarship Mode */}
                      <div className={`
                        flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
                        ${scholarshipMode 
                          ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700" 
                          : "border-neutral-200 dark:border-neutral-700"
                        }
                      `} onClick={() => setScholarshipMode(!scholarshipMode)}>
                        <input
                          type="checkbox"
                          id="scholarshipMode"
                          checked={scholarshipMode}
                          onChange={(e) => setScholarshipMode(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="scholarshipMode" className="flex-1 cursor-pointer">
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            Maharashtra Scholarship Mode
                          </span>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Optimized for Class 5 & 8 scholarship exams with Marathi options (क, ख, ग, घ)
                          </p>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* File Upload */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {importType === "pdf" ? "PDF File" : "CSV/Excel File"} <span className="text-red-500">*</span>
                </label>
                
                {importType === "pdf" ? (
                  <div className="space-y-3">
                    {/* Main PDF Upload */}
                    <label className="block cursor-pointer">
                      <div className={`
                        flex items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all
                        ${pdfFile 
                          ? "border-success-300 bg-success-50 dark:border-success-700 dark:bg-success-900/20" 
                          : "border-neutral-300 hover:border-primary-400 hover:bg-primary-50/50 dark:border-neutral-600 dark:hover:border-primary-500"
                        }
                      `}>
                        {pdfFile ? (
                          <div className="text-center">
                            <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-xl bg-success-100 dark:bg-success-900/30">
                              <FileText className="h-7 w-7 text-success-600 dark:text-success-400" />
                            </div>
                            <p className="mt-3 text-sm font-medium text-neutral-900 dark:text-white">{pdfFile.name}</p>
                            <p className="text-xs text-neutral-500 mt-1">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button
                              onClick={(e) => { e.preventDefault(); setPdfFile(null); }}
                              className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800">
                              <Upload className="h-7 w-7 text-neutral-400" />
                            </div>
                            <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Drop your PDF here or <span className="text-primary-600">browse</span>
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">Supports PDF files up to 50MB</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileSelect(e, "pdf")}
                        className="hidden"
                      />
                    </label>

                    {/* Answer Key (Optional) */}
                    <label className="block cursor-pointer">
                      <div className={`
                        flex items-center gap-4 rounded-lg border p-4 transition-all
                        ${answerKeyFile 
                          ? "border-success-300 bg-success-50 dark:border-success-700 dark:bg-success-900/20" 
                          : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700"
                        }
                      `}>
                        <div className={`
                          flex items-center justify-center w-10 h-10 rounded-lg
                          ${answerKeyFile ? "bg-success-100 dark:bg-success-900/30" : "bg-neutral-100 dark:bg-neutral-800"}
                        `}>
                          <FileText className={`h-5 w-5 ${answerKeyFile ? "text-success-600" : "text-neutral-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {answerKeyFile ? (
                            <>
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{answerKeyFile.name}</p>
                              <p className="text-xs text-neutral-500">Answer key attached</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Answer Key PDF</p>
                              <p className="text-xs text-neutral-500">Optional - Click to upload</p>
                            </>
                          )}
                        </div>
                        {answerKeyFile && (
                          <button
                            onClick={(e) => { e.preventDefault(); setAnswerKeyFile(null); }}
                            className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileSelect(e, "answerKey")}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className={`
                      flex items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all
                      ${csvFile 
                        ? "border-success-300 bg-success-50 dark:border-success-700 dark:bg-success-900/20" 
                        : "border-neutral-300 hover:border-primary-400 hover:bg-primary-50/50 dark:border-neutral-600 dark:hover:border-primary-500"
                      }
                    `}>
                      {csvFile ? (
                        <div className="text-center">
                          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-xl bg-success-100 dark:bg-success-900/30">
                            <FileText className="h-7 w-7 text-success-600 dark:text-success-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-neutral-900 dark:text-white">{csvFile.name}</p>
                          <p className="text-xs text-neutral-500 mt-1">{(csvFile.size / 1024).toFixed(2)} KB</p>
                          <button
                            onClick={(e) => { e.preventDefault(); setCsvFile(null); }}
                            className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800">
                            <Upload className="h-7 w-7 text-neutral-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Drop your file here or <span className="text-primary-600">browse</span>
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">Supports CSV and Excel files</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => handleFileSelect(e, "csv")}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Form Footer */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!((importType === "pdf" && pdfFile) || (importType === "csv" && csvFile))}
              >
                <Upload className="mr-2 h-4 w-4" />
                Process {importType === "pdf" ? "PDF" : "File"}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Processing Step */}
      {step === "processing" && (
        <GlassCard>
          <div className="py-12 text-center">
            <LoadingComponent size="lg" message="Reading file and preparing import..." />
            <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
              {processingMessage || "Processing file..."}
            </p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {importType === "pdf"
                ? `Extracting questions from PDF using AI. This may take 30-60 seconds depending on PDF size.`
                : "Processing CSV file. This may take a few moments."}
            </p>
            {importType === "pdf" && (
              <div className="mt-4 max-w-md mx-auto">
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-brand-blue-500 h-full animate-pulse" style={{ width: "60%" }} />
                </div>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  AI is analyzing the PDF and extracting questions...
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Review Step */}
      {step === "review" && (
        <div className="space-y-6">
          {/* Default Settings */}
          <GlassCard>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Default Settings</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Default Chapter
                  </label>
                  <Select
                    value={defaultChapterId}
                    onChange={setDefaultChapterId}
                    options={[
                      { value: "", label: "None" },
                      ...chapters.map((ch) => ({
                        value: ch.id,
                        label: `${ch.name_en}`,
                      })),
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Default Difficulty
                  </label>
                  <Select
                    value={defaultDifficulty}
                    onChange={setDefaultDifficulty}
                    options={[
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Default Marks
                  </label>
                  <TextInput
                    type="number"
                    value={defaultMarks.toString()}
                    onChange={(e) => setDefaultMarks(parseInt(e.target.value) || 1)}
                    className="w-full"
                    min={1}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Review Table */}
          <GlassCard>
            <QuestionImportReviewTable
              questions={parsedQuestions}
              chapters={chapters}
              onQuestionsChange={setParsedQuestions}
              defaultChapterId={defaultChapterId}
              defaultDifficulty={defaultDifficulty}
              defaultMarks={defaultMarks}
            />
          </GlassCard>

          {/* Actions */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="info">{parsedQuestions.length} Questions</Badge>
                <Button variant="outline" onClick={handleExportExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleSaveDraft} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader size="sm" variant="white" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </Button>
                <Button variant="danger" onClick={() => setStep("upload")}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleCommit} disabled={isCommitting || parsedQuestions.length === 0}>
                  {isCommitting ? (
                    <>
                      <Loader size="sm" variant="white" className="mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Import to Database
                    </>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

