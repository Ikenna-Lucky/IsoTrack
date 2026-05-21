import type { AxiosError } from "axios";

/**
 * Extracts a clean, user-facing error message from any thrown value.
 *
 * Priority order:
 *  1. Backend `message` field from a structured API error response
 *  2. Zod validation errors from the backend (first issue message)
 *  3. HTTP-status-specific fallback messages
 *  4. Generic fallback
 *
 * Usage:
 *   catch (err) { setError(extractErrorMessage(err)); }
 */
export function extractErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const axiosErr = err as AxiosError<{
    message?: string | undefined;
    error?: string | undefined;
    errors?: Array<{ message: string }>;
  }>;

  const responseData = axiosErr?.response?.data;
  const status = axiosErr?.response?.status;

  // 1. Structured backend message
  if (responseData?.message && typeof responseData.message === "string") {
    const msg = responseData.message.trim();
    // Reject obviously internal messages that slipped through
    if (!isInternalMessage(msg)) return msg;
  }

  // 2. First Zod validation issue
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return (responseData.errors[0] as { message: string }).message;
  }

  // 3. HTTP status fallbacks
  if (status === 400) return "The request was invalid. Please check your input and try again.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 409) return "A conflict occurred. This record may already exist.";
  if (status === 422) return "The submitted data is invalid. Please check your input.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status != null && status >= 500) return "A server error occurred. Please try again later.";

  // 4. Network / no response
  if (axiosErr?.code === "ERR_NETWORK" || axiosErr?.message === "Network Error") {
    return "Unable to reach the server. Check your internet connection.";
  }

  return fallback;
}

/**
 * Returns true if the message looks like a raw internal/DB error
 * that should never be shown to users.
 */
function isInternalMessage(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("column") ||
    lower.includes("relation") ||
    lower.includes("syntax error") ||
    lower.includes("neon") ||
    lower.includes("neondb") ||
    lower.includes("postgres") ||
    lower.includes("sql") ||
    lower.includes("constraint") ||
    lower.includes("violates") ||
    lower.includes("parse_relation") ||
    lower.includes("errorMissingColumn") ||
    lower.includes("internal error")
  );
}
