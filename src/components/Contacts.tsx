import LeadForm from "@/components/LeadForm";

export default function Contacts() {
  return (
    <section id="contacts" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-blue-600 text-sm font-medium tracking-widest uppercase mb-3">
              Контакты
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Обсудим ваш проект
            </h2>
            <p className="text-gray-600 leading-relaxed mb-10">
              Оставьте заявку и наш специалист свяжется с вами в течение одного рабочего дня.
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Телефон</div>
                <a href="tel:+78001234567" className="text-gray-800 hover:text-blue-600 transition-colors">
                  +7 (800) 123-45-67
                </a>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</div>
                <a href="mailto:info@cosmacapital.ru" className="text-gray-800 hover:text-blue-600 transition-colors">
                  info@cosmacapital.ru
                </a>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Адрес</div>
                <span className="text-gray-800">г. Москва</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <LeadForm source="homepage" />
          </div>
        </div>
      </div>
    </section>
  );
}
