import { NextRequest, NextResponse } from "next/server";

if (!process.env.API_TOKEN) {
  console.error(
    "[auth] API_TOKEN is not set — failing closed: all requests to token-protected API routes will be rejected with 401 until API_TOKEN is configured."
  );
}

export function requireApiToken(
  req: NextRequest
): NextResponse | null {
  const token = process.env.API_TOKEN;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (provided !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
