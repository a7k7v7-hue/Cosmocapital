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

const SUPABASE_ERROR = "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY";

export default function MigratePhotosButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<MigrateResult | null>(null);

  const isSupabaseError = result?.error?.includes("SUPABASE") || result?.error?.includes("Supabase не настроен");

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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 max-w-xl">
      <div className="text-sm font-medium text-gray-700 mb-1">Перенос фото в Supabase Storage</div>
      <div className="text-xs text-gray-400 mb-3">
        Скачает фото со старого сайта cosmocapital.ru и загрузит в Supabase Storage.
        Фото сейчас работают как hotlinks — перенос нужен для независимости от старого сайта.
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
          ⏳ Переносим фото... (может занять 30–60 сек)
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
              {!!result.errors && (
                <span className="text-orange-500 ml-2">({result.errors} ошибок)</span>
              )}
              <div className="text-gray-400 mt-0.5">Обновлено объектов в БД: {result.dbUpdated}</div>
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
        <div className="text-sm">
          {isSupabaseError ? (
            <div>
              <div className="text-amber-600 font-medium mb-2">Supabase Storage не настроен</div>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal ml-4 mb-3">
                <li>
                  Создайте проект на{" "}
                  <span className="font-mono bg-gray-100 px-1 rounded">supabase.com</span>{" "}
                  (бесплатно)
                </li>
                <li>
                  В проекте: <b>Storage → New bucket</b>, имя:{" "}
                  <span className="font-mono bg-gray-100 px-1 rounded">objects</span>, Public: ✓
                </li>
                <li>
                  Скопируйте из <b>Settings → API</b>:{" "}
                  <span className="font-mono bg-gray-100 px-1 rounded">Project URL</span> и{" "}
                  <span className="font-mono bg-gray-100 px-1 rounded">service_role</span> ключ
                </li>
                <li>
                  В <b>Render Dashboard → cosmacapital → Environment</b> добавьте:
                  <div className="font-mono bg-gray-100 rounded p-1.5 mt-1 space-y-0.5 text-gray-700">
                    <div>SUPABASE_URL = https://xxxx.supabase.co</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY = eyJ...</div>
                    <div>NEXT_PUBLIC_SUPABASE_URL = https://xxxx.supabase.co</div>
                  </div>
                </li>
                <li>Нажмите Save → Render перезапустится → вернитесь и нажмите "Перенести фото"</li>
              </ol>
              <button
                onClick={() => { setState("idle"); setResult(null); }}
                className="text-indigo-600 underline text-xs"
              >
                Попробовать снова
              </button>
            </div>
          ) : (
            <div className="text-red-500">
              ✗ {result.error}
              <button
                onClick={() => { setState("idle"); setResult(null); }}
                className="ml-3 text-gray-400 underline text-xs"
              >
                повторить
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
