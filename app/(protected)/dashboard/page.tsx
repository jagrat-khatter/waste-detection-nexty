// Responsibility: Gate and render the protected dashboard for frontend auth concern.
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/jwt";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="dashboard-section">
      <section className="dashboard-hero">
        <p className="dashboard-eyebrow">Home</p>
        <h1>Welcome back</h1>
        <div className="dashboard-meta">
          <span className="inline-pill">{session.email ?? session.id}</span>
        </div>
      </section>

      <DashboardClient />
    </main>
  );
}
