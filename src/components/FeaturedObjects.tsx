import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ObjectCard from "@/components/ObjectCard";
import { ObjectListItem } from "@/types/objects";

async function getFeatured(): Promise<ObjectListItem[]> {
  try {
    const items = await prisma.object.findMany({
      where: { status: "ACTIVE", featured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, type: true, category: true, title: true,
        address: true, metro: true, areaTotal: true, areaMin: true,
        price: true, pricePerSqm: true, photos: true, featured: true,
      },
    });
    return items as ObjectListItem[];
  } catch {
    return [];
  }
}

export default async function FeaturedObjects() {
  const items = await getFeatured();

  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-medium tracking-widest uppercase mb-2">
              Актуальные предложения
            </p>
            <h2 className="text-4xl font-bold text-gray-900">Объекты в топе</h2>
          </div>
          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Смотреть все →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((obj) => (
            <ObjectCard key={obj.id} obj={obj} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium"
          >
            Смотреть все объекты →
          </Link>
        </div>
      </div>
    </section>
  );
}
