"use client";

import { useState } from 'react';
import { Button } from '@/client/components/ui/button';
import { Chapter, useCreateChapter, useUpdateChapter } from '@/client/hooks/use-chapters';

// Add Chapter Modal Component
export function AddChapterModal({
    subjectSlug,
    onClose,
    onSuccess,
    nextOrderIndex,
}: {
    subjectSlug: string;
    onClose: () => void;
    onSuccess: () => void;
    nextOrderIndex: number;
}) {
    const [formData, setFormData] = useState({
        name_en: '',
        name_mr: '',
        description_en: '',
        description_mr: '',
        order_index: nextOrderIndex,
    });

    const { mutate: createChapter, loading } = useCreateChapter(subjectSlug);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name_en.trim() || !formData.name_mr.trim()) {
            return;
        }

        const result = await createChapter(formData);

        if (result) {
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Add New Chapter
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Chapter Name (English) *
                        </label>
                        <input
                            type="text"
                            value={formData.name_en}
                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            placeholder="e.g., Introduction to Programming"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Chapter Name (Marathi) *
                        </label>
                        <input
                            type="text"
                            value={formData.name_mr}
                            onChange={(e) => setFormData({ ...formData, name_mr: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            placeholder="e.g., प्रोग्रामिंगचा परिचय"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Description (English)
                        </label>
                        <textarea
                            value={formData.description_en}
                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            rows={2}
                            placeholder="Optional description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Description (Marathi)
                        </label>
                        <textarea
                            value={formData.description_mr}
                            onChange={(e) => setFormData({ ...formData, description_mr: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            rows={2}
                            placeholder="वैकल्पिक वर्णन"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Order Index
                        </label>
                        <input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            min="1"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.name_en.trim() || !formData.name_mr.trim()}
                            className="flex-1 bg-brand-blue-600 hover:bg-brand-blue-700 text-white"
                        >
                            {loading ? 'Creating...' : 'Create Chapter'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Edit Chapter Modal Component
export function EditChapterModal({
    chapter,
    onClose,
    onSuccess,
}: {
    chapter: Chapter;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name_en: chapter.name_en,
        name_mr: chapter.name_mr || '',
        description_en: chapter.description_en || '',
        description_mr: chapter.description_mr || '',
        order_index: chapter.order_index,
    });

    const { mutate: updateChapter, loading } = useUpdateChapter(chapter.id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name_en.trim() || !formData.name_mr.trim()) {
            return;
        }

        const result = await updateChapter(formData);

        if (result) {
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Edit Chapter
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Chapter Name (English) *
                        </label>
                        <input
                            type="text"
                            value={formData.name_en}
                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Chapter Name (Marathi) *
                        </label>
                        <input
                            type="text"
                            value={formData.name_mr}
                            onChange={(e) => setFormData({ ...formData, name_mr: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Description (English)
                        </label>
                        <textarea
                            value={formData.description_en}
                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Description (Marathi)
                        </label>
                        <textarea
                            value={formData.description_mr}
                            onChange={(e) => setFormData({ ...formData, description_mr: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Order Index
                        </label>
                        <input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            min="1"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.name_en.trim() || !formData.name_mr.trim()}
                            className="flex-1 bg-brand-blue-600 hover:bg-brand-blue-700 text-white"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
