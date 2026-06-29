// Responsibility: Enforce auth-first access to business-logic user endpoint in backend concern.
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";

function extractBearerToken(header: string | null): string | null {
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

export async function GET(request: Request) {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decodedToken = await verifyToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.placeholderRecord.findMany({
    where: { firebaseUid: decodedToken.uid },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: reports });
}
