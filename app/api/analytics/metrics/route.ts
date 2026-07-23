import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/jwt";

function getScopeWhere(email: string) {
  if (email.toLowerCase().includes("admin")) return {};
  const match = email.match(/(\d+)/);
  if (match) return { address: `Sector ${match[1]}` };
  return {};
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extract email securely from session cookie
    const session = await getSessionFromCookies();
    if (!session || !session.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse optional params from body if provided
    let days = 30;
    try {
      const body = await request.json();
      if (body?.days && typeof body.days === "number") {
        days = body.days;
      }
    } catch {
      // Body is optional
    }

    const scopeWhere = getScopeWhere(session.email);
    const now = new Date();
    const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

    const [h24, d7, d14, d30, created, processed, failed] = await Promise.all([
      prisma.wasteReport.groupBy({ by: ["status"], where: { ...scopeWhere, updatedAt: { gte: daysAgo(1) } }, _count: true }),
      prisma.wasteReport.groupBy({ by: ["status"], where: { ...scopeWhere, updatedAt: { gte: daysAgo(7) } }, _count: true }),
      prisma.wasteReport.groupBy({ by: ["status"], where: { ...scopeWhere, updatedAt: { gte: daysAgo(14) } }, _count: true }),
      prisma.wasteReport.groupBy({ by: ["status"], where: { ...scopeWhere, updatedAt: { gte: daysAgo(30) } }, _count: true }),
      prisma.wasteReport.findMany({ where: { ...scopeWhere, createdAt: { gte: daysAgo(days) } }, select: { createdAt: true } }),
      prisma.wasteReport.findMany({ where: { ...scopeWhere, status: "PROCESSED", updatedAt: { gte: daysAgo(days) } }, select: { updatedAt: true } }),
      prisma.wasteReport.findMany({ where: { ...scopeWhere, status: "FAILED", updatedAt: { gte: daysAgo(days) } }, select: { updatedAt: true } }),
    ]);

    function toKpi(rows: { status: string; _count: number }[]) {
      const map: Record<string, number> = { PENDING: 0, PROCESSED: 0, FAILED: 0 };
      rows.forEach((r) => (map[r.status] = r._count));
      return { pending: map.PENDING, processed: map.PROCESSED, failed: map.FAILED };
    }

    const startDate = daysAgo(days);
    const toDateKey = (d: Date) => d.toISOString().slice(0, 10);

    function toDayMap(dates: Date[]) {
      const map: Record<string, number> = {};
      dates.forEach((d) => { const k = toDateKey(d); map[k] = (map[k] || 0) + 1; });
      return map;
    }

    const pendingMap = toDayMap(created.map((r) => r.createdAt));
    const processedMap = toDayMap(processed.map((r) => r.updatedAt));
    const failedMap = toDayMap(failed.map((r) => r.updatedAt));

    const chartData = [];
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = toDateKey(d);
      chartData.push({
        date: key,
        pending: pendingMap[key] || 0,
        processed: processedMap[key] || 0,
        failed: failedMap[key] || 0,
      });
    }

    return NextResponse.json({
      kpis: {
        last24Hours: toKpi(h24 as any),
        last7Days: toKpi(d7 as any),
        last14Days: toKpi(d14 as any),
        last30Days: toKpi(d30 as any),
      },
      chartData,
    });

  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics", details: error.message }, { status: 500 });
  }
}
