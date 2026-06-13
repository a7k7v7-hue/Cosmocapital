"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEAL_TYPE_LABELS,
  SEGMENT_LABELS,
  DEFAULT_GCI,
  formatGci,
} from "@/lib/pipeline";
import ObjectSelector from "@/components/admin/pipeline/ObjectSelector";

interface DealFormProps {
  initialData?: {
    id: string;
    brokerName: string;
    segment: string;
    dealType: string;
    clientName: string;
    objectDescription: string;
    areaSqm: number | null;
    expectedGci: number;
    expectedCloseDate: string | null;
    lprContact: string | null;
    leadSource: string | null;
    nextActionDate: string | null;
    nextActionDesc: string | null;
    notes: string | null;
    objectId: string | null;
  };
  prefill?: {
    clientName?: string;
    lprContact?: string;
    leadSource?: string;
    leadId?: string;
    objectId?: string;
    objectDesc?: string;
    message?: string;
  };
  mode: "create" | "edit";
}

const SEGMENT_DEAL_TYPE_MAP: Record<string, string[]> = {
  LIGHT_INDUSTRIAL: ["LI_RENT", "LI_SALE_LAND"],
  BIG_BOX: ["BB_RENT", "BB_SALE_LAND", "BTS_SLB_MANDATE"],
  LAND: ["LI_SALE_LAND", "BB_SALE_LAND", "BTS_SLB_MANDATE"],
};

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

export default function DealForm({ initialData, prefill, mode }: DealFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [brokerName, setBrokerName] = useState(initialData?.brokerName ?? "");
  const [segment, setSegment] = useState(initialData?.segment ?? "BIG_BOX");
  const [dealType, setDealType] = useState(initialData?.dealType ?? "BB_RENT");
  const [clientName, setClientName] = useState(initialData?.clientName ?? prefill?.clientName ?? "");
  const [objectDescription, setObjectDescription] = useState(
    initialData?.objectDescription ?? prefill?.objectDesc ?? ""
  );
  const [areaSqm, setAreaSqm] = useState<string>(initialData?.areaSqm?.toString() ?? "");
  const [expectedGci, setExpectedGci] = useState<string>(
    initialData?.expectedGci?.toString() ?? DEFAULT_GCI["BB_RENT"].toString()
  );
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    toDateInputValue(initialData?.expectedCloseDate)
  );
  const [lprContact, setLprContact] = useState(initialData?.lprContact ?? prefill?.lprContact ?? "");
  const [leadSource, setLeadSource] = useState(initialData?.leadSource ?? prefill?.leadSource ?? "");
  const [nextActionDate, setNextActionDate] = useState(
    toDateInputValue(initialData?.nextActionDate)
  );
  const [nextActionDesc, setNextActionDesc] = useState(initialData?.nextActionDesc ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? prefill?.message ?? "");
  const [objectId, setObjectId] = useState<string | null>(
    initialData?.objectId ?? prefill?.objectId ?? null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableTypes = SEGMENT_DEAL_TYPE_MAP[segment] ?? Object.keys(DEAL_TYPE_LABELS);

  function handleSegmentChange(newSegment: string) {
    setSegment(newSegment);
    const types = SEGMENT_DEAL_TYPE_MAP[newSegment] ?? [];
    const newType = types.includes(dealType) ? dealType : types[0] ?? "BB_RENT";
    setDealType(newType);
    if (!initialData) {
      setExpectedGci(DEFAULT_GCI[newType]?.toString() ?? "");
    }
  }

  function handleDealTypeChange(newType: string) {
    setDealType(newType);
    if (!initialData) {
      setExpectedGci(DEFAULT_GCI[newType]?.toString() ?? "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      brokerName: brokerName.trim(),
      segment,
      dealType,
      clientName: clientName.trim(),
      objectDescription: objectDescription.trim(),
      areaSqm: areaSqm ? parseFloat(areaSqm) : null,
      expectedGci: parseFloat(expectedGci),
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : null,
      lprContact: lprContact.trim() || null,
      leadSource: leadSource.trim() || null,
      nextActionDate: nextActionDate ? new Date(nextActionDate).toISOString() : null,
      nextActionDesc: nextActionDesc.trim() || null,
      notes: notes.trim() || null,
      objectId: objectId || null,
    };

    try {
      const url = isEdit
        ? `/api/admin/pipeline/${initialData!.id}`
        : "/api/admin/pipeline";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message ?? `Ошибка ${res.status}`;
        setError(msg);
        return;
      }

      const deal = await res.json();

      if (prefill?.leadId) {
        await fetch(`/api/admin/leads/${prefill.leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "IN_WORK" }),
        });
      }

      router.push(`/admin/pipeline/${deal.id}`);
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  const gciNum = parseFloat(expectedGci) || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Section: Deal identity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Основная информация</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Клиент / Компания *">
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="ООО «Логистика Плюс»"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
          <Field label="Описание объекта / запроса *">
            <input
              required
              value={objectDescription}
              onChange={(e) => setObjectDescription(e.target.value)}
              placeholder="Склад класс А, аренда, Новорижское шоссе"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
          <Field label="Ответственный брокер *">
            <input
              required
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              placeholder="Иванов Иван"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
          <Field label="Контакт ЛПР">
            <input
              value={lprContact}
              onChange={(e) => setLprContact(e.target.value)}
              placeholder="Петров Андрей, +7 916 000-00-00, CFO"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
        </div>
      </div>

      {/* Section: Catalog object link */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Объект из каталога</h2>
        <Field label="Привязать объект (необязательно)">
          <ObjectSelector value={objectId} onChange={setObjectId} />
        </Field>
      </div>

      {/* Section: Segment & Type */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Сегмент и тип сделки</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Сегмент *">
            <select
              required
              value={segment}
              onChange={(e) => handleSegmentChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            >
              {Object.entries(SEGMENT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Тип сделки *">
            <select
              required
              value={dealType}
              onChange={(e) => handleDealTypeChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            >
              {availableTypes.map((t) => (
                <option key={t} value={t}>{DEAL_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="Площадь, кв. м">
            <input
              type="number"
              min="0"
              step="0.1"
              value={areaSqm}
              onChange={(e) => setAreaSqm(e.target.value)}
              placeholder="5000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
        </div>
      </div>

      {/* Section: Financials */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Финансы</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Ожидаемый GCI, ₽ *"
            hint={gciNum > 0 ? `≈ ${formatGci(gciNum)}` : undefined}
          >
            <input
              required
              type="number"
              min="1"
              value={expectedGci}
              onChange={(e) => setExpectedGci(e.target.value)}
              placeholder="4000000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
          <Field label="Ожидаемая дата закрытия">
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
        </div>
      </div>

      {/* Section: Next action */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Следующий шаг</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Дата следующего касания">
            <input
              type="date"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
          <Field label="Описание следующего шага">
            <input
              value={nextActionDesc}
              onChange={(e) => setNextActionDesc(e.target.value)}
              placeholder="Отправить подборку объектов"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field label="Источник лида">
            <input
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value)}
              placeholder="Входящий звонок, ЦИАН, рекомендация..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </Field>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Заметки</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Дополнительная информация по сделке..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          {saving ? "Сохранение..." : isEdit ? "Сохранить изменения" : "Создать сделку"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Отмена
        </button>
      </div>

    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {hint && <span className="ml-2 text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
