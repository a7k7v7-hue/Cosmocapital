import Link from "next/link";
import Image from "next/image";
import {
  ObjectListItem,
  TYPE_LABELS,
  CATEGORY_LABELS,
} from "@/types/objects";

function formatPrice(type: ObjectListItem["type"], price: number): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(price);
  return type === "RENT" ? `${formatted} ₽/мес` : `${formatted} ₽`;
}

function formatArea(total: number, min: number | null): string {
  if (min && min < total) return `от ${min} до ${total} м²`;
  return `${total} м²`;
}

export default function ObjectCard({ obj }: { obj: ObjectListItem }) {
  const photo = obj.photos[0] ?? null;

  return (
    <Link
      href={`/catalog/${obj.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative h-48 bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={obj.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-4xl">
            🏢
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {TYPE_LABELS[obj.type]}
          </span>
          <span className="bg-white/90 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {CATEGORY_LABELS[obj.category]}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {obj.title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span>📍</span>
          <span className="truncate">{obj.metro ?? obj.address}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(obj.type, obj.price)}
            </div>
            {obj.pricePerSqm && (
              <div className="text-xs text-gray-400">
                {new Intl.NumberFormat("ru-RU").format(obj.pricePerSqm)} ₽/м²
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {formatArea(obj.areaTotal, obj.areaMin)}
          </div>
        </div>
      </div>
    </Link>
  );
}
