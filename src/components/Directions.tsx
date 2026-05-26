"use client";

const directions = [
  {
    num: "01", label: "Офисная недвижимость",
    sub: "Бизнес-центры классов A и B+ в Москве. Аренда и продажа.",
    href: "/catalog?category=OFFICE",
    bg: "linear-gradient(135deg, #0e2a5e 0%, #1e4a8e 100%)",
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="6" y="6" width="36" height="36" rx="3" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/><rect x="11" y="13" width="7" height="5" rx="1" fill="rgba(255,255,255,0.5)"/><rect x="20" y="13" width="7" height="5" rx="1" fill="rgba(255,255,255,0.5)"/><rect x="29" y="13" width="7" height="5" rx="1" fill="rgba(255,255,255,0.5)"/><rect x="11" y="21" width="7" height="5" rx="1" fill="rgba(255,255,255,0.45)"/><rect x="20" y="21" width="7" height="5" rx="1" fill="rgba(255,255,255,0.45)"/><rect x="29" y="21" width="7" height="5" rx="1" fill="rgba(255,255,255,0.45)"/><rect x="18" y="30" width="11" height="12" rx="1" fill="rgba(255,255,255,0.55)"/></svg>`,
  },
  {
    num: "02", label: "Стрит-ритейл и ГАБ",
    sub: "Торговые объекты с арендаторами. Готовый арендный бизнес.",
    href: "/catalog?category=RETAIL",
    bg: "linear-gradient(135deg, #4a1942 0%, #7e3671 100%)",
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M8 20L12 8H36L40 20" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linejoin="round"/><rect x="8" y="20" width="32" height="20" rx="2" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/><rect x="18" y="28" width="12" height="12" rx="1" fill="rgba(255,255,255,0.5)"/><circle cx="18" cy="20" r="3.5" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/><circle cx="30" cy="20" r="3.5" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/></svg>`,
  },
  {
    num: "03", label: "Склады и производство",
    sub: "Логистические комплексы класса A/B в Подмосковье.",
    href: "/catalog?category=WAREHOUSE",
    bg: "linear-gradient(135deg, #1a3a1a 0%, #2e6b2e 100%)",
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M4 26L24 12L44 26V44H4V26Z" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linejoin="round"/><rect x="16" y="30" width="16" height="14" rx="1" fill="rgba(255,255,255,0.4)"/><rect x="7" y="32" width="6" height="7" rx="1" fill="rgba(255,255,255,0.4)"/><rect x="35" y="32" width="6" height="7" rx="1" fill="rgba(255,255,255,0.4)"/></svg>`,
  },
  {
    num: "04", label: "Инвестиционные объекты",
    sub: "ГАБ, промышленные зоны, портфели активов.",
    href: "/catalog",
    bg: "linear-gradient(135deg, #3a2a00 0%, #7a5a00 100%)",
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/><path d="M24 14v4M24 30v4M17 24h14" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/><path d="M19 18l10 12M29 18L19 30" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    num: "05", label: "Оценка (RICS / РОО)",
    sub: "Рыночная оценка, для залога, оценка бизнеса.",
    href: "/",
    bg: "linear-gradient(135deg, #003a3a 0%, #006a5e 100%)",
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="3" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/><path d="M14 32l7-8 6 5 8-12" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14" cy="32" r="2" fill="rgba(255,255,255,0.5)"/><circle cx="35" cy="17" r="2" fill="rgba(255,255,255,0.5)"/></svg>`,
  },
  {
    num: "06", label: "Консалтинг и аналитика",
    sub: "Due diligence, best use, стратегии девелопмента.",
    href: "/",
    bg: "linear-gradient(135deg, #1a0e4a 0%, #3a2a8e 100%)",
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="12" width="32" height="24" rx="3" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/><path d="M14 20h20M14 26h14" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/><circle cx="36" cy="36" r="7" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/><path d="M38.5 38.5L41 41" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    num: "07", label: "Управление недвижимостью",
    sub: "Property management, оптимизация, эксплуатация.",
    href: "/",
    bg: "linear-gradient(135deg, #0a2a1a 0%, #1a5a32 100%)",
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="10" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/><circle cx="24" cy="24" r="3" fill="rgba(255,255,255,0.5)"/><path d="M24 8v5M24 35v5M8 24h5M35 24h5M12.7 12.7l3.5 3.5M31.8 31.8l3.5 3.5M35.3 12.7l-3.5 3.5M16.2 31.8l-3.5 3.5" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    num: "08", label: "Земельные участки",
    sub: "Промышленные, коммерческие, под застройку в МО.",
    href: "/catalog",
    bg: "linear-gradient(135deg, #2a1a0a 0%, #5e3a14 100%)",
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M6 36L16 20L26 28L36 14L42 36H6Z" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linejoin="round" fill="rgba(255,255,255,0.08)"/><path d="M6 40h36" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/><circle cx="36" cy="14" r="3" fill="rgba(255,255,255,0.5)"/></svg>`,
  },
];

export default function Directions() {
  return (
    <section id="directions" style={{ background: "var(--surface2)", padding: "80px 0" }}>
      <div className="rg-section-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>
              Направления работы
            </p>
            <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)" }}>
              8 направлений экспертизы
            </h2>
          </div>
          <a href="/catalog" style={{
            background: "var(--dark)", color: "#fff", padding: "10px 22px",
            borderRadius: "var(--r)", fontSize: 13, fontWeight: 600, letterSpacing: ".02em",
          }}>Каталог объектов →</a>
        </div>

        <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {directions.map((d) => (
            <a key={d.num} href={d.href} style={{
              display: "flex", flexDirection: "column",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, overflow: "hidden", textDecoration: "none", color: "inherit",
              transition: "var(--trans)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(14,42,94,.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "none";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}>
              {/* Image area */}
              <div style={{
                height: 120, background: d.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                {/* Subtle grid pattern */}
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.08,
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,1) 20px, rgba(255,255,255,1) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,1) 20px, rgba(255,255,255,1) 21px)",
                }} />
                <div dangerouslySetInnerHTML={{ __html: d.icon }} />
                <div style={{
                  position: "absolute", top: 10, left: 12,
                  fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: ".15em",
                }}>{d.num}</div>
              </div>

              {/* Text area */}
              <div style={{ padding: "18px 20px 20px" }}>
                <div style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 18, fontWeight: 400, color: "var(--dark)", marginBottom: 6, lineHeight: 1.25 }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55 }}>
                  {d.sub}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
