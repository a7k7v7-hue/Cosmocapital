import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyStuckDeals } from "@/lib/notify";
import { STAGES, getDaysOnStage, isStuck } from "@/lib/pipeline";
import { requireSessionUser } from "@/lib/session";
import { canManageUsers } from "@/lib/roles";

export async function POST() {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const active = await prisma.deal.findMany({
    where: { isLost: false, isClosed: false },
    select: {
      id: true, clientName: true, brokerName: true,
      stage: true, expectedGci: true, lastStageChangedAt: true,
    },
  });

  const stuck = active
    .filter((d) => isStuck(d.lastStageChangedAt))
    .map((d) => ({
      clientName: d.clientName,
      brokerName: d.brokerName,
      stage: d.stage,
      stageName: STAGES[d.stage - 1]?.name ?? String(d.stage),
      daysOnStage: getDaysOnStage(d.lastStageChangedAt),
      expectedGci: d.expectedGci,
    }))
    .sort((a, b) => b.daysOnStage - a.daysOnStage);

  await notifyStuckDeals(stuck);

  return NextResponse.json({ sent: stuck.length, deals: stuck });
}
