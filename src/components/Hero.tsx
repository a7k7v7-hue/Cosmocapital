"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const tabs = ["Все объекты", "Офисы", "Склады", "Ритейл", "Инвестиции", "Земля"];

export default function Hero() {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/catalog${params.toString() ? "?" + params.toString() : ""}`);
  }

  return (
    <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 68 }}>
      <div style={{ position: "absolute", inset: 0, background: "#0f1a2e" }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(135deg,transparent,transparent 60px,rgba(255,255,255,.025) 60px,rgba(255,255,255,.025) 120px)",
        backgroundSize: "170px 170px",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(10,16,28,.92) 45%,rgba(10,16,28,.5) 75%,rgba(10,16,28,.2))" }} />

      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "80px 40px", width: "100%" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 20 }}>
          Москва и Московская область · с 2006 года · RICS
        </p>
        <h1 style={{
          fontFamily: "var(--font-cormorant, serif)",
          fontSize: "clamp(52px,6vw,86px)", fontWeight: 400,
          color: "#fff", lineHeight: 1.05, marginBottom: 22,
        }}>
          Создаём<br />пространство для<br /><em style={{ color: "var(--accent)" }}>вашего роста</em>
        </h1>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: 16, lineHeight: 1.7, marginBottom: 44, maxWidth: 560 }}>
          Космо Капитал - консультант в сфере коммерческой недвижимости. Офисы, склады, торговые площади, инвестиционные объекты. Полный цикл услуг от поиска до управления.
        </p>

        <div style={{ maxWidth: 680 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)} style={{
                padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                background: activeTab === i ? "#fff" : "transparent",
                color: activeTab === i ? "var(--dark)" : "rgba(255,255,255,.5)",
                border: activeTab === i ? "1px solid #fff" : "1px solid rgba(255,255,255,.15)",
                fontWeight: activeTab === i ? 500 : 400,
                transition: "var(--trans)",
              }}>{tab}</button>
            ))}
          </div>
          <div style={{
            display: "flex", background: "rgba(255,255,255,.97)",
            borderRadius: "var(--r)", overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,.3)",
          }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Район, адрес или название объекта..."
              style={{
                flex: 1, padding: "16px 20px", fontSize: 15,
                border: "none", outline: "none", background: "transparent", color: "var(--dark)",
              }}
            />
            <button onClick={handleSearch} style={{
              padding: "14px 28px", background: "var(--accent)", color: "#fff",
              fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
              border: "none", cursor: "pointer", transition: "var(--trans)",
            }}>Найти объект</button>
          </div>
        </div>
      </div>
    </section>
  );
}
