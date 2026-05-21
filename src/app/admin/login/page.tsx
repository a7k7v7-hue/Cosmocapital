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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          Космо<span className="text-blue-600">капитал</span> — Вход
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
          <input
            name="pass"
            type="password"
            required
            placeholder="Пароль"
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
          />
          {error && (
            <p className="text-red-500 text-sm">Неверный email или пароль</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
