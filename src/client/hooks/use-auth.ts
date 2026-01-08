// Client-side only — no server secrets or database access here

"use client";

import { api } from "@/client/api";
import { useMutation } from "./use-mutations";

// ============================================
// Types
// ============================================

export interface SigninPayload {
  email?: string;
  phone?: string;
  password?: string;
  passcode?: string;
}

export interface SigninResponse {
  user?: {
    id: string;
    email?: string;
    phone?: string;
    name?: string;
    role: string;
  };
  session?: {
    access_token: string;
  };
}

export interface SignupData {
  email?: string;
  password: string;
  name: string;
  phone: string;
  school_id?: string;
}

export interface SignupResponse {
  user: {
    id: string;
    email?: string;
    name?: string;
  };
  message?: string;
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook for signing in (supports both password and passcode)
 */
export function useSignin() {
  return useMutation<SigninResponse, SigninPayload>(
    async (payload) => {
      return api.post("/api/v1/auth/signin", payload);
    },
    {
      successMessage: "Welcome back!",
      errorMessage: "Login failed",
    }
  );
}

/**
 * Hook for user signup
 */
export function useSignup() {
  return useMutation<SignupResponse, SignupData>(
    async (data) => {
      return api.post("/api/v1/auth/signup", data);
    },
    {
      successMessage: "Account created successfully",
      errorMessage: "Failed to create account",
    }
  );
}

/**
 * Hook for logout
 */
export function useLogout() {
  return useMutation<{ success: boolean }, void>(
    async () => {
      return api.post("/api/v1/auth/logout", {});
    },
    {
      successMessage: "Logged out successfully",
      errorMessage: "Failed to logout",
    }
  );
}
