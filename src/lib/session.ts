import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  brokerName?: string | null;
};

/** Returns the session user or null */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) return null;
  return session.user as SessionUser;
}

/** API helper: returns null if authed, or a 401 Response */
export async function requireSession(): Promise<NextResponse | null> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

/** API helper: returns the user or a 401 Response */
export async function requireSessionUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return user;
}
