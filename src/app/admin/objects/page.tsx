import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/types/objects";
import TeaserButton from "@/components/admin/TeaserButton";
import ObjectsFilter from "@/components/admin/ObjectsFilter";

interface PageProps {
  searchParams: Promise<{ type?: string; category?: string; status?: string; q?: string }>;
}

async function getData(filters: { type?: string; category?: string; status?: string; q?: string }) {
  try {
    const where: Record<string, unknown> = {};
    if (filters.type === "RENT" || filters.type === "SALE") where.type = filters.type;
    if (["OFFICE","RETAIL","WAREHOUSE","FREE_PURPOSE","PRODUCTION"].includes(filters.category ?? ""))
      where.category = filters.category;
    if (filters.status === "ACTIVE") where.status = "ACTIVE";
    else if (filters.status === "ARCHIVED") where.status = "ARCHIVED";
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: "insensitive" } },
        { address: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    const [objects, all] = await Promise.all([
      prisma.object.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        select: { id: true, title: true, type: true, category: true, price: true, status: true, featured: true, areaTotal: true },
      }),
      prisma.object.findMany({
        select: { type: true, category: true },
      }),
    ]);

    const catCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    for (const o of all) {
      catCounts[o.category] = (catCounts[o.category] ?? 0) + 1;
      typeCounts[o.type] = (typeCounts[o.type] ?? 0) + 1;
    }

    return { objects, counts: { category: catCounts, type: typeCounts, total: all.length } };
  } catch {
    return { objects: [], counts: { category: {}, type: {}, total: 0 } };
  }
}

export default async function AdminObjectsPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const { objects, counts } = await getData(filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Объекты
          <span className="ml-2 text-base font-normal text-gray-400">{objects.length}</span>
        </h1>
        <Link
          href="/admin/objects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Добавить
        </Link>
      </div>

      <Suspense>
        <ObjectsFilter counts={counts} />
      </Suspense>

      {objects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          Объектов не найдено
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Название</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Тип</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Категория</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Площадь</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Цена</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {objects.map((obj) => (
                <tr key={obj.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {obj.featured && <span className="mr-1.5">⭐</span>}
                    {obj.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[obj.type]}</td>
                  <td className="px-4 py-3 text-gray-600">{CATEGORY_LABELS[obj.category]}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{obj.areaTotal} м²</td>
                  <td className="px-4 py-3 text-right text-gray-800 font-medium">
                    {obj.price > 0 ? `${new Intl.NumberFormat("ru-RU").format(obj.price)} ₽` : "По запросу"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      obj.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {obj.status === "ACTIVE" ? "Активен" : "Архив"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/objects/${obj.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Изменить
                    </Link>
                    <TeaserButton objectId={obj.id} objectTitle={obj.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
