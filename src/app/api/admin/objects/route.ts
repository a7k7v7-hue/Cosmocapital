import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSessionUser } from "@/lib/session";
import { canEdit } from "@/lib/roles";

const objectSchema = z.object({
  type: z.enum(["RENT", "SALE"]),
  category: z.enum(["OFFICE", "RETAIL", "WAREHOUSE", "FREE_PURPOSE", "PRODUCTION", "LAND", "READY_BUSINESS"]),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  address: z.string().min(5),
  metro: z.string().optional().nullable(),
  areaTotal: z.coerce.number().positive(),
  areaMin: z.coerce.number().positive().optional().nullable(),
  floor: z.coerce.number().int().optional().nullable(),
  floorsTotal: z.coerce.number().int().optional().nullable(),
  price: z.coerce.number().positive(),
  pricePerSqm: z.coerce.number().positive().optional().nullable(),
  photos: z.array(z.string()).default([]),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.coerce.boolean().default(false),
  landCategory: z.string().optional().nullable(),
  landVri: z.string().optional().nullable(),
  cadastralNumber: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canEdit(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = objectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const obj = await prisma.object.create({ data: parsed.data });
  return NextResponse.json(obj, { status: 201 });
}
