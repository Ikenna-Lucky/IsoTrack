import { type NextRequest, NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  // Dashboard auth is handled by AuthGuard/AuthProvider on the client.
  // In production the refresh cookie can belong to the API domain, so Next
  // middleware may not see it and would incorrectly redirect after login.
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
