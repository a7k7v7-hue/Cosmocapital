import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { canManageUsers } from "@/lib/roles";

const USER_SELECT = {
  id: true, email: true, name: true,
  role: true, brokerName: true, active: true, createdAt: true,
} as const;

const createSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().min(1).max(100),
  role: z.enum(["HEAD", "SENIOR_BROKER", "BROKER", "RESEARCH"]),
  brokerName: z.string().max(100).nullable().optional(),
  pass: z.string().min(6).max(100),
});

export async function GET() {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: USER_SELECT,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { email, name, role, brokerName, pass } = parsed.data;
  const pw = await bcrypt.hash(pass, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email уже используется" }, { status: 409 });
  }

  const created = await prisma.user.create({
    data: { email, name, role, brokerName: brokerName ?? null, password: pw },
    select: USER_SELECT,
  });
  return NextResponse.json(created, { status: 201 });
}
