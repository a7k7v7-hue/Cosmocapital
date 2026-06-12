"use client";

import { useState } from "react";

export default function ReEngagementDate({
  dealId,
  currentDate,
}: {
  dealId: string;
  currentDate: string | null;
}) {
  const [date, setDate] = useState(
    currentDate ? currentDate.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/pipeline/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reEngagementDate: date ? new Date(date).toISOString() : null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const presets = [
    { label: "+3 мес", months: 3 },
    { label: "+6 мес", months: 6 },
  ];

  function applyPreset(months: number) {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setDate(d.toISOString().slice(0, 10));
    setSaved(false);
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-1 text-sm">
        Дата повторного контакта
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        TZ §4.8: запланируйте повторный выход через 3–6 месяцев, если клиент
        отложил решение или бюджет не подтверждён.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setSaved(false); }}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-400 transition-colors bg-white"
        />
        {presets.map((p) => (
          <button
            key={p.months}
            onClick={() => applyPreset(p.months)}
            className="text-xs border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors bg-white"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={save}
          disabled={saving}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? "Сохраняем..." : "Сохранить"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Сохранено
          </span>
        )}
      </div>
      {date && (
        <p className="text-xs text-gray-500 mt-2">
          Повторный контакт:{" "}
          {new Date(date).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
