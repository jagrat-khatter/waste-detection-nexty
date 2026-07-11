// Responsibility: Proxy POST requests to the Waste Detection ML API to avoid CORS issues.
import { NextResponse, type NextRequest } from "next/server";

const ML_API_URL =
  "https://jagrat-khatter-waste-detection-api.hf.space/api/v1/predict";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(ML_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `ML API returned ${res.status}`, detail: errorText },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
