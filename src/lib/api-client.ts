import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { User } from "../types/index";

export interface SessionData {
  user: User;
  accessToken: string;
}
interface SessionAccess {
  get: () => string | null;
  set: (session: SessionData) => void;
  clear: () => void;
}
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean; _sessionRevision?: number };
const sessionEndpoint = (url = "") =>
  /^\/auth\/(login|register|refresh|logout|deactivate|password|forgot-password|reset-password|verification\/[^/?]+)(?:[/?]|$)/.test(
    url,
  );

// Bootstrap and expired requests share one refresh. Session changes fence late
// responses so an old request cannot restore a signed-out user.
export function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });
  let access: SessionAccess | null = null;
  let revision = 0;
  let refreshing: Promise<SessionData> | null = null;
  const invalidate = () => {
    revision++;
  };
  const refresh = (): Promise<SessionData> => {
    if (refreshing) return refreshing;
    const started = revision;
    const exchange = async () => {
      if (started !== revision) throw new Error("Session changed");
      const { data } = await client.post<{ data: SessionData }>("/auth/refresh");
      if (started !== revision) throw new Error("Session changed");
      const session = data.data;
      if (!session?.accessToken || !session.user?.id) throw new Error("Invalid session response");
      access?.set(session);
      return session;
    };
    // Serialize rotating-cookie exchanges between tabs without persisting tokens.
    const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
    const exchangeLocked = async (): Promise<SessionData> =>
      locks ? await locks.request("isotrack-session", exchange) : await exchange();
    refreshing = exchangeLocked()
      .catch((error: unknown) => {
        if (started === revision) {
          invalidate();
          access?.clear();
        }
        throw error;
      })
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  };
  client.interceptors.request.use((config: RetryConfig) => {
    config._sessionRevision ??= revision;
    const token = access?.get();
    if (token && !/^\/auth\/(login|register|refresh)(?:[/?]|$)/.test(config.url ?? ""))
      config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  });
  client.interceptors.response.use(
    (response) => {
      if ((response.config as RetryConfig)._sessionRevision !== revision)
        throw new axios.CanceledError("Session changed");
      return response;
    },
    async (error: AxiosError) => {
      const original = error.config as RetryConfig | undefined;
      if (
        !original ||
        error.response?.status !== 401 ||
        sessionEndpoint(original.url) ||
        original._sessionRevision !== revision
      )
        throw error;
      if (original._retry) {
        invalidate();
        access?.clear();
        throw error;
      }
      original._retry = true;
      const current = access?.get();
      if (current && original.headers.get("Authorization") !== `Bearer ${current}`) {
        original.headers.set("Authorization", `Bearer ${current}`);
        return client(original);
      }
      const session = await refresh();
      if (original._sessionRevision !== revision) throw error;
      original.headers.set("Authorization", `Bearer ${session.accessToken}`);
      return client(original);
    },
  );
  return {
    client,
    refresh,
    invalidate,
    register: (value: SessionAccess) => {
      access = value;
    },
  };
}
