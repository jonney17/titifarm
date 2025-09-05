import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Auth temporarily disabled" }, { status: 503 });
}

export function POST() {
  return NextResponse.json({ error: "Auth temporarily disabled" }, { status: 503 });
}


