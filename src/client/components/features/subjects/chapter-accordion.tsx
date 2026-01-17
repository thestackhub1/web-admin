"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, FileQuestion, ArrowRight, Edit, Trash2, PlusCircle } from "lucide-react";
import { GlassCard } from '@/client/components/ui/premium';
import { Button } from '@/client/components/ui/button';
import { useDeleteChapter } from '@/client/hooks/use-chapters';
import { AddChapterModal, EditChapterModal } from './chapter-modals';

interface Chapter {
  id: string;
  name_en: string;
  name_mr: string;
  subject_id: string;
  order_index: number;
  question_count?: number;
}

interface ChapterAccordionProps {
  chapters: Chapter[];
  subjectId: string;
  subjectSlug: string;
}

export function ChapterAccordion({ chapters, subjectId: _subjectId, subjectSlug }: ChapterAccordionProps) {
  const searchParams = useSearchParams();
  const classLevelId = searchParams.get('classLevelId');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { mutate: deleteChapter, loading: _deleting } = useDeleteChapter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleDelete = async (chapterId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this chapter? Questions will not be deleted but will lose their chapter association.');

    if (confirmed) {
      setDeletingId(chapterId);
      const result = await deleteChapter(chapterId);
      setDeletingId(null);

      if (result) {
        // Refresh the page to show updated list
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Add Chapter
        </Button>
      </div>

      <div className="space-y-3">
        {chapters.map((chapter) => {
          const isExpanded = expandedChapters.has(chapter.id);
          const isDeleting = deletingId === chapter.id;

          return (
            <GlassCard key={chapter.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        aria-label={isExpanded ? "Collapse chapter" : "Expand chapter"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-neutral-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-neutral-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                          {chapter.name_en}
                        </h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 italic mt-0.5">
                          {chapter.name_mr}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          <FileQuestion className="h-3.5 w-3.5" />
                          {chapter.question_count || 0} Questions
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingChapter(chapter)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(chapter.id)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Chapter {chapter.order_index}
                      </p>
                      <Link href={`/dashboard/questions/${subjectSlug.replace(/_/g, "-")}/chapters/${chapter.id}${classLevelId ? `?classLevelId=${classLevelId}` : ''}`}>
                        <Button variant="primary" size="sm" className="gap-2">
                          <FileQuestion className="h-3.5 w-3.5" />
                          View Questions
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingChapter && (
        <EditChapterModal
          chapter={editingChapter}
          onClose={() => setEditingChapter(null)}
          onSuccess={() => {
            setEditingChapter(null);
            window.location.reload();
          }}
        />
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddChapterModal
          subjectSlug={subjectSlug}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            window.location.reload();
          }}
          nextOrderIndex={chapters.length > 0 ? Math.max(...chapters.map(c => c.order_index)) + 1 : 1}
        />
      )}
    </div>
  );
}

// Edit Chapter Modal
// Removed inline modal

// Add Chapter Modal
// Removed inline modal
