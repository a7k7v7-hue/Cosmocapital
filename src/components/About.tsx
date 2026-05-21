const stats = [
  { value: "10+", label: "лет на рынке" },
  { value: "500+", label: "реализованных объектов" },
  { value: "3 млрд", label: "рублей под управлением" },
  { value: "98%", label: "клиентов возвращаются" },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-600 text-sm font-medium tracking-widest uppercase mb-3">
              О компании
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Надежный партнер в мире инвестиций
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Космокапитал - инвестиционная компания с фокусом на недвижимость и реальные активы.
              Мы помогаем клиентам сохранить и приумножить капитал через продуманные инвестиционные решения.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Наша команда объединяет специалистов с глубокой экспертизой в финансах, юриспруденции
              и управлении активами. Каждое решение принимается взвешенно, с учетом целей и возможностей клиента.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
