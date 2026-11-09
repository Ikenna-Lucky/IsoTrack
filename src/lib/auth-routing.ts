import type { UserRole } from "../types/index";

export const roleRoutes: Record<UserRole, string> = {
  business: "/business",
  driver: "/driver",
  customer: "/customer",
};

export function loginDestination(next: string | null, role: UserRole): string {
  const fallback = roleRoutes[role];
  if (!next?.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  const destination = new URL(next, "https://isotrack.invalid");
  return destination.origin === "https://isotrack.invalid" &&
    (destination.pathname === fallback || destination.pathname.startsWith(fallback + "/"))
    ? destination.pathname + destination.search + destination.hash
    : fallback;
}
