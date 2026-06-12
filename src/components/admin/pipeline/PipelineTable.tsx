"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  STAGES,
  DEAL_TYPE_LABELS,
  SEGMENT_LABELS,
  LOSS_REASON_LABELS,
  STAGE_COLORS,
  SEGMENT_COLORS,
  formatGci,
  STUCK_DAYS_THRESHOLD,
} from "@/lib/pipeline";

interface Deal {
  id: string;
  brokerName: string;
  segment: string;
  dealType: string;
  clientName: string;
  objectDescription: string;
  areaSqm: number | null;
  stage: number;
  expectedGci: number;
  actualGci: number | null;
  weightedGci: number;
  daysOnStage: number;
  isStuck: boolean;
  isApproachingStuck?: boolean;
  isActionOverdue?: boolean;
  hasNoNextAction?: boolean;
  isLost: boolean;
  isClosed: boolean;
  lossReason: string | null;
  expectedCloseDate: string | null;
  nextActionDate: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { activities: number };
}

const PAGE_SIZE = 25;

type SortKey =
  | "stage"
  | "expectedGci"
  | "weightedGci"
  | "daysOnStage"
  | "expectedCloseDate"
  | "clientName"
  | "updatedAt";

const ALL = "all";

function SortTh({
  label,
  k,
  sortKey,
  sortAsc,
  onToggle,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortAsc: boolean;
  onToggle: (key: SortKey) => void;
}) {
  const active = sortKey === k;
  return (
    <th
      onClick={() => onToggle(k)}
      className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap"
    >
      {label}
      {active && <span className="ml-1 text-gray-400">{sortAsc ? "↑" : "↓"}</span>}
    </th>
  );
}

