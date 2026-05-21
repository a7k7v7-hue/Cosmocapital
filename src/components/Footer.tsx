"use client";

const year = new Date().getFullYear();

const dirLinks = [
  "Офисная недвижимость",
  "Стрит-ритейл и ГАБ",
  "Склады / Производство",
  "Инвестиции",
  "Земельные участки",
];

const serviceLinks = [
  "Агентские услуги",
  "Оценка",
  "Консалтинг",
  "Управление",
  "Аудит",
];

export default function Footer() {
  return (
    <footer style={{ background: "#071540", color: "rgba(255,255,255,.55)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 40px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".1em", color: "#fff" }}>КОСМО КАПИТАЛ</div>
          <div style={{ fontSize: 12, marginTop: 3, opacity: .5 }}>Commercial Real Estate · Moscow</div>
          <p style={{ fontSize: 12, marginTop: 12, lineHeight: 1.7, maxWidth: 220 }}>
            Консультант по коммерческой недвижимости Москвы и МО с 2006 года. Члены RICS и РОО.
          </p>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: 14 }}>
            Направления
          </div>
          {dirLinks.map(l => (
            <a key={l} href="#directions" style={{ display: "block", fontSize: 13, marginBottom: 8, transition: "var(--trans)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.55)"}
            >{l}</a>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: 14 }}>
            Услуги
          </div>
          {serviceLinks.map(l => (
            <a key={l} href="#directions" style={{ display: "block", fontSize: 13, marginBottom: 8, transition: "var(--trans)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.55)"}
            >{l}</a>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: 14 }}>
            Контакты
          </div>
          <a href="#contacts" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Колодезный пер., д. 14, оф. 608</a>
          <a href="tel:+79035374488" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>+7 (903) 537-44-88</a>
          <a href="mailto:info@cosmocapital.ru" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>info@cosmocapital.ru</a>
        </div>
      </div>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,.07)", padding: "20px 40px",
        maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between",
        fontSize: 12, opacity: .4,
      }}>
        <span>© {year} Космо Капитал. Все права защищены.</span>
        <span>RICS · РОО</span>
      </div>
    </footer>
  );
}
