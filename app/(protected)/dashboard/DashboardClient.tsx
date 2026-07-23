"use client";

import { useEffect, useState } from "react";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";

interface DashboardData {
  kpis: {
    last24Hours: any;
    last7Days: any;
    last14Days: any;
    last30Days: any;
  };
  chartData: any[];
}

export function DashboardClient() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days }),
        });

        if (!res.ok) {
          throw new Error("Failed to load analytics");
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [days]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Overview</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{
            padding: '8px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            background: 'rgba(236, 253, 245, 0.8)',
            color: '#064e3b',
            fontWeight: 600,
            fontSize: '0.9rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value={1}>Last 24 Hours</option>
          <option value={7}>Last 7 Days</option>
          <option value={14}>Last 14 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
      </div>

      {error || !data ? (
        <div className="info-card" style={{ border: "1px solid #f87171", color: "#b91c1c", opacity: loading ? 0.5 : 1 }}>
          <h3 style={{ fontWeight: 600 }}>Error loading dashboard</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 200ms ease' }}>
          <MetricsCards data={data.kpis} days={days} />
          <AnalyticsChart data={data.chartData} days={days} />
        </div>
      )}
    </>
  );
}
