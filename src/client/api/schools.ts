import { api } from "./api-client";

// Types matching the API response
export interface School {
    id: string;
    name: string;
    name_search: string;
    location_city: string | null;
    location_state: string | null;
    location_country: string;
    logo_url: string | null;
    website: string | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface SearchSchoolsParams {
    q?: string;
    city?: string;
    state?: string;
    location?: string;
    limit?: number;
}

export interface CreateSchoolData {
    name: string;
    location_city?: string;
    location_state?: string;
    location_country?: string;
}

export const schoolsApi = {
    /**
     * Search schools by name and location
     */
    search: async (params: SearchSchoolsParams) => {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append("q", params.q);
        if (params.city) queryParams.append("city", params.city);
        if (params.state) queryParams.append("state", params.state);
        if (params.location) queryParams.append("location", params.location);
        if (params.limit) queryParams.append("limit", params.limit.toString());

        return api.get<School[]>(`/api/v1/schools/search?${queryParams.toString()}`);
    },

    /**
     * Get popular/suggested schools
     */
    suggest: async (limit: number = 10) => {
        return api.get<School[]>(`/api/v1/schools/suggest?limit=${limit}`);
    },

    /**
     * Create a new school
     */
    create: async (data: CreateSchoolData) => {
        return api.post<School>("/api/v1/schools", data as unknown as Record<string, unknown>);
    },

    /**
     * Get a school by ID
     */
    getById: async (id: string) => {
        return api.get<School>(`/api/v1/schools/${id}`);
    },
};
