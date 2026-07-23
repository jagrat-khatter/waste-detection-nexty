import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";
import { getSessionFromCookies } from "@/lib/auth/jwt";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status || !Object.values(ReportStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // We accept notes but they are currently dropped since the schema lacks a notes field.
    // In the future, a migration can add it and it will seamlessly work here.
    if (notes) {
      console.log(`[Status Update] Notes attached for ${id}: ${notes}`);
    }

    const updatedReport = await prisma.wasteReport.update({
      where: { id },
      data: { status },
      include: { detectedItems: true }
    });

    return NextResponse.json({ success: true, data: updatedReport });
  } catch (error: any) {
    console.error("Error updating report status:", error);
    return NextResponse.json(
      { error: "Failed to update report status", details: error.message },
      { status: 500 }
    );
  }
}
