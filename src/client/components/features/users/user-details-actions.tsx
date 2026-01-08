"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { useDeleteUser, type User } from "@/client/hooks/use-users";
import { useRouter } from "next/navigation";

interface UserDetailsActionsProps {
    user: User;
}

export function UserDetailsActions({ user }: UserDetailsActionsProps) {
    const { mutate: deleteUser, loading: deleting } = useDeleteUser();
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
        if (confirmed) {
            const result = await deleteUser({ userId: user.id, hardDelete: false });
            if (result) {
                router.push('/dashboard/users');
            }
        }
    };

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete'}
            </Button>
        </div>
    );
}
