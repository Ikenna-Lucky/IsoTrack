"use client";

import { create } from "zustand";
import { api, registerAuthAccessors, refreshSession, invalidateSession } from "@/lib/api";
import type { User, UserRole } from "@/types";

// Types

interface AuthStore {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true while bootstrapping on page load

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  // Async actions
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
  // Business-specific
  businessName?: string;
}

interface AuthApiResponse {
  data: {
    user: User;
    accessToken: string;
  };
  message?: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set, get) => {
  // Register accessors so the axios interceptor can read/write the token
  // without importing this store directly (circular dependency prevention)
  registerAuthAccessors({
    get: () => get().accessToken,
    set: (session) => get().setAuth(session.user, session.accessToken),
    clear: () => get().clearAuth(),
  });

  return {
    // ── State ──────────────────────────────────────────────────────────────
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    // ── Sync actions ───────────────────────────────────────────────────────
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

    // ── Login ──────────────────────────────────────────────────────────────
    login: async (email, password) => {
      invalidateSession();
      const { data } = await api.post<AuthApiResponse>("/auth/login", {
        email,
        password,
      });
      get().setAuth(data.data.user, data.data.accessToken);
    },

    // ── Register ───────────────────────────────────────────────────────────
    register: async (registerData) => {
      invalidateSession();
      const { data } = await api.post<AuthApiResponse>("/auth/register", registerData);
      get().setAuth(data.data.user, data.data.accessToken);
    },

    // ── Logout ─────────────────────────────────────────────────────────────
    logout: async () => {
      get().clearAuth();
      await api.post("/auth/logout");
    },

    // ── Silent refresh (called on page load to restore session) ────────────
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

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (s: AuthStore) => s.user;
export const selectIsAuthenticated = (s: AuthStore) => s.isAuthenticated;
export const selectIsLoading = (s: AuthStore) => s.isLoading;
export const selectUserRole = (s: AuthStore) => s.user?.role ?? null;
