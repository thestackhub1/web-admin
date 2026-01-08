// Client-side only — no server secrets or database access here

/**
 * Rich Content Renderer
 * Safely renders HTML content with math equations, tables, images, etc.
 * Used on student-side (web/mobile) to display questions
 */

"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { sanitizeHtml } from '@/client/utils/html-sanitize';

interface RichContentRendererProps {
  content: string;
  language?: "en" | "mr";
  className?: string;
}

export function RichContentRenderer({
  content,
  language = "en",
  className = "",
}: RichContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Sanitize HTML
    const sanitized = sanitizeHtml(content);
    containerRef.current.innerHTML = sanitized;

    // Render math equations
    const mathElements = containerRef.current.querySelectorAll(
      'span[data-type="math"]'
    );

    mathElements.forEach((element) => {
      const formula = element.getAttribute("data-formula");
      const display = element.getAttribute("data-display") === "true";

      if (formula) {
        try {
          const html = katex.renderToString(formula, {
            throwOnError: false,
            displayMode: display,
          });
          element.innerHTML = html;
        } catch (error) {
          console.error("Math rendering error:", error);
          element.textContent = formula;
        }
      }
    });
  }, [content]);

  const fontFamily =
    language === "mr"
      ? "'Noto Sans Devanagari', 'Mukta', 'Arial Unicode MS', sans-serif"
      : "system-ui, -apple-system, sans-serif";

  return (
    <div
      ref={containerRef}
      className={`rich-content ${className}`}
      style={{ fontFamily }}
    >
      {/* Content will be inserted via innerHTML */}
    </div>
  );
}

// Styles for rich content
const styles = `
  .rich-content {
    line-height: 1.6;
  }
  .rich-content p {
    margin: 0.5em 0;
  }
  .rich-content h1, .rich-content h2, .rich-content h3 {
    margin: 1em 0 0.5em 0;
    font-weight: 600;
  }
  .rich-content ul, .rich-content ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }
  .rich-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }
  .rich-content table td,
  .rich-content table th {
    border: 1px solid var(--color-neutral-200, #e5e7eb);
    padding: 0.5em;
  }
  .rich-content table th {
    background-color: var(--color-neutral-100, #f3f4f6);
    font-weight: 600;
  }
  .rich-content img {
    max-width: 100%;
    height: auto;
    margin: 0.5em 0;
  }
  .rich-content .blank-mark {
    display: inline-block;
    min-width: 60px;
    border-bottom: 2px dashed var(--color-neutral-400, #9ca3af);
    margin: 0 0.25em;
    padding: 0 0.5em;
  }
  .rich-content code {
    background-color: var(--color-neutral-100, #f3f4f6);
    padding: 0.125em 0.25em;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.9em;
  }
  .rich-content pre {
    background-color: var(--color-neutral-100, #f3f4f6);
    padding: 1em;
    border-radius: 0.5rem;
    overflow-x: auto;
  }
  .rich-content blockquote {
    border-left: 4px solid var(--color-neutral-200, #e5e7eb);
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
