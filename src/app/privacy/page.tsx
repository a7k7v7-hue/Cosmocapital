import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Политика конфиденциальности - Космо Капитал",
  description: "Политика конфиденциальности и обработки персональных данных компании Космо Капитал.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 68, minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 40px 100px" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 12 }}>
            Документы
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)", marginBottom: 8 }}>
            Политика конфиденциальности
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 48 }}>
            Редакция от 1 января 2025 г.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 32, color: "var(--text)", lineHeight: 1.8, fontSize: 15 }}>
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>1. Общие положения</h2>
              <p>
                Настоящая Политика конфиденциальности (далее - Политика) определяет порядок обработки и защиты персональных данных
                пользователей сайта cosmacapital.ru, принадлежащего ООО «Космо Капитал» (далее - Оператор).
              </p>
              <p style={{ marginTop: 12 }}>
                Используя сайт и оставляя заявку, вы соглашаетесь с условиями настоящей Политики.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>2. Какие данные мы собираем</h2>
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <li>Имя и фамилия</li>
                <li>Номер телефона</li>
                <li>Адрес электронной почты (если указан)</li>
                <li>Сообщение или комментарий (если указан)</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                Данные собираются исключительно при добровольном заполнении формы обратной связи.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>3. Цели обработки данных</h2>
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <li>Обработка и ответ на входящие заявки</li>
                <li>Предоставление информации об объектах недвижимости</li>
                <li>Связь с клиентом по вопросам подбора объекта</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>4. Хранение и защита данных</h2>
              <p>
                Персональные данные хранятся в защищённой базе данных на серверах Render (США).
                Мы не передаём ваши данные третьим лицам без вашего согласия, за исключением случаев,
                предусмотренных законодательством Российской Федерации.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>5. Ваши права</h2>
              <p>
                Вы вправе в любой момент запросить удаление или корректировку своих персональных данных,
                направив письмо на{" "}
                <a href="mailto:info@cosmocapital.ru" style={{ color: "var(--accent)" }}>info@cosmocapital.ru</a>.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>6. Cookies</h2>
              <p>
                Сайт использует технические cookies, необходимые для авторизации и корректной работы сессии.
                Маркетинговые и аналитические cookies не применяются.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--dark)", marginBottom: 12 }}>7. Контакты</h2>
              <p>
                По вопросам, связанным с обработкой персональных данных, обращайтесь:<br />
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
