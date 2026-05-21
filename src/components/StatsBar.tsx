const stats = [
  { value: "2006", label: "Год основания" },
  { value: "100+", label: "Объектов в каталоге" },
  { value: "RICS", label: "Международная сертификация" },
  { value: "8", label: "Направлений работы" },
  { value: "A–C", label: "Классы объектов" },
];

export default function StatsBar() {
  return (
    <div style={{ background: "var(--dark)", display: "flex", justifyContent: "center" }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          flex: 1, maxWidth: 220, padding: "28px 20px", textAlign: "center",
          borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none",
        }}>
          <span style={{ display: "block", fontFamily: "var(--font-cormorant, serif)", fontSize: 38, color: "#fff", lineHeight: 1, fontWeight: 600 }}>
            {s.value}
          </span>
          <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.45)", letterSpacing: ".05em", marginTop: 4, textTransform: "uppercase" }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
