import { NextRequest, NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  curPass: z.string().min(1),
  nextPass: z.string().min(8, "Минимум 8 символов"),
});

export async function PATCH(req: NextRequest) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const match = await bcrypt.compare(parsed.data.curPass, dbUser.password);
  if (!match) return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 400 });

  const pw = await bcrypt.hash(parsed.data.nextPass, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: pw } });

  return NextResponse.json({ ok: true });
}
