"use client";

import { useState } from "react";
import { Mail, Phone, Globe, Edit2, Check, X } from "lucide-react";
import { GlassCard } from "@/client/components/ui/premium";
import { Button } from "@/client/components/ui/button";
import { useUpdateUser, type User } from "@/client/hooks/use-users";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserContactInfoProps {
    user: User;
}

export function UserContactInfo({ user }: UserContactInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState(user.phone || "");
    const [language, setLanguage] = useState(user.preferred_language || "EN");

    const { mutate: updateUser, loading } = useUpdateUser(user.id);
    const router = useRouter();

    const handleSave = async () => {
        try {
            const result = await updateUser({
                phone: phone || null,
                preferred_language: language,
            });
            if (result) {
                toast.success("Contact info updated");
                setIsEditing(false);
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to update contact info");
        }
    };

    const handleCancel = () => {
        setPhone(user.phone || "");
        setLanguage(user.preferred_language || "EN");
        setIsEditing(false);
    };

    return (
        <GlassCard className="relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Contact Information</h3>
                {!isEditing ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <Edit2 className="h-4 w-4 text-neutral-500" />
                    </Button>
                ) : (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSave}
                            disabled={loading}
                            className="h-8 w-8 p-0 rounded-full text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            disabled={loading}
                            className="h-8 w-8 p-0 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {/* Email - Always Read Only */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <Mail className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Email</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {user.email || "Not provided"}
                        </p>
                    </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <Phone className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Phone</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full text-sm font-medium bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-1 focus:ring-brand-blue-500 rounded p-0 px-1 text-neutral-900 dark:text-white"
                                placeholder="Enter phone number"
                            />
                        ) : (
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                {user.phone || "Not provided"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Language */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <Globe className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Language</p>
                        {isEditing ? (
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full text-sm font-medium bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-1 focus:ring-brand-blue-500 rounded p-0 px-1 text-neutral-900 dark:text-white uppercase"
                            >
                                <option value="EN">English (EN)</option>
                                <option value="HI">Hindi (HI)</option>
                                <option value="MR">Marathi (MR)</option>
                            </select>
                        ) : (
                            <p className="text-sm font-medium text-neutral-900 dark:text-white uppercase">
                                {language || "EN"}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
