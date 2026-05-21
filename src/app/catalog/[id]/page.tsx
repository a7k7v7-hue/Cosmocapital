import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PhotoGallery from "@/components/PhotoGallery";
import LeadForm from "@/components/LeadForm";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/types/objects";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getObject(id: string) {
  try {
    return await prisma.object.findFirst({ where: { id, status: "ACTIVE" } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const obj = await getObject(id);
  if (!obj) return { title: "Объект не найден" };
  return {
    title: `${obj.title} - Космокапитал`,
    description: obj.description.slice(0, 160),
    openGraph: {
      title: obj.title,
      description: obj.description.slice(0, 160),
      images: obj.photos[0] ? [obj.photos[0]] : [],
    },
  };
}

export default async function ObjectPage({ params }: PageProps) {
  const { id } = await params;
  const obj = await getObject(id);
  if (!obj) notFound();

  const specs = [
    { label: "Тип сделки", value: TYPE_LABELS[obj.type] },
    { label: "Категория", value: CATEGORY_LABELS[obj.category] },
    { label: "Адрес", value: obj.address },
    obj.metro ? { label: "Метро", value: obj.metro } : null,
    { label: "Общая площадь", value: `${obj.areaTotal} м²` },
    obj.areaMin ? { label: "Минимальная секция", value: `${obj.areaMin} м²` } : null,
    obj.floor ? { label: "Этаж", value: `${obj.floor}${obj.floorsTotal ? ` из ${obj.floorsTotal}` : ""}` } : null,
    {
      label: obj.type === "RENT" ? "Стоимость аренды" : "Цена",
      value: `${new Intl.NumberFormat("ru-RU").format(obj.price)} ${obj.type === "RENT" ? "₽/мес" : "₽"}`,
    },
    obj.pricePerSqm
      ? { label: "Цена за м²", value: `${new Intl.NumberFormat("ru-RU").format(obj.pricePerSqm)} ₽` }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <a
          href="/catalog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Назад к каталогу
        </a>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="flex flex-col gap-6">
            <PhotoGallery photos={obj.photos} title={obj.title} />

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                  {TYPE_LABELS[obj.type]}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {CATEGORY_LABELS[obj.category]}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">{obj.title}</h1>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {obj.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Характеристики
              </h2>
              <dl className="grid sm:grid-cols-2 gap-3">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex flex-col">
                    <dt className="text-xs text-gray-400 uppercase tracking-wider">
                      {label}
                    </dt>
                    <dd className="text-sm font-medium text-gray-800 mt-0.5">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("ru-RU").format(obj.price)}{" "}
                  {obj.type === "RENT" ? "₽/мес" : "₽"}
                </div>
                {obj.pricePerSqm && (
                  <div className="text-sm text-gray-400 mt-0.5">
                    {new Intl.NumberFormat("ru-RU").format(obj.pricePerSqm)} ₽/м²
                  </div>
                )}
              </div>

              <LeadForm objectId={obj.id} source="object_page" />

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <a
                  href="tel:+78001234567"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  +7 (800) 123-45-67
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
