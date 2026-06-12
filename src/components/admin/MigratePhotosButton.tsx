"use client";

import { useState } from "react";

interface FixResult {
  ok: boolean;
  updatedObjects?: number;
  error?: string;
}

export default function MigratePhotosButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<FixResult | null>(null);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/fix-photo-urls", { method: "POST" });
      const data: FixResult = await res.json();
      setResult(data);
      setState(data.ok ? "done" : "error");
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message });
      setState("error");
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 max-w-xl">
      <div className="text-sm font-medium text-gray-700 mb-1">Перенос фото</div>
      <div className="text-xs text-gray-400 mb-3">
        Обновляет URL фото в базе данных — с cosmocapital.ru на локальные файлы сайта.
        Фото уже скачаны и задеплоены вместе с кодом.
      </div>

      {state === "idle" && (
        <button
          onClick={run}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Перенести фото
        </button>
      )}

      {state === "loading" && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500 animate-pulse">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Обновляем URL...
        </div>
      )}

      {state === "done" && result && (
        <div className="text-sm text-green-600 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Готово — обновлено объектов: {result.updatedObjects}
          </span>
        </div>
      )}

      {state === "error" && result && (
        <div className="text-sm text-red-500">
          <span className="inline-flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            {result.error}
          </span>
          <button onClick={() => { setState("idle"); setResult(null); }} className="ml-3 text-gray-400 underline text-xs">
            повторить
          </button>
        </div>
      )}
    </div>
  );
}
