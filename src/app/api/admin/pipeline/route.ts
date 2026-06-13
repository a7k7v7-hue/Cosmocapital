import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { DEFAULT_GCI } from "@/lib/pipeline";
import { requireSessionUser } from "@/lib/session";
import { canEdit, seeAllBrokers } from "@/lib/roles";

const createSchema = z.object({
  brokerName: z.string().min(1).max(100),
  segment: z.enum(["BIG_BOX", "LIGHT_INDUSTRIAL", "LAND"]),
  dealType: z.enum(["LI_RENT", "LI_SALE_LAND", "BB_RENT", "BB_SALE_LAND", "BTS_SLB_MANDATE"]),
  clientName: z.string().min(1).max(200),
  objectDescription: z.string().min(1).max(500),
  areaSqm: z.number().positive().nullable().optional(),
  expectedGci: z.number().positive().optional(),
  expectedCloseDate: z.string().datetime({ offset: true }).nullable().optional(),
  lprContact: z.string().max(300).nullable().optional(),
  leadSource: z.string().max(200).nullable().optional(),
  nextActionDate: z.string().datetime({ offset: true }).nullable().optional(),
  nextActionDesc: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  objectId: z.string().uuid().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const segment = searchParams.get("segment");
  const showLost = searchParams.get("showLost") === "true";
  const showClosed = searchParams.get("showClosed") === "true";

  const where: Record<string, unknown> = {};
  if (!showLost && !showClosed) {
    where.isLost = false;
    where.isClosed = false;
  } else if (showLost && !showClosed) {
    where.isLost = true;
  } else if (showClosed && !showLost) {
    where.isClosed = true;
  }
  if (stage) where.stage = parseInt(stage, 10);
  if (segment) where.segment = segment;

  // BROKER role: only see own deals
  if (!seeAllBrokers(user.role) && user.brokerName) {
    where.brokerName = user.brokerName;
  }

  const deals = await prisma.deal.findMany({
    where,
    orderBy: [{ stage: "asc" }, { lastStageChangedAt: "asc" }],
    include: {
      _count: { select: { activities: true } },
    },
  });

  return NextResponse.json(deals);
}

export async function POST(req: NextRequest) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canEdit(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const firstMsg = Object.values(fields).flat()[0] ?? "Ошибка валидации";
    return NextResponse.json({ error: { message: firstMsg, fields } }, { status: 422 });
  }

  const data = parsed.data;
  const expectedGci = data.expectedGci ?? DEFAULT_GCI[data.dealType] ?? 0;

  try {
    const deal = await prisma.deal.create({
      data: {
        brokerName: data.brokerName,
        segment: data.segment,
        dealType: data.dealType,
        clientName: data.clientName,
        objectDescription: data.objectDescription,
        areaSqm: data.areaSqm ?? null,
        expectedGci,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        lprContact: data.lprContact ?? null,
        leadSource: data.leadSource ?? null,
        nextActionDate: data.nextActionDate ? new Date(data.nextActionDate) : null,
        nextActionDesc: data.nextActionDesc ?? null,
        notes: data.notes ?? null,
        objectId: data.objectId ?? null,
        lastStageChangedAt: new Date(),
      },
    });
    return NextResponse.json(deal, { status: 201 });
  } catch (e) {
    console.error("deal create error", e);
    return NextResponse.json(
      { error: { message: "Ошибка базы данных — проверь логи сервера" } },
      { status: 500 }
    );
  }
}
