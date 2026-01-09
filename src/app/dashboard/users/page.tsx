import { isAuthenticated, authServerApi } from "@/lib/api";
import { getUsers, getSchoolById, getUserStats, checkAdminAccess } from "@/client/services";
import { GlassCard, PageHeader, Badge } from '@/client/components/ui/premium';
import { Users, Shield, GraduationCap, BookOpen, Building2, X, Layers } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UsersClient } from '@/client/components/features/users/users-client';
import Link from "next/link";

export const metadata: Metadata = {
  title: "Users - The Stack Hub Admin",
};

interface PageProps {
  searchParams: Promise<{
    schoolId?: string;
    role?: string;
    search?: string;
    classLevelId?: string;
  }>;
}

// Helper to fetch class level info
async function getClassLevelById(id: string) {
  const { data, error } = await authServerApi.get<{
    id: string;
    nameEn: string;
    nameMr: string;
    slug: string;
  }>(`/api/v1/class-levels/${id}`);

  if (error || !data) return null;
  return data;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { schoolId, role, search, classLevelId } = params;

  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const isAdmin = await checkAdminAccess();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Fetch data in parallel
  const [users, stats, school, classLevel] = await Promise.all([
    getUsers({ schoolId, role, search, classLevelId }),
    getUserStats({ schoolId, search }),
    schoolId ? getSchoolById(schoolId) : Promise.resolve(null),
    classLevelId ? getClassLevelById(classLevelId) : Promise.resolve(null),
  ]);
  const totalUsers = stats.admins + stats.teachers + stats.students;

  // Build page title and description based on filter
  let pageTitle = "Users";
  let pageDescription = "Manage user accounts and permissions";
  
  if (school) {
    pageTitle = `Students at ${school.name}`;
    pageDescription = `View and manage students from ${school.name}`;
  } else if (classLevel) {
    pageTitle = `Students in ${classLevel.nameEn}`;
    pageDescription = `View and manage students enrolled in ${classLevel.nameEn}`;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          ...(school ? [{ label: "Schools", href: "/dashboard/schools" }] : []),
          ...(classLevel ? [{ label: "Class Levels", href: "/dashboard/class-levels" }] : []),
          { label: school ? school.name : classLevel ? classLevel.nameEn : "Users" },
        ]}
      />

      {/* Active Filters */}
      {(school || classLevel) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">Filtering by:</span>
          {school && (
            <Link href="/dashboard/users">
              <Badge variant="info" className="gap-1.5 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors">
                <Building2 className="h-3 w-3" />
                {school.name}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            </Link>
          )}
          {classLevel && (
            <Link href="/dashboard/users">
              <Badge variant="info" className="gap-1.5 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors">
                <Layers className="h-3 w-3" />
                {classLevel.nameEn}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <GlassCard className="flex items-center gap-4">
          <div className="rounded-xl bg-primary-100 p-3 dark:bg-primary-900/30">
            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalUsers}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Users</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
            <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.admins}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Admins</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.teachers}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Teachers</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="rounded-xl bg-primary-100 p-3 dark:bg-primary-900/30">
            <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.students}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Students</p>
          </div>
        </GlassCard>
      </div>

      {/* Users Table */}
      <UsersClient users={users} />
    </div>
  );
}
