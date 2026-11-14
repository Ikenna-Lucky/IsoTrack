import { type NextRequest, NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  // The refresh cookie may belong to the API domain, where Next cannot read it.
  // Let AuthProvider and AuthGuard handle dashboard redirects.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next assets and static files.
    "/((?!_next/static|_next/image|favicon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf)).*)",
  ],
};
