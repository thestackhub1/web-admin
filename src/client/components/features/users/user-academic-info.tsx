"use client";

import { useState } from "react";
import { School, GraduationCap, Edit2, Check, X } from "lucide-react";
import { GlassCard } from "@/client/components/ui/premium";
import { SchoolSearchModal } from "@/client/components/ui/SchoolSearchModal";
import { useUpdateUser, type User } from "@/client/hooks/use-users";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/client/components/ui/button";

interface UserAcademicInfoProps {
    user: User;
}

export function UserAcademicInfo({ user }: UserAcademicInfoProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditingClass, setIsEditingClass] = useState(false);
    const [classLevel, setClassLevel] = useState(user.class_level || "");

    const { mutate: updateUser, loading } = useUpdateUser(user.id);
    const router = useRouter();

    const handleSchoolSelect = async (school: any) => {
        if (!school) return;

        try {
            const result = await updateUser({
                schoolId: school.id,
            });

            if (result) {
                toast.success("School updated successfully");
                setIsModalOpen(false);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update school:", error);
            toast.error("Failed to update school");
        }
    };

    const handleSaveClass = async () => {
        try {
            const result = await updateUser({
                classLevel: classLevel || null,
            });
            if (result) {
                toast.success("Class level updated");
                setIsEditingClass(false);
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to update class level");
        }
    };

    return (
        <>
            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Academic Information</h3>
                </div>
                <div className="space-y-4">
                    {/* School Section */}
                    <div className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <School className="h-5 w-5 text-neutral-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">School</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                {user.schools?.name || user.school_id || "Not provided"}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setIsModalOpen(true)}
                            disabled={loading}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Class Level Section */}
                    <div className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <GraduationCap className="h-5 w-5 text-neutral-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Class Level</p>
                            {isEditingClass ? (
                                <input
                                    type="text"
                                    value={classLevel}
                                    onChange={(e) => setClassLevel(e.target.value)}
                                    className="w-full text-sm font-medium bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-1 focus:ring-brand-blue-500 rounded p-0 px-1 text-neutral-900 dark:text-white"
                                    autoFocus
                                    placeholder="Enter class level"
                                />
                            ) : (
                                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                    {user.class_level || "Not set"}
                                </p>
                            )}
                        </div>
                        {!isEditingClass ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setIsEditingClass(true)}
                                disabled={loading}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSaveClass}
                                    disabled={loading}
                                    className="h-8 w-8 p-0 rounded-full text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditingClass(false);
                                        setClassLevel(user.class_level || "");
                                    }}
                                    disabled={loading}
                                    className="h-8 w-8 p-0 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>

            <SchoolSearchModal
                isOpen={isModalOpen}
                selectedSchoolId={user.school_id || null}
                onSelect={handleSchoolSelect}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