export default function PipelineTable({
  deals: initial,
  view = "active",
}: {
  deals: Deal[];
  view?: "active" | "closed" | "lost";
}) {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState(ALL);
  const [filterSegment, setFilterSegment] = useState(ALL);
  const [filterBroker, setFilterBroker] = useState(ALL);
  const [filterStuck, setFilterStuck] = useState(false);
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(view === "active" ? "stage" : "updatedAt");
  const [sortAsc, setSortAsc] = useState(view !== "active");
  const [page, setPage] = useState(0);

  const brokers = useMemo(
    () => Array.from(new Set(initial.map((d) => d.brokerName))).sort(),
    [initial]
  );

  const filtered = useMemo(() => {
    let list = initial;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.clientName.toLowerCase().includes(q) ||
          d.objectDescription.toLowerCase().includes(q) ||
          d.brokerName.toLowerCase().includes(q)
      );
    }
    if (view === "active") {
      if (filterStage !== ALL) list = list.filter((d) => d.stage === parseInt(filterStage, 10));
      if (filterStuck) list = list.filter((d) => d.isStuck);
      if (filterOverdue) list = list.filter((d) => d.isActionOverdue || d.hasNoNextAction);
    }
    if (filterSegment !== ALL) list = list.filter((d) => d.segment === filterSegment);
    if (filterBroker !== ALL) list = list.filter((d) => d.brokerName === filterBroker);

    return [...list].sort((a, b) => {
      let av: number | string, bv: number | string;
      switch (sortKey) {
        case "stage":           av = a.stage;          bv = b.stage;          break;
        case "expectedGci":     av = a.expectedGci;    bv = b.expectedGci;    break;
        case "weightedGci":     av = a.weightedGci;    bv = b.weightedGci;    break;
        case "daysOnStage":     av = a.daysOnStage;    bv = b.daysOnStage;    break;
        case "expectedCloseDate":
          av = a.expectedCloseDate ?? "9999";
          bv = b.expectedCloseDate ?? "9999";
          break;
        case "updatedAt":       av = a.updatedAt;      bv = b.updatedAt;      break;
        case "clientName":      av = a.clientName;     bv = b.clientName;     break;
        default:                av = a.stage;          bv = b.stage;
      }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [initial, search, filterStage, filterSegment, filterBroker, filterStuck, filterOverdue, sortKey, sortAsc, view]);

  const totalWeighted = filtered.reduce((s, d) => s + d.weightedGci, 0);
  const totalActualGci = filtered.reduce((s, d) => s + (d.actualGci ?? d.expectedGci), 0);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, pageCount - 1));
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(key !== "updatedAt"); }
    setPage(0);
  }

  const emptyLabel =
    view === "closed"
      ? "Закрытых сделок нет"
      : view === "lost"
      ? "Проигранных сделок нет"
      : "Активных сделок нет";

  if (initial.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
        <div className="flex justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {view === "lost"
              ? <><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 1 1-4 0M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></>
              : <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>
            }
          </svg>
        </div>
        <div className="text-gray-500 font-medium mb-1">{emptyLabel}</div>
        {view === "active" && (
          <>
            <div className="text-sm text-gray-400 mb-6">Создайте первую сделку в пайплайне</div>
            <Link
              href="/admin/pipeline/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Новая сделка
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Поиск по клиенту, объекту, брокеру..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
        />
        {view === "active" && (
          <select
            value={filterStage}
            onChange={(e) => { setFilterStage(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
          >
            <option value={ALL}>Все стадии</option>
            {STAGES.map((s) => (
              <option key={s.num} value={s.num}>
                {s.num}. {s.name}
              </option>
            ))}
          </select>
        )}
        <select
          value={filterSegment}
          onChange={(e) => { setFilterSegment(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
        >
          <option value={ALL}>Все сегменты</option>
          {Object.entries(SEGMENT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {brokers.length > 1 && (
          <select
            value={filterBroker}
            onChange={(e) => { setFilterBroker(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
          >
            <option value={ALL}>Все брокеры</option>
            {brokers.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}
        {view === "active" && (
          <>
            <button
              onClick={() => { setFilterStuck((v) => !v); setFilterOverdue(false); setPage(0); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                filterStuck
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Зависшие
            </button>
            <button
              onClick={() => { setFilterOverdue((v) => !v); setFilterStuck(false); setPage(0); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                filterOverdue
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Просрочен шаг
            </button>
          </>
        )}
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-500 items-center">
        <span>{filtered.length} сделок</span>
        {view === "active" && (
          <span>
            Взвешенный GCI:{" "}
            <strong className="text-gray-800">{formatGci(totalWeighted)}</strong>
          </span>
        )}
        {view === "closed" && (
          <span>
            Итого GCI:{" "}
            <strong className="text-gray-800">{formatGci(totalActualGci)}</strong>
          </span>
        )}
        {view === "active" && filtered.filter((d) => d.isStuck).length > 0 && (
          <span className="inline-flex items-center gap-1 text-red-500 font-medium">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Зависших: {filtered.filter((d) => d.isStuck).length}
          </span>
        )}
        {view === "active" && filtered.filter((d) => d.isApproachingStuck && !d.isStuck).length > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Приближаются: {filtered.filter((d) => d.isApproachingStuck && !d.isStuck).length}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <SortTh label="Клиент / Объект" k="clientName" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
              <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                Сегмент / Тип
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Брокер</th>

              {view === "active" && (
                <>
                  <SortTh label="Стадия" k="stage" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
                  <SortTh label="GCI" k="expectedGci" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
                  <SortTh label="Взвеш." k="weightedGci" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
                  <SortTh label="Дней" k="daysOnStage" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Следующий шаг</th>
                  <SortTh label="Закрытие" k="expectedCloseDate" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
                </>
              )}

              {view === "closed" && (
                <>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Стадия</th>
                  <SortTh label="GCI факт" k="expectedGci" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
                  <SortTh label="Закрыто" k="updatedAt" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
                </>
              )}

              {view === "lost" && (
                <>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Стадия</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Причина</th>
                  <SortTh label="Дата" k="updatedAt" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
                </>
              )}

              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((deal) => {
              const sc = STAGE_COLORS[deal.stage] ?? STAGE_COLORS[1];
              const segColor = SEGMENT_COLORS[deal.segment] ?? "bg-gray-50 text-gray-600";
              return (
                <tr
                  key={deal.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    view === "active" && deal.isStuck
                      ? "bg-red-50/40"
                      : view === "active" && deal.isApproachingStuck
                      ? "bg-amber-50/30"
                      : ""
                  }`}
                >
                  {/* Client / Object — all views */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="font-medium text-gray-900 truncate">{deal.clientName}</div>
                    <div className="text-xs text-gray-400 truncate">{deal.objectDescription}</div>
                    {deal.areaSqm && (
                      <div className="text-xs text-gray-400">
                        {deal.areaSqm.toLocaleString("ru")} кв.м
                      </div>
                    )}
                  </td>

                  {/* Segment / Type — all views */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${segColor}`}
                    >
                      {SEGMENT_LABELS[deal.segment]}
                    </span>
                    <div className="text-xs text-gray-500">{DEAL_TYPE_LABELS[deal.dealType]}</div>
                  </td>

                  {/* Broker — all views */}
                  <td className="px-4 py-3 text-gray-600 text-xs">{deal.brokerName}</td>

                  {/* Active-specific columns */}
                  {view === "active" && (
                    <>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {deal.stage}. {STAGES[deal.stage - 1]?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                        {formatGci(deal.expectedGci)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatGci(deal.weightedGci)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium ${
                            deal.isStuck ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          {deal.daysOnStage}д
                        </span>
                        {deal.daysOnStage >= STUCK_DAYS_THRESHOLD && (
                          <div className="text-xs text-red-400 font-medium">завис</div>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[140px]">
                        {deal.hasNoNextAction ? (
                          <span className="text-xs text-amber-600 font-medium">нет шага</span>
                        ) : deal.isActionOverdue ? (
                          <div>
                            <span className="text-xs text-red-500 font-medium">
                              просрочен {new Date(deal.nextActionDate!).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {new Date(deal.nextActionDate!).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {deal.expectedCloseDate
                          ? new Date(deal.expectedCloseDate).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "short",
                              year: "2-digit",
                            })
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </>
                  )}

                  {/* Closed-specific columns */}
                  {view === "closed" && (
                    <>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                          Закрыта
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                        {formatGci(deal.actualGci ?? deal.expectedGci)}
                        {!deal.actualGci && (
                          <span className="text-xs text-gray-400 ml-1">(ожид.)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(deal.updatedAt).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </>
                  )}

                  {/* Lost-specific columns */}
                  {view === "lost" && (
                    <>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                          {STAGES[deal.stage - 1]?.name ?? `Стадия ${deal.stage}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[160px]">
                        {deal.lossReason
                          ? LOSS_REASON_LABELS[deal.lossReason] ?? deal.lossReason
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(deal.updatedAt).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </>
                  )}

                  {/* Action — all views */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {deal._count.activities > 0 && (
                      <span className="text-xs text-gray-300 mr-2">
                        {deal._count.activities} каc.
                      </span>
                    )}
                    <Link
                      href={`/admin/pipeline/${deal.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Открыть →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} из {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={safePage === 0}
              className="px-2 py-1 rounded border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-default text-xs"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="px-2 py-1 rounded border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-default text-xs"
            >
              ‹
            </button>
            <span className="px-3 py-1 text-xs text-gray-600">
              {safePage + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="px-2 py-1 rounded border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-default text-xs"
            >
              ›
            </button>
            <button
              onClick={() => setPage(pageCount - 1)}
              disabled={safePage >= pageCount - 1}
              className="px-2 py-1 rounded border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-default text-xs"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
