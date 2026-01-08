"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle, Download, X, Loader2 } from "lucide-react";
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
    <div className="space-y-6">
      <PageHeader
        title="Import Questions"
        description="Upload PDF or CSV files to bulk import questions into the database"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Questions", href: "/dashboard/questions" },
          { label: "Import" },
        ]}
      />

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4">
        {[
          { key: "upload", label: "Upload", icon: Upload },
          { key: "processing", label: "Processing", icon: Loader2 },
          { key: "review", label: "Review", icon: CheckCircle },
        ].map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.key;
          const isCompleted = idx < (step === "upload" ? 0 : step === "processing" ? 1 : 2);

          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors
                  ${isActive ? "border-brand-blue-500 bg-brand-blue-500 text-white" : ""}
                  ${isCompleted ? "border-green-500 bg-green-500 text-white" : "border-neutral-300 text-neutral-400"}
                `}
              >
                <Icon className={`h-5 w-5 ${isActive && s.key === "processing" ? "animate-spin" : ""}`} />
              </div>
              <span
                className={`text-sm font-medium ${isActive ? "text-brand-blue-600 dark:text-brand-blue-400" : "text-neutral-500"}`}
              >
                {s.label}
              </span>
              {idx < 2 && <div className="h-px w-16 bg-neutral-300" />}
            </div>
          );
        })}
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <GlassCard>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Upload File</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Select a PDF or CSV/Excel file to import questions
              </p>
            </div>

            {/* Import Type Toggle */}
            <div className="flex gap-4">
              <button
                onClick={() => setImportType("pdf")}
                className={`flex-1 rounded-lg border-2 p-4 transition-colors ${importType === "pdf"
                    ? "border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/20"
                    : "border-neutral-200 dark:border-neutral-700"
                  }`}
              >
                <FileText className="mx-auto h-8 w-8 text-brand-blue-500" />
                <p className="mt-2 text-sm font-medium">PDF Import</p>
                <p className="mt-1 text-xs text-neutral-500">Upload PDF exam papers</p>
              </button>
              <button
                onClick={() => setImportType("csv")}
                className={`flex-1 rounded-lg border-2 p-4 transition-colors ${importType === "csv"
                    ? "border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/20"
                    : "border-neutral-200 dark:border-neutral-700"
                  }`}
              >
                <Download className="mx-auto h-8 w-8 text-brand-blue-500" />
                <p className="mt-2 text-sm font-medium">CSV/Excel Import</p>
                <p className="mt-1 text-xs text-neutral-500">Upload structured data</p>
              </button>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <Select
                value={subjectSlug}
                onChange={handleSubjectChange}
                options={subjectOptions}
                className="w-full"
              />
            </div>

            {/* Batch Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Batch Name (Optional)
              </label>
              <TextInput
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g., CCC_0101 Import"
                className="w-full"
              />
            </div>

            {/* AI Extraction Toggle (PDF only) */}
            {importType === "pdf" && (
              <>
                {/* Use AI Extraction Toggle */}
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-brand-blue-200 dark:border-brand-blue-800 bg-brand-blue-50 dark:bg-brand-blue-900/20">
                  <input
                    type="checkbox"
                    id="useAI"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-blue-600 focus:ring-brand-blue-500"
                  />
                  <label htmlFor="useAI" className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      Use AI-Powered Extraction
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Enable AI extraction for better accuracy with Marathi text and complex formats. Disable to use traditional parsing (faster but less accurate for Marathi).
                    </div>
                  </label>
                </div>

                {/* AI Model Selection (only shown when AI is enabled) */}
                {useAI && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        AI Model <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={aiModel}
                        onChange={setAiModel}
                        options={aiModelOptions}
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Select the AI model for question extraction. GPT-4o is recommended for best Marathi support.
                      </p>
                    </div>

                    {/* Scholarship Mode Toggle */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                      <input
                        type="checkbox"
                        id="scholarshipMode"
                        checked={scholarshipMode}
                        onChange={(e) => setScholarshipMode(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 text-brand-blue-600 focus:ring-brand-blue-500"
                      />
                      <label htmlFor="scholarshipMode" className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          Maharashtra Scholarship Mode
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Optimized for Maharashtra State Scholarship Exams (Class 5 & 8). Handles two-paper format, Marathi options (क, ख, ग, घ), and questions with two correct answers.
                        </div>
                      </label>
                    </div>
                  </>
                )}
              </>
            )}

            {/* File Upload */}
            {importType === "pdf" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    PDF File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-8 hover:border-brand-blue-500 transition-colors">
                        {pdfFile ? (
                          <div className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-2 text-sm font-medium">{pdfFile.name}</p>
                            <p className="text-xs text-neutral-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                            <p className="mt-2 text-sm font-medium">Click to upload PDF</p>
                            <p className="text-xs text-neutral-500">or drag and drop</p>
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
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Answer Key PDF (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 hover:border-brand-blue-500 transition-colors">
                        {answerKeyFile ? (
                          <div className="text-center">
                            <FileText className="mx-auto h-8 w-8 text-green-500" />
                            <p className="mt-1 text-xs font-medium">{answerKeyFile.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-neutral-400" />
                            <p className="mt-1 text-xs text-neutral-500">Optional: Upload answer key</p>
                          </div>
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
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  CSV/Excel File <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-8 hover:border-brand-blue-500 transition-colors">
                      {csvFile ? (
                        <div className="text-center">
                          <FileText className="mx-auto h-12 w-12 text-green-500" />
                          <p className="mt-2 text-sm font-medium">{csvFile.name}</p>
                          <p className="text-xs text-neutral-500">{(csvFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                          <p className="mt-2 text-sm font-medium">Click to upload CSV/Excel</p>
                          <p className="text-xs text-neutral-500">or drag and drop</p>
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
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!((importType === "pdf" && pdfFile) || (importType === "csv" && csvFile))}
              >
                <Upload className="mr-2 h-4 w-4" />
                Process File
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Processing Step */}
      {step === "processing" && (
        <GlassCard>
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-blue-500" />
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

