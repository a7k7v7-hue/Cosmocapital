"use client";

import { useState } from "react";

interface LeadFormProps {
  objectId?: string;
  source?: string;
}

type State = "idle" | "loading" | "done" | "error";

export default function LeadForm({ objectId, source = "site" }: LeadFormProps) {
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      objectId: objectId ?? undefined,
      source,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">✓</div>
        <p className="font-semibold text-gray-900">Заявка принята</p>
        <p className="text-sm text-gray-500 mt-1">
          Свяжемся с вами в течение рабочего дня
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="name"
        type="text"
        required
        placeholder="Ваше имя"
        className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
      />
      <input
        name="phone"
        type="tel"
        required
        placeholder="+7 (___) ___-__-__"
        className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
      />
      <textarea
        name="message"
        rows={3}
        placeholder="Вопрос или комментарий"
        className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
      />
      {state === "error" && (
        <p className="text-red-500 text-sm">Ошибка отправки. Попробуйте ещё раз.</p>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium transition-colors"
      >
        {state === "loading" ? "Отправка..." : "Оставить заявку"}
      </button>
    </form>
  );
}
