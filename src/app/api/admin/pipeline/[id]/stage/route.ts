import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyStageAdvanced } from "@/lib/notify";
import { STAGES } from "@/lib/pipeline";
import { requireSessionUser } from "@/lib/session";
import { canEdit } from "@/lib/roles";

const stageSchema = z.object({
  toStage: z.number().int().min(1).max(7),
  comment: z.string().max(500).optional(),
  changedBy: z.string().max(100).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canEdit(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = stageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.deal.findUnique({
    where: { id },
    select: { stage: true, clientName: true, brokerName: true, expectedGci: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { toStage, comment, changedBy } = parsed.data;
  const fromStage = existing.stage;

  const [deal] = await prisma.$transaction([
    prisma.deal.update({
      where: { id },
      data: {
        stage: toStage,
        lastStageChangedAt: new Date(),
        isClosed: toStage === 7,
      },
    }),
    prisma.stageChange.create({
      data: { dealId: id, fromStage, toStage, comment: comment ?? null, changedBy: changedBy ?? null },
    }),
  ]);

  if (toStage > fromStage) {
    notifyStageAdvanced({
      clientName: existing.clientName,
      brokerName: existing.brokerName,
      stage: toStage,
      stageName: STAGES[toStage - 1]?.name ?? String(toStage),
      expectedGci: existing.expectedGci,
    }).catch(() => {});
  }

  return NextResponse.json(deal);
}
