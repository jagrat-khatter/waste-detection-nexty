import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";
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
    let status: ReportStatus | undefined = undefined;
    let page = 1;
    let limit = 10;
    let search = "";

    try {
      const body = await request.json();
      if (body?.status && body.status !== "ALL") status = body.status as ReportStatus;
      if (body?.page) page = Math.max(1, parseInt(body.page, 10));
      if (body?.limit) limit = Math.max(1, parseInt(body.limit, 10));
      if (body?.search) search = String(body.search).trim();
    } catch {
      // Body is optional
    }

    const scopeWhere = getScopeWhere(session.email);
    
    // Build search conditions
    const searchWhere = search ? {
      OR: [
        { id: { contains: search, mode: "insensitive" as const } },
        { userEmail: { contains: search, mode: "insensitive" as const } },
        { address: { contains: search, mode: "insensitive" as const } }
      ]
    } : {};

    const where = {
      ...scopeWhere,
      ...(status ? { status } : {}),
      ...searchWhere,
    };

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      prisma.wasteReport.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { updatedAt: "desc" },
        include: { detectedItems: true }
      }),
      prisma.wasteReport.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error: any) {
    console.error("Assigned reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports", details: error.message }, { status: 500 });
  }
}
