// Client-side only — no server secrets or database access here

/**
 * TipTap Blank Extension
 * Creates underlined blanks for fill-in-the-blank questions
 */

import { Mark, mergeAttributes } from '@tiptap/core';

export interface BlankOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blank: {
      setBlank: () => ReturnType;
      unsetBlank: () => ReturnType;
    };
  }
}

export const BlankExtension = Mark.create<BlankOptions>({
  name: 'blank',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="blank"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'blank',
        class: 'blank-mark inline-block min-w-[60px] border-b-2 border-dashed border-neutral-400 dark:border-neutral-500 mx-1 px-2',
        style: 'text-decoration: none;',
      }),
      '_____',
    ];
  },

  addCommands() {
    return {
      setBlank:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      unsetBlank:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.setBlank(),
    };
  },
});




