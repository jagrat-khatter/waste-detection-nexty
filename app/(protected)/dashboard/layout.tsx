// Responsibility: Render the protected dashboard shell with responsive sidebar and logout for frontend auth concern.
"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/testing", label: "Testing" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    setSidebarOpen(false);
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return null;
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar" data-open={sidebarOpen}>
        <div className="dashboard-brand">
          <p className="dashboard-eyebrow">Workspace</p>
          <strong>GreenFlow Dashboard</strong>
          <span className="muted">
            A clean auth test area for checking login, logout, and protected routing.
          </span>
        </div>

        <div className="dashboard-user">
          <p className="muted" style={{ color: "rgba(255,255,255,0.72)" }}>
            Signed in as
          </p>
          <strong>{user?.email ?? user?.uid ?? "Unknown user"}</strong>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                data-active={active}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.label}</span>
                <span>↗</span>
              </Link>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-footer">
          <button className="logout-button" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-topbar">
          <button
            className="dashboard-mobile-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            type="button"
            aria-label="Toggle dashboard sidebar"
          >
            ☰
          </button>
          <div>
            <strong>Dashboard</strong>
            <div className="muted">Home, profile, and testing pages are ready.</div>
          </div>
        </div>

        {children}
      </section>
    </div>
  );
}
