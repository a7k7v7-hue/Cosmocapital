const directions = [
  { num: "01", label: "Офисная недвижимость", sub: "Бизнес-центры классов A и B+ в Москве. Аренда и продажа.", accent: "var(--accent)", featured: false },
  { num: "02", label: "Стрит-ритейл и ГАБ", sub: "Торговые объекты с арендаторами. Готовый арендный бизнес.", accent: "var(--accent)", featured: true },
  { num: "03", label: "Склады и производство", sub: "Логистические комплексы класса A/B в Подмосковье.", accent: "#b8963e", featured: false },
  { num: "04", label: "Инвестиционные объекты", sub: "ГАБ, промышленные зоны, портфели активов.", accent: "var(--accent)", featured: false },
  { num: "05", label: "Оценка (RICS / РОО)", sub: "Рыночная оценка, для залога, оценка бизнеса.", accent: "#b8963e", featured: false },
  { num: "06", label: "Консалтинг и аналитика", sub: "Due diligence, best use, стратегии девелопмента.", accent: "var(--accent)", featured: false },
  { num: "07", label: "Управление недвижимостью", sub: "Property management, оптимизация, эксплуатация.", accent: "var(--accent)", featured: false },
  { num: "08", label: "Земельные участки", sub: "Промышленные, коммерческие, под застройку в МО.", accent: "#b8963e", featured: false },
];

export default function Directions() {
  return (
    <section id="directions" className="rg-section-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>
            Направления работы
          </p>
          <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)" }}>
            8 направлений экспертизы
          </h2>
        </div>
        <a href="/catalog" style={{
          background: "var(--accent)", color: "#fff", padding: "10px 22px",
          borderRadius: "var(--r)", fontSize: 13, fontWeight: 600, letterSpacing: ".02em",
          display: "inline-block",
        }}>Все направления →</a>
      </div>

      <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {directions.map((d) => (
          <div key={d.num} style={{
            background: d.featured ? "var(--accent)" : "var(--surface)",
            border: `1px solid ${d.featured ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 12, padding: "28px 24px", cursor: "pointer",
            position: "relative", overflow: "hidden", transition: "var(--trans)",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {!d.featured && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: d.accent }} />
            )}
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: d.featured ? "rgba(255,255,255,.7)" : "var(--accent)", textTransform: "uppercase" }}>
              {d.num}
            </div>
            <div style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 22, fontWeight: 400, color: d.featured ? "#fff" : "var(--dark)", lineHeight: 1.2 }}>
              {d.label}
            </div>
            <div style={{ fontSize: 13, color: d.featured ? "rgba(255,255,255,.7)" : "var(--muted)", lineHeight: 1.5 }}>
              {d.sub}
            </div>
            <div style={{ fontSize: 18, marginTop: "auto", color: d.featured ? "#fff" : "var(--accent)", paddingTop: 8 }}>→</div>
          </div>
        ))}
      </div>
    </section>
  );
}
