"use client";

import React, { useState } from "react";
import Link from "next/link";
import { STAGES, STAGE_COLORS, DEAL_TYPE_LABELS, SEGMENT_LABELS } from "@/lib/pipeline";

interface PlanerDeal {
  id: string;
  clientName: string;
  brokerName: string;
  stage: number;
  dealType: string;
  segment: string;
  expectedGci: number;
  nextActionDate: string | null;
  nextActionDesc: string | null;
  daysOverdue?: number;
}

function DealActionRow({ deal, canEdit }: { deal: PlanerDeal; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(
    deal.nextActionDate ? deal.nextActionDate.slice(0, 10) : ""
  );
  const [desc, setDesc] = useState(deal.nextActionDesc ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sc = STAGE_COLORS[deal.stage] ?? STAGE_COLORS[1];

  async function save() {
    if (!date) return;
    setSaving(true);
    await fetch(`/api/admin/pipeline/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nextActionDate: new Date(date).toISOString(),
        nextActionDesc: desc || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setOpen(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/70 transition-colors">
        {/* Deal info */}
        <Link
          href={`/admin/pipeline/${deal.id}`}
          className="flex-1 min-w-0 group"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-700 transition-colors">
              {deal.clientName}
            </span>
            <span className="text-xs text-gray-400 shrink-0">{deal.brokerName}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {STAGES[deal.stage - 1]?.name}
            </span>
            <span className="text-xs text-gray-400">
              {DEAL_TYPE_LABELS[deal.dealType] ?? deal.dealType}
            </span>
            <span className="text-xs text-gray-400">
              {SEGMENT_LABELS[deal.segment] ?? deal.segment}
            </span>
          </div>
        </Link>

        {/* Status / saved indicator */}
        <div className="shrink-0 text-right min-w-[110px]">
          {saved ? (
            <span className="flex items-center justify-end gap-1 text-xs text-green-600 font-medium">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Шаг назначен
            </span>
          ) : deal.daysOverdue !== undefined ? (
            <span className="text-red-600 font-semibold text-xs">
              Просрочен {deal.daysOverdue}д
            </span>
          ) : (
            <span className="text-amber-500 text-xs">нет шага</span>
          )}
        </div>

        {/* Toggle button — hidden for RESEARCH */}
        {canEdit && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 text-xs border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-500 px-2.5 py-1 rounded-xl transition-colors"
          >
            {open ? "Скрыть" : "Назначить →"}
          </button>
        )}
      </div>

      {/* Inline form */}
      {canEdit && open && (
        <div className="px-5 pb-3 flex items-center gap-3 flex-wrap bg-blue-50/40">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-400 transition-colors bg-white"
          />
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Описание шага (необязательно)"
            className="flex-1 min-w-[180px] border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-400 transition-colors bg-white"
          />
          <button
            onClick={save}
            disabled={saving || !date}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50 shrink-0"
          >
            {saving ? "..." : "Сохранить"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlanerActionSection({
  icon,
  title,
  countColor,
  deals,
  emptyText,
  canEdit = true,
}: {
  icon: React.ReactNode;
  title: string;
  countColor: string;
  deals: PlanerDeal[];
  emptyText: string;
  canEdit?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span>{icon}</span>
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        {deals.length > 0 && (
          <span className={`text-xs font-semibold ml-1 ${countColor}`}>
            {deals.length}
          </span>
        )}
      </div>
      {deals.length === 0 ? (
        <div className="px-5 py-4 text-sm text-gray-400">{emptyText}</div>
      ) : (
        <div>
          {deals.map((d) => (
            <DealActionRow key={d.id} deal={d} canEdit={canEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
