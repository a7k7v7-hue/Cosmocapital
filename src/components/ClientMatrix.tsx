"use client";

import { useState } from "react";

const tabs = [
  { key: "seller", label: "Продавцам / собственникам" },
  { key: "buyer", label: "Покупателю / инвесторам" },
  { key: "tenant", label: "Арендаторам" },
  { key: "dev", label: "Девелоперам" },
];

const matrixData: Record<string, string[]> = {
  seller: [
    "Подбор покупателя и представление интересов собственника",
    "Подбор арендатора и представление интересов собственника",
    "Технический и юридический аудит объекта",
    "Оценка рыночной стоимости (RICS / РОО)",
    "Разработка маркетинговой и PR-стратегии",
    "Управление объектом и стратегия активов",
  ],
  buyer: [
    "Подбор объекта и сравнительный анализ предложений",
    "Переговоры и представление интересов покупателя",
    "Технический и юридический аудит",
    "Оценка и привлечение финансирования",
    "Покупка готового арендного бизнеса (ГАБ)",
    "Стратегия инвестирования и управления активами",
  ],
  tenant: [
    "Подбор оптимального объекта, представление арендатора",
    "Формирование шортлиста и анализ конкурентных предложений",
    "Оптимизация расходов, пересогласование договоров",
    "Субаренда и возврат излишков площадей",
    "Консультирование по условиям договора аренды",
    "Управление проектами строительства и отделки",
  ],
  dev: [
    "Создание концепции проекта / Best Use анализ",
    "Стратегия реализации и управление продажами",
    "Комплексное развитие территорий и промзон",
    "Технический и юридический аудит, оценка",
    "Привлечение финансирования",
    "Бизнес-план и финансовый мониторинг",
  ],
};

export default function ClientMatrix() {
  const [active, setActive] = useState("seller");

  return (
    <section style={{ background: "var(--surface2)" }}>
      <div className="rg-section-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 40px" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>
          Что мы делаем
        </p>
        <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)", marginBottom: 28 }}>
          Полный спектр услуг
        </h2>

        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActive(tab.key)} style={{
              padding: "10px 20px", fontSize: 13, letterSpacing: ".02em",
              cursor: "pointer", border: "none", background: "transparent",
              fontWeight: 500, transition: "var(--trans)",
              color: active === tab.key ? "var(--accent)" : "var(--muted)",
              borderBottom: active === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1,
            }}>{tab.label}</button>
          ))}
        </div>

        <div className="rg-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {matrixData[active].map((text) => (
            <div key={text} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
              border: "1px solid var(--border)", borderRadius: "var(--r)", background: "var(--surface)",
              transition: "var(--trans)",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", background: "var(--surface2)",
                border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--accent)", fontSize: 12, flexShrink: 0, marginTop: 1,
              }}>✓</div>
              <div style={{ fontSize: "13.5px", color: "var(--text)", lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
