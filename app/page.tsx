// Responsibility: Render the public landing page for frontend auth concern.
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Welcome</h1>
      <p>This frontend handles authentication only.</p>
      <nav>
        <ul>
          <li>
            <Link href="/login">Log in</Link>
          </li>
          <li>
            <Link href="/signup">Sign up</Link>
          </li>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
