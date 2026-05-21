"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ObjectCategory, ObjectType, CATEGORY_LABELS, TYPE_LABELS } from "@/types/objects";

const TYPES: ObjectType[] = ["RENT", "SALE"];
const CATEGORIES: ObjectCategory[] = [
  "OFFICE",
  "RETAIL",
  "WAREHOUSE",
  "FREE_PURPOSE",
  "PRODUCTION",
];

export default function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const get = (key: string) => searchParams.get(key) ?? "";

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-5">
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Тип сделки
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => update("type", "")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !get("type")
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Все
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => update("type", get("type") === t ? "" : t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                get("type") === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Категория
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => update("category", "")}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !get("category")
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Все категории
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => update("category", get("category") === c ? "" : c)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                get("category") === c
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Площадь, м²
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="от"
            defaultValue={get("areaMin")}
            onBlur={(e) => update("areaMin", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <span className="text-gray-400 shrink-0">-</span>
          <input
            type="number"
            placeholder="до"
            defaultValue={get("areaMax")}
            onBlur={(e) => update("areaMax", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Цена, ₽
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="от"
            defaultValue={get("priceMin")}
            onBlur={(e) => update("priceMin", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <span className="text-gray-400 shrink-0">-</span>
          <input
            type="number"
            placeholder="до"
            defaultValue={get("priceMax")}
            onBlur={(e) => update("priceMax", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={() => router.push(pathname)}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-left"
      >
        Сбросить фильтры
      </button>
    </aside>
  );
}
