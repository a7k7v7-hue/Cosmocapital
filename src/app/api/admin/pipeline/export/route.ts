import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEAL_TYPE_LABELS,
  SEGMENT_LABELS,
  LOSS_REASON_LABELS,
  STAGES,
  getWeightedGci,
  getDaysOnStage,
} from "@/lib/pipeline";
import { requireSessionUser } from "@/lib/session";
import { seeAllBrokers } from "@/lib/roles";

function esc(v: string | null | undefined): string {
  if (!v) return "";
  return `"${v.replace(/"/g, '""')}"`;
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toLocaleDateString("ru-RU");
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "";
  return Math.round(n).toString();
}

export async function GET(req: NextRequest) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") ?? "active";

  const baseWhere =
    view === "closed"
      ? { isClosed: true }
      : view === "lost"
      ? { isLost: true }
      : { isLost: false, isClosed: false };

  // BROKER sees only own deals
  const brokerWhere =
    !seeAllBrokers(user.role) && user.brokerName
      ? { brokerName: user.brokerName }
      : {};

  const deals = await prisma.deal.findMany({
    where: { ...baseWhere, ...brokerWhere },
    orderBy: [{ stage: "asc" }, { createdAt: "asc" }],
  });

  const headers = [
    "ID", "Клиент", "Объект / запрос", "Брокер", "Сегмент", "Тип сделки",
    "Площадь кв.м", "Стадия №", "Стадия", "Ожид. GCI ₽", "Взвеш. GCI ₽",
    "Факт. GCI ₽", "Дней на стадии", "Завис", "Дата закрытия",
    "Следующий шаг", "Дата след. шага", "Источник лида", "ЛПР",
    "Причина проигрыша", "Заметки", "Создана", "Обновлена",
  ];

  const rows = deals.map((d) => {
    const stageName = STAGES[d.stage - 1]?.name ?? String(d.stage);
    const daysOn = getDaysOnStage(d.lastStageChangedAt);
    return [
      esc(d.id.slice(0, 8)),
      esc(d.clientName),
      esc(d.objectDescription),
      esc(d.brokerName),
      esc(SEGMENT_LABELS[d.segment] ?? d.segment),
      esc(DEAL_TYPE_LABELS[d.dealType] ?? d.dealType),
      fmtNum(d.areaSqm),
      String(d.stage),
      esc(stageName),
      fmtNum(d.expectedGci),
      fmtNum(getWeightedGci(d.expectedGci, d.stage)),
      fmtNum(d.actualGci),
      String(daysOn),
      daysOn >= 30 ? "Да" : "Нет",
      esc(fmtDate(d.expectedCloseDate)),
      esc(d.nextActionDesc),
      esc(fmtDate(d.nextActionDate)),
      esc(d.leadSource),
      esc(d.lprContact),
      esc(d.lossReason ? (LOSS_REASON_LABELS[d.lossReason] ?? d.lossReason) : null),
      esc(d.notes),
      esc(fmtDate(d.createdAt)),
      esc(fmtDate(d.updatedAt)),
    ].join(",");
  });

  const csv = "﻿" + [headers.map(esc).join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pipeline-${view}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
