/**
 * School Details Client Component
 * 
 * Premium SaaS-style school details with modern UX.
 * Features: Hero section, animated stats, tabbed interface, inline editing.
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { GlassCard, Badge } from '@/client/components/ui/premium';
import { TextInput } from '@/client/components/ui/input';
import { Button } from '@/client/components/ui/button';
import { useUpdateSchool, useDeleteSchool } from '@/client/hooks';
import { cn } from "@/client/utils";
import {
  Building2,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  MapPin,
  Calendar,
  Shield,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  GraduationCap,
  Globe,
  Clock,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

interface School {
  id: string;
  name: string;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  is_verified?: boolean;
  is_user_added?: boolean;
  student_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface SchoolDetailsClientProps {
  school: School;
}

type TabType = "overview" | "settings" | "danger";

export function SchoolDetailsClient({ school }: SchoolDetailsClientProps) {
  const router = useRouter();
  const updateSchoolMutation = useUpdateSchool();
  const deleteSchoolMutation = useDeleteSchool();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [formData, setFormData] = useState({
    name: school.name,
    location_city: school.location_city || "",
    location_state: school.location_state || "",
    location_country: school.location_country || "India",
  });
  const [isVerified, setIsVerified] = useState(school.is_verified ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const hasChanges = useCallback(() => {
    return (
      formData.name !== school.name ||
      formData.location_city !== (school.location_city || "") ||
      formData.location_state !== (school.location_state || "") ||
      formData.location_country !== (school.location_country || "India") ||
      isVerified !== (school.is_verified ?? false)
    );
  }, [formData, isVerified, school]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("School name is required");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateSchoolMutation.mutateAsync({
        id: school.id,
        name: formData.name.trim(),
        location_city: formData.location_city.trim() || null,
        location_state: formData.location_state.trim() || null,
        location_country: formData.location_country.trim() || "India",
        is_verified: isVerified,
      });

      if (result) {
        toast.success("School updated successfully", {
          description: "All changes have been saved.",
        });
        router.refresh();
      }
    } catch (_error) {
      toast.error("Failed to update school", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== school.name) {
      toast.error("Please type the school name exactly to confirm");
      return;
    }

    const result = await deleteSchoolMutation.mutateAsync({ id: school.id });
    if (result) {
      toast.success("School deleted", {
        description: "The school has been permanently removed.",
      });
      router.push("/dashboard/schools");
    }
  };

  const location = [school.location_city, school.location_state, school.location_country]
    .filter(Boolean)
    .join(", ");

  const createdDate = school.created_at
    ? new Date(school.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const updatedDate = school.updated_at
    ? new Date(school.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Building2 className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Shield className="h-4 w-4" /> },
    { id: "danger", label: "Danger Zone", icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-50 via-purple-50/50 to-blue-50 dark:from-primary-950/30 dark:via-purple-950/20 dark:to-blue-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent dark:from-primary-900/20" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/30 dark:bg-primary-800/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/30 dark:bg-purple-800/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

        <div className="relative px-6 py-8 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            <Link 
              href="/dashboard" 
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              href="/dashboard/schools" 
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Schools
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neutral-900 dark:text-white font-medium truncate max-w-[200px]">
              {school.name}
            </span>
          </nav>

          {/* Back Button */}
          <Link 
            href="/dashboard/schools"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schools
          </Link>

          {/* School Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* School Icon */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 dark:shadow-primary-900/50">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center ring-3 ring-white dark:ring-neutral-900 shadow-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* School Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    {school.name}
                  </h1>
                  <Badge 
                    variant={isVerified ? "success" : "warning"}
                    className="text-xs font-medium"
                  >
                    {isVerified ? (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </>
                    )}
                  </Badge>
                  {school.is_user_added && (
                    <Badge variant="info" className="text-xs">
                      User Added
                    </Badge>
                  )}
                </div>

                {location && (
                  <div className="flex items-center gap-2 mt-2 text-neutral-600 dark:text-neutral-400">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                  </div>
                )}

                {createdDate && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Added {createdDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link href={`/dashboard/users?schoolId=${school.id}`}>
                <Button variant="secondary" className="gap-2 shadow-sm">
                  <Users className="h-4 w-4" />
                  View Students
                  <Badge variant="default" className="ml-1 text-xs">
                    {school.student_count || 0}
                  </Badge>
                </Button>
              </Link>
              {hasChanges() && (
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2 shadow-lg shadow-primary-500/25"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Students Stat */}
          <GlassCard className="p-5 group hover:scale-[1.02] transition-transform duration-200" bento>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {school.student_count || 0}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Enrolled Students
                </p>
              </div>
            </div>
            <Link 
              href={`/dashboard/users?schoolId=${school.id}`}
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 mt-3 hover:underline"
            >
              View all students
              <ExternalLink className="h-3 w-3" />
            </Link>
          </GlassCard>

          {/* Status Stat */}
          <GlassCard className="p-5 group hover:scale-[1.02] transition-transform duration-200" bento>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200",
                isVerified 
                  ? "bg-linear-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50"
                  : "bg-linear-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50"
              )}>
                {isVerified ? (
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {isVerified ? "Verified" : "Pending"}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Trust Status
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Location Stat */}
          <GlassCard className="p-5 group hover:scale-[1.02] transition-transform duration-200" bento>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                  {school.location_state || school.location_city || "Not set"}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Location
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Activity Stat */}
          <GlassCard className="p-5 group hover:scale-[1.02] transition-transform duration-200" bento>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">
                  Active
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  School Status
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 lg:px-8 mt-8">
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in duration-300">
            {/* School Information */}
            <GlassCard className="p-6" bento>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white mb-6">
                <Building2 className="h-5 w-5 text-primary-500" />
                School Information
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    School Name
                  </label>
                  <TextInput
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter school name"
                    inputSize="md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                      City
                    </label>
                    <TextInput
                      value={formData.location_city}
                      onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                      placeholder="City"
                      inputSize="md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                      State
                    </label>
                    <TextInput
                      value={formData.location_state}
                      onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                      placeholder="State"
                      inputSize="md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Country
                  </label>
                  <TextInput
                    value={formData.location_country}
                    onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                    placeholder="Country"
                    inputSize="md"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Quick Stats & Info */}
            <div className="space-y-6">
              {/* Verification Card */}
              <GlassCard className="p-6" bento>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  <Shield className="h-5 w-5 text-primary-500" />
                  Verification Status
                </h3>
                
                <div className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200",
                  isVerified
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                    : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isVerified ? (
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-amber-500" />
                      )}
                      <div>
                        <p className={cn(
                          "font-semibold",
                          isVerified ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
                        )}>
                          {isVerified ? "Verified School" : "Unverified School"}
                        </p>
                        <p className={cn(
                          "text-sm",
                          isVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        )}>
                          {isVerified 
                            ? "This school is trusted and verified" 
                            : "This school is pending verification"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={isVerified ? "outline" : "emerald"}
                      size="sm"
                      onClick={() => setIsVerified(!isVerified)}
                      className="gap-2"
                    >
                      {isVerified ? "Unverify" : "Verify"}
                    </Button>
                  </div>
                </div>
              </GlassCard>

              {/* Metadata Card */}
              <GlassCard className="p-6" bento>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  <Calendar className="h-5 w-5 text-primary-500" />
                  Metadata
                </h3>
                
                <dl className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">School ID</dt>
                    <dd className="text-sm font-mono text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      {school.id.slice(0, 8)}...
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Created</dt>
                    <dd className="text-sm text-neutral-700 dark:text-neutral-300">{createdDate || "Unknown"}</dd>
                  </div>
                  {updatedDate && (
                    <div className="flex items-center justify-between py-2">
                      <dt className="text-sm text-neutral-500 dark:text-neutral-400">Last Updated</dt>
                      <dd className="text-sm text-neutral-700 dark:text-neutral-300">{updatedDate}</dd>
                    </div>
                  )}
                </dl>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <GlassCard className="p-6" bento>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                <Shield className="h-5 w-5 text-primary-500" />
                School Settings
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Configure school verification and visibility options.
              </p>

              <div className="space-y-6">
                {/* Verification Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Verified Status</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Verified schools appear with a trust badge
                    </p>
                  </div>
                  <button
                    onClick={() => setIsVerified(!isVerified)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
                      isVerified ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm",
                        isVerified ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {/* Save Button */}
                {hasChanges() && (
                  <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400/80 mb-6">
                Irreversible and destructive actions. Please proceed with caution.
              </p>

              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Delete this school</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Once deleted, this school and all associated data will be permanently removed. 
                      Students linked to this school will have their school reference cleared.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="shrink-0"
                  >
                    Delete School
                  </Button>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                  <div className="mt-6 p-4 rounded-xl border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 animate-in slide-in-from-top duration-300">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-3">
                      Type <span className="font-mono bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">{school.name}</span> to confirm deletion:
                    </p>
                    <TextInput
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type school name to confirm..."
                      inputSize="md"
                      className="mb-3"
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={deleteConfirmText !== school.name || deleteSchoolMutation.isLoading}
                        className="gap-2"
                      >
                        {deleteSchoolMutation.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Permanently Delete
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
