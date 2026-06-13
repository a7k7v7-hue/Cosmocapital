import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSessionUser } from "@/lib/session";
import { canEdit } from "@/lib/roles";

const patchSchema = z.object({
  type: z.enum(["RENT", "SALE"]).optional(),
  category: z.enum(["OFFICE", "RETAIL", "WAREHOUSE", "FREE_PURPOSE", "PRODUCTION", "LAND", "READY_BUSINESS"]).optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  metro: z.string().nullable().optional(),
  areaTotal: z.coerce.number().positive().optional(),
  areaMin: z.coerce.number().positive().nullable().optional(),
  floor: z.coerce.number().int().nullable().optional(),
  floorsTotal: z.coerce.number().int().nullable().optional(),
  price: z.coerce.number().positive().optional(),
  pricePerSqm: z.coerce.number().positive().nullable().optional(),
  photos: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  featured: z.coerce.boolean().optional(),
  landCategory: z.string().nullable().optional(),
  landVri: z.string().nullable().optional(),
  cadastralNumber: z.string().nullable().optional(),
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

  const obj = await prisma.object.update({ where: { id }, data: parsed.data });
  return NextResponse.json(obj);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canEdit(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.object.update({ where: { id }, data: { status: "ARCHIVED" } });
  return NextResponse.json({ ok: true });
}
