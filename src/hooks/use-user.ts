"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { User, ApiResponse } from "@/types";

export interface UpdateProfileInput {
  name?: string | undefined;
  phone?: string | null | undefined;
  avatar?: string | null | undefined;
  emergencyContact?: string | null | undefined;
}

/**
 * PATCH /auth/me — Updates name, phone, and/or avatar URL.
 * On success, syncs the returned user into the auth store.
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
