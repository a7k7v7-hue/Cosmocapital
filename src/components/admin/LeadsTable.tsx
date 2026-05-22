"use client";

import { Fragment, useState } from "react";

type LeadStatus = "NEW" | "IN_WORK" | "DONE" | "REJECTED";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  notes: string | null;
  createdAt: Date;
  object: { title: string } | null;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новая",
  IN_WORK: "В работе",
  DONE: "Завершена",
  REJECTED: "Отклонена",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  IN_WORK: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
  REJECTED: "bg-gray-100 text-gray-500",
};

export default function LeadsTable({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function updateStatus(id: string, status: LeadStatus) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  }

  async function saveNotes(id: string, notes: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
        Заявок пока нет
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Клиент</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Объект</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Дата</th>
            <th className="text-center px-4 py-3 font-medium text-gray-500">Статус</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leads.map((lead) => (
            <Fragment key={lead.id}>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{lead.name}</div>
                  <a href={`tel:${lead.phone}`} className="text-xs text-blue-600 hover:text-blue-800">
                    {lead.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                  {lead.object?.title ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleString("ru-RU", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-center">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[lead.status]}`}
                  >
                    {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {expanded === lead.id ? "Скрыть" : "Детали"}
                  </button>
                </td>
              </tr>
              {expanded === lead.id && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      {lead.email && (
                        <div>
                          <span className="text-gray-400">Email: </span>
                          <a href={`mailto:${lead.email}`} className="text-blue-600">{lead.email}</a>
                        </div>
                      )}
                      {lead.message && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-400">Сообщение: </span>
                          <span className="text-gray-700">{lead.message}</span>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 mb-1">Заметки</label>
                        <textarea
                          defaultValue={lead.notes ?? ""}
                          rows={2}
                          onBlur={(e) => saveNotes(lead.id, e.target.value)}
                          placeholder="Добавить заметку..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
