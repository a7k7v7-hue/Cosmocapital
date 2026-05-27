import Header from "@/components/Header";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Стать партнёром — Космо Капитал",
  description: "Зарабатывайте на рекомендациях в коммерческой недвижимости. До 50% комиссии за каждую закрытую сделку.",
};

const steps = [
  {
    n: "01",
    title: "Передаёте нам контакт",
    text: "Звоните, пишете или заполняете форму ниже. Достаточно имени и телефона — детали уточним сами.",
    side: "left",
  },
  {
    n: "02",
    title: "Фиксируем партнёра за вами",
    text: "Клиент регистрируется в нашей базе с пометкой вашего имени. Ни один коллега не может перехватить — это правило компании.",
    side: "right",
  },
  {
    n: "03",
    title: "Ведём клиента без вашего участия",
    text: "Консультант RICS с 18-летним опытом берёт работу на себя: созвон, подбор объектов, показы, переговоры.",
    side: "left",
  },
  {
    n: "04",
    title: "Согласовываем условия сделки",
    text: "Как только выбран объект и стороны готовы — подписываем договор. Вас держим в курсе на ключевых этапах.",
    side: "right",
  },
  {
    n: "05",
    title: "Закрываем сделку",
    text: "Юридическое сопровождение, документы, ключи — всё под нашим контролем. Ваше присутствие не требуется.",
    side: "left",
  },
  {
    n: "06",
    title: "Выплачиваем вознаграждение",
    text: "В течение 5 рабочих дней после получения комиссии переводим вашу часть. Процент обсуждается индивидуально — до 50%.",
    side: "right",
  },
];

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 68, background: "var(--bg)" }}>

        {/* ── Hero ── */}
        <section style={{
          background: "var(--dark)",
          padding: "80px 40px 72px",
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 20 }}>
              Партнёрская программа
            </p>
            <h1 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, marginBottom: 24 }}>
              Знаете того, кто ищет<br />коммерческую недвижимость?
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.62)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 40px" }}>
              Один звонок с вашей стороны — и мы берём всё в свои руки. Вы получаете до 50% комиссии после закрытия сделки, не вникая в детали.
            </p>
            <a href="#partner-form" style={{
              display: "inline-block", background: "var(--accent)", color: "#fff",
              padding: "14px 36px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              letterSpacing: ".03em",
            }}>
              Передать контакт →
            </a>
          </div>
        </section>

        {/* ── Two partner types ── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Card 1 */}
            <div style={{
              background: "var(--dark)", borderRadius: 14, padding: "40px 36px",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>
                Рекомендация
              </span>
              <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 26, fontWeight: 400, color: "#fff", lineHeight: 1.25 }}>
                Есть знакомый с интересом к недвижимости
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.7 }}>
                Вы передаёте нам имя и номер телефона. Мы связываемся, изучаем запрос и подбираем подходящие варианты. После закрытия сделки — выплачиваем вам комиссионное вознаграждение.
              </p>
              <a href="#partner-form" style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                Оставить рекомендацию →
              </a>
            </div>

            {/* Card 2 */}
            <div style={{
              background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "40px 36px",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>
                Совместная сделка
              </span>
              <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 26, fontWeight: 400, color: "var(--dark)", lineHeight: 1.25 }}>
                Вы риэлтор или брокер с клиентом на руках
              </h2>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
                Вы приводите клиента, мы закрываем сделку своей экспертизой и базой объектов. Условия партнёрства — индивидуально, обычно 50/50. Официальное соглашение фиксирует каждую деталь.
              </p>
              <a href="#partner-form" style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                Обсудить партнёрство →
              </a>
            </div>
          </div>
        </section>

        {/* ── Why KK ── */}
        <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16 }}>
                Почему Космо Капитал
              </p>
              <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 36, fontWeight: 400, color: "var(--dark)", marginBottom: 24, lineHeight: 1.2 }}>
                18 лет на рынке коммерческой недвижимости Москвы
              </h2>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8, marginBottom: 16 }}>
                Консультант RICS — международная квалификация, которую имеют не более 200 специалистов в России. Для ваших клиентов это гарантия профессионализма и честности.
              </p>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8 }}>
                Офисы, склады, торговые помещения, земельные участки — мы специализируемся на коммерческом сегменте и не конкурируем с жилыми агентствами.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { n: "18+", label: "лет в сфере CRE" },
                { n: "RICS", label: "международная квалификация" },
                { n: "50%", label: "максимальная доля партнёра" },
                { n: "5 дн.", label: "выплата после закрытия" },
              ].map(({ n, label }) => (
                <div key={n} style={{ background: "var(--bg)", borderRadius: 10, padding: "24px 20px", border: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 36, fontWeight: 600, color: "var(--dark)", lineHeight: 1 }}>
                    {n}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Steps ── */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
              Как это работает
            </p>
            <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)" }}>
              6 шагов от контакта до выплаты
            </h2>
          </div>

          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: "50%", top: 0, bottom: 0,
              width: 1, background: "var(--border)", transform: "translateX(-50%)",
            }} />

            {steps.map((step) => (
              <div key={step.n} style={{
                display: "grid",
                gridTemplateColumns: step.side === "left" ? "1fr 48px 1fr" : "1fr 48px 1fr",
                gap: 0,
                marginBottom: 48,
                alignItems: "center",
              }}>
                {step.side === "left" ? (
                  <>
                    {/* Content left */}
                    <div style={{ textAlign: "right", paddingRight: 40 }}>
                      <div style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 22, fontWeight: 600, color: "var(--dark)", marginBottom: 8 }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7 }}>
                        {step.text}
                      </div>
                    </div>
                    {/* Circle */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "var(--dark)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, letterSpacing: ".05em",
                        flexShrink: 0, zIndex: 1,
                      }}>{step.n}</div>
                    </div>
                    {/* Empty right */}
                    <div />
                  </>
                ) : (
                  <>
                    {/* Empty left */}
                    <div />
                    {/* Circle */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "var(--accent)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, letterSpacing: ".05em",
                        flexShrink: 0, zIndex: 1,
                      }}>{step.n}</div>
                    </div>
                    {/* Content right */}
                    <div style={{ paddingLeft: 40 }}>
                      <div style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 22, fontWeight: 600, color: "var(--dark)", marginBottom: 8 }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7 }}>
                        {step.text}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA / Form ── */}
        <section id="partner-form" style={{ background: "var(--dark)", padding: "72px 40px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16 }}>
              Начать сотрудничество
            </p>
            <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 36, fontWeight: 400, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
              Оставьте контакт —<br />мы выйдем на связь сегодня
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 40, lineHeight: 1.7 }}>
              Или позвоните напрямую: <a href="tel:+79035374488" style={{ color: "var(--accent)", fontWeight: 600 }}>+7 (903) 537-44-88</a>
            </p>
            <div style={{ background: "var(--surface)", borderRadius: 14, padding: 32 }}>
              <LeadForm source="partners_page" />
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
