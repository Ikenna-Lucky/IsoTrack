"use client";

import { create } from "zustand";
import { api, registerAuthAccessors } from "@/lib/api";
import type { User, UserRole } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthStore {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;          // true while bootstrapping on page load

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  // Async actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;  // true = success, false = no session
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  // Business-specific
  businessName?: string;
  // Driver-specific
  vehicleType?: "bike" | "car" | "van" | "truck";
  vehiclePlate?: string;
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
    set: (token) => set({ accessToken: token }),
    clear: () =>
      set({ user: null, accessToken: null, isAuthenticated: false }),
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

    updateUser: (patch) =>
      set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

    clearAuth: () =>
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      }),

    setLoading: (loading) => set({ isLoading: loading }),

    // ── Login ──────────────────────────────────────────────────────────────
    login: async (email, password) => {
      const { data } = await api.post<AuthApiResponse>("/auth/login", {
        email,
        password,
      });
      get().setAuth(data.data.user, data.data.accessToken);
    },

    // ── Register ───────────────────────────────────────────────────────────
    register: async (registerData) => {
      const { data } = await api.post<AuthApiResponse>(
        "/auth/register",
        registerData,
      );
      get().setAuth(data.data.user, data.data.accessToken);
    },

    // ── Logout ─────────────────────────────────────────────────────────────
    logout: async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        // Clear local state even if the server call fails
        get().clearAuth();
      }
    },

    // ── Silent refresh (called on page load to restore session) ────────────
    refresh: async () => {
      try {
        const { data } = await api.post<AuthApiResponse>("/auth/refresh");
        get().setAuth(data.data.user, data.data.accessToken);
        return true;
      } catch {
        get().clearAuth();
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
