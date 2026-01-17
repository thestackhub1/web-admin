// Client-side only — no server secrets or database access here

"use client";

/**
 * Users Client - Premium User Management
 * 
 * Premium SaaS table design with consistent styling.
 */

import { useState, useEffect } from "react";
import { Search, UserCircle, Mail, Calendar, ToggleLeft, ToggleRight, ChevronRight, Crown, BookOpen, GraduationCap, Trash2, PlusCircle, Users } from "lucide-react";
import { Badge, EmptyState, DataTableContainer, DataTable, DataTableHead, DataTableHeadCell, DataTableBody, DataTableRow, DataTableCell, PageHeader, StatCardPremium } from '@/client/components/ui/premium';
import { SmartFilterChips } from '@/client/components/ui/question-components';
import { TextInput } from '@/client/components/ui/input';
import { Button } from '@/client/components/ui/button';
import { LoadingComponent, PageLoader } from '@/client/components/ui/loader';
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AddUserModal } from "./user-modals";
import { useDeleteUser, useUsers } from "@/client/hooks/use-users";

interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  school_id?: string | null;
  class_level?: string | null;
  preferred_language?: string | null;
  created_at: string;
}

const roleVariants: Record<string, "purple" | "info" | "default"> = {
  admin: "purple",
  teacher: "info",
  student: "default",
  super_admin: "purple",
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Crown className="h-3 w-3 mr-1 inline" />,
  teacher: <BookOpen className="h-3 w-3 mr-1 inline" />,
  student: <GraduationCap className="h-3 w-3 mr-1 inline" />,
  super_admin: <Crown className="h-3 w-3 mr-1 inline" />,
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  super_admin: "Super Admin",
};

export function UsersClient({ users: initialUsers = [] }: { users: User[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initial values from URL or defaults
  const initialRole = searchParams.get("role") || "all";
  const initialSearch = searchParams.get("search") || "";
  const schoolId = searchParams.get("schoolId") || undefined;
  const classLevelId = searchParams.get("classLevelId") || undefined;

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users based on filters
  const { data, loading, execute: fetchUsers } = useUsers({
    role: roleFilter,
    search: debouncedSearch,
    schoolId,
    classLevel: classLevelId,
    pageSize: 100
  });

  const users = (data?.items || initialUsers) as User[];

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (roleFilter !== "all") {
      params.set("role", roleFilter);
    } else {
      params.delete("role");
    }

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.push(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [roleFilter, debouncedSearch, pathname, router, searchParams]);

  const { mutate: deleteUser, loading: _deleting } = useDeleteUser();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (confirmed) {
      setDeletingId(userId);
      const result = await deleteUser({ userId, hardDelete: false }); // Soft delete by default
      setDeletingId(null);
      if (result) {
        fetchUsers();
      }
    }
  };

  // Stats for users
  const totalUsers = data?.pagination?.totalItems || users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const studentCount = users.filter(u => u.role === 'student').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Users"
        description="Manage all users including admins, teachers and students"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users" },
        ]}
        action={
          <Button
            className="gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardPremium
          title="Total Users"
          value={totalUsers}
          icon={Users}
          gradient="blue"
        />
        <StatCardPremium
          title="Active Users"
          value={activeUsers}
          icon={ToggleRight}
          gradient="green"
          iconColor="text-success-500"
        />
        <StatCardPremium
          title="Admins"
          value={adminCount}
          icon={Crown}
          gradient="purple"
          iconColor="text-purple-500"
        />
        <StatCardPremium
          title="Students"
          value={studentCount}
          icon={GraduationCap}
          gradient="amber"
          iconColor="text-amber-500"
        />
      </div>

      <DataTableContainer>
        {/* Filters */}
        <div className="p-5 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-11"
              />
            </div>
            <SmartFilterChips
              chips={[
                { id: "all", label: "All", isActive: roleFilter === "all", count: data?.pagination?.totalItems || users.length },
                { id: "admin", label: "Admins", isActive: roleFilter === "admin", count: roleFilter === "admin" ? data?.pagination.totalItems : totalUsersCount(users, "admin") },
                { id: "teacher", label: "Teachers", isActive: roleFilter === "teacher", count: roleFilter === "teacher" ? data?.pagination.totalItems : totalUsersCount(users, "teacher") },
                { id: "student", label: "Students", isActive: roleFilter === "student", count: roleFilter === "student" ? data?.pagination.totalItems : totalUsersCount(users, "student") },
              ]}
              onSelect={(id) => setRoleFilter(id)}
            />
          </div>
        </div>

        {/* Table Content */}
        {loading && users.length === 0 ? (
          <PageLoader message="Loading users..." />
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={UserCircle}
              title="No users found"
              description="Try adjusting your search or filters"
            />
          </div>
        ) : (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <LoadingComponent size="md" />
              </div>
            )}
            <DataTable>
              <DataTableHead>
                <tr>
                  <DataTableHeadCell>User</DataTableHeadCell>
                  <DataTableHeadCell>Role</DataTableHeadCell>
                  <DataTableHeadCell>Status</DataTableHeadCell>
                  <DataTableHeadCell>Language</DataTableHeadCell>
                  <DataTableHeadCell>Joined</DataTableHeadCell>
                  <DataTableHeadCell className="text-right">Actions</DataTableHeadCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {users.map((user) => (
                  <DataTableRow key={user.id}>
                    <DataTableCell>
                      <Link href={`/dashboard/users/${user.id}`} className="flex items-center gap-3 group/user">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name || ""}
                            className="h-10 w-10 rounded-xl object-cover ring-2 ring-transparent group-hover/user:ring-primary-400 transition-all"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-insight-600 text-sm font-semibold text-white ring-2 ring-transparent group-hover/user:ring-primary-400 transition-all">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white group-hover/user:text-primary-600 dark:group-hover/user:text-primary-400 transition-colors">
                            {user.name || "No name"}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </Link>
                    </DataTableCell>
                    <DataTableCell>
                      <Badge variant={roleVariants[user.role] || "default"}>
                        {roleIcons[user.role]} {roleLabels[user.role] || user.role}
                      </Badge>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-2">
                        {user.is_active ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-success-500" />
                            <span className="text-sm font-medium text-success-600 dark:text-success-400">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-neutral-400" />
                            <span className="text-sm text-neutral-500">Inactive</span>
                          </>
                        )}
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-sm text-neutral-600 uppercase dark:text-neutral-400 font-medium">
                        {user.preferred_language || "en"}
                      </span>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </DataTableCell>
                    <DataTableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="h-8 w-8 p-0 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Link href={`/dashboard/users/${user.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-500">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </div>
        )}

        <div className="px-6 py-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing <span className="font-medium text-neutral-700 dark:text-neutral-300">{users.length}</span> of <span className="font-medium text-neutral-700 dark:text-neutral-300">{data?.pagination?.totalItems || users.length}</span> users
          </p>
        </div>
      </DataTableContainer>

      {/* Modals */}
      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// Helper to calculate total counts for chips when not yet fetched
function totalUsersCount(users: any[], role: string) {
  if (role === "all") return users.length;
  return users.filter(u => u.role === role || (role === "admin" && u.role === "super_admin")).length;
}
