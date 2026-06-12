import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSessionUser } from "@/lib/session";
import { canEdit, canDelete } from "@/lib/roles";

const patchSchema = z.object({
  brokerName: z.string().min(1).max(100).optional(),
  segment: z.enum(["BIG_BOX", "LIGHT_INDUSTRIAL", "LAND"]).optional(),
  dealType: z.enum(["LI_RENT", "LI_SALE_LAND", "BB_RENT", "BB_SALE_LAND", "BTS_SLB_MANDATE"]).optional(),
  clientName: z.string().min(1).max(200).optional(),
  objectDescription: z.string().min(1).max(500).optional(),
  areaSqm: z.number().positive().nullable().optional(),
  expectedGci: z.number().positive().optional(),
  expectedCloseDate: z.string().datetime({ offset: true }).nullable().optional(),
  lprContact: z.string().max(300).nullable().optional(),
  leadSource: z.string().max(200).nullable().optional(),
  nextActionDate: z.string().datetime({ offset: true }).nullable().optional(),
  nextActionDesc: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  actualGci: z.number().positive().nullable().optional(),
  isClosed: z.boolean().optional(),
  isLost: z.boolean().optional(),
  lossReason: z.enum([
    "CHOSE_ANOTHER_WITHOUT_US",
    "WENT_TO_COMPETITOR",
    "POSTPONED_DECISION",
    "BUDGET_NOT_CONFIRMED",
    "OWNER_REMOVED_OBJECT",
    "OTHER",
  ]).nullable().optional(),
  lossComment: z.string().max(500).nullable().optional(),
  reEngagementDate: z.string().datetime({ offset: true }).nullable().optional(),
  objectId: z.string().nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      stageChanges: { orderBy: { changedAt: "desc" } },
      activities: { orderBy: { activityDate: "desc" } },
      linkedObject: { select: { id: true, title: true, address: true, type: true, category: true } },
    },
  });

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PATCH(
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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };

  if (data.expectedCloseDate !== undefined) {
    updateData.expectedCloseDate = data.expectedCloseDate ? new Date(data.expectedCloseDate) : null;
  }
  if (data.nextActionDate !== undefined) {
    updateData.nextActionDate = data.nextActionDate ? new Date(data.nextActionDate) : null;
  }
  if (data.reEngagementDate !== undefined) {
    updateData.reEngagementDate = data.reEngagementDate ? new Date(data.reEngagementDate) : null;
  }

  const deal = await prisma.deal.update({ where: { id }, data: updateData });
  return NextResponse.json(deal);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canDelete(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.deal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
