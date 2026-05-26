import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Пользовательское соглашение - Космо Капитал",
  description: "Условия использования сайта cosmacapital.ru компании Космо Капитал.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 68, minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 40px 100px" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 12 }}>
            Документы
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)", marginBottom: 8 }}>
            Пользовательское соглашение
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 48 }}>
            Редакция от 1 января 2025 г.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 32, color: "var(--text)", lineHeight: 1.8, fontSize: 15 }}>
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>1. Предмет соглашения</h2>
              <p>
                Настоящее Пользовательское соглашение регулирует условия использования сайта cosmacapital.ru
                (далее - Сайт), принадлежащего ООО «Космо Капитал». Использование Сайта означает полное
                и безоговорочное принятие данного соглашения.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>2. Использование сайта</h2>
              <p>Пользователь обязуется:</p>
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                <li>Предоставлять достоверные данные при заполнении форм</li>
                <li>Не использовать Сайт в незаконных целях</li>
                <li>Не предпринимать действий, нарушающих работу Сайта или нарушающих права других пользователей</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>3. Информация на сайте</h2>
              <p>
                Все сведения об объектах недвижимости, ценах и условиях носят информационный характер и не являются
                публичной офертой. Актуальность данных подтверждается у менеджера при обращении.
                ООО «Космо Капитал» не несёт ответственности за изменение условий по объектам без предварительного уведомления.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>4. Интеллектуальная собственность</h2>
              <p>
                Все материалы Сайта (тексты, изображения, логотип, дизайн) являются собственностью ООО «Космо Капитал»
                и защищены законодательством об авторском праве. Копирование и использование материалов без письменного
                разрешения не допускается.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>5. Ограничение ответственности</h2>
              <p>
                ООО «Космо Капитал» не гарантирует непрерывную работу Сайта и не несёт ответственности за
                убытки, возникшие в результате технических сбоев, действий третьих лиц или форс-мажорных обстоятельств.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>6. Изменение соглашения</h2>
              <p>
                ООО «Космо Капитал» вправе в одностороннем порядке изменять настоящее соглашение.
                Актуальная версия всегда доступна по адресу cosmacapital.ru/terms.
                Продолжение использования Сайта после изменений означает согласие с новой редакцией.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>7. Применимое право</h2>
              <p>
                Настоящее соглашение регулируется законодательством Российской Федерации.
                Все споры разрешаются в суде по месту нахождения ООО «Космо Капитал».
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>8. Контакты</h2>
              <p>
                <a href="mailto:info@cosmocapital.ru" style={{ color: "var(--accent)" }}>info@cosmocapital.ru</a><br />
                +7 (903) 537-44-88<br />
                Москва, Колодезный пер., д. 14, оф. 608
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
