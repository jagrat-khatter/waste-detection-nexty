"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataPoint {
  date: string;
  pending: number;
  processed: number;
  failed: number;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  days: number;
}

export function AnalyticsChart({ data, days }: AnalyticsChartProps) {
  // Format date from YYYY-MM-DD to MMM DD (e.g. Jul 23)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="info-card" style={{ marginTop: '16px', background: 'rgba(236, 253, 245, 0.4)', boxShadow: 'none' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
          Report Trends (Last {days === 1 ? '24 Hours' : `${days} Days`})
        </h3>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Daily breakdown of new vs resolved reports.
        </p>
      </div>

      <div style={{ height: '380px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(5, 150, 105, 0.12)"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475569", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475569", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "16px",
                border: "1px solid rgba(5, 150, 105, 0.12)",
                boxShadow: "0 24px 80px rgba(5, 150, 105, 0.12)",
                fontFamily: "var(--font-sans)",
              }}
              labelStyle={{ color: "#0f172a", fontWeight: 700, marginBottom: "8px" }}
              labelFormatter={(label) => formatDate(label as string)}
            />
            <Area
              type="monotone"
              dataKey="processed"
              name="Processed"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProcessed)"
              activeDot={{ r: 5, strokeWidth: 0, fill: "#10b981" }}
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPending)"
              activeDot={{ r: 5, strokeWidth: 0, fill: "#f59e0b" }}
            />
            <Area
              type="monotone"
              dataKey="failed"
              name="Failed"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFailed)"
              activeDot={{ r: 5, strokeWidth: 0, fill: "#f43f5e" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
