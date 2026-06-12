"use client";

import { useState } from "react";

export default function ProfileClient() {
  const [curPass, setCurPass] = useState("");
  const [nextPass, setNextPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (nextPass.length < 8) { setError("Минимум 8 символов"); return; }
    if (nextPass !== confirm) { setError("Пароли не совпадают"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curPass, nextPass }),
      });
      if (res.ok) {
        setDone(true);
        setCurPass(""); setNextPass(""); setConfirm("");
      } else {
        const data = await res.json();
        setError(data.error ?? "Ошибка");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Текущий пароль</label>
        <input
          type="password"
          value={curPass}
          onChange={(e) => setCurPass(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Новый пароль</label>
        <input
          type="password"
          value={nextPass}
          onChange={(e) => setNextPass(e.target.value)}
          required
          minLength={8}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Повторите пароль</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && (
        <p className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Пароль изменён
        </p>
      )}
      <button
        type="submit"
        disabled={saving || !curPass || !nextPass || !confirm}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        {saving ? "Сохранение..." : "Изменить пароль"}
      </button>
    </form>
  );
}
