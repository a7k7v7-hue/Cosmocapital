import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { objectsQuerySchema } from "@/lib/schemas";
import { Prisma } from "@/generated/prisma";
import { requireApiToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authError = requireApiToken(req);
  if (authError) return authError;

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = objectsQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Неверные параметры", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, category, metro, areaMin, areaMax, priceMin, priceMax, page, limit } =
    parsed.data;

  const where: Prisma.ObjectWhereInput = {
    status: "ACTIVE",
    ...(type && { type }),
    ...(category && { category }),
    ...(metro && { metro: { contains: metro, mode: "insensitive" } }),
    ...(areaMin !== undefined || areaMax !== undefined
      ? { areaTotal: { gte: areaMin, lte: areaMax } }
      : {}),
    ...(priceMin !== undefined || priceMax !== undefined
      ? { price: { gte: priceMin, lte: priceMax } }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.object.count({ where }),
    prisma.object.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        category: true,
        title: true,
        address: true,
        metro: true,
        areaTotal: true,
        areaMin: true,
        price: true,
        pricePerSqm: true,
        photos: true,
        featured: true,
      },
    }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
