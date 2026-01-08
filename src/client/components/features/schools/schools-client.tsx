"use client";

import { useState, useMemo } from "react";
import {
  GlassCard,
  Badge,
  EmptyState,
  StatCardPremium,
  DataTableContainer,
  DataTable,
  DataTableHead,
  DataTableHeadCell,
  DataTableBody,
  DataTableRow,
  DataTableCell
} from '@/client/components/ui/premium';
import {
  Search,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { TextInput } from '@/client/components/ui/input';
import { Button } from '@/client/components/ui/button';
import { Select } from '@/client/components/ui/select';
import { useSchools, useDeleteSchool, useVerifySchool } from '@/client/hooks';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SchoolsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const [userAddedFilter, setUserAddedFilter] = useState<"all" | "student" | "admin">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const router = useRouter();
  const verifySchoolMutation = useVerifySchool();
  const deleteSchoolMutation = useDeleteSchool();

  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    verified: verifiedFilter === "all" ? undefined : (verifiedFilter === "verified"),
    userAdded: userAddedFilter === "all" ? undefined : (userAddedFilter === "student"),
    page,
    pageSize
  }), [searchQuery, verifiedFilter, userAddedFilter, page]);

  const { data: schoolsData, loading: isLoading, error, execute: refetchSchools } = useSchools(filters);

  const handleVerify = async (e: React.MouseEvent, schoolId: string, verified: boolean) => {
    e.stopPropagation();
    try {
      const result = await verifySchoolMutation.mutate({ id: schoolId, is_verified: verified });
      if (result) {
        toast.success(`School ${verified ? 'verified' : 'unverified'}`);
        refetchSchools();
      }
    } catch (err) {
      toast.error("Failed to update verification status");
    }
  };

  const handleDelete = async (e: React.MouseEvent, schoolId: string, schoolName: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Are you sure you want to delete "${schoolName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const result = await deleteSchoolMutation.mutate({ id: schoolId });
      if (result) {
        toast.success("School deleted successfully");
        refetchSchools();
      }
    } catch (err) {
      toast.error("Failed to delete school");
    }
  };

  if (error) {
    return (
      <GlassCard className="p-8 text-center" bento>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Failed to load schools
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {error}
        </p>
        <Button variant="primary" onClick={() => refetchSchools()}>
          Try Again
        </Button>
      </GlassCard>
    );
  }

  const schools = schoolsData?.items || [];
  const pagination = schoolsData?.pagination;
  const stats = schoolsData?.stats;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCardPremium
          title="Total Schools"
          value={stats?.totalOverall || 0}
          icon={Building2}
          gradient="blue"
        />
        <StatCardPremium
          title="Verified"
          value={stats?.totalVerified || 0}
          icon={CheckCircle2}
          gradient="green"
          iconColor="text-emerald-500"
        />
        <StatCardPremium
          title="Unverified"
          value={stats?.totalUnverified || 0}
          icon={XCircle}
          gradient="amber"
          iconColor="text-amber-500"
        />
      </div>

      {/* Table Section with Integrated Filters */}
      <DataTableContainer>
        {/* Filters - Inside table container like UsersClient */}
        <div className="p-5 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <TextInput
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, city, or state..."
                className="pl-11"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-3">
              <div className="w-36">
                <Select
                  value={verifiedFilter}
                  onChange={(val) => { setVerifiedFilter(val as "all" | "verified" | "unverified"); setPage(1); }}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "verified", label: "Verified" },
                    { value: "unverified", label: "Unverified" },
                  ]}
                  placeholder="Status"
                  selectSize="sm"
                />
              </div>
              <div className="w-40">
                <Select
                  value={userAddedFilter}
                  onChange={(val) => { setUserAddedFilter(val as "all" | "admin" | "student"); setPage(1); }}
                  options={[
                    { value: "all", label: "All Sources" },
                    { value: "admin", label: "Admin Added" },
                    { value: "student", label: "Student Added" },
                  ]}
                  placeholder="Source"
                  selectSize="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Content with Loading Overlay */}
        {schools.length === 0 && !isLoading ? (
          <div className="p-8">
            <EmptyState
              icon={Building2}
              title="No schools found"
              description="Try adjusting your search or filters to see more results."
            />
          </div>
        ) : (
          <div className="relative">
            {isLoading && schools.length > 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              </div>
            )}
            <DataTable>
              <DataTableHead>
                <tr>
                  <DataTableHeadCell>School Name</DataTableHeadCell>
                  <DataTableHeadCell>Location</DataTableHeadCell>
                  <DataTableHeadCell>Students</DataTableHeadCell>
                  <DataTableHeadCell>Status</DataTableHeadCell>
                  <DataTableHeadCell className="text-right">Actions</DataTableHeadCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {isLoading && schools.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <DataTableRow key={i}>
                      <DataTableCell><div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded" /></DataTableCell>
                      <DataTableCell><div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded" /></DataTableCell>
                      <DataTableCell><div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded" /></DataTableCell>
                      <DataTableCell><div className="h-6 w-20 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-full" /></DataTableCell>
                      <DataTableCell />
                    </DataTableRow>
                  ))
                ) : (
                  schools.map((school) => (
                    <DataTableRow
                      key={school.id}
                      onClick={() => router.push(`/dashboard/schools/${school.id}`)}
                    >
                      <DataTableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 dark:text-white truncate">{school.name}</p>
                            <p className="text-xs text-neutral-500 truncate">{school.id}</p>
                          </div>
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                          <MapPin className="h-4 w-4 text-neutral-400" />
                          <span className="truncate">
                            {[school.location_city, school.location_state].filter(Boolean).join(", ") || "N/A"}
                          </span>
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-medium">
                          <Users className="h-4 w-4 text-neutral-400" />
                          {school.student_count || 0}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <Badge variant={school.is_verified ? "success" : "warning"} dot>
                          {school.is_verified ? "Verified" : "Pending"}
                        </Badge>
                      </DataTableCell>
                      <DataTableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleVerify(e, school.id, !school.is_verified)}
                            className={`h-8 w-8 p-0 rounded-full ${school.is_verified ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          >
                            {school.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(e, school.id, school.name)}
                            className="h-8 w-8 p-0 rounded-full text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-neutral-400 ml-1" />
                        </div>
                      </DataTableCell>
                    </DataTableRow>
                  ))
                )}
              </DataTableBody>
            </DataTable>

            {/* Pagination Console */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/30">
                <p className="text-xs text-neutral-500">
                  Showing <span className="font-medium text-neutral-900 dark:text-white">{(page - 1) * pageSize + 1}</span> to <span className="font-medium text-neutral-900 dark:text-white">{Math.min(page * pageSize, pagination.totalItems)}</span> of <span className="font-medium text-neutral-900 dark:text-white">{pagination.totalItems}</span> schools
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                      const pageNum = i + 1; // Basic pagination logic for demo
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`h-8 w-8 text-xs font-medium rounded-lg transition-all ${page === pageNum
                            ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                            : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer - like UsersClient */}
        <div className="px-6 py-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing <span className="font-medium text-neutral-700 dark:text-neutral-300">{schools.length}</span> of <span className="font-medium text-neutral-700 dark:text-neutral-300">{pagination?.totalItems || schools.length}</span> schools
          </p>
        </div>
      </DataTableContainer>
    </div>
  );
}




