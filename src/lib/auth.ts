import { NextRequest, NextResponse } from "next/server";

export function requireApiToken(
  req: NextRequest
): NextResponse | null {
  const token = process.env.API_TOKEN;
  if (!token) return null;

  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (provided !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
