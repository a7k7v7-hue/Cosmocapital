"use client";

import { useState } from "react";

const TYPE_RU: Record<string, string> = { RENT: "АРЕНДА", SALE: "ПРОДАЖА" };
const CAT_RU: Record<string, string> = {
  OFFICE: "Офис",
  RETAIL: "Торговое",
  WAREHOUSE: "Склад",
  FREE_PURPOSE: "Свободное назначение",
  PRODUCTION: "Производство",
};

interface Props {
  objectId: string;
  objectTitle: string;
  type: string;
  category: string;
  address: string;
  metro: string | null;
  areaTotal: number;
  areaMin: number | null;
  floor: number | null;
  floorsTotal: number | null;
  description: string;
}

function buildTeaser(p: Omit<Props, "objectId" | "objectTitle">): string {
  const lines: string[] = [];
  lines.push(`${TYPE_RU[p.type] ?? p.type} | ${CAT_RU[p.category] ?? p.category} — ${p.areaTotal} кв.м`);
  lines.push("");
  lines.push(`📍 ${p.address}`);
  if (p.metro) lines.push(`🚇 м. ${p.metro}`);
  lines.push("");
  lines.push(`• Площадь: ${p.areaTotal} кв.м`);
  if (p.areaMin) lines.push(`• Мин. секция: ${p.areaMin} кв.м`);
  if (p.floor) lines.push(`• Этаж: ${p.floor}${p.floorsTotal ? `/${p.floorsTotal}` : ""}`);
  lines.push("• Цена: по запросу");
  if (p.description.trim()) {
    lines.push("");
    lines.push(p.description.trim());
  }
  lines.push("");
  lines.push("──────────────────");
  lines.push("📞 +7 (903) 537 44 88");
  lines.push("✉️ info@cosmacapital.ru");
  return lines.join("\n");
}

export default function TeaserButton(props: Props) {
  const { objectTitle } = props;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = open ? buildTeaser(props) : "";

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-green-600 hover:text-green-800 text-xs font-medium ml-3"
        title="Сгенерировать тизер для клиента"
      >
        Тизер
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Тизер для клиента</p>
                <p className="text-xs text-gray-400 truncate max-w-xs">{objectTitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 flex items-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="px-5 py-4">
              <textarea
                readOnly
                value={text}
                rows={14}
                className="w-full text-sm font-mono bg-gray-50 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>

            <div className="px-5 pb-4 flex gap-3">
              <button
                onClick={copy}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {copied ? (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Скопировано
                  </span>
                ) : "Копировать"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
