// Client-side only — no server secrets or database access here

/**
 * Tiptap Math Extension
 * Adds LaTeX math formula support using KaTeX
 */

import { Node, mergeAttributes } from '@tiptap/core';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface MathOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      /**
       * Insert a math formula
       */
      setMath: (options: { latex: string; inline?: boolean }) => ReturnType;
    };
  }
}

export const MathExtension = Node.create<MathOptions>({
  name: 'math',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
      inline: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return {
            latex: element.getAttribute('data-formula') || '',
            inline: element.getAttribute('data-display') !== 'true',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Store LaTeX in data attributes, will be rendered client-side
    return [
      'span',
      mergeAttributes(
        {
          'data-type': 'math',
          'data-formula': HTMLAttributes.latex || '',
          'data-display': HTMLAttributes.inline === false ? 'true' : 'false',
          class: 'math-node',
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('span');
      const { latex, inline } = node.attrs;

      if (!latex) {
        dom.className = 'text-neutral-400 italic';
        dom.textContent = '[Empty formula]';
        return { dom };
      }

      try {
        const html = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: !inline,
        });
        dom.className = `math-formula ${inline ? 'inline-math' : 'block-math'}`;
        dom.innerHTML = html;
      } catch {
        dom.className = 'text-red-500 text-sm';
        dom.textContent = `Error: ${latex}`;
      }

      return { dom };
    };
  },

  addCommands() {
    return {
      setMath:
        (options: { formula?: string; latex?: string; display?: boolean; inline?: boolean }) =>
          ({ commands }) => {
            // Support both 'formula' and 'latex' for backward compatibility
            const latex = options.formula || options.latex || '';
            const inline = options.inline !== undefined ? options.inline : !options.display;
            return commands.insertContent({
              type: this.name,
              attrs: { latex, inline },
            });
          },
    };
  },
});
