// Responsibility: Render client signup UI for frontend auth concern
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "COLLECTOR">("COLLECTOR");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Signup failed");
      }
      
      // Force page reload to re-fetch the user context
      window.location.href = searchParams.get("next") ?? "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
            <p className="auth-eyebrow">Create access</p>
            <h1>CivicX</h1>
          </div>
          <div>
            <p>
              Create an account, get redirected into the dashboard, and use the
              logout flow to test other identities quickly.
            </p>
            <ul className="feature-list">
              <li>
                <span className="inline-pill">A</span>
                Green-and-white onboarding card
              </li>
              <li>
                <span className="inline-pill">B</span>
                Local auth session cookie is written automatically
              </li>
              <li>
                <span className="inline-pill">C</span>
                Dashboard flow stays ready for testing
              </li>
            </ul>
          </div>
        </aside>

        <section className="auth-panel">
          <div>
            <p className="auth-eyebrow">Sign up</p>
            <h1>Create account</h1>
            <p>Create a new staff identity to test the full flow.</p>
          </div>

          <form className="auth-card-form" onSubmit={onSubmit}>
            <div className="field-grid">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>

            <div className="field-grid">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "COLLECTOR")}
                required
                style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
              >
                <option value="COLLECTOR">Collector</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? "Creating..." : "Create account"}
            </button>
          </form>

          {error ? <p className="auth-error">{error}</p> : null}

          <div className="auth-footer">
            <p className="muted">Already have an account?</p>
            <Link className="secondary-button" href="/login">
              Sign in
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
