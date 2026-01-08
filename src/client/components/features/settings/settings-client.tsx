/**
 * Settings Client Component - Premium SaaS Design
 * 
 * User settings for profile, language, and theme.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

"use client";

import { useState } from "react";
import { GlassCard, SectionHeader } from '@/client/components/ui/premium';
import { TextInput } from '@/client/components/ui/input';
import { Button } from '@/client/components/ui/button';
import { toast } from "sonner";
import { User, Globe, Palette, Save, Settings } from "lucide-react";
import { useUpdateProfile, useChangePassword } from "@/client/hooks/use-profile";

interface SettingsClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    preferred_language?: string | null;
    avatar_url?: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [name, setName] = useState(user.name || "");
  const [language, setLanguage] = useState(user.preferred_language || "en");

  // Hooks
  const { mutate: updateProfile, loading: saving } = useUpdateProfile();
  const { mutate: changePassword, loading: changingPassword } = useChangePassword();

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = async () => {
    await updateProfile({
      name,
      preferred_language: language,
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and type
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error("File must be an image");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');

    const promise = fetch('/api/v1/uploads', {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      // Update profile with new avatar URL
      await updateProfile({ avatar_url: data.data.url });
      window.location.reload(); // Refresh to show new avatar immediately
    });

    toast.promise(promise, {
      loading: 'Uploading avatar...',
      success: 'Avatar updated',
      error: 'Failed to upload avatar',
    });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    await changePassword({ password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <GlassCard bento padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-linear-to-r from-primary-50/50 to-transparent dark:from-primary-900/20">
          <div className="icon-container-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Profile Information</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Update your personal details</p>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                onChange={handleAvatarUpload}
              />
              <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-white dark:ring-neutral-800 drop-shadow-md group-hover:ring-primary-100 transition-all">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl font-bold text-primary-600">
                    {(name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">Profile Picture</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Click to upload a new photo. Max size 5MB.
              </p>
            </div>
          </div>

          <TextInput
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          <div>
            <TextInput
              label="Email Address"
              value={user.email}
              disabled
              className="cursor-not-allowed opacity-60"
            />
            <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">Email cannot be changed</p>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-neutral-200/60 dark:border-neutral-800/60 flex justify-end bg-neutral-50/50 dark:bg-neutral-900/20">
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </GlassCard>

      {/* Language Settings */}
      <GlassCard bento padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-linear-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/20">
          <div className="icon-container-success">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Language</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Choose your preferred language
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex gap-4">
            {[
              { code: "en", label: "English", flag: "🇬🇧" },
              { code: "mr", label: "मराठी", flag: "🇮🇳" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex flex-1 items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${language === lang.code
                  ? "border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20 dark:border-primary-400 dark:bg-primary-900/20"
                  : "border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700/80 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/50"
                  }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium text-neutral-900 dark:text-white">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Security Settings (Change Password) */}
      <GlassCard bento padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-linear-to-r from-red-50/50 to-transparent dark:from-red-900/20">
          <div className="icon-container-danger">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Security</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Change your password</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <TextInput
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <TextInput
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        <div className="px-5 py-4 border-t border-neutral-200/60 dark:border-neutral-800/60 flex justify-end bg-neutral-50/50 dark:bg-neutral-900/20">
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword}
            variant="danger"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {changingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </GlassCard>

      {/* Theme Settings */}
      <GlassCard bento padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-linear-to-r from-purple-50/50 to-transparent dark:from-purple-900/20">
          <div className="icon-container-insight">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Appearance</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Theme is controlled by the header toggle
            </p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Use the theme toggle in the header to switch between light and dark modes. Your
            preference is saved automatically.
          </p>
        </div>
      </GlassCard>

    </div>
  );
}
