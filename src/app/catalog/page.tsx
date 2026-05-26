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
  const q = str(params.q);
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
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { metro: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
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
  title: "Каталог объектов",
  description: "Аренда и продажа коммерческой недвижимости в Москве и МО",
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";

  let data = { items: [] as ObjectListItem[], total: 0, page: 1, totalPages: 0 };
  try {
    data = await fetchObjects(params);
  } catch {
    // БД недоступна — показываем пустой каталог
  }

  const { items, total, page, totalPages } = data;

  return (
    <div style={{ paddingTop: 68, minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>
            Недвижимость
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)" }}>
            {q ? `Поиск: ${q}` : "Каталог объектов"}
          </h1>
          {total > 0 && (
            <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Найдено: {total} объектов</p>
          )}
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          <Suspense>
            <FilterPanel />
          </Suspense>

          <div style={{ flex: 1 }}>
            {items.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Объектов не найдено</h2>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
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
