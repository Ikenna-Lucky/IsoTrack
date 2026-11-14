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

// Sync the saved profile into auth so account details update across the workspace.
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
