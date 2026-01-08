// Client-side only — no server secrets or database access here

"use client";

import { useState, useEffect } from "react";
import { X, Save, Folder, BookOpen } from "lucide-react";
import { Button } from '@/client/components/ui/button';
import { TextInput as Input } from '@/client/components/ui/input';
import { GlassCard } from '@/client/components/ui/premium';

interface Subject {
  id: string;
  name_en: string;
  name_mr: string;
  slug: string;
  description_en?: string | null;
  description_mr?: string | null;
  icon?: string | null;
  order_index: number;
  is_category: boolean;
  parent_subject_id: string | null;
}

interface CategoryOption {
  id: string;
  name_en: string;
  name_mr?: string;
  slug: string;
}

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  subject?: Subject | null;
  categories?: CategoryOption[];
  isLoading?: boolean;
}

export function SubjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  subject,
  categories = [],
  isLoading = false,
}: SubjectFormModalProps) {
  const [formData, setFormData] = useState({
    name_en: "",
    name_mr: "",
    description_en: "",
    description_mr: "",
    icon: "",
    is_category: false,
    parent_subject_id: "",
    order_index: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subject) {
      setFormData({
        name_en: subject.name_en || "",
        name_mr: subject.name_mr || "",
        description_en: subject.description_en || "",
        description_mr: subject.description_mr || "",
        icon: subject.icon || "",
        is_category: subject.is_category || false,
        parent_subject_id: subject.parent_subject_id || "",
        order_index: subject.order_index || 0,
      });
    } else {
      // Reset form for new subject
      setFormData({
        name_en: "",
        name_mr: "",
        description_en: "",
        description_mr: "",
        icon: "",
        is_category: false,
        parent_subject_id: "",
        order_index: 0,
      });
    }
    setErrors({});
  }, [subject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name_en.trim()) {
      newErrors.name_en = "English name is required";
    }
    if (!formData.name_mr.trim()) {
      newErrors.name_mr = "Marathi name is required";
    }
    if (formData.is_category && formData.parent_subject_id) {
      newErrors.parent_subject_id = "Categories cannot have a parent";
    }
    if (!formData.is_category && categories.length > 0 && !formData.parent_subject_id) {
      // Allow empty parent for standalone subjects
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = new FormData();
    data.append("name_en", formData.name_en.trim());
    data.append("name_mr", formData.name_mr.trim());
    if (formData.description_en) data.append("description_en", formData.description_en);
    if (formData.description_mr) data.append("description_mr", formData.description_mr);
    if (formData.icon) data.append("icon", formData.icon);
    data.append("is_category", String(formData.is_category));
    if (formData.parent_subject_id) {
      data.append("parent_subject_id", formData.parent_subject_id);
    }
    data.append("order_index", String(formData.order_index));

    await onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <GlassCard className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {subject ? "Edit Subject" : formData.is_category ? "Create Category" : "Create Subject"}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {formData.is_category
                ? "Categories group multiple related subjects together"
                : "Add a new subject or sub-subject to the curriculum"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, is_category: true, parent_subject_id: "" });
                  setErrors({ ...errors, parent_subject_id: "" });
                }}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${formData.is_category
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
              >
                <div className={`rounded-lg p-2 ${formData.is_category ? "bg-purple-100 dark:bg-purple-900/30" : "bg-neutral-100 dark:bg-neutral-800"}`}>
                  <Folder className={`h-5 w-5 ${formData.is_category ? "text-purple-600 dark:text-purple-400" : "text-neutral-400"}`} />
                </div>
                <div className="text-left">
                  <div className={`font-semibold ${formData.is_category ? "text-purple-900 dark:text-purple-100" : "text-neutral-700 dark:text-neutral-300"}`}>
                    Category
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Groups multiple subjects</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_category: false })}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${!formData.is_category
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
              >
                <div className={`rounded-lg p-2 ${!formData.is_category ? "bg-blue-100 dark:bg-blue-900/30" : "bg-neutral-100 dark:bg-neutral-800"}`}>
                  <BookOpen className={`h-5 w-5 ${!formData.is_category ? "text-blue-600 dark:text-blue-400" : "text-neutral-400"}`} />
                </div>
                <div className="text-left">
                  <div className={`font-semibold ${!formData.is_category ? "text-blue-900 dark:text-blue-100" : "text-neutral-700 dark:text-neutral-300"}`}>
                    Subject
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Standalone or sub-subject</div>
                </div>
              </button>
            </div>
          </div>

          {/* Parent Category Selection (only for subjects, not categories) */}
          {!formData.is_category && categories.length > 0 && (
            <div>
              <label htmlFor="parent_subject_id" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Parent Category <span className="text-neutral-400">(Optional)</span>
              </label>
              <select
                id="parent_subject_id"
                value={formData.parent_subject_id}
                onChange={(e) => setFormData({ ...formData, parent_subject_id: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20"
              >
                <option value="">None (Standalone Subject)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_en} {cat.name_mr && `(${cat.name_mr})`}
                  </option>
                ))}
              </select>
              {errors.parent_subject_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parent_subject_id}</p>
              )}
            </div>
          )}

          {/* English Name */}
          <div>
            <label htmlFor="name_en" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              English Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="e.g., Scholarship, Mathematics"
              required
            />
            {errors.name_en && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name_en}</p>
            )}
          </div>

          {/* Marathi Name */}
          <div>
            <label htmlFor="name_mr" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Marathi Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name_mr"
              value={formData.name_mr}
              onChange={(e) => setFormData({ ...formData, name_mr: e.target.value })}
              placeholder="e.g., शिष्यवृत्ती, गणित"
              required
            />
            {errors.name_mr && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name_mr}</p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Icon <span className="text-neutral-400">(Emoji or icon code)</span>
            </label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="e.g., trophy, laptop, book-open (Lucide icon name)"
            />
          </div>

          {/* Description English */}
          <div>
            <label htmlFor="description_en" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              English Description
            </label>
            <textarea
              id="description_en"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 resize-none"
              placeholder="Brief description in English..."
            />
          </div>

          {/* Description Marathi */}
          <div>
            <label htmlFor="description_mr" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Marathi Description
            </label>
            <textarea
              id="description_mr"
              value={formData.description_mr}
              onChange={(e) => setFormData({ ...formData, description_mr: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 resize-none"
              placeholder="मराठी भाषेत संक्षिप्त वर्णन..."
            />
          </div>

          {/* Order Index */}
          <div>
            <label htmlFor="order_index" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Display Order
            </label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-blue-600 hover:bg-brand-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : subject ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}


