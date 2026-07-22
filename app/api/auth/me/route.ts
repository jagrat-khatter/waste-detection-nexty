import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  
  if (!cookieHeader) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const match = cookieHeader.match(/auth_token=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: payload }, { status: 200 });
}
