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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          🖼 Перенести фото
        </button>
      )}

      {state === "loading" && (
        <div className="text-sm text-gray-500 animate-pulse">⏳ Обновляем URL...</div>
      )}

      {state === "done" && result && (
        <div className="text-sm text-green-600 font-medium">
          ✓ Готово — обновлено объектов: {result.updatedObjects}
        </div>
      )}

      {state === "error" && result && (
        <div className="text-sm text-red-500">
          ✗ {result.error}
          <button onClick={() => { setState("idle"); setResult(null); }} className="ml-3 text-gray-400 underline text-xs">
            повторить
          </button>
        </div>
      )}
    </div>
  );
}
