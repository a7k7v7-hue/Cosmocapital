"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STAGES, STAGE_COLORS } from "@/lib/pipeline";

interface StageChangerProps {
  dealId: string;
  currentStage: number;
  isLost: boolean;
  isClosed: boolean;
}

// Критерии перехода из ТЗ §4
const STAGE_CRITERIA: Record<number, { transition: string; norm: string }> = {
  1: {
    transition: "Состоялся содержательный разговор с ЛПР, подтверждён интерес, согласована квалификационная встреча.",
    norm: "До 10 р.д. на стадии.",
  },
  2: {
    transition: "Требования формализованы, бюджет реалистичен, срок принятия решения понятен, клиент согласен получать подборку.",
    norm: "До 10 р.д. (LI) / до 15 р.д. (BB / Земля).",
  },
  3: {
    transition: "Клиент выбрал 1–3 целевых объекта и готов обсуждать коммерческие условия.",
    norm: "LI — 1 мес. / BB — 2 мес. / Земля — 3 мес.",
  },
  4: {
    transition: "Стороны достигли принципиального согласия по ключевым условиям и готовы зафиксировать их в LOI / term sheet.",
    norm: "До 1 мес. активных переговоров. 30+ дней без движения → статус «завис».",
  },
  5: {
    transition: "Стороны приступили к согласованию договора аренды / ДКП, юристы получили проект.",
    norm: "До 1 мес. (аренда) / до 2 мес. (продажа / земля).",
  },
  6: {
    transition: "Договор подписан обеими сторонами; для купли-продажи — проведены расчёты / подана регистрация.",
    norm: "До 1 мес. (аренда) / до 2 мес. (продажа).",
  },
  7: {
    transition: "Комиссия зачислена в полном объёме. Выставить счёт в течение 3 р.д. после подписания.",
    norm: "Контроль дебиторки еженедельно.",
  },
};

const LOSS_REASONS = [
  { value: "CHOSE_ANOTHER_WITHOUT_US", label: "Выбрал другой объект без нас" },
  { value: "WENT_TO_COMPETITOR", label: "Ушёл к конкуренту" },
  { value: "POSTPONED_DECISION", label: "Отложил решение" },
  { value: "BUDGET_NOT_CONFIRMED", label: "Бюджет не подтверждён" },
  { value: "OWNER_REMOVED_OBJECT", label: "Собственник снял объект" },
  { value: "OTHER", label: "Иное" },
];

export default function StageChanger({ dealId, currentStage, isLost, isClosed }: StageChangerProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [pendingStage, setPendingStage] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [showLostModal, setShowLostModal] = useState(false);
  const [lossReason, setLossReason] = useState("OTHER");
  const [lossComment, setLossComment] = useState("");

  async function changeStage(toStage: number) {
    if (toStage === currentStage) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pipeline/${dealId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStage, comment: comment.trim() || undefined }),
      });
      if (res.ok) {
        setComment("");
        setShowComment(false);
        setPendingStage(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function markLost() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pipeline/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isLost: true,
          lossReason,
          lossComment: lossComment.trim() || null,
        }),
      });
      if (res.ok) {
        setShowLostModal(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function reactivate() {
    setSaving(true);
    try {
      await fetch(`/api/admin/pipeline/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLost: false, isClosed: false, lossReason: null, lossComment: null }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (isLost) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Стадия</h3>
          <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
            Проиграна
          </span>
        </div>
        <button
          onClick={reactivate}
          disabled={saving}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          Вернуть в пайплайн
        </button>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Стадия</h3>
          <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
            Закрыта
          </span>
        </div>
        <button
          onClick={reactivate}
          disabled={saving}
          className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          Переоткрыть сделку
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Стадия сделки</h3>

      {/* Stage selector */}
      <div className="space-y-1.5 mb-4">
        {STAGES.map((s) => {
          const sc = STAGE_COLORS[s.num];
          const isCurrent = s.num === currentStage;
          const isPast = s.num < currentStage;
          return (
            <button
              key={s.num}
              disabled={saving}
              onClick={() => {
                if (!isCurrent) {
                  setPendingStage(s.num);
                  setShowComment(true);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all text-left
                ${isCurrent
                  ? `${sc.bg} ${sc.text} border-transparent font-semibold`
                  : isPast
                    ? "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                    : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                } disabled:opacity-50`}
            >
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                  ${isCurrent ? sc.dot + " text-white" : isPast ? "bg-gray-200 text-gray-400" : "bg-gray-100 text-gray-400"}`}
              >
                {isPast ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : s.num}
              </span>
              <span className="flex-1">{s.name}</span>
              <span className="text-xs opacity-60">{Math.round(s.probability * 100)}%</span>
            </button>
          );
        })}
      </div>

      {/* Transition dialog with criteria */}
      {showComment && pendingStage !== null && (
        <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/50 mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">
            → Стадия {pendingStage}: «{STAGES[pendingStage - 1]?.name}»
          </div>

          {/* Criteria hint from TZ */}
          {STAGE_CRITERIA[pendingStage] && (
            <div className="mb-3 text-xs text-gray-600 bg-white rounded-xl px-3 py-2 border border-blue-100">
              <span className="font-medium text-blue-700 block mb-1">
                Критерий перехода (ТЗ §4.{pendingStage}):
              </span>
              {STAGE_CRITERIA[pendingStage].transition}
              <span className="block mt-1 text-gray-400">{STAGE_CRITERIA[pendingStage].norm}</span>
            </div>
          )}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий к переходу (необязательно)"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors resize-none bg-white mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => changeStage(pendingStage)}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-xl text-xs font-medium transition-colors"
            >
              {saving ? "Сохранение..." : "Подтвердить переход"}
            </button>
            <button
              onClick={() => { setShowComment(false); setPendingStage(null); setComment(""); }}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-xl text-xs font-medium hover:border-gray-300 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Mark lost */}
      <button
        onClick={() => setShowLostModal(true)}
        disabled={saving}
        className="w-full text-sm text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 rounded-xl py-2 transition-colors disabled:opacity-50"
      >
        Отметить проигранной
      </button>

      {/* Loss modal */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-4">Причина проигрыша</h3>
            <select
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors mb-3"
            >
              {LOSS_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <textarea
              value={lossComment}
              onChange={(e) => setLossComment(e.target.value)}
              placeholder="Дополнительный комментарий..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={markLost}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? "Сохранение..." : "Закрыть как проигранную"}
              </button>
              <button
                onClick={() => setShowLostModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
