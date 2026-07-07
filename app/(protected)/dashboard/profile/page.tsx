// Responsibility: Render the protected dashboard profile page for frontend auth concern.
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/jwt";

export default async function ProfilePage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="dashboard-section">
      <section className="profile-grid">
        <article className="profile-card">
          <p className="dashboard-eyebrow">Profile</p>
          <h1>Your test identity</h1>
          <p>
            This page is wired into the same session cookie flow as the home and
            testing pages.
          </p>
        </article>

        <article className="profile-card">
          <p className="dashboard-eyebrow">Session</p>
          <div className="stat-block">
            <strong>Email</strong>
            {session.email ?? "No email available"}
          </div>
          <div className="stat-block" style={{ marginTop: "12px" }}>
            <strong>UID</strong>
            {session.id}
          </div>
        </article>
      </section>
    </main>
  );
}
