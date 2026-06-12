"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatGci } from "@/lib/pipeline";

export default function CloseWithGci({
  dealId,
  currentActualGci,
}: {
  dealId: string;
  currentActualGci: number | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentActualGci?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const num = parseFloat(value) || 0;

  async function save() {
    if (!num) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pipeline/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualGci: num }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
      <h3 className="font-semibold text-green-900 mb-1">Сделка закрыта — внесите фактический GCI</h3>
      <p className="text-xs text-green-700 mb-4">
        По ТЗ §4.7: выставить счёт в течение 3 р.д., внести фактический GCI после получения оплаты.
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="number"
            min="1"
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false); }}
            placeholder="4000000"
            className="w-full border border-green-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400 transition-colors bg-white"
          />
          {num > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">
              {formatGci(num)}
            </span>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving || !num}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
        >
          {saving ? "Сохранение..." : "Сохранить GCI"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Сохранено
          </span>
        )}
      </div>
      {currentActualGci && (
        <p className="text-xs text-green-600 mt-2">
          Текущее значение: {formatGci(currentActualGci)}
        </p>
      )}
    </div>
  );
}
