import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

const TYPE_RU: Record<string, string> = { RENT: "АРЕНДА", SALE: "ПРОДАЖА" };
const CAT_RU: Record<string, string> = {
  OFFICE: "Офис",
  RETAIL: "Торговое",
  WAREHOUSE: "Склад",
  FREE_PURPOSE: "Свободное назначение",
  PRODUCTION: "Производство",
};

function buildTeaser(obj: {
  id: string; type: string; category: string; title: string;
  description: string; address: string; metro: string | null;
  areaTotal: number; areaMin: number | null; floor: number | null; floorsTotal: number | null;
}): string {
  const lines: string[] = [];

  lines.push(`${TYPE_RU[obj.type]} | ${CAT_RU[obj.category]} — ${obj.areaTotal} кв.м`);
  lines.push(`${obj.title}`);
  lines.push("");
  lines.push(`📍 ${obj.address}`);
  if (obj.metro) lines.push(`🚇 м. ${obj.metro}`);
  lines.push("");

  const params: string[] = [];
  params.push(`• Площадь: ${obj.areaTotal} кв.м`);
  if (obj.areaMin) params.push(`• Мин. секция: ${obj.areaMin} кв.м`);
  if (obj.floor) {
    params.push(`• Этаж: ${obj.floor}${obj.floorsTotal ? `/${obj.floorsTotal}` : ""}`);
  }
  params.push("• Цена: по запросу");
  lines.push(...params);
  lines.push("");

  lines.push(obj.description.trim());
  lines.push("");
  lines.push("──────────────────");
  lines.push(`🌐 cosmocapital.ru/catalog/${obj.id}`);
  lines.push("📞 +7 (903) 537 44 88");
  lines.push("✉️ info@cosmocapital.ru");

  return lines.join("\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const obj = await prisma.object.findUnique({
    where: { id },
    select: { id: true, type: true, category: true, title: true, description: true,
              address: true, metro: true, areaTotal: true, areaMin: true,
              floor: true, floorsTotal: true },
  });
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ text: buildTeaser(obj) });
}
