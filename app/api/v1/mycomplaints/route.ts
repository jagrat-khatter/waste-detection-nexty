import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

// We use POST instead of GET because GET requests generally shouldn't have a JSON body.
// This allows you to securely pass { "userEmail": "...", "date": "..." } in the raw JSON body.
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const userEmail = json.userEmail;
    const dateString = json.date;

    if (!userEmail) {
      return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
    }

    // Build the date filter only if a valid date is provided; otherwise fetch all
    const parsedDate = dateString ? new Date(dateString) : null;
    const dateFilter = parsedDate && !isNaN(parsedDate.getTime()) ? { gte: parsedDate } : undefined;

    // Query the database
    const reports = await prisma.wasteReport.findMany({
      where: {
        userEmail: userEmail,
        ...(dateFilter ? { createdAt: dateFilter } : {})
      },
      include: {
        // Include the actual detected items in the response
        detectedItems: true 
      },
      orderBy: {
        createdAt: 'desc' // Newest reports first
      }
    });

    return NextResponse.json({
      status: "success",
      count: reports.length,
      reports: reports
    });

  } catch (error: any) {
    console.error("Error fetching my complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints", details: error.message },
      { status: 500 }
    );
  }
}