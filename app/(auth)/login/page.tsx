// Responsibility: Render client login UI for frontend auth concern using Firebase client SDK.
"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return null;
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <aside className="auth-visual">
          <div>
            <p className="auth-eyebrow">Secure access</p>
            <h1>CivicX</h1>
          </div>
          <div>
            <p>
              Sign in to continue into the protected dashboard, switch between
              test accounts, and verify the end-to-end auth flow.
            </p>
            <ul className="feature-list">
              <li>
                <span className="inline-pill">1</span>
                Session cookie sync after Firebase login
              </li>
              <li>
                <span className="inline-pill">2</span>
                Proxy-safe redirect to your intended page
              </li>
              <li>
                <span className="inline-pill">3</span>
                Logout anytime from the dashboard sidebar
              </li>
            </ul>
          </div>
        </aside>

        <section className="auth-panel">
          <div>
            <p className="auth-eyebrow">Log in</p>
            <h1>Sign in</h1>
            <p>Use your Firebase account to enter the dashboard.</p>
          </div>

          <form className="auth-card-form" onSubmit={onSubmit}>
            <div className="field-grid">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="field-grid">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {error ? <p className="auth-error">{error}</p> : null}

          <div className="auth-footer">
            <p className="muted">Need an account?</p>
            <Link className="secondary-button" href="/signup">
              Create account
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
