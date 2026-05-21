import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const object = await prisma.object.findFirst({
    where: { id, status: "ACTIVE" },
  });

  if (!object) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  return NextResponse.json(object);
}
