// Responsibility: Verify Firebase ID token from cookie for frontend auth gating concern only.
import { jwtVerify, createLocalJWKSet, type JWTPayload } from "jose";
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

export async function verifySessionCookie(token: string): Promise<Session | null> {
  if (!localJwks) {
    return null;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, localJwks, {
      issuer: buildExpectedIssuer(projectId),
      audience: projectId,
    });

    const typedPayload = payload as FirebaseJwtPayload;
    const uid = typedPayload.user_id ?? typedPayload.sub;

    if (!uid || typeof uid !== "string") {
      return null;
    }

    return {
      uid,
      email: typeof typedPayload.email === "string" ? typedPayload.email : null,
    };
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
