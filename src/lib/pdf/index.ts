/**
 * PDF Generation Library
 * Centralized, reusable PDF generation utilities
 */

export { ExamPdfGenerator } from "./exam-pdf-generator";
// font-loader moved to @/client/pdf/font-loader (uses browser APIs)
// Re-export for backward compatibility
export { getLocalizedText, containsDevanagari, addTextWithDevanagariSupport, PDF_FONTS } from "@/client/pdf/font-loader";
export type {
    ExamPdfConfig,
    ExamPdfSection,
    ExamPdfQuestion,
    PdfLanguage,
} from "./types";
