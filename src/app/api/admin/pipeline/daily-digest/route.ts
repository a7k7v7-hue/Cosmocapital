import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyDigest } from "@/lib/notify";
import { requireSessionUser } from "@/lib/session";
import { canManageUsers } from "@/lib/roles";

export async function POST() {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [overdue, today] = await Promise.all([
    prisma.deal.findMany({
      where: { isLost: false, isClosed: false, nextActionDate: { lt: todayStart } },
      select: {
        clientName: true, brokerName: true, stage: true,
        nextActionDate: true, nextActionDesc: true,
      },
      orderBy: { nextActionDate: "asc" },
    }),
    prisma.deal.findMany({
      where: { isLost: false, isClosed: false, nextActionDate: { gte: todayStart, lte: todayEnd } },
      select: {
        clientName: true, brokerName: true, stage: true,
        nextActionDate: true, nextActionDesc: true,
      },
      orderBy: { nextActionDate: "asc" },
    }),
  ]);

  await sendDailyDigest({ overdue, today });

  return NextResponse.json({ overdue: overdue.length, today: today.length });
}
