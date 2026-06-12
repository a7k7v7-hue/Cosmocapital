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

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["HEAD", "SENIOR_BROKER", "BROKER", "RESEARCH"]).optional(),
  brokerName: z.string().max(100).nullable().optional(),
  active: z.boolean().optional(),
  pass: z.string().min(6).max(100).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { pass, ...rest } = parsed.data;
  const pw = pass ? await bcrypt.hash(pass, 12) : undefined;
  const updateData: Record<string, unknown> = { ...rest };
  if (pw) updateData.password = pw;

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: USER_SELECT,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json({ error: "Нельзя удалить себя" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
