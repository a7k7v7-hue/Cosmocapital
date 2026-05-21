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

const inp: React.CSSProperties = {
  width: "100%", border: "1.5px solid var(--border)", borderRadius: "var(--r)",
  padding: "12px 14px", fontSize: 14, color: "var(--text)", fontFamily: "inherit",
  outline: "none", transition: "var(--trans)", background: "var(--surface)",
};

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
          name, phone,
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
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 32, color: "var(--accent)", marginBottom: 8 }}>✓</div>
        <p style={{ fontWeight: 600, color: "var(--dark)" }}>Заявка принята</p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Свяжемся в течение рабочего дня</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }} noValidate>
      <div>
        <input name="name" type="text" placeholder="Ваше имя"
          onChange={() => setNameError(false)}
          style={{ ...inp, borderColor: nameError ? "#c53030" : "var(--border)" }}
        />
        {nameError && <p style={{ color: "#c53030", fontSize: 12, marginTop: 4 }}>Введите имя</p>}
      </div>
      <div>
        <input type="tel" placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={(e) => { setPhone(formatPhone(e.target.value)); setPhoneError(false); }}
          style={{ ...inp, borderColor: phoneError ? "#c53030" : "var(--border)" }}
        />
        {phoneError && <p style={{ color: "#c53030", fontSize: 12, marginTop: 4 }}>Введите корректный номер</p>}
      </div>
      <textarea name="message" rows={3} placeholder="Вопрос или комментарий"
        style={{ ...inp, resize: "none" }}
      />
      {state === "error" && (
        <p style={{ color: "#c53030", fontSize: 13 }}>Ошибка отправки. Попробуйте ещё раз.</p>
      )}
      <button type="submit" disabled={state === "loading"} style={{
        background: "var(--accent)", color: "#fff", border: "none",
        padding: "13px", borderRadius: "var(--r)", fontSize: 14, fontWeight: 600,
        cursor: "pointer", transition: "var(--trans)", opacity: state === "loading" ? .6 : 1,
        fontFamily: "inherit",
      }}>
        {state === "loading" ? "Отправка..." : "Оставить заявку"}
      </button>
    </form>
  );
}
