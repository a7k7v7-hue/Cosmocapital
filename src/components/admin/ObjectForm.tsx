"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, TYPE_LABELS } from "@/types/objects";
import PhotoUpload from "@/components/admin/PhotoUpload";
import TeaserButton from "@/components/admin/TeaserButton";

type ObjectStatus = "ACTIVE" | "ARCHIVED";
type ObjType = "RENT" | "SALE";
type ObjCategory = "OFFICE" | "RETAIL" | "WAREHOUSE" | "FREE_PURPOSE" | "PRODUCTION" | "LAND" | "READY_BUSINESS";

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
  landCategory: string | null;
  landVri: string | null;
  cadastralNumber: string | null;
}

interface ObjectFormProps {
  initialData?: InitialData;
}

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors bg-white";

export default function ObjectForm({ initialData }: ObjectFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos ?? []);
  const [category, setCategory] = useState<ObjCategory>(initialData?.category ?? "OFFICE");

  const isLand = category === "LAND";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      type: fd.get("type"),
      category: fd.get("category"),
      title: fd.get("title"),
      description: fd.get("description"),
      address: fd.get("address"),
      metro: fd.get("metro") || null,
      areaTotal: fd.get("areaTotal"),
      areaMin: isLand ? null : (fd.get("areaMin") || null),
      floor: isLand ? null : (fd.get("floor") || null),
      floorsTotal: isLand ? null : (fd.get("floorsTotal") || null),
      price: fd.get("price"),
      pricePerSqm: isLand ? null : (fd.get("pricePerSqm") || null),
      status: fd.get("status"),
      featured: fd.get("featured") === "on",
      photos,
      landCategory: isLand ? (fd.get("landCategory") || null) : null,
      landVri: isLand ? (fd.get("landVri") || null) : null,
      cadastralNumber: isLand ? (fd.get("cadastralNumber") || null) : null,
    };

    const url = isEdit ? `/api/admin/objects/${initialData.id}` : "/api/admin/objects";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Section 1: Тип и категория */}
      <Section title="Классификация">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Тип сделки *">
            <select name="type" defaultValue={d?.type ?? "RENT"} required className={INPUT}>
              {(Object.keys(TYPE_LABELS) as ObjType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="Категория *">
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ObjCategory)}
              required
              className={INPUT}
            >
              {(Object.keys(CATEGORY_LABELS) as ObjCategory[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Section 2: Описание */}
      <Section title="Описание объекта">
        <Field label="Название *">
          <input name="title" type="text" required defaultValue={d?.title}
            placeholder={isLand ? "Участок 5 га, Новорижское шоссе" : "Склад класса А, Новорижское шоссе"}
            className={INPUT} />
        </Field>
        <Field label="Описание *">
          <textarea name="description" rows={4} required defaultValue={d?.description}
            placeholder="Подробное описание объекта, особенности, инфраструктура..."
            className={INPUT + " resize-none"} />
        </Field>
      </Section>

      {/* Section 3: Расположение */}
      <Section title="Расположение">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Адрес *">
            <input name="address" type="text" required defaultValue={d?.address}
              placeholder="Москва, Новорижское ш., 22 км"
              className={INPUT} />
          </Field>
          <Field label="Метро">
            <input name="metro" type="text" defaultValue={d?.metro ?? ""}
              placeholder="Тверская, Белорусская"
              className={INPUT} />
          </Field>
        </div>
      </Section>

      {/* Section 4: Параметры участка (только для LAND) */}
      {isLand && (
        <Section title="Параметры участка">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Категория земли">
              <input name="landCategory" type="text" defaultValue={d?.landCategory ?? ""}
                placeholder="Земли промышленности"
                className={INPUT} />
            </Field>
            <Field label="Кадастровый номер">
              <input name="cadastralNumber" type="text" defaultValue={d?.cadastralNumber ?? ""}
                placeholder="50:20:0010101:123"
                className={INPUT} />
            </Field>
          </div>
          <Field label="ВРИ (вид разрешённого использования)">
            <input name="landVri" type="text" defaultValue={d?.landVri ?? ""}
              placeholder="Для размещения производственных и административных зданий"
              className={INPUT} />
          </Field>
        </Section>
      )}

      {/* Section 5: Площадь и этажность */}
      <Section title={isLand ? "Площадь" : "Площадь и этажность"}>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label={isLand ? "Площадь, га *" : "Общая площадь, м² *"}>
            <input name="areaTotal" type="number" required step="0.01" min="0.01"
              defaultValue={d?.areaTotal} className={INPUT} />
          </Field>
          {!isLand && (
            <>
              <Field label="Мин. секция, м²">
                <input name="areaMin" type="number" step="0.1" defaultValue={d?.areaMin ?? ""}
                  placeholder="От" className={INPUT} />
              </Field>
              <Field label="Этаж / Всего этажей">
                <div className="flex gap-2">
                  <input name="floor" type="number" defaultValue={d?.floor ?? ""} placeholder="3"
                    className={INPUT} />
                  <input name="floorsTotal" type="number" defaultValue={d?.floorsTotal ?? ""} placeholder="9"
                    className={INPUT} />
                </div>
              </Field>
            </>
          )}
        </div>
      </Section>

      {/* Section 6: Стоимость */}
      <Section title="Стоимость">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Цена, ₽ (0 = по запросу) *">
            <input name="price" type="number" required min="0" defaultValue={d?.price ?? 0}
              className={INPUT} />
          </Field>
          {!isLand && (
            <Field label="Цена за м², ₽">
              <input name="pricePerSqm" type="number" defaultValue={d?.pricePerSqm ?? ""}
                placeholder="Заполнится авто" className={INPUT} />
            </Field>
          )}
        </div>
      </Section>

      {/* Section 7: Фотографии */}
      <Section title="Фотографии">
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </Section>

      {/* Section 8: Публикация */}
      <Section title="Публикация">
        <div className="flex items-center gap-6 flex-wrap">
          <Field label="Статус">
            <select name="status" defaultValue={d?.status ?? "ACTIVE"} className={INPUT + " w-40"}>
              <option value="ACTIVE">Активен</option>
              <option value="ARCHIVED">Архив</option>
            </select>
          </Field>
          <label className="flex items-center gap-2.5 cursor-pointer pt-5">
            <input name="featured" type="checkbox" defaultChecked={d?.featured}
              className="w-4 h-4 rounded border-gray-300 accent-blue-600" />
            <span className="text-sm text-gray-700">Показывать в топе каталога</span>
          </label>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap items-center pt-1">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          {saving ? "Сохранение..." : isEdit ? "Сохранить изменения" : "Создать объект"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-200 hover:border-gray-300 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Отмена
        </button>
        {isEdit && initialData && (
          <span className="ml-auto">
            <TeaserButton
              objectId={initialData.id}
              objectTitle={initialData.title}
              type={initialData.type}
              category={initialData.category}
              address={initialData.address}
              metro={initialData.metro}
              areaTotal={initialData.areaTotal}
              areaMin={initialData.areaMin}
              floor={initialData.floor}
              floorsTotal={initialData.floorsTotal}
              description={initialData.description}
            />
          </span>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
