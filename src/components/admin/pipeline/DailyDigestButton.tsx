"use client";

import { useState } from "react";

export default function DailyDigestButton() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ overdue: number; today: number } | null>(null);

  async function send() {
    setState("sending");
    try {
      const res = await fetch("/api/admin/pipeline/daily-digest", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={send}
        disabled={state === "sending"}
        className="inline-flex items-center gap-2 text-sm border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
      >
        {state === "sending" ? "Отправка..." : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Дайджест задач → Telegram
          </>
        )}
      </button>
      {state === "done" && result && (
        <span className="text-sm text-green-600">
          {result.overdue + result.today > 0
            ? `Отправлено: ${result.overdue} просроч. + ${result.today} сегодня`
            : "Задач нет — не отправлено"}
        </span>
      )}
      {state === "error" && (
        <span className="text-sm text-red-500">Ошибка отправки</span>
      )}
    </div>
  );
}
