import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const key = new TextEncoder().encode(JWT_SECRET);

export type JwtPayload = {
  id: string;
  email: string;
  role: "ADMIN" | "COLLECTOR";
  name: string | null;
};

export async function signJwt(payload: JwtPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
  
  return jwt;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<JwtPayload | null> {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return null;
  }
  return verifyJwt(token);
}
