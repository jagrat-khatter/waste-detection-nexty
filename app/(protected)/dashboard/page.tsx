// Responsibility: Gate and render the protected dashboard for frontend auth concern.
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/firebase/session";

export default async function DashboardPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Authenticated as {session.email ?? session.uid}</p>
    </main>
  );
}
