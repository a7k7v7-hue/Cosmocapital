const creds = ["✦ RICS", "✦ РОО", "✦ Опыт с 2001 г."];

export default function About() {
  return (
    <section id="about" style={{ background: "var(--surface2)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>
              О компании
            </p>
            <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)", marginBottom: 20 }}>
              Экспертиза, рождённая <em>рынком</em>
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.85, marginBottom: 16 }}>
              Компания «Космо Капитал» основана в 2006 году специалистами, стоявшими у истоков российского рынка консалтинга в коммерческой недвижимости. Опыт наших специалистов на рынке - с 2001 года.
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.85, marginBottom: 20 }}>
              Мы реализовывали масштабные проекты комплексного развития территорий, работали с промышленными зонами и коммерческими объектами любой сложности в Москве и МО.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {creds.map((c) => (
                <div key={c} style={{
                  border: "1px solid var(--border)", padding: "8px 14px", borderRadius: "var(--r)",
                  fontSize: 12, color: "var(--accent)", fontWeight: 600, background: "var(--surface)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>{c}</div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{
              width: "100%", aspectRatio: "4/3", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              <span style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 120, fontWeight: 600, color: "var(--border)", opacity: .5, userSelect: "none" }}>
                2006
              </span>
            </div>
            <div style={{
              position: "absolute", bottom: -8, right: -8,
              background: "var(--accent)", color: "#fff",
              padding: "14px 18px", borderRadius: 10, textAlign: "center",
            }}>
              <b style={{ display: "block", fontFamily: "var(--font-cormorant, serif)", fontSize: 28, lineHeight: 1 }}>19</b>
              <small style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500 }}>лет на рынке</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
