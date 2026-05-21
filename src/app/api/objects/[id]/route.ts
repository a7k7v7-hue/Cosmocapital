import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiToken(req);
  if (authError) return authError;

  const { id } = await params;

  const object = await prisma.object.findFirst({
    where: { id, status: "ACTIVE" },
  });

  if (!object) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  return NextResponse.json(object);
}
