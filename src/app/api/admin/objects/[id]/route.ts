import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  type: z.enum(["RENT", "SALE"]).optional(),
  category: z.enum(["OFFICE", "RETAIL", "WAREHOUSE", "FREE_PURPOSE", "PRODUCTION"]).optional(),
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
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

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
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await prisma.object.update({ where: { id }, data: { status: "ARCHIVED" } });
  return NextResponse.json({ ok: true });
}
