export default function Hero() {
  return (
    <section className="pt-32 pb-24 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-4">
            Агентство коммерческой недвижимости
          </p>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Cosmocapital
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed mb-10">
            Аренда и продажа коммерческой недвижимости в Москве.
            Офисы, торговые площади, склады - полное сопровождение сделки.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/catalog"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Смотреть объекты
            </a>
            <a
              href="#contacts"
              className="inline-flex items-center justify-center border border-white/30 hover:border-white/60 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Оставить заявку
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
