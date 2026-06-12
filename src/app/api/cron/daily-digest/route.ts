import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyDigest } from "@/lib/notify";

// Called by Vercel Cron (or Render Cron) at 09:00 MSK every weekday.
// Authenticate via CRON_SECRET env var — Vercel sends it as Bearer token automatically.
export async function GET(req: NextRequest) {
  const token = process.env.CRON_SECRET;
  if (token) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${token}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [overdue, today] = await Promise.all([
    prisma.deal.findMany({
      where: { isLost: false, isClosed: false, nextActionDate: { lt: todayStart } },
      select: { clientName: true, brokerName: true, stage: true, nextActionDate: true, nextActionDesc: true },
      orderBy: { nextActionDate: "asc" },
    }),
    prisma.deal.findMany({
      where: { isLost: false, isClosed: false, nextActionDate: { gte: todayStart, lte: todayEnd } },
      select: { clientName: true, brokerName: true, stage: true, nextActionDate: true, nextActionDesc: true },
      orderBy: { nextActionDate: "asc" },
    }),
  ]);

  await sendDailyDigest({ overdue, today });

  return NextResponse.json({ ok: true, overdue: overdue.length, today: today.length });
}
