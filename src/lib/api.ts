import { createApiClient } from "./api-client";

const origin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const session = createApiClient(`${origin}/api/v1`);

export const api = session.client;
export const refreshSession = session.refresh;
export const invalidateSession = session.invalidate;
export const registerAuthAccessors = session.register;
