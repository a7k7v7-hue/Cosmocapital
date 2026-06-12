"use client";

import { useState, useEffect } from "react";

interface CatalogObject {
  id: string;
  title: string;
  address: string;
  type: string;
  category: string;
}

const TYPE_LABELS: Record<string, string> = { RENT: "Аренда", SALE: "Продажа" };
const CAT_LABELS: Record<string, string> = {
  OFFICE: "Офис", RETAIL: "Ритейл", WAREHOUSE: "Склад",
  FREE_PURPOSE: "СНП", PRODUCTION: "Производство",
};

export default function ObjectSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [objects, setObjects] = useState<CatalogObject[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/admin/objects-list");
        const data: CatalogObject[] = await r.json();
        if (!cancelled) setObjects(data);
      } catch {
        // ignore fetch errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selected = objects.find((o) => o.id === value);

  const filtered = search.trim()
    ? objects.filter(
        (o) =>
          o.title.toLowerCase().includes(search.toLowerCase()) ||
          o.address.toLowerCase().includes(search.toLowerCase())
      )
    : objects.slice(0, 30);

  return (
    <div className="relative">
      {/* Display */}
      {selected ? (
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800 truncate">{selected.title}</div>
            <div className="text-xs text-gray-400 truncate">{selected.address}</div>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setSearch(""); }}
            className="text-gray-400 hover:text-gray-600 shrink-0 flex items-center"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full text-left border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 hover:border-gray-300 bg-white"
        >
          {loading ? "Загрузка..." : "Выбрать объект из каталога..."}
        </button>
      )}

      {/* Dropdown */}
      {open && !selected && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или адресу..."
              className="w-full text-sm px-2 py-1 outline-none"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">Не найдено</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(o.id); setOpen(false); setSearch(""); }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-800 truncate">{o.title}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {o.address} · {TYPE_LABELS[o.type]} · {CAT_LABELS[o.category]}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
