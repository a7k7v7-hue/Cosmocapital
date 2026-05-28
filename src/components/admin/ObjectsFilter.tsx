"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const TYPES = [
  { value: "", label: "Все типы" },
  { value: "RENT", label: "Аренда" },
  { value: "SALE", label: "Продажа" },
];

const CATEGORIES = [
  { value: "", label: "Все" },
  { value: "OFFICE", label: "Офис" },
  { value: "RETAIL", label: "Торговое" },
  { value: "WAREHOUSE", label: "Склад" },
  { value: "FREE_PURPOSE", label: "Своб. назначение" },
  { value: "PRODUCTION", label: "Производство" },
];

const STATUSES = [
  { value: "", label: "Все статусы" },
  { value: "ACTIVE", label: "Активные" },
  { value: "ARCHIVED", label: "Архив" },
];

export default function ObjectsFilter({ counts }: {
  counts: { category: Record<string, number>; type: Record<string, number>; total: number }
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const set = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, sp]);

  const active = (key: string, value: string) => sp.get(key) === (value || null);

  const pill = (key: string, value: string, label: string, count?: number) => (
    <button
      key={value || "_all"}
      onClick={() => set(key, value)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
        active(key, value)
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
          active(key, value) ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-col gap-3">
      {/* Search */}
      <input
        type="text"
        placeholder="Поиск по названию или адресу..."
        defaultValue={sp.get("q") ?? ""}
        onChange={(e) => set("q", e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 font-medium mr-1">Категория:</span>
        {CATEGORIES.map(({ value, label }) =>
          pill("category", value, label, value ? counts.category[value] : counts.total)
        )}
      </div>

      {/* Type + Status pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 font-medium mr-1">Тип:</span>
        {TYPES.map(({ value, label }) =>
          pill("type", value, label, value ? counts.type[value] : undefined)
        )}
        <span className="text-xs text-gray-400 font-medium ml-4 mr-1">Статус:</span>
        {STATUSES.map(({ value, label }) => pill("status", value, label))}
      </div>
    </div>
  );
}
