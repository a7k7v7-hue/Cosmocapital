import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import ObjectCard from "@/components/ObjectCard";
import FilterPanel from "@/components/FilterPanel";
import Pagination from "@/components/Pagination";
import { ObjectListItem } from "@/types/objects";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

async function fetchObjects(params: Record<string, string | string[] | undefined>) {
  const type = str(params.type) as "RENT" | "SALE" | "";
  const category = str(params.category) as
    | "OFFICE" | "RETAIL" | "WAREHOUSE" | "FREE_PURPOSE" | "PRODUCTION" | "";
  const metro = str(params.metro);
  const areaMin = Number(str(params.areaMin)) || undefined;
  const areaMax = Number(str(params.areaMax)) || undefined;
  const priceMin = Number(str(params.priceMin)) || undefined;
  const priceMax = Number(str(params.priceMax)) || undefined;
  const page = Math.max(1, Number(str(params.page)) || 1);
  const limit = 12;

  const where: Prisma.ObjectWhereInput = {
    status: "ACTIVE",
    ...(type && { type }),
    ...(category && { category }),
    ...(metro && { metro: { contains: metro, mode: "insensitive" } }),
    ...(areaMin !== undefined || areaMax !== undefined
      ? { areaTotal: { gte: areaMin, lte: areaMax } }
      : {}),
    ...(priceMin !== undefined || priceMax !== undefined
      ? { price: { gte: priceMin, lte: priceMax } }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.object.count({ where }),
    prisma.object.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, type: true, category: true, title: true,
        address: true, metro: true, areaTotal: true, areaMin: true,
        price: true, pricePerSqm: true, photos: true, featured: true,
      },
    }),
  ]);

  return { items: items as ObjectListItem[], total, page, totalPages: Math.ceil(total / limit) };
}

export const metadata = {
  title: "Каталог объектов - Космокапитал",
  description: "Аренда и продажа коммерческой недвижимости",
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let data = { items: [] as ObjectListItem[], total: 0, page: 1, totalPages: 0 };
  try {
    data = await fetchObjects(params);
  } catch {
    // БД недоступна — показываем пустой каталог
  }

  const { items, total, page, totalPages } = data;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Каталог объектов</h1>
          {total > 0 && (
            <p className="text-gray-500 mt-1">Найдено: {total} объектов</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <Suspense>
            <FilterPanel />
          </Suspense>

          <div className="flex-1">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Объектов не найдено
                </h2>
                <p className="text-gray-400">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((obj) => (
                    <ObjectCard key={obj.id} obj={obj} />
                  ))}
                </div>
                <Suspense>
                  <Pagination page={page} totalPages={totalPages} />
                </Suspense>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
