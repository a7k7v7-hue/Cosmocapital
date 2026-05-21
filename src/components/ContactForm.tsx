"use client";

import { useState } from "react";

const directions = [
  "Офисная недвижимость",
  "Стрит-ритейл / ГАБ",
  "Склады / Производство",
  "Инвестиционные объекты",
  "Оценка и консалтинг",
  "Управление недвижимостью",
  "Земельные участки",
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 1) return `+7`;
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

const inp: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  border: "1.5px solid var(--border)", borderRadius: "var(--r)",
  fontSize: 14, color: "var(--text)", outline: "none",
  transition: "var(--trans)", background: "var(--surface)",
  fontFamily: "inherit",
};

export default function ContactForm() {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const company = (form.elements.namedItem("company") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const direction = (form.elements.namedItem("direction") as HTMLSelectElement).value;
    if (!name || phone.replace(/\D/g, "").length < 11) return;

    setState("loading");
    const message = [
      company && `Компания: ${company}`,
      direction && `Направление: ${direction}`,
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message, source: "homepage" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 40, color: "var(--accent)", marginBottom: 12 }}>✓</div>
        <p style={{ fontWeight: 600, color: "var(--dark)" }}>Заявка принята</p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Свяжемся с вами в течение рабочего дня</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} noValidate>
      <input name="name" type="text" placeholder="Имя" required style={inp} />
      <input name="company" type="text" placeholder="Компания" style={inp} />
      <input
        type="tel" placeholder="+7 (___) ___-__-__"
        value={phone}
        onChange={e => setPhone(formatPhone(e.target.value))}
        style={inp}
      />
      <input name="email" type="email" placeholder="E-mail" style={inp} />
      <select name="direction" style={{ ...inp, color: "var(--muted)", cursor: "pointer", appearance: "none", gridColumn: "1 / -1" }}>
        <option value="">Направление - выберите</option>
        {directions.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
        <button type="submit" disabled={state === "loading"} style={{
          background: "var(--accent)", color: "#fff", border: "none",
          padding: "13px 32px", borderRadius: "var(--r)",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          transition: "var(--trans)", opacity: state === "loading" ? .6 : 1,
        }}>
          {state === "loading" ? "Отправка..." : "Отправить заявку →"}
        </button>
      </div>
      {state === "error" && (
        <p style={{ gridColumn: "1 / -1", color: "#c53030", fontSize: 12 }}>Ошибка отправки. Попробуйте ещё раз.</p>
      )}
      <p style={{ gridColumn: "1 / -1", fontSize: 11, color: "var(--muted)" }}>
        Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
      </p>
    </form>
  );
}
