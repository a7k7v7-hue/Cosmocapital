import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [totalObjects, activeObjects, totalLeads, newLeads] = await Promise.all([
      prisma.object.count(),
      prisma.object.count({ where: { status: "ACTIVE" } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
    ]);
    return { totalObjects, activeObjects, totalLeads, newLeads };
  } catch {
    return { totalObjects: 0, activeObjects: 0, totalLeads: 0, newLeads: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Объектов всего", value: stats.totalObjects, sub: `${stats.activeObjects} активных`, href: "/admin/objects" },
    { label: "Заявок всего", value: stats.totalLeads, sub: `${stats.newLeads} новых`, href: "/admin/leads", highlight: stats.newLeads > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Обзор</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`bg-white rounded-2xl border p-5 hover:shadow-sm transition-shadow ${
              c.highlight ? "border-blue-200" : "border-gray-100"
            }`}
          >
            <div className={`text-3xl font-bold mb-1 ${c.highlight ? "text-blue-600" : "text-gray-900"}`}>
              {c.value}
            </div>
            <div className="text-sm font-medium text-gray-700">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </Link>
        ))}
      </div>
      <div className="flex gap-4">
        <Link
          href="/admin/objects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Добавить объект
        </Link>
        <Link
          href="/admin/leads"
          className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Смотреть заявки
        </Link>
      </div>
    </div>
  );
}
