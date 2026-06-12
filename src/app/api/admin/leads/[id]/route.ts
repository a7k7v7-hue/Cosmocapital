import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSessionUser } from "@/lib/session";
import { canEdit } from "@/lib/roles";

const patchSchema = z.object({
  status: z.enum(["NEW", "IN_WORK", "DONE", "REJECTED"]).optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canEdit(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const lead = await prisma.lead.update({ where: { id }, data: parsed.data });
  return NextResponse.json(lead);
}
