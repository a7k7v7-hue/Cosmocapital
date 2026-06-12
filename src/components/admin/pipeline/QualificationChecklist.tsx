"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface QualData {
  location: string;
  objectClass: string;
  ceilingHeight: string;
  floorLoad: string;
  dockEquipment: string;
  power: string;
  temperatureMode: string;
  moveInDate: string;
  budget: string;
  financingSource: string;
  decisionStage: string;
  competingBrokers: string;
}

const EMPTY: QualData = {
  location: "",
  objectClass: "",
  ceilingHeight: "",
  floorLoad: "",
  dockEquipment: "",
  power: "",
  temperatureMode: "",
  moveInDate: "",
  budget: "",
  financingSource: "",
  decisionStage: "",
  competingBrokers: "",
};

const FIELDS: {
  key: keyof QualData;
  label: string;
  placeholder: string;
  type?: "select" | "text";
  options?: string[];
}[] = [
  {
    key: "location",
    label: "Локация / направление",
    placeholder: "Новорижское, Киевское ш., МО",
  },
  {
    key: "objectClass",
    label: "Класс объекта",
    type: "select",
    placeholder: "",
    options: ["", "A", "A+", "B", "B+", "C"],
  },
  {
    key: "ceilingHeight",
    label: "Высота потолков, м",
    placeholder: "12",
  },
  {
    key: "floorLoad",
    label: "Нагрузка на пол, т/кв.м",
    placeholder: "5",
  },
  {
    key: "dockEquipment",
    label: "Доковое оборудование",
    placeholder: "4 дока + 1 ворота",
  },
  {
    key: "power",
    label: "Мощности, кВА",
    placeholder: "400",
  },
  {
    key: "temperatureMode",
    label: "Температурный режим",
    type: "select",
    placeholder: "",
    options: ["", "Сухой (15–25°C)", "Холодный (+5–15°C)", "Морозильный (до -18°C)", "Производственный"],
  },
  {
    key: "moveInDate",
    label: "Срок въезда",
    placeholder: "Q3 2026 / до 01.09.2026",
  },
  {
    key: "budget",
    label: "Бюджет",
    placeholder: "3 900 ₽/кв.м/год или 20 млн ₽",
  },
  {
    key: "financingSource",
    label: "Источник финансирования",
    type: "select",
    placeholder: "",
    options: ["", "Собственные средства", "Кредит", "Промышленная ипотека", "Лизинг"],
  },
  {
    key: "decisionStage",
    label: "Стадия принятия решения",
    placeholder: "Собирает предложения / выбирает из 3 вариантов",
  },
  {
    key: "competingBrokers",
    label: "Конкурирующие брокеры",
    placeholder: "Нет / CBRE, JLL",
  },
];

const COMPLETION_WEIGHTS: (keyof QualData)[] = [
  "location",
  "objectClass",
  "budget",
  "financingSource",
  "moveInDate",
  "decisionStage",
];

function calcCompletion(data: QualData): number {
  const filled = COMPLETION_WEIGHTS.filter((k) => data[k]?.trim()).length;
  return Math.round((filled / COMPLETION_WEIGHTS.length) * 100);
}

export default function QualificationChecklist({
  dealId,
  initialData,
  stage,
  canEdit = true,
}: {
  dealId: string;
  initialData: QualData | null;
  stage: number;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<QualData>(initialData ?? EMPTY);
  const [open, setOpen] = useState(stage >= 2);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const completion = calcCompletion(data);
  const hasData = Object.values(data).some((v) => v?.trim());

  function update(key: keyof QualData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/admin/pipeline/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualificationData: data }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">Квалификационный чек-лист</span>
          {stage < 2 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Стадия 2+
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  completion === 100
                    ? "bg-green-500"
                    : completion >= 50
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{completion}%</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-50">
          {stage < 2 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mb-4 mt-4">
              Чек-лист заполняется на стадии 2 «Квалификация». Переведите сделку на стадию 2
              перед заполнением.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {f.label}
                  {COMPLETION_WEIGHTS.includes(f.key) && (
                    <span className="ml-1 text-gray-300">*</span>
                  )}
                </label>
                {f.type === "select" ? (
                  <select
                    value={data[f.key]}
                    onChange={(e) => canEdit && update(f.key, e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors disabled:bg-gray-50"
                  >
                    {f.options!.map((o) => (
                      <option key={o} value={o}>
                        {o || "— не выбрано —"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={data[f.key]}
                    onChange={(e) => canEdit && update(f.key, e.target.value)}
                    readOnly={!canEdit}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors read-only:bg-gray-50"
                  />
                )}
              </div>
            ))}
          </div>

          {canEdit && (
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={save}
                disabled={saving || (!hasData && !initialData)}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? "Сохранение..." : "Сохранить чек-лист"}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Сохранено
                </span>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                * — ключевые поля для перехода на стадию 3
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
