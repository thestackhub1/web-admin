/**
 * Exam PDF Generator
 * Generates professional exam papers using jsPDF
 */

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
    ExamPdfConfig,
    ExamPdfSection,
    ExamPdfQuestion,
    DEFAULT_MARGINS,
    QUESTION_TYPE_LABELS,
    PdfLanguage,
} from "./types";
import { getLocalizedText, containsDevanagari, addTextWithDevanagariSupport } from "@/client/pdf/font-loader";

// Extend jsPDF with autoTable
declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: object) => jsPDF;
        lastAutoTable: { finalY: number };
    }
}

export class ExamPdfGenerator {
    private doc: jsPDF;
    private config: ExamPdfConfig;
    private sections: ExamPdfSection[];
    private currentY: number = 0;
    private pageWidth: number;
    private pageHeight: number;
    private contentWidth: number;
    private margins = DEFAULT_MARGINS;
    private questionCounter: number = 0;
    private language: PdfLanguage;

    constructor(config: ExamPdfConfig, sections: ExamPdfSection[]) {
        this.doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });
        this.config = config;
        this.sections = sections;
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
        this.language = config.language || "en";
    }

    /**
     * Get text based on current language setting
     */
    private getText(english?: string, marathi?: string): string {
        return getLocalizedText(english, marathi, this.language);
    }

    /**
     * Add text to PDF with proper Devanagari (Marathi) support
     */
    private addText(
        text: string,
        x: number,
        y: number,
        options: {
            fontSize?: number;
            fontWeight?: "normal" | "bold";
            align?: "left" | "center" | "right";
            maxWidth?: number;
        } = {}
    ): { width: number; height: number } {
        const {
            fontSize = 10,
            fontWeight = "normal",
            align = "left",
            maxWidth = this.contentWidth,
        } = options;

        // If text contains Devanagari and we're rendering Marathi, use canvas method
        if (this.language === "mr" && containsDevanagari(text)) {
            return addTextWithDevanagariSupport(this.doc, text, x, y, {
                fontSize,
                fontWeight,
                align,
                maxWidth,
            });
        }

        // Use regular jsPDF text rendering for Latin characters
        this.doc.setFontSize(fontSize);
        this.doc.setFont("helvetica", fontWeight === "bold" ? "bold" : "normal");
        this.doc.text(text, x, y, { align, maxWidth });

        const textWidth = this.doc.getTextWidth(text);
        const textHeight = fontSize * 0.3528;

        return { width: textWidth, height: textHeight };
    }

    /**
     * Generate the complete exam PDF
     */
    public generate(): Blob {
        this.currentY = this.margins.top;

        // Draw header
        this.drawHeader();

        // Draw instructions
        this.drawInstructions();

        // Draw sections with questions
        this.sections.forEach((section, index) => {
            this.drawSection(section, index);
        });

        // Add page numbers to all pages
        this.addPageNumbers();

        return this.doc.output("blob");
    }

    /**
     * Draw the exam header with title and metadata
     */
    private drawHeader(): void {
        const startY = this.currentY;
        const headerHeight = 35;

        // Outer border
        this.doc.setDrawColor(0);
        this.doc.setLineWidth(0.5);
        this.doc.rect(this.margins.left, startY, this.contentWidth, headerHeight);

        // Inner border (double border effect)
        this.doc.setLineWidth(0.2);
        this.doc.rect(
            this.margins.left + 1.5,
            startY + 1.5,
            this.contentWidth - 3,
            headerHeight - 3
        );

        // Roll No box (left)
        const rollNoWidth = 25;
        this.doc.setLineWidth(0.3);
        this.doc.line(
            this.margins.left + rollNoWidth,
            startY,
            this.margins.left + rollNoWidth,
            startY + headerHeight - 12
        );

        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Roll No.", this.margins.left + rollNoWidth / 2, startY + 6, {
            align: "center",
        });

        // Roll number line
        this.doc.setLineWidth(0.2);
        this.doc.line(
            this.margins.left + 4,
            startY + 12,
            this.margins.left + rollNoWidth - 4,
            startY + 12
        );
        this.doc.line(
            this.margins.left + 4,
            startY + 18,
            this.margins.left + rollNoWidth - 4,
            startY + 18
        );

        // Marks box (right)
        const marksWidth = 25;
        this.doc.line(
            this.margins.left + this.contentWidth - marksWidth,
            startY,
            this.margins.left + this.contentWidth - marksWidth,
            startY + headerHeight - 12
        );

        this.doc.text(
            "Marks",
            this.margins.left + this.contentWidth - marksWidth / 2,
            startY + 6,
            { align: "center" }
        );

        // Marks lines
        this.doc.line(
            this.margins.left + this.contentWidth - marksWidth + 4,
            startY + 12,
            this.margins.left + this.contentWidth - 4,
            startY + 12
        );
        this.doc.line(
            this.margins.left + this.contentWidth - marksWidth + 4,
            startY + 18,
            this.margins.left + this.contentWidth - 4,
            startY + 18
        );

        // Center content - Title
        const centerX = this.margins.left + this.contentWidth / 2;

        // Institution name
        const instituteName = this.getText(
            this.config.instituteName || "EXAMINATION",
            this.config.instituteNameMr || "परीक्षा"
        );
        this.addText(instituteName, centerX, startY + 7, {
            fontSize: 9,
            fontWeight: "bold",
            align: "center",
        });

        // Exam title (use appropriate language)
        const examTitle = this.getText(this.config.examName, this.config.examNameMr);
        this.addText(examTitle, centerX, startY + 14, {
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
        });

        // Metadata row
        const metaY = startY + headerHeight - 10;
        this.doc.setLineWidth(0.3);
        this.doc.line(
            this.margins.left,
            metaY,
            this.margins.left + this.contentWidth,
            metaY
        );

        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "normal");

        const totalQuestions = this.sections.reduce(
            (sum, s) => sum + s.questions.length,
            0
        );

        // Language-aware labels
        const labels = this.language === "mr" 
            ? { subject: "विषय", class: "वर्ग", maxMarks: "एकूण गुण", time: "वेळ", questions: "प्रश्न", mins: "मिनिटे" }
            : { subject: "Subject", class: "Class", maxMarks: "Max Marks", time: "Time", questions: "Questions", mins: "mins" };

        const metaItems: string[] = [];
        const subjectName = this.getText(this.config.subjectName, this.config.subjectNameMr);
        const className = this.getText(this.config.classLevelName, this.config.classLevelNameMr);
        
        if (subjectName) {
            metaItems.push(`${labels.subject}: ${subjectName}`);
        }
        if (className) {
            metaItems.push(`${labels.class}: ${className}`);
        }
        metaItems.push(`${labels.maxMarks}: ${this.config.totalMarks}`);
        metaItems.push(`${labels.time}: ${this.config.durationMinutes} ${labels.mins}`);
        metaItems.push(`${labels.questions}: ${totalQuestions}`);

        // Calculate spacing for metadata
        const metaText = metaItems.join("   |   ");
        this.addText(metaText, centerX, metaY + 7, {
            fontSize: 8,
            fontWeight: "normal",
            align: "center",
        });

        this.currentY = startY + headerHeight + 5;
    }

    /**
     * Draw general instructions box
     */
    private drawInstructions(): void {
        const startY = this.currentY;
        
        // Default instructions in both languages
        const defaultInstructionsEn = [
            "Read all questions carefully before attempting.",
            "All questions are compulsory unless otherwise specified.",
            "Write your answers neatly and legibly in the space provided.",
            "Marks for each question are indicated in brackets.",
        ];
        const defaultInstructionsMr = [
            "उत्तर देण्यापूर्वी सर्व प्रश्न काळजीपूर्वक वाचा.",
            "अन्यथा निर्दिष्ट केल्याशिवाय सर्व प्रश्न अनिवार्य आहेत.",
            "दिलेल्या जागेत तुमची उत्तरे नीटनेटके आणि वाचनीय लिहा.",
            "प्रत्येक प्रश्नाचे गुण कंसात दर्शविले आहेत.",
        ];

        const instructions = this.language === "mr"
            ? (this.config.instructionsMr || defaultInstructionsMr)
            : (this.config.instructions || defaultInstructionsEn);

        const headerTitle = this.language === "mr" ? "सामान्य सूचना" : "GENERAL INSTRUCTIONS";

        // Instructions header
        this.doc.setFillColor(245, 245, 245);
        this.doc.setDrawColor(100);
        this.doc.setLineWidth(0.2);
        this.doc.rect(this.margins.left, startY, this.contentWidth, 7, "FD");

        this.addText(headerTitle, this.margins.left + 3, startY + 5, {
            fontSize: 9,
            fontWeight: "bold",
        });

        // Instructions content
        const contentStartY = startY + 7;
        const lineHeight = 6; // Increased for image-based text
        const contentHeight = instructions.length * lineHeight + 4;

        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(this.margins.left, contentStartY, this.contentWidth, contentHeight, "D");

        instructions.forEach((instruction, index) => {
            this.addText(
                `${index + 1}. ${instruction}`,
                this.margins.left + 3,
                contentStartY + 4 + index * lineHeight,
                { fontSize: 8, fontWeight: "normal" }
            );
        });

        this.currentY = contentStartY + contentHeight + 5;
    }

    /**
     * Draw a section with its questions
     */
    private drawSection(section: ExamPdfSection, sectionIndex: number): void {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 60) {
            this.doc.addPage();
            this.currentY = this.margins.top;
        }

        const sectionLetter = String.fromCharCode(65 + sectionIndex);
        const startY = this.currentY;

        // Section header
        this.doc.setFillColor(232, 232, 232);
        this.doc.setDrawColor(0);
        this.doc.setLineWidth(0.3);
        this.doc.rect(this.margins.left, startY, this.contentWidth, 8, "FD");

        const sectionName = this.getText(section.name_en, section.name_mr);
        const sectionLabel = this.language === "mr" ? "विभाग" : "SECTION";
        const sectionTitle = `${sectionLabel} ${sectionLetter} - ${sectionName.toUpperCase()}`;
        this.addText(sectionTitle, this.margins.left + 3, startY + 5.5, {
            fontSize: 10,
            fontWeight: "bold",
        });

        // Marks info (always English numbers)
        const marksText = `(${section.questions.length} x ${section.marks_per_question} = ${section.total_marks} marks)`;
        this.doc.setFontSize(9);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(
            marksText,
            this.margins.left + this.contentWidth - 3,
            startY + 5.5,
            { align: "right" }
        );

        // Section instructions
        const defaultSectionNote = this.language === "mr"
            ? `खालील ${QUESTION_TYPE_LABELS[section.question_type]?.toLowerCase() || section.question_type} प्रश्नांची उत्तरे द्या.`
            : `Answer the following ${QUESTION_TYPE_LABELS[section.question_type]?.toLowerCase() || section.question_type}.`;
        const sectionNote = this.getText(section.instructions_en, section.instructions_mr) || defaultSectionNote;

        this.doc.setFillColor(250, 250, 250);
        this.doc.setDrawColor(200);
        this.doc.rect(this.margins.left, startY + 8, this.contentWidth, 6, "FD");

        this.addText(sectionNote, this.margins.left + 3, startY + 12, {
            fontSize: 8,
            fontWeight: "normal",
        });

        this.currentY = startY + 16;

        // Draw questions
        section.questions.forEach((question) => {
            this.drawQuestion(question, section);
        });

        // Add separator line
        this.doc.setDrawColor(200);
        this.doc.setLineWidth(0.1);
        this.doc.line(
            this.margins.left + 20,
            this.currentY,
            this.margins.left + this.contentWidth - 20,
            this.currentY
        );
        this.currentY += 5;
    }

    /**
     * Draw a single question with its answer area
     */
    private drawQuestion(question: ExamPdfQuestion, section: ExamPdfSection): void {
        // Check if we need a new page
        const estimatedHeight = this.estimateQuestionHeight(question, section);
        if (this.currentY + estimatedHeight > this.pageHeight - this.margins.bottom) {
            this.doc.addPage();
            this.currentY = this.margins.top;
        }

        this.questionCounter++;
        const startY = this.currentY;

        // Question number
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "bold");
        const qNumText = `${this.questionCounter}.`;
        this.doc.text(qNumText, this.margins.left, startY + 4);

        // Question text with Devanagari support
        const textStartX = this.margins.left + 8;
        const maxTextWidth = this.contentWidth - 20;

        // Use question text based on language
        const questionText = question.question_text;
        
        // For Devanagari text, we render as image; for Latin, use regular text
        let linesCount = 1;
        if (this.language === "mr" && containsDevanagari(questionText)) {
            // Render question text as image for Marathi
            this.addText(questionText, textStartX, startY + 4, {
                fontSize: 10,
                fontWeight: "normal",
                maxWidth: maxTextWidth,
            });
            // Estimate lines based on text length
            linesCount = Math.ceil(questionText.length / 60);
        } else {
            // Use regular jsPDF text with word wrap
            this.doc.setFont("helvetica", "normal");
            this.doc.setFontSize(10);
            const lines = this.doc.splitTextToSize(questionText, maxTextWidth);
            this.doc.text(lines, textStartX, startY + 4);
            linesCount = lines.length;
        }

        // Marks indicator
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "bold");
        const marksIndicator = `[${section.marks_per_question}]`;
        this.doc.text(
            marksIndicator,
            this.margins.left + this.contentWidth,
            startY + 4,
            { align: "right" }
        );

        const lineHeight = this.language === "mr" ? 5.5 : 4.5;
        this.currentY = startY + 4 + linesCount * lineHeight;

        // Draw answer area based on question type
        this.drawAnswerArea(question, section.question_type);

        this.currentY += 3;
    }

    /**
     * Draw answer area based on question type
     */
    private drawAnswerArea(question: ExamPdfQuestion, questionType: string): void {
        const data = question.answer_data;

        switch (questionType) {
            case "mcq_single":
            case "mcq_multiple":
                this.drawMcqOptions(data?.options || []);
                break;

            case "true_false":
                this.drawTrueFalse();
                break;

            case "fill_blank":
                this.drawFillBlank();
                break;

            case "match":
                this.drawMatchColumns(data?.left_column || [], data?.right_column || []);
                break;

            case "short_answer":
                this.drawAnswerLines(3);
                break;

            case "long_answer":
                this.drawAnswerLines(6);
                break;

            case "programming":
                this.drawCodeArea();
                break;

            default:
                this.drawAnswerLines(2);
        }
    }

    /**
     * Draw MCQ options
     */
    private drawMcqOptions(options: string[]): void {
        const startX = this.margins.left + 12;
        this.currentY += 2;

        options.forEach((option, index) => {
            const label = `(${String.fromCharCode(65 + index)})`;
            this.doc.setFontSize(9);
            this.doc.setFont("helvetica", "normal");
            this.doc.text(label, startX, this.currentY + 4);
            
            // Use addText for Devanagari support in options
            this.addText(option, startX + 10, this.currentY + 4, {
                fontSize: 9,
                fontWeight: "normal",
            });
            this.currentY += 5;
        });
    }

    /**
     * Draw True/False options
     */
    private drawTrueFalse(): void {
        const startX = this.margins.left + 12;
        this.currentY += 3;

        const trueText = this.language === "mr" ? "खरे" : "TRUE";
        const falseText = this.language === "mr" ? "खोटे" : "FALSE";

        // True option
        this.doc.rect(startX, this.currentY, 4, 4);
        this.addText(trueText, startX + 6, this.currentY + 3, { fontSize: 9 });

        // False option
        this.doc.rect(startX + 35, this.currentY, 4, 4);
        this.addText(falseText, startX + 41, this.currentY + 3, { fontSize: 9 });

        this.currentY += 6;
    }

    /**
     * Draw fill in the blank answer line
     */
    private drawFillBlank(): void {
        const startX = this.margins.left + 12;
        this.currentY += 3;

        const ansLabel = this.language === "mr" ? "उत्तर:" : "Ans:";
        this.addText(ansLabel, startX, this.currentY + 3, { fontSize: 8 });

        this.doc.setDrawColor(150);
        this.doc.setLineWidth(0.2);
        this.doc.line(startX + 12, this.currentY + 3, startX + 100, this.currentY + 3);

        this.currentY += 6;
    }

    /**
     * Draw match the following columns
     */
    private drawMatchColumns(leftColumn: string[], rightColumn: string[]): void {
        const startX = this.margins.left + 12;
        this.currentY += 3;

        const colWidth = (this.contentWidth - 20) / 2 - 5;

        // Column A header
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(startX, this.currentY, colWidth, 6, "F");
        this.doc.setDrawColor(0);
        this.doc.setLineWidth(0.2);
        this.doc.rect(startX, this.currentY, colWidth, 6);

        // Column B header
        this.doc.rect(startX + colWidth + 10, this.currentY, colWidth, 6, "F");
        this.doc.rect(startX + colWidth + 10, this.currentY, colWidth, 6);

        const colALabel = this.language === "mr" ? "स्तंभ अ" : "Column A";
        const colBLabel = this.language === "mr" ? "स्तंभ ब" : "Column B";
        
        this.addText(colALabel, startX + colWidth / 2, this.currentY + 4, {
            fontSize: 8,
            fontWeight: "bold",
            align: "center",
        });
        this.addText(colBLabel, startX + colWidth + 10 + colWidth / 2, this.currentY + 4, {
            fontSize: 8,
            fontWeight: "bold",
            align: "center",
        });

        this.currentY += 6;

        // Items
        const maxItems = Math.max(leftColumn.length, rightColumn.length);

        for (let i = 0; i < maxItems; i++) {
            // Left column item
            this.doc.rect(startX, this.currentY, colWidth, 6);
            if (leftColumn[i]) {
                this.addText(`${i + 1}. ${leftColumn[i]}`, startX + 2, this.currentY + 4, { fontSize: 8 });
            }

            // Right column item
            this.doc.rect(startX + colWidth + 10, this.currentY, colWidth, 6);
            if (rightColumn[i]) {
                this.addText(
                    `(${String.fromCharCode(65 + i)}) ${rightColumn[i]}`,
                    startX + colWidth + 12,
                    this.currentY + 4,
                    { fontSize: 8 }
                );
            }

            this.currentY += 6;
        }

        // Answer area
        this.currentY += 3;
        const answersLabel = this.language === "mr" ? "उत्तरे:" : "Answers:";
        this.addText(answersLabel, startX, this.currentY + 3, { fontSize: 8, fontWeight: "bold" });
        this.currentY += 5;

        const answersPerRow = 5;
        for (let i = 0; i < leftColumn.length; i++) {
            const col = i % answersPerRow;
            if (col === 0 && i > 0) {
                this.currentY += 6;
            }
            const xPos = startX + col * 30;
            this.doc.setFontSize(8);
            this.doc.setFont("helvetica", "normal");
            this.doc.text(`${i + 1} -> (   )`, xPos, this.currentY + 3);
        }
        this.currentY += 6;
    }

    /**
     * Draw answer lines for short/long answer
     */
    private drawAnswerLines(count: number): void {
        const startX = this.margins.left + 8;
        const lineWidth = this.contentWidth - 16;
        this.currentY += 3;

        this.doc.setDrawColor(180);
        this.doc.setLineWidth(0.1);

        for (let i = 0; i < count; i++) {
            this.currentY += 7;
            this.doc.line(startX, this.currentY, startX + lineWidth, this.currentY);
        }

        this.currentY += 2;
    }

    /**
     * Draw code area for programming questions
     */
    private drawCodeArea(): void {
        const startX = this.margins.left + 8;
        const codeWidth = this.contentWidth - 16;
        const codeHeight = 40;
        this.currentY += 3;

        const codeLabel = this.language === "mr" ? "तुमचा कोड लिहा:" : "Write your code:";
        this.addText(codeLabel, startX, this.currentY + 3, { fontSize: 8 });
        this.currentY += 5;

        // Code box
        this.doc.setDrawColor(150);
        this.doc.setLineWidth(0.2);
        this.doc.rect(startX, this.currentY, codeWidth, codeHeight);

        // Lines inside code box
        this.doc.setDrawColor(220);
        this.doc.setLineWidth(0.1);
        for (let i = 1; i <= 5; i++) {
            const y = this.currentY + i * 7;
            this.doc.line(startX + 2, y, startX + codeWidth - 2, y);
        }

        this.currentY += codeHeight + 2;
    }

    /**
     * Estimate question height for page break calculation
     */
    private estimateQuestionHeight(question: ExamPdfQuestion, section: ExamPdfSection): number {
        let height = 15; // Base height for question text

        switch (section.question_type) {
            case "mcq_single":
            case "mcq_multiple":
                height += (question.answer_data?.options?.length || 4) * 5 + 5;
                break;
            case "true_false":
                height += 10;
                break;
            case "fill_blank":
                height += 10;
                break;
            case "match": {
                const matchItems = question.answer_data?.left_column?.length || 4;
                height += matchItems * 6 + 25;
                break;
            }
            case "short_answer":
                height += 25;
                break;
            case "long_answer":
                height += 50;
                break;
            case "programming":
                height += 50;
                break;
            default:
                height += 20;
        }

        return height;
    }

    /**
     * Add page numbers to all pages
     */
    private addPageNumbers(): void {
        const totalPages = this.doc.internal.pages.length - 1;

        for (let i = 1; i <= totalPages; i++) {
            this.doc.setPage(i);

            // Footer line
            this.doc.setDrawColor(180);
            this.doc.setLineWidth(0.1);
            this.doc.line(
                this.margins.left,
                this.pageHeight - 15,
                this.margins.left + this.contentWidth,
                this.pageHeight - 15
            );

            // Left side - exam name and date
            this.doc.setFontSize(7);
            this.doc.setFont("helvetica", "normal");
            this.doc.setTextColor(100);
            const locale = this.language === "mr" ? "mr-IN" : "en-IN";
            const dateStr = new Date().toLocaleDateString(locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
            // Use English exam name for footer to avoid rendering issues
            this.doc.text(
                `${this.config.examName} | ${dateStr}`,
                this.margins.left,
                this.pageHeight - 10
            );

            // Right side - page numbers
            this.doc.setFontSize(9);
            this.doc.setTextColor(60);
            // Keep page numbers in English for consistent rendering
            this.doc.text(
                `Page ${i} of ${totalPages}`,
                this.margins.left + this.contentWidth,
                this.pageHeight - 10,
                { align: "right" }
            );

            // Reset text color
            this.doc.setTextColor(0);
        }
    }

    /**
     * Get the PDF document instance (for advanced usage)
     */
    public getDocument(): jsPDF {
        return this.doc;
    }
}
