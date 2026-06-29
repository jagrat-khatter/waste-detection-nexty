// Responsibility: Enforce frontend protected-route auth gating concern at the request boundary.
import { NextResponse, type NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/session";

const SESSION_COOKIE_NAME = "firebase_id_token";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionCookie(token) : null;

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
