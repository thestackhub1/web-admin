/**
 * PDF Font Loader
 * Loads and registers custom fonts for jsPDF with Devanagari support
 */

import { jsPDF } from "jspdf";

/**
 * Available fonts for PDF generation
 */
export const PDF_FONTS = {
    // Default Latin fonts (built-in)
    HELVETICA: "helvetica",
    TIMES: "times",
    COURIER: "courier",
    
    // Custom fonts for Devanagari (Marathi, Hindi)
    NOTO_SANS_DEVANAGARI: "NotoSansDevanagari",
} as const;

/**
 * Check if text contains Devanagari characters
 */
export function containsDevanagari(text: string): boolean {
    // Devanagari Unicode range: 0900-097F
    const devanagariRegex = /[\u0900-\u097F]/;
    return devanagariRegex.test(text);
}

/**
 * Get the appropriate text based on language preference
 */
export function getLocalizedText(
    englishText: string | undefined,
    marathiText: string | undefined,
    language: "en" | "mr"
): string {
    if (language === "mr" && marathiText) {
        return marathiText;
    }
    return englishText || "";
}

/**
 * Render text as an image using Canvas (for Devanagari support)
 * This allows rendering any Unicode text by converting it to an image
 */
export function renderTextAsImage(
    text: string,
    options: {
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string;
        color?: string;
        maxWidth?: number;
    } = {}
): { dataUrl: string; width: number; height: number } | null {
    if (typeof document === "undefined") return null;
    
    const {
        fontSize = 12,
        fontFamily = "'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif",
        fontWeight = "normal",
        color = "#000000",
        maxWidth = 500,
    } = options;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set font for measuring
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    // Measure text
    const metrics = ctx.measureText(text);
    const textWidth = Math.min(metrics.width, maxWidth);
    const textHeight = fontSize * 1.3; // Line height

    // Set canvas size with some padding
    canvas.width = textWidth + 4;
    canvas.height = textHeight + 4;

    // Fill background (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font again after resize
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    
    // Draw text
    ctx.fillText(text, 2, 2, maxWidth);

    return {
        dataUrl: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height,
    };
}

/**
 * Add text to PDF with Devanagari support
 * Uses canvas rendering for non-Latin text
 */
export function addTextWithDevanagariSupport(
    doc: jsPDF,
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
        fontSize = 12,
        fontWeight = "normal",
        align = "left",
        maxWidth = 180,
    } = options;

    // Check if text contains Devanagari
    if (containsDevanagari(text)) {
        // Render as image for proper Devanagari support
        const imageData = renderTextAsImage(text, {
            fontSize: fontSize * 3, // Higher resolution for quality
            fontWeight,
            maxWidth: maxWidth * 3,
        });

        if (imageData) {
            // Convert pixel dimensions to mm (assuming 96 DPI screen, 72 DPI PDF)
            const imgWidthMm = imageData.width / 3 / 2.83465; // px to mm
            const imgHeightMm = imageData.height / 3 / 2.83465;

            let imgX = x;
            if (align === "center") {
                imgX = x - imgWidthMm / 2;
            } else if (align === "right") {
                imgX = x - imgWidthMm;
            }

            doc.addImage(imageData.dataUrl, "PNG", imgX, y - imgHeightMm * 0.7, imgWidthMm, imgHeightMm);
            
            return { width: imgWidthMm, height: imgHeightMm };
        }
    }

    // Use regular text for Latin characters
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontWeight === "bold" ? "bold" : "normal");
    
    const textOptions: { align?: "left" | "center" | "right"; maxWidth?: number } = {};
    if (align) textOptions.align = align;
    if (maxWidth) textOptions.maxWidth = maxWidth;
    
    doc.text(text, x, y, textOptions);
    
    // Estimate dimensions
    const textWidth = doc.getTextWidth(text);
    const textHeight = fontSize * 0.3528; // Convert points to mm approximately
    
    return { width: textWidth, height: textHeight };
}
