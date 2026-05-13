"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { User, ApiResponse } from "@/types";

// ─── Update profile ───────────────────────────────────────────────────────────

export interface UpdateProfileInput {
  name?:   string;
  phone?:  string | null;
  avatar?: string | null;
}

/**
 * PATCH /auth/me
 * Updates name, phone, and/or avatar URL.
 * On success, syncs the returned user object into the auth store so
 * every component that reads `useAuthStore(s => s.user)` re-renders instantly.
 */
export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await api.patch<ApiResponse<User>>("/auth/me", input);
      return data.data;
    },
    onSuccess: (updated) => {
      updateUser(updated);
    },
  });
}

// ─── Change password ──────────────────────────────────────────────────────────

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword:     string;
}

/**
 * PATCH /auth/password
 * Validates current password server-side, then updates to the new one.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const { data } = await api.patch<ApiResponse<unknown>>("/auth/password", input);
      return data;
    },
  });
}
