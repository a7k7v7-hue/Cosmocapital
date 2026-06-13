"use client";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPass, setNewPass] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/reset-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pass: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
        setMessage(`Пароль обновлён для: ${data.email}`);
      } else {
        setStatus("err");
        setMessage(data.error ?? "Неизвестная ошибка");
      }
    } catch {
      setStatus("err");
      setMessage("Сетевая ошибка");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Сброс пароля</h1>
        <p className="text-sm text-gray-500 mb-6">
          Введите API Token из Render Dashboard и новый пароль администратора.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Token (из Render → Environment)
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Вставьте значение API_TOKEN"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Новый пароль (мин. 6 символов)
            </label>
            <input
              type="text"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Новый пароль"
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {status === "loading" ? "Обновление..." : "Обновить пароль"}
          </button>
        </form>
        {status === "ok" && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {message}
            <br />
            <a href="/admin/login" className="underline font-medium">
              Войти в панель →
            </a>
          </div>
        )}
        {status === "err" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
