import { type NextRequest, NextResponse } from "next/server";

// ─── Route groups ─────────────────────────────────────────────────────────────

/** Routes that require authentication */
const PROTECTED_PREFIXES = ["/business", "/driver", "/customer", "/account"];

/** Routes only for unauthenticated users (redirect away if already logged in) */
const AUTH_ROUTES = ["/login", "/register"];

/** Cookie name — must match the backend constant */
const REFRESH_COOKIE = "iso_refresh_token";

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  // 1. Visiting a protected route without a session → /login
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!hasSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname); // preserve intended destination
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Visiting auth routes while already logged in → block (let client-side handle redirect)
  // We deliberately don't redirect here — the client AuthProvider will push the user
  // to their dashboard once the session bootstraps. This avoids a flash of the auth page.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.svg / images / fonts
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf)).*)",
  ],
};
