"use client";

import { useState } from 'react';
import { Chapter, useDeleteChapter } from '@/client/hooks/use-chapters';
import { PlusCircle, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Badge } from '@/client/components/ui/premium';
import { AddChapterModal, EditChapterModal } from './chapter-modals';

interface ChapterListProps {
    subjectId: string;
    subjectSlug: string;
    chapters: Chapter[];
    onRefresh: () => void;
}

export function ChapterList({ subjectId, subjectSlug, chapters, onRefresh }: ChapterListProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null);

    const { mutate: deleteChapter, loading: deleting } = useDeleteChapter();

    const handleDelete = async (chapterId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this chapter? Questions will not be deleted but will lose their chapter association.');

        if (confirmed) {
            setDeletingChapterId(chapterId);
            const result = await deleteChapter(chapterId);
            setDeletingChapterId(null);

            if (result) {
                onRefresh();
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Chapters ({chapters.length})
                </h3>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add Chapter
                </Button>
            </div>

            {chapters.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        No chapters yet. Add your first chapter to get started.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {chapters.map((chapter) => (
                        <div
                            key={chapter.id}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-brand-blue-300 dark:hover:border-brand-blue-700 transition-all"
                        >
                            <GripVertical className="h-5 w-5 text-neutral-400 cursor-move" />

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-neutral-900 dark:text-white truncate">
                                    {chapter.name_en}
                                </h4>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                    {chapter.name_mr}
                                </p>
                            </div>

                            <Badge variant="default" size="sm">
                                #{chapter.order_index}
                            </Badge>

                            <div className="flex items-center gap-2">
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
                                    disabled={deleting && deletingChapterId === chapter.id}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Chapter Modal */}
            {isAddModalOpen && (
                <AddChapterModal
                    subjectSlug={subjectSlug}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        onRefresh();
                    }}
                    nextOrderIndex={chapters.length > 0 ? Math.max(...chapters.map(c => c.order_index)) + 1 : 1}
                />
            )}

            {/* Edit Chapter Modal */}
            {editingChapter && (
                <EditChapterModal
                    chapter={editingChapter}
                    onClose={() => setEditingChapter(null)}
                    onSuccess={() => {
                        setEditingChapter(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}
