"use client";

import { useState } from "react";

interface LeadFormProps {
  objectId?: string;
  source?: string;
}

type State = "idle" | "loading" | "done" | "error";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 1) return `+7`;
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

function validatePhone(v: string): boolean {
  return v.replace(/\D/g, "").length === 11;
}

export default function LeadForm({ objectId, source = "site" }: LeadFormProps) {
  const [state, setState] = useState<State>("idle");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [nameError, setNameError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const nameOk = name.length >= 2;
    const phoneOk = validatePhone(phone);

    setNameError(!nameOk);
    setPhoneError(!phoneOk);
    if (!nameOk || !phoneOk) return;

    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
          objectId: objectId ?? undefined,
          source,
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3 text-green-500">✓</div>
        <p className="font-semibold text-gray-900">Заявка принята</p>
        <p className="text-sm text-gray-500 mt-1">Свяжемся с вами в течение рабочего дня</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <div>
        <input
          name="name"
          type="text"
          placeholder="Ваше имя"
          onChange={() => setNameError(false)}
          className={`w-full border rounded-lg px-4 py-3 text-sm outline-none transition-colors ${
            nameError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
          }`}
        />
        {nameError && <p className="text-red-500 text-xs mt-1">Введите имя</p>}
      </div>

      <div>
        <input
          type="tel"
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={(e) => { setPhone(formatPhone(e.target.value)); setPhoneError(false); }}
          className={`w-full border rounded-lg px-4 py-3 text-sm outline-none transition-colors ${
            phoneError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
          }`}
        />
        {phoneError && <p className="text-red-500 text-xs mt-1">Введите корректный номер</p>}
      </div>

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
        className="relative bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium transition-colors"
      >
        {state === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Отправка...
          </span>
        ) : (
          "Оставить заявку"
        )}
      </button>
    </form>
  );
}
