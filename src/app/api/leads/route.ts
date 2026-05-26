import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLeadSchema } from "@/lib/schemas";
import { notifyNewLead } from "@/lib/notify";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ошибка валидации", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, phone, email, message, objectId, source } = parsed.data;

  const [lead, object] = await Promise.all([
    prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        message: message || null,
        objectId: objectId || null,
        source,
      },
      select: { id: true, createdAt: true },
    }),
    objectId ? prisma.object.findUnique({ where: { id: objectId }, select: { title: true } }) : Promise.resolve(null),
  ]);

  await notifyNewLead({ name, phone, email, message, source, objectTitle: object?.title });

  return NextResponse.json(lead, { status: 201 });
}
