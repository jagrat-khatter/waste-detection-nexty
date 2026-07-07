// Responsibility: Gate and render the protected dashboard for frontend auth concern.
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/jwt";

export default async function DashboardPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="dashboard-section">
      <section className="dashboard-hero">
        <p className="dashboard-eyebrow">Home</p>
        <h1>Welcome back.</h1>
        <p>
          Your Firebase session is active and the dashboard flow is ready for
          switching accounts, exploring profile pages, and testing routes.
        </p>
        <div className="dashboard-meta">
          <span className="inline-pill">{session.email ?? session.id}</span>
          <span className="muted">Protected by cookie-backed auth</span>
        </div>
      </section>

      <section className="dashboard-cards">
        <article className="info-card">
          <p className="dashboard-eyebrow">Flow</p>
          <h2>Login → dashboard → logout</h2>
          <p>
            Use the sidebar logout to test another account and confirm the
            redirect returns you to the login screen.
          </p>
        </article>

        <article className="stat-card">
          <p className="dashboard-eyebrow">Status</p>
          <div className="stat-grid">
            <div className="stat-block">
              <strong>Auth</strong>
              Active
            </div>
            <div className="stat-block">
              <strong>Routes</strong>
              Home / Profile / Testing
            </div>
            <div className="stat-block">
              <strong>Logout</strong>
              Ready
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
