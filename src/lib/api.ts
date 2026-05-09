import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// ─── Base instance ────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL:
    (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") + "/api/v1",
  withCredentials: true, // send the httpOnly refresh cookie on every request
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor — attach access token ────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken?.();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — silent token refresh on 401 ──────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processRefreshQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401, once per request, and not on refresh/login calls
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh resolves
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            } else {
              reject(err);
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{
          data: { accessToken: string };
        }>("/auth/refresh");

        const newToken = data.data.accessToken;
        setAccessToken?.(newToken);
        processRefreshQueue(newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        processRefreshQueue(null);
        clearAuth?.();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

// ─── Auth accessors — registered by Zustand store to avoid circular imports ───

export let getAccessToken: (() => string | null) | null = null;
export let setAccessToken: ((token: string) => void) | null = null;
export let clearAuth: (() => void) | null = null;

export function registerAuthAccessors(accessors: {
  get: () => string | null;
  set: (token: string) => void;
  clear: () => void;
}) {
  getAccessToken = accessors.get;
  setAccessToken = accessors.set;
  clearAuth = accessors.clear;
}
