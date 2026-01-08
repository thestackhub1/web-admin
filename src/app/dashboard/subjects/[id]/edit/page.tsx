"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { LoadingComponent, Loader } from "@/client/components/ui/loader";
import { Button } from '@/client/components/ui/button';
import { TextInput } from '@/client/components/ui/input';
import { GlassCard, PageHeader } from '@/client/components/ui/premium';
import { IconPicker } from '@/client/components/ui/icon-picker';
import { useSubjectById, useUpdateSubject } from "@/client/hooks";

const formSchema = z.object({
    name_en: z.string().min(1, "English name is required"),
    name_mr: z.string().min(1, "Marathi name is required"),
    slug: z.string().min(1, "Slug is required"),
    icon: z.string().optional(),
    is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const categoryId = params.id;

    // Use hooks for API calls
    const { data: category, loading: isLoading } = useSubjectById(categoryId);
    const { mutate: updateSubject, isLoading: isSaving } = useUpdateSubject();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name_en: "",
            name_mr: "",
            slug: "",
            icon: "",
            is_active: true,
        },
    });

    // Populate form when category data loads
    useEffect(() => {
        if (category) {
            form.reset({
                name_en: category.name_en,
                name_mr: category.name_mr || "",
                slug: category.slug,
                icon: category.icon || "",
                is_active: category.is_active,
            });
        }
    }, [category, form]);

    const onSubmit = async (values: FormValues) => {
        if (!categoryId) return;

        const result = await updateSubject({
            id: categoryId,
            name_en: values.name_en,
            name_mr: values.name_mr,
            slug: values.slug,
            icon: values.icon || null,
            is_active: values.is_active,
        });

        if (result) {
            router.refresh();
            router.push("/dashboard/subjects");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center space-y-4">
                <LoadingComponent size="lg" message="Fetching subject details..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Category"
                description={`Edit details for ${category?.name_en || "Category"}`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Subjects", href: "/dashboard/subjects" },
                    { label: "Edit Category" },
                ]}
                action={
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                }
            />

            <GlassCard className="max-w-3xl p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                English Name
                            </label>
                            <TextInput
                                {...form.register("name_en")}
                                error={!!form.formState.errors.name_en}
                                placeholder="e.g. Mathematics"
                            />
                            {form.formState.errors.name_en && (
                                <p className="text-xs text-red-500">{form.formState.errors.name_en.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Marathi Name
                            </label>
                            <TextInput
                                {...form.register("name_mr")}
                                error={!!form.formState.errors.name_mr}
                                placeholder="e.g. गणित"
                            />
                            {form.formState.errors.name_mr && (
                                <p className="text-xs text-red-500">{form.formState.errors.name_mr.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Slug (URL Identifier)
                            </label>
                            <TextInput
                                {...form.register("slug")}
                                error={!!form.formState.errors.slug}
                                disabled={true}
                                className="bg-neutral-50 dark:bg-neutral-800"
                            />
                            <p className="text-xs text-neutral-500">Slugs are auto-generated and immutable.</p>
                        </div>

                        <div className="space-y-2">
                            <IconPicker
                                value={form.watch("icon") || ""}
                                onChange={(val) => form.setValue("icon", val)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...form.register("is_active")}
                                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Active Status
                            </span>
                        </label>
                        <p className="text-xs text-neutral-500">
                            Inactive categories will be hidden from the student portal.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader size="sm" variant="white" className="mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
