"use client";

import { create } from "zustand";
import { api, registerAuthAccessors, refreshSession, invalidateSession } from "@/lib/api";
import type { User, UserRole } from "@/types";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true while bootstrapping on page load

  setAuth: (user: User, accessToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>; // true = success, false = no session
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "driver">;
  phone?: string;
  businessName?: string;
}

interface AuthApiResponse {
  data: {
    user: User;
    accessToken: string;
  };
  message?: string;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  // Accessors let the API client use the session without a circular store import.
  registerAuthAccessors({
    get: () => get().accessToken,
    set: (session) => get().setAuth(session.user, session.accessToken),
    clear: () => get().clearAuth(),
  });

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: (user, accessToken) =>
      set({ user, accessToken, isAuthenticated: true, isLoading: false }),

    updateUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

    clearAuth: () => {
      invalidateSession();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),

    login: async (email, password) => {
      invalidateSession();
      const { data } = await api.post<AuthApiResponse>("/auth/login", {
        email,
        password,
      });
      get().setAuth(data.data.user, data.data.accessToken);
    },

    register: async (registerData) => {
      invalidateSession();
      const { data } = await api.post<AuthApiResponse>("/auth/register", registerData);
      get().setAuth(data.data.user, data.data.accessToken);
    },

    logout: async () => {
      get().clearAuth();
      await api.post("/auth/logout");
    },

    refresh: async () => {
      try {
        await refreshSession();
        return true;
      } catch {
        return false;
      }
    },
  };
});

export const selectUser = (s: AuthStore) => s.user;
export const selectIsAuthenticated = (s: AuthStore) => s.isAuthenticated;
export const selectIsLoading = (s: AuthStore) => s.isLoading;
export const selectUserRole = (s: AuthStore) => s.user?.role ?? null;
