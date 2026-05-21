import ContactForm from "@/components/ContactForm";

export default function Contacts() {
  return (
    <section id="contacts" style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 40px" }}>
      <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>
        Свяжитесь с нами
      </p>
      <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)", marginBottom: 32 }}>
        Оставьте <em>заявку</em>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 56, alignItems: "start" }}>
        <div>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8, marginBottom: 20 }}>
            Наш менеджер свяжется с вами и подберёт оптимальное решение под ваши задачи.
          </p>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 2.2 }}>
            <div><span style={{ color: "var(--accent)", fontWeight: 600 }}>Адрес:</span> Москва, Колодезный пер., д. 14, оф. 608</div>
            <div>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>Телефон:</span>{" "}
              <a href="tel:+79035374488" style={{ color: "var(--text)" }}>+7 (903) 537-44-88</a>
            </div>
            <div><span style={{ color: "var(--accent)", fontWeight: 600 }}>E-mail:</span> info@cosmocapital.ru</div>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
