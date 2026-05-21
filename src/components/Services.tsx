import { prisma } from "@/lib/prisma";

const FALLBACK = [
  { id: "1", icon: "🏢", title: "Коммерческая недвижимость", description: "Покупка, продажа и управление офисными, торговыми и складскими объектами. Полное сопровождение сделки." },
  { id: "2", icon: "🏗️", title: "Инвестиции в девелопмент", description: "Участие в строительных проектах на стадии котлована. Повышенная доходность при профессиональном управлении рисками." },
  { id: "3", icon: "📊", title: "Управление активами", description: "Формирование и управление портфелем недвижимости. Оптимизация доходности и минимизация издержек." },
  { id: "4", icon: "⚖️", title: "Юридическое сопровождение", description: "Проверка объектов, структурирование сделок, защита интересов клиента на всех этапах." },
  { id: "5", icon: "💼", title: "Консалтинг", description: "Анализ рынка, оценка объектов, разработка инвестиционной стратегии под ваши цели." },
  { id: "6", icon: "🔑", title: "Аренда и субаренда", description: "Поиск арендаторов, управление арендными отношениями, максимизация загруженности объектов." },
];

async function getServices() {
  try {
    const rows = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return rows.length > 0 ? rows : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export default async function Services() {
  const services = await getServices();

  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-blue-600 text-sm font-medium tracking-widest uppercase mb-3">
            Услуги
          </p>
          <h2 className="text-4xl font-bold text-gray-900">Что мы делаем</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              {s.icon && <div className="text-3xl mb-4">{s.icon}</div>}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
