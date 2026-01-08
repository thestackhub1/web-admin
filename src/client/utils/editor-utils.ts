// Client-side only — no server secrets or database access here

/**
 * Editor Utilities
 * Helper functions for converting between TipTap JSON and database storage formats
 */

/**
 * TipTap text node structure
 */
interface TextNode {
  type: "text";
  text: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

/**
 * TipTap content node structure (paragraph, heading, etc.)
 */
interface ContentNode {
  type: string;
  content?: Array<ContentNode | TextNode>;
  attrs?: Record<string, unknown>;
}

/**
 * TipTap document structure
 */
export interface TipTapDocument {
  type: "doc";
  content: ContentNode[];
}

/**
 * Union type for any TipTap node
 */
type TipTapNode = TipTapDocument | ContentNode | TextNode;

/**
 * Convert TipTap JSON to string for database storage
 * Since question_text is TEXT in the database, we store JSON as a string
 */
export function jsonToString(json: TipTapDocument | null | undefined): string {
  if (!json) return "";
  return JSON.stringify(json);
}

/**
 * Parse stored JSON string back to TipTap JSON
 */
export function stringToJson(str: string | null | undefined): TipTapDocument | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as TipTapDocument;
  } catch {
    // If parsing fails, assume it's plain text (backward compatibility)
    // Return as a simple paragraph node
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: str,
            } as TextNode,
          ],
        },
      ],
    };
  }
}

/**
 * Check if a string is valid JSON
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert HTML to TipTap JSON (for migration/backward compatibility)
 * Note: This is a basic conversion. For full HTML support, use TipTap's HTML parser
 */
export function htmlToJson(html: string): TipTapDocument {
  if (!html) {
    return {
      type: "doc",
      content: [],
    };
  }

  // Basic conversion - in production, you'd want to use TipTap's HTML parser
  // For now, return as a simple paragraph
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: html.replace(/<[^>]*>/g, ""), // Strip HTML tags
          } as TextNode,
        ],
      },
    ],
  };
}

/**
 * Extract plain text from TipTap JSON content
 * Useful for displaying a text preview in textareas
 */
export function jsonToPlainText(json: TipTapDocument | null | undefined): string {
  if (!json || !json.content) return "";

  const extractText = (node: TipTapNode): string => {
    if ("text" in node && node.type === "text") {
      return (node as TextNode).text || "";
    }

    if ("content" in node && node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join("");
    }

    return "";
  };

  return json.content.map(extractText).join("\n").trim();
}

/**
 * Convert plain text to TipTap JSON format
 * Creates a simple paragraph node with the text
 */
export function plainTextToJson(text: string): TipTapDocument {
  if (!text || text.trim() === "") {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [],
        },
      ],
    };
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: text,
          } as TextNode,
        ],
      },
    ],
  };
}
