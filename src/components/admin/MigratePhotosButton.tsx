"use client";

import { useState } from "react";

interface MigrateResult {
  ok: boolean;
  message?: string;
  totalPhotos?: number;
  migrated?: number;
  errors?: number;
  dbUpdated?: number;
  errorDetails?: string[];
  error?: string;
}

export default function MigratePhotosButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<MigrateResult | null>(null);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/migrate-photos", { method: "POST" });
      const data: MigrateResult = await res.json();
      setResult(data);
      setState(data.ok ? "done" : "error");
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message });
      setState("error");
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="text-sm font-medium text-gray-700 mb-1">Перенос фото в Supabase</div>
      <div className="text-xs text-gray-400 mb-3">
        Скачает фото со старого сайта и загрузит в Supabase Storage
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
        <div className="text-sm text-gray-500 animate-pulse">
          ⏳ Переносим фото... (может занять 30-60 сек)
        </div>
      )}

      {state === "done" && result && (
        <div className="text-sm">
          {result.message ? (
            <span className="text-green-600">✓ {result.message}</span>
          ) : (
            <div>
              <span className="text-green-600 font-medium">
                ✓ Перенесено {result.migrated} из {result.totalPhotos} фото
              </span>
              {result.errors ? (
                <span className="text-orange-500 ml-2">({result.errors} ошибок)</span>
              ) : null}
              <div className="text-gray-400 mt-0.5">
                Обновлено объектов в БД: {result.dbUpdated}
              </div>
              {result.errorDetails?.length ? (
                <details className="mt-2">
                  <summary className="text-xs text-gray-400 cursor-pointer">Детали ошибок</summary>
                  <ul className="text-xs text-red-400 mt-1 space-y-0.5">
                    {result.errorDetails.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </details>
              ) : null}
            </div>
          )}
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
