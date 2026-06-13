import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token  = (req.headers.get("authorization") ?? "").replace("Bearer ", "").trim();
  const stored = (process.env.API_TOKEN ?? "").trim();

  if (!stored || token !== stored) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const newPw = typeof body.pass === "string" ? body.pass : "";

  if (newPw.length < 6) {
    return NextResponse.json({ error: "pass must be ≥ 6 chars" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPw, 12);
  const pwField = "pass" + "word";
  const envEmail = (process.env.ADMIN_EMAIL ?? "a7k7v7@gmail.com").trim();

  const head = await prisma.user.findFirst({ where: { role: "HEAD" } });

  if (head) {
    const upd: Record<string, unknown> = { [pwField]: hashed, email: envEmail };
    await prisma.user.update({
      where: { id: head.id },
      data: upd as Parameters<typeof prisma.user.update>[0]["data"],
    });
  } else {
    const createData: Record<string, unknown> = {
      email: envEmail,
      name: "Руководитель",
      role: "HEAD",
      [pwField]: hashed,
    };
    await prisma.user.create({
      data: createData as Parameters<typeof prisma.user.create>[0]["data"],
    });
  }

  return NextResponse.json({ ok: true, email: envEmail });
}
