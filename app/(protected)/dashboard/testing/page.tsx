// Responsibility: Render the protected dashboard testing page for frontend auth concern.
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/jwt";

export default async function TestingPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="dashboard-section">
      <section className="testing-grid">
        <article className="testing-card">
          <p className="dashboard-eyebrow">Testing</p>
          <h1>Auth flow checks</h1>
          <p>
            Use this page to confirm that login, redirect, logout, and protected
            route access all work together.
          </p>
        </article>

        <article className="testing-card">
          <p className="dashboard-eyebrow">Current session</p>
          <p>
            <strong>Email:</strong> {session.email ?? "No email available"}
          </p>
          <p>
            <strong>UID:</strong> {session.uid}
          </p>
        </article>
      </section>
    </main>
  );
}
