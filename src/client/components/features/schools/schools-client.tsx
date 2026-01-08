/**
 * Schools Client Component - Premium SaaS Design
 * 
 * Manages school listings with search, filtering, and actions.
 * Follows the premium design system (Linear/Raycast/Vercel inspired).
 */

"use client";

import { useState } from "react";
import { GlassCard, Badge, EmptyState, SkeletonCard } from '@/client/components/ui/premium';
import {
  Search,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { TextInput } from '@/client/components/ui/input';
import { Button } from '@/client/components/ui/button';
import { useSchools, useDeleteSchool, useVerifySchool } from '@/client/hooks';
import Link from "next/link";

export function SchoolsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const verifySchoolMutation = useVerifySchool();
  const deleteSchoolMutation = useDeleteSchool();

  // Filtering is done client-side after fetching all schools
  
  const { data: schools = [], loading: isLoading, error, execute: refetchSchools } = useSchools();

  const handleVerify = async (schoolId: string, verified: boolean) => {
    const result = await verifySchoolMutation.mutateAsync({ id: schoolId, is_verified: verified });
    if (result) {
      refetchSchools();
    }
  };

  const handleDelete = async (schoolId: string, schoolName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${schoolName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const result = await deleteSchoolMutation.mutateAsync({ id: schoolId });
    if (result) {
      refetchSchools();
    }
  };

  const filteredSchools = (schools || []).filter((school) => {
    const city = school.location_city || school.city;
    const state = school.location_state || school.state;
    const matchesSearch =
      !searchQuery ||
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply verified filter
    if (verifiedFilter === 'verified' && !school.is_verified) return false;
    if (verifiedFilter === 'unverified' && school.is_verified) return false;

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-5" bento>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <TextInput
                type="text"
                placeholder="Search schools by name, city, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
                inputSize="md"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={verifiedFilter === "all" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setVerifiedFilter("all")}
            >
              All
            </Button>
            <Button
              variant={verifiedFilter === "verified" ? "emerald" : "secondary"}
              size="sm"
              onClick={() => setVerifiedFilter("verified")}
            >
              Verified
            </Button>
            <Button
              variant={verifiedFilter === "unverified" ? "amber" : "secondary"}
              size="sm"
              onClick={() => setVerifiedFilter("unverified")}
            >
              Unverified
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard className="p-4 border-l-4 border-l-primary-500 hover:border-l-primary-400 transition-colors" bento>
          <div className="flex items-center gap-4">
            <div className="icon-container-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{schools?.length || 0}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Schools</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-l-emerald-500 hover:border-l-emerald-400 transition-colors" bento>
          <div className="flex items-center gap-4">
            <div className="icon-container-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {(schools || []).filter((s) => s.is_verified).length}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Verified</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-l-amber-500 hover:border-l-amber-400 transition-colors" bento>
          <div className="flex items-center gap-4">
            <div className="icon-container-warning">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {(schools || []).filter((s) => !s.is_verified).length}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Unverified</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Schools List */}
      {filteredSchools.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={searchQuery ? "No schools found" : "No schools yet"}
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Schools will appear here as students sign up"
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => (
            <GlassCard key={school.id} className="p-6 group cursor-pointer hover:border-primary-500/50 transition-all" bento>
              <Link href={`/dashboard/schools/${school.id}`} className="block mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{school.name}</h3>
                      {school.is_verified ? (
                        <Badge variant="success" size="sm">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Unverified
                        </Badge>
                      )}
                    </div>
                    {(school.location_city || school.location_state) && (
                      <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {[school.location_city, school.location_state]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {school.student_count !== undefined && school.student_count > 0 && (
                      <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        <Users className="h-3 w-3" />
                        <span>{school.student_count} students</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </Link>

              <div className="flex gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                <Button
                  variant={school.is_verified ? "outline" : "emerald"}
                  size="sm"
                  onClick={() => handleVerify(school.id, !school.is_verified)}
                  className="flex-1 gap-2"
                >
                  {school.is_verified ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      Unverify
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(school.id, school.name)}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}




