import { getCurrentUserProfile } from "@/client/services";
import { PageHeader, GlassCard, Badge } from '@/client/components/ui/premium';
import { SettingsClient } from '@/client/components/features/settings/settings-client';
import { Shield, Globe } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings - The Stack Hub Admin",
};

export default async function SettingsPage() {
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account preferences"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <GlassCard className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || ""}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-neutral-800"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-purple-500 text-3xl font-bold text-white ring-4 ring-white dark:ring-neutral-800">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <h3 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">
              {user.name || "No name set"}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
            <div className="mt-3">
              <Badge
                variant={
                  user.role === "admin" ? "purple" : user.role === "teacher" ? "info" : "default"
                }
              >
{user.role}
              </Badge>
            </div>

            <div className="mt-6 w-full space-y-3 border-t border-neutral-200/50 pt-6 dark:border-neutral-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                  <Globe className="h-4 w-4" />
                  Language
                </span>
                <span className="font-medium text-neutral-900 uppercase dark:text-white">
                  {user.preferred_language || "en"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                  <Shield className="h-4 w-4" />
                  Status
                </span>
                <Badge variant={user.is_active ? "success" : "error"} size="sm" dot>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Settings Form */}
        <div className="space-y-6 lg:col-span-2">
          <SettingsClient user={user} />
        </div>
      </div>
    </div>
  );
}
