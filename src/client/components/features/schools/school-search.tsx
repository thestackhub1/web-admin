// Client-side only — no server secrets or database access here

"use client";

import { useState, useEffect } from "react";
import { useSchoolSuggest, useSchoolSearch, useCreateSchool, type School } from '@/client/hooks';
import { Search, Building2, MapPin, Plus } from "lucide-react";
import { clsx } from "clsx";
import { GlassCard, Badge } from '@/client/components/ui/premium';
import { TextInput } from '@/client/components/ui/input';
import { Button } from '@/client/components/ui/button';
import { Loader } from '@/client/components/ui/loader';
import { toast } from "sonner";

interface SchoolSearchProps {
  selectedSchoolId?: string | null;
  onSchoolSelect: (school: School | null) => void;
  onNewSchool?: (schoolData: { name: string; location_city?: string; location_state?: string }) => void;
  className?: string;
  required?: boolean;
}

export function SchoolSearch({
  selectedSchoolId,
  onSchoolSelect,
  onNewSchool,
  className,
  required = false,
}: SchoolSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showNewSchoolForm, setShowNewSchoolForm] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolCity, setNewSchoolCity] = useState("");
  const [newSchoolState, setNewSchoolState] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Load selected school on mount if selectedSchoolId is provided
  useEffect(() => {
    if (selectedSchoolId && !selectedSchool) {
      // Load school details - would need to fetch from API
      // For now, just clear selection if ID doesn't match
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchoolId]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSchools([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  const { data: suggestions, loading: suggestionsLoading } = useSchoolSuggest("", 5);
  const [searchQueryForHook, setSearchQueryForHook] = useState("");
  const { data: searchResults, loading: searchLoading } = useSchoolSearch(searchQueryForHook);
  const createSchoolMutation = useCreateSchool();

  useEffect(() => {
    if (suggestions) {
      setSchools(suggestions);
    }
  }, [suggestions]);

  useEffect(() => {
    if (searchResults) {
      setSchools(searchResults);
      setShowResults(true);
    }
  }, [searchResults]);

  const loadSuggestions = () => {
    // Suggestions are loaded automatically via hook
  };

  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) return;
    setSearchQueryForHook(query);
    setIsSearching(true);
    // Search is handled by hook, loading state will be updated
    setTimeout(() => setIsSearching(false), 100);
  };

  const handleSelect = (school: School) => {
    setSelectedSchool(school);
    setSearchQuery(school.name);
    setShowResults(false);
    onSchoolSelect(school);
  };

  const handleCreateNew = async () => {
    if (!newSchoolName.trim()) {
      toast.error("School name is required");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createSchoolMutation.mutateAsync({
        name: newSchoolName.trim(),
        location_city: newSchoolCity.trim() || null,
        location_state: newSchoolState.trim() || null,
      });

      if (result) {
        handleSelect(result);
        toast.success("School added successfully");
        if (onNewSchool) {
          onNewSchool({
            name: result.name,
            location_city: result.city || undefined,
            location_state: result.state || undefined,
          });
        }

        setShowNewSchoolForm(false);
        setNewSchoolName("");
        setNewSchoolCity("");
        setNewSchoolState("");
      }
    } catch (err) {
      console.error("Error creating school:", err);
      toast.error("Failed to create school");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={clsx("space-y-2", className)}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <TextInput
            type="text"
            placeholder="Search for your school..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              if (schools.length > 0) setShowResults(true);
            }}
            className="w-full pl-10"
            required={required}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader size="sm" variant="neutral" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && schools.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {schools.map((school) => (
              <button
                key={school.id}
                onClick={() => handleSelect(school)}
                className={clsx(
                  "w-full px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800",
                  selectedSchoolId === school.id && "bg-brand-blue-50 dark:bg-brand-blue-950/20"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-neutral-400" />
                      <span className="font-medium text-neutral-900 dark:text-white">{school.name}</span>
                      {school.is_active && (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    {(school.city || school.state) && (
                      <div className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {[school.city, school.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results / Add New School */}
        {showResults && searchQuery.length >= 2 && !isSearching && schools.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
              No schools found for &quot;{searchQuery}&quot;
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNewSchoolForm(true);
                setNewSchoolName(searchQuery);
                setShowResults(false);
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4" />
              Add &quot;{searchQuery}&quot; as new school
            </Button>
          </div>
        )}
      </div>

      {/* Selected School Display */}
      {selectedSchool && !showResults && (
        <GlassCard className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-brand-blue-600 dark:text-brand-blue-400" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{selectedSchool.name}</p>
                {(selectedSchool.city || selectedSchool.state) && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {[selectedSchool.city, selectedSchool.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedSchool(null);
                setSearchQuery("");
                onSchoolSelect(null);
              }}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Change
            </button>
          </div>
        </GlassCard>
      )}

      {/* New School Form */}
      {showNewSchoolForm && (
        <GlassCard className="p-4">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">Add New School</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                School Name *
              </label>
              <TextInput
                type="text"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="Enter school name"
                required
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  City
                </label>
                <TextInput
                  type="text"
                  value={newSchoolCity}
                  onChange={(e) => setNewSchoolCity(e.target.value)}
                  placeholder="City"
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  State
                </label>
                <TextInput
                  type="text"
                  value={newSchoolState}
                  onChange={(e) => setNewSchoolState(e.target.value)}
                  placeholder="State"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateNew}
                disabled={isCreating || !newSchoolName.trim()}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader size="sm" variant="white" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add School
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNewSchoolForm(false);
                  setNewSchoolName("");
                  setNewSchoolCity("");
                  setNewSchoolState("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

