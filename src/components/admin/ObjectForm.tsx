"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, TYPE_LABELS } from "@/types/objects";

type ObjectStatus = "ACTIVE" | "ARCHIVED";
type ObjType = "RENT" | "SALE";
type ObjCategory = "OFFICE" | "RETAIL" | "WAREHOUSE" | "FREE_PURPOSE" | "PRODUCTION";

interface InitialData {
  id: string;
  type: ObjType;
  category: ObjCategory;
  title: string;
  description: string;
  address: string;
  metro: string | null;
  areaTotal: number;
  areaMin: number | null;
  floor: number | null;
  floorsTotal: number | null;
  price: number;
  pricePerSqm: number | null;
  photos: string[];
  status: ObjectStatus;
  featured: boolean;
}

interface ObjectFormProps {
  initialData?: InitialData;
}

export default function ObjectForm({ initialData }: ObjectFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      type: fd.get("type"),
      category: fd.get("category"),
      title: fd.get("title"),
      description: fd.get("description"),
      address: fd.get("address"),
      metro: fd.get("metro") || null,
      areaTotal: fd.get("areaTotal"),
      areaMin: fd.get("areaMin") || null,
      floor: fd.get("floor") || null,
      floorsTotal: fd.get("floorsTotal") || null,
      price: fd.get("price"),
      pricePerSqm: fd.get("pricePerSqm") || null,
      status: fd.get("status"),
      featured: fd.get("featured") === "on",
      photos: initialData?.photos ?? [],
    };

    const url = isEdit
      ? `/api/admin/objects/${initialData.id}`
      : "/api/admin/objects";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/admin/objects");
      router.refresh();
    } else {
      setError("Ошибка сохранения. Проверьте данные.");
    }
  }

  const d = initialData;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Тип сделки</span>
          <select name="type" defaultValue={d?.type ?? "RENT"} required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
            {(Object.keys(TYPE_LABELS) as ObjType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Категория</span>
          <select name="category" defaultValue={d?.category ?? "OFFICE"} required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
            {(Object.keys(CATEGORY_LABELS) as ObjCategory[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 font-medium">Название</span>
        <input name="title" type="text" required defaultValue={d?.title}
          placeholder="Офис класса A в деловом центре"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 font-medium">Описание</span>
        <textarea name="description" rows={4} required defaultValue={d?.description}
          placeholder="Подробное описание объекта..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 font-medium">Адрес</span>
        <input name="address" type="text" required defaultValue={d?.address}
          placeholder="Москва, ул. Примерная, 1"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 font-medium">Метро (опционально)</span>
        <input name="metro" type="text" defaultValue={d?.metro ?? ""}
          placeholder="Тверская"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Площадь, м²</span>
          <input name="areaTotal" type="number" required step="0.1" defaultValue={d?.areaTotal}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Мин. секция, м²</span>
          <input name="areaMin" type="number" step="0.1" defaultValue={d?.areaMin ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Этаж / Всего</span>
          <div className="flex gap-1">
            <input name="floor" type="number" defaultValue={d?.floor ?? ""} placeholder="3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <input name="floorsTotal" type="number" defaultValue={d?.floorsTotal ?? ""} placeholder="9"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Цена, ₽</span>
          <input name="price" type="number" required defaultValue={d?.price}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Цена за м², ₽</span>
          <input name="pricePerSqm" type="number" defaultValue={d?.pricePerSqm ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </label>
      </div>

      <div className="flex gap-6 items-center">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Статус</span>
          <select name="status" defaultValue={d?.status ?? "ACTIVE"}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="ACTIVE">Активен</option>
            <option value="ARCHIVED">Архив</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pt-5 cursor-pointer">
          <input name="featured" type="checkbox" defaultChecked={d?.featured}
            className="w-4 h-4 rounded border-gray-300 text-blue-600" />
          <span className="text-sm text-gray-700">Показывать в топе</span>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
          {saving ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-gray-200 hover:border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Отмена
        </button>
      </div>
    </form>
  );
}
