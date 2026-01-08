// Client-side only — no server secrets or database access here

"use client";

/**
 * Table Controls Component
 * Provides controls for table editing: add/remove rows/columns, merge/split cells
 */

import { Button } from '@/client/components/ui/button';
import {
  Plus,
  Minus,
  Columns,
  Rows,
  Merge,
  Split,
  Trash2,
} from 'lucide-react';


interface TableControlsProps {
  onAddColumnBefore: () => void;
  onAddColumnAfter: () => void;
  onDeleteColumn: () => void;
  onAddRowBefore: () => void;
  onAddRowAfter: () => void;
  onDeleteRow: () => void;
  onMergeCells: () => void;
  onSplitCell: () => void;
  onDeleteTable: () => void;
}

export function TableControls({
  onAddColumnBefore,
  onAddColumnAfter,
  onDeleteColumn,
  onAddRowBefore,
  onAddRowAfter,
  onDeleteRow,
  onMergeCells,
  onSplitCell,
  onDeleteTable,
}: TableControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary-200 bg-primary-50/50 p-2 dark:border-primary-800 dark:bg-primary-900/20">
      <span className="mr-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
        Table Tools:
      </span>

      {/* Column Controls */}
      <div className="flex items-center gap-1 border-r border-neutral-300 pr-2 dark:border-neutral-600">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddColumnBefore}
          className="h-7 w-7 p-0"
          title="Add Column Before"
        >
          <Columns className="h-3.5 w-3.5" />
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddColumnAfter}
          className="h-7 w-7 p-0"
          title="Add Column After"
        >
          <Plus className="h-3 w-3" />
          <Columns className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDeleteColumn}
          className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 dark:text-rose-400"
          title="Delete Column"
        >
          <Minus className="h-3 w-3" />
          <Columns className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Row Controls */}
      <div className="flex items-center gap-1 border-r border-neutral-300 pr-2 dark:border-neutral-600">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddRowBefore}
          className="h-7 w-7 p-0"
          title="Add Row Before"
        >
          <Rows className="h-3.5 w-3.5" />
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddRowAfter}
          className="h-7 w-7 p-0"
          title="Add Row After"
        >
          <Plus className="h-3 w-3" />
          <Rows className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDeleteRow}
          className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 dark:text-rose-400"
          title="Delete Row"
        >
          <Minus className="h-3 w-3" />
          <Rows className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Cell Controls */}
      <div className="flex items-center gap-1 border-r border-neutral-300 pr-2 dark:border-neutral-600">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMergeCells}
          className="h-7 w-7 p-0"
          title="Merge Cells"
        >
          <Merge className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSplitCell}
          className="h-7 w-7 p-0"
          title="Split Cell"
        >
          <Split className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Delete Table */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDeleteTable}
          className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 dark:text-rose-400"
          title="Delete Table"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
