// Responsibility: Enforce frontend protected-route auth gating concern at the request boundary.
import { NextResponse, type NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";

const SESSION_COOKIE_NAME = "auth_token";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyJwt(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes only; static asset paths are excluded by this scoped matcher.
    "/dashboard/:path*",
  ],
};
