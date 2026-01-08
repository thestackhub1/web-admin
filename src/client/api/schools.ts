"use client";

import { api } from "@/client/api";
import type { School } from "@/client/hooks/use-schools";

export type { School };

/**
 * Schools API for Client Components
 */
export const schoolsApi = {
    async search(params: { q: string; limit?: number }) {
        const { data, error } = await api.get<School[]>(
            `/api/v1/schools/search?q=${encodeURIComponent(params.q)}&limit=${params.limit || 20}`
        );
        return { success: !error, data, error: error ? String(error) : undefined };
    },
    async suggest(limit: number = 10) {
        const { data, error } = await api.get<School[]>(`/api/v1/schools/suggest?limit=${limit}`);
        return { success: !error, data, error: error ? String(error) : undefined };
    },
    async create(payload: any) {
        const { data, error } = await api.post<School>('/api/v1/schools', payload);
        return { success: !error, data, error: error ? String(error) : undefined };
    }
};
