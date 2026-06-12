import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSessionUser } from "@/lib/session";
import { canEdit } from "@/lib/roles";

const createSchema = z.object({
  type: z.enum(["CALL", "MEETING", "VIEWING", "PROPOSAL_SENT", "EMAIL", "OTHER"]),
  description: z.string().min(1).max(1000),
  activityDate: z.string().datetime({ offset: true }).optional(),
  createdBy: z.string().max(100).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const activities = await prisma.dealActivity.findMany({
    where: { dealId: id },
    orderBy: { activityDate: "desc" },
  });

  return NextResponse.json(activities);
}

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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { type, description, activityDate, createdBy } = parsed.data;
  const activity = await prisma.dealActivity.create({
    data: {
      dealId: id,
      type,
      description,
      activityDate: activityDate ? new Date(activityDate) : new Date(),
      createdBy: createdBy ?? null,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
