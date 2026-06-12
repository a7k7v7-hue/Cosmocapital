"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const form = e.currentTarget;
    const res = await signIn("credentials", {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      pass: (form.elements.namedItem("pass") as HTMLInputElement).value,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/admin");
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ colorScheme: "light" }}>
      {/* Left: branded dark panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-96 shrink-0 p-12"
        style={{ background: "#0f172a" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            КК
          </div>
          <div>
            <div className="text-white font-semibold tracking-tight">КосмоКапитал</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>CRM</div>
          </div>
        </div>

        <div>
          <p className="text-2xl font-bold leading-snug text-white mb-4">
            Управление сделками<br />для команды брокеров
          </p>
          <ul className="space-y-2.5">
            {[
              "7-стадийный пайплайн",
              "Взвешенный прогноз GCI",
              "Ролевой доступ · Head / Broker",
              "KPI аналитика и планёрка",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          КосмоКапитал © 2025
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
            >
              КК
            </div>
            <div className="font-semibold text-gray-900 tracking-tight">КосмоКапитал CRM</div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Добро пожаловать</h2>
          <p className="text-sm text-gray-400 mb-8">Войдите в свой аккаунт</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@kosmocapital.ru"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ colorScheme: "light" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Пароль</label>
              <input
                name="pass"
                type="password"
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ colorScheme: "light" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-red-600 text-sm">Неверный email или пароль</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors text-sm mt-2"
              style={{ boxShadow: "0 1px 3px rgba(59,130,246,0.3)" }}
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
