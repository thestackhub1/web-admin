// Client-side only — no server secrets or database access here

import { useApi } from './use-api';
import { api } from '@/client/api';
import { useMutation } from './use-mutations';

export interface Profile {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  role: string;
  school_id?: string | null;
  class_level?: string | null;
  preferred_language?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useProfile() {
  return useApi<Profile>(async () => {
    return api.get<Profile>('/api/v1/profile');
  });
}

export function useUpdateProfile() {
  return useMutation<Profile, Partial<Profile>>(
    async (data) => api.put('/api/v1/profile', data),
    {
      successMessage: 'Profile updated successfully',
      errorMessage: 'Failed to update profile',
    }
  );
}

export interface SetPasscodeInput {
  passcode: string;
  password: string;
}


export function useSetPasscode() {
  return useMutation<{ success: boolean }, SetPasscodeInput>(
    async (data) => api.post('/api/v1/auth/update-passcode', data),
    {
      successMessage: 'Passcode set successfully',
      errorMessage: 'Failed to set passcode',
    }
  );
}

export function useChangePassword() {
  return useMutation<{ success: boolean; message: string }, { password: string }>(
    async (data) => api.post('/api/v1/profile/change-password', data),
    {
      successMessage: 'Password changed successfully',
      errorMessage: 'Failed to change password',
    }
  );
}
