import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;

  const objects = await prisma.object.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, title: true, address: true, type: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(objects);
}
