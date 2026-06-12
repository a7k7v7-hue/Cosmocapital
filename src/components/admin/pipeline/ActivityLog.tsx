"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS } from "@/lib/pipeline";

const ACTIVITY_STYLE: Record<string, { bg: string; color: string }> = {
  CALL:          { bg: "#eff6ff", color: "#3b82f6" },
  MEETING:       { bg: "#f0fdf4", color: "#22c55e" },
  VIEWING:       { bg: "#fff7ed", color: "#f97316" },
  PROPOSAL_SENT: { bg: "#faf5ff", color: "#a855f7" },
  EMAIL:         { bg: "#f0fdfa", color: "#14b8a6" },
  OTHER:         { bg: "#f8fafc", color: "#64748b" },
};

function ActivityIcon({ type }: { type: string }) {
  const s = "currentColor";
  const p = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: s, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "CALL": return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.36 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.53 6.53l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case "MEETING": return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "VIEWING": return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case "PROPOSAL_SENT": return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case "EMAIL": return <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    default: return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  }
}

type ActivityType = "CALL" | "MEETING" | "VIEWING" | "PROPOSAL_SENT" | "EMAIL" | "OTHER";

interface Activity {
  id: string;
  type: string;
  description: string;
  activityDate: string;
  createdBy: string | null;
}

interface ActivityLogProps {
  dealId: string;
  activities: Activity[];
  canEdit?: boolean;
}

export default function ActivityLog({ dealId, activities: initial, canEdit = true }: ActivityLogProps) {
  const router = useRouter();
  const [activities, setActivities] = useState(initial);
  const [type, setType] = useState<ActivityType>("CALL");
  const [description, setDescription] = useState("");
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pipeline/${dealId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          description: description.trim(),
          activityDate: new Date(activityDate).toISOString(),
        }),
      });
      if (res.ok) {
        const newActivity = await res.json();
        setActivities((prev) => [newActivity, ...prev]);
        setDescription("");
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          История касаний
          {activities.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">{activities.length}</span>
          )}
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
              showForm ? "text-gray-400 hover:text-gray-600" : "text-blue-600 hover:text-blue-800"
            }`}
          >
            {showForm ? (
              "Отмена"
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Добавить
              </>
            )}
          </button>
        )}
      </div>

      {/* Add form */}
      {canEdit && showForm && (
        <form onSubmit={addActivity} className="mb-5 border border-gray-100 rounded-xl p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Тип</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full border border-gray-200 rounded-xl px-2 py-1.5 text-sm outline-none focus:border-blue-400 transition-colors"
              >
                {(Object.keys(ACTIVITY_TYPE_LABELS) as ActivityType[]).map((t) => (
                  <option key={t} value={t}>
                    {ACTIVITY_TYPE_ICONS[t]} {ACTIVITY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Дата</label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-2 py-1.5 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Описание *</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Провели звонок, договорились о показе..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors resize-none bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !description.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            {saving ? "Сохранение..." : "Добавить касание"}
          </button>
        </form>
      )}

      {/* Timeline */}
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-300">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <div className="text-sm text-gray-400">Касаний пока нет</div>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a, i) => {
            const style = ACTIVITY_STYLE[a.type] ?? ACTIVITY_STYLE.OTHER;
            return (
              <div key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: style.bg, color: style.color }}
                  >
                    <ActivityIcon type={a.type} />
                  </div>
                  {i < activities.length - 1 && (
                    <div className="w-px flex-1 bg-gray-100 mt-1" />
                  )}
                </div>
                <div className="pb-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {ACTIVITY_TYPE_LABELS[a.type] ?? a.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(a.activityDate).toLocaleDateString("ru-RU", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                    {a.createdBy && (
                      <span className="text-xs text-gray-300">{a.createdBy}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
