// Responsibility: Provide frontend auth state context and session cookie sync for auth concern.
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "@/lib/firebase/client";
import type { Session, User } from "@/types/auth";

const SESSION_COOKIE_NAME = "firebase_id_token";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function writeSessionCookie(token: string | null): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  if (!token) {
    document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    return;
  }

  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
}

function toUser(session: Session | null): User | null {
  if (!session) {
    return null;
  }

  return {
    uid: session.uid,
    email: session.email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        writeSessionCookie(null);
        setSession(null);
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      writeSessionCookie(token);
      setSession({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      });
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: toUser(session),
      loading,
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
