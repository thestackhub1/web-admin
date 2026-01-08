"use client";

import { useState, useEffect } from "react";
import { Button } from "@/client/components/ui/button";
import { X } from "lucide-react";
import { useCreateClassLevel, useUpdateClassLevel, ClassLevel } from "@/client/hooks/use-class-levels";

interface ClassLevelModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classLevel?: ClassLevel | null; // If null, it's add mode
    onSuccess?: () => void;
}

export function ClassLevelModal({ open, onOpenChange, classLevel, onSuccess }: ClassLevelModalProps) {
    const isEdit = !!classLevel;
    const { mutate: createClassLevel, loading: isCreating } = useCreateClassLevel();
    // Using a key or conditional hook call is tricky, so we'll just always call it but only use it if needed.
    // Actually, hooks must not be conditional.
    // We can pass empty ID for create mode, it won't be used.
    const { mutate: updateClassLevel, loading: isUpdating } = useUpdateClassLevel(classLevel?.id || "new");

    const [formData, setFormData] = useState({
        name_en: "",
        name_mr: "",
        description_en: "",
        description_mr: "",
        order_index: 0,
        slug: "",
    });

    // Reset form when modal opens or classLevel changes
    useEffect(() => {
        if (open) {
            if (classLevel) {
                setFormData({
                    name_en: classLevel.name_en,
                    name_mr: classLevel.name_mr || "",
                    description_en: classLevel.description_en || "",
                    description_mr: classLevel.description_mr || "",
                    order_index: classLevel.order_index,
                    slug: classLevel.slug,
                });
            } else {
                setFormData({
                    name_en: "",
                    name_mr: "",
                    description_en: "",
                    description_mr: "",
                    order_index: 0,
                    slug: "",
                });
            }
        }
    }, [open, classLevel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name_en || !formData.name_mr) return;

        if (isEdit && classLevel) {
            const result = await updateClassLevel({
                name_en: formData.name_en,
                name_mr: formData.name_mr,
                description_en: formData.description_en,
                description_mr: formData.description_mr,
                order_index: formData.order_index,
                slug: formData.slug || undefined,
            });
            if (result) {
                onOpenChange(false);
                onSuccess?.();
                window.location.reload();
            }
        } else {
            const result = await createClassLevel({
                name_en: formData.name_en,
                name_mr: formData.name_mr,
                description_en: formData.description_en,
                description_mr: formData.description_mr,
                order_index: formData.order_index,
                slug: formData.slug || undefined,
            });
            if (result) {
                onOpenChange(false);
                onSuccess?.();
                window.location.reload();
            }
        }
    };

    if (!open) return null;

    const loading = isCreating || isUpdating;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => onOpenChange(false)}>
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                            {isEdit ? "Edit Class Level" : "Add Class Level"}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {isEdit ? "Update class level details." : "Create a new class level cohort."}
                        </p>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                English Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name_en}
                                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                                placeholder="e.g. 10th Standard"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Marathi Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name_mr}
                                onChange={(e) => setFormData({ ...formData, name_mr: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                                placeholder="e.g. इयत्ता १० वी"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Slug (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                                placeholder="Auto-generated"
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
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            English Description
                        </label>
                        <textarea
                            value={formData.description_en}
                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            rows={2}
                            placeholder="Description..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Marathi Description
                        </label>
                        <textarea
                            value={formData.description_mr}
                            onChange={(e) => setFormData({ ...formData, description_mr: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500"
                            rows={2}
                            placeholder="वर्णन..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Saving..." : isEdit ? "Update Class Level" : "Create Class Level"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
