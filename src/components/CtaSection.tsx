export default function CtaSection() {
  return (
    <section style={{ background: "var(--dark)", padding: "80px 40px", textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 44, color: "#fff", fontWeight: 400, marginBottom: 16 }}>
          Новый уровень.<br />Тот же <em style={{ color: "var(--accent)" }}>рынок.</em>
        </h2>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: 16, marginBottom: 36 }}>
          Не агентство, а консультант с экспертизой RICS-уровня. Москва и Московская область - наша территория.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <a href="#contacts" style={{
            background: "var(--accent)", color: "#fff", padding: "13px 28px",
            borderRadius: "var(--r)", fontSize: 14, fontWeight: 600, letterSpacing: ".02em",
            display: "inline-block", transition: "var(--trans)",
          }}>Подобрать объект</a>
          <a href="#directions" style={{
            border: "1.5px solid rgba(255,255,255,.4)", color: "#fff", padding: "12px 26px",
            borderRadius: "var(--r)", fontSize: 14, fontWeight: 500,
            display: "inline-block", transition: "var(--trans)",
          }}>Направления работы</a>
        </div>
      </div>
    </section>
  );
}
