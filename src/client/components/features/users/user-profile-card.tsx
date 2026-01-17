"use client";

import { useState } from "react";
import { Shield, BookOpen, GraduationCap, CheckCircle2, XCircle, Edit2, Check, X } from "lucide-react";
import { GlassCard } from "@/client/components/ui/premium";
import { Button } from "@/client/components/ui/button";
import { useUpdateUser, type User } from "@/client/hooks/use-users";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clsx } from "clsx";

const roleConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
    admin: { icon: Shield, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
    teacher: { icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    student: { icon: GraduationCap, color: "text-brand-blue-600 dark:text-brand-blue-400", bgColor: "bg-brand-blue-100 dark:bg-brand-blue-900/30" },
};

interface UserProfileCardProps {
    user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name || "");
    const [role, setRole] = useState(user.role);
    const [isActive, setIsActive] = useState(user.is_active);

    const { mutate: updateUser, loading } = useUpdateUser(user.id);
    const router = useRouter();

    const handleSave = async () => {
        try {
            const result = await updateUser({
                name,
                role,
                isActive,
            });
            if (result) {
                toast.success("Profile updated");
                setIsEditing(false);
                router.refresh();
            }
        } catch (_error) {
            toast.error("Failed to update profile");
        }
    };

    const handleCancel = () => {
        setName(user.name || "");
        setRole(user.role);
        setIsActive(user.is_active);
        setIsEditing(false);
    };

    const getInitials = (name: string | null | undefined, email: string | null) => {
        if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        if (email) return email.charAt(0).toUpperCase();
        return "U";
    };

    const getGradient = (name: string | null | undefined) => {
        const gradients = [
            "from-blue-400 to-indigo-500",
            "from-purple-400 to-pink-500",
            "from-green-400 to-teal-500",
            "from-brand-blue-400 to-red-500",
            "from-cyan-400 to-blue-500",
        ];
        const index = (name?.charCodeAt(0) || 0) % gradients.length;
        return gradients[index];
    };

    const roleInfo = roleConfig[role] || roleConfig.student;
    const RoleIcon = roleInfo.icon;

    return (
        <GlassCard className="relative overflow-hidden">
            {/* Edit Toggle Button */}
            <div className="absolute right-4 top-4 z-10">
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

            {/* Avatar */}
            <div className="flex justify-center mb-4">
                {user.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={user.name || ""}
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-neutral-800 shadow-lg"
                    />
                ) : (
                    <div className={clsx(
                        "flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white",
                        "bg-linear-to-br shadow-lg ring-4 ring-white dark:ring-neutral-800",
                        getGradient(name)
                    )}>
                        {getInitials(name, user.email)}
                    </div>
                )}
            </div>

            {/* Name & Email */}
            {isEditing ? (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full text-center text-xl font-bold bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-brand-blue-500 rounded-lg p-1 text-neutral-900 dark:text-white"
                        autoFocus
                    />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                        {user.email}
                    </p>
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {user.name || "No name set"}
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {user.email}
                    </p>
                </>
            )}

            {/* Role & Status */}
            <div className="mt-6 space-y-4">
                <div className="flex flex-col items-center gap-2">
                    {isEditing ? (
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="bg-neutral-50 dark:bg-neutral-800 border-none text-sm font-medium rounded-full px-4 py-2 focus:ring-2 focus:ring-brand-blue-500"
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    ) : (
                        <div className={clsx(
                            "inline-flex items-center gap-2 rounded-full px-4 py-2",
                            roleInfo.bgColor
                        )}>
                            <RoleIcon className={clsx("h-4 w-4", roleInfo.color)} />
                            <span className={clsx("font-medium capitalize", roleInfo.color)}>{role}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    {isEditing ? (
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            )}
                        >
                            {isActive ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            {isActive ? "Account Active" : "Account Inactive"}
                        </button>
                    ) : (
                        <div className={clsx(
                            "flex items-center gap-2",
                            isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                            {isActive ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span className="text-sm font-medium">{isActive ? "Active Account" : "Inactive Account"}</span>
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
