// Responsibility: Verify Firebase ID token from cookie for frontend auth gating concern only.
import { decodeJwt, jwtVerify, createLocalJWKSet, type JWTPayload } from "jose";
import type { Session } from "@/types/auth";

const SESSION_COOKIE_NAME = "firebase_id_token";

type FirebaseJwtPayload = JWTPayload & {
  user_id?: string;
  email?: string;
};

const jwksJson = process.env.FIREBASE_AUTH_JWKS_JSON;
const localJwks = jwksJson ? createLocalJWKSet(JSON.parse(jwksJson)) : null;

function buildExpectedIssuer(projectId: string): string {
  return `https://securetoken.google.com/${projectId}`;
}

function sessionFromPayload(payload: JWTPayload, projectId: string): Session | null {
  const uid = (payload.user_id ?? payload.sub) as string | undefined;
  const email = typeof payload.email === "string" ? payload.email : null;

  if (!uid) {
    return null;
  }

  if (payload.aud !== projectId || payload.iss !== buildExpectedIssuer(projectId)) {
    return null;
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return { uid, email };
}

export async function verifySessionCookie(token: string): Promise<Session | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  try {
    if (localJwks) {
      const { payload } = await jwtVerify(token, localJwks, {
        issuer: buildExpectedIssuer(projectId),
        audience: projectId,
      });

      return sessionFromPayload(payload as FirebaseJwtPayload, projectId);
    }

    return sessionFromPayload(decodeJwt(token), projectId);
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<Session | null> {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySessionCookie(token);
}

export { SESSION_COOKIE_NAME };
