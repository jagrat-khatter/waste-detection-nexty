// Responsibility: Verify Firebase auth tokens for backend business-logic access control concern only.
// SECURITY: This file contains privileged credential loading and must never be imported by client-facing code.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = requiredEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requiredEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = requiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export async function verifyToken(token: string): Promise<DecodedIdToken | null> {
  try {
    // Firebase Admin SDK verifies JWT signatures and caches Google public keys internally.
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}
