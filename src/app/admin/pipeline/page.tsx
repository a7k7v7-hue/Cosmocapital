import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  STAGES,
  getWeightedGci,
  getDaysOnStage,
  isStuck,
  formatGci,
  STUCK_DAYS_THRESHOLD,
  STAGE_COLORS,
} from "@/lib/pipeline";
import { Suspense } from "react";
import PipelineTable from "@/components/admin/pipeline/PipelineTable";
import BrokerChips from "@/components/admin/pipeline/BrokerChips";
import KanbanBoard, { APPROACHING_STUCK_DAYS } from "@/components/admin/pipeline/KanbanBoard";
import { getSessionUser } from "@/lib/session";
import { canEdit as roleCanEdit, seeAllBrokers } from "@/lib/roles";

type Tab = "active" | "closed" | "lost";

async function getActiveDeals(broker?: string) {
  return prisma.deal.findMany({
    where: { isLost: false, isClosed: false, ...(broker ? { brokerName: broker } : {}) },
    orderBy: [{ stage: "asc" }, { lastStageChangedAt: "asc" }],
    include: { _count: { select: { activities: true } } },
  }).catch(() => []);
}

async function getClosedDeals(broker?: string) {
  return prisma.deal.findMany({
    where: { isClosed: true, ...(broker ? { brokerName: broker } : {}) },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { activities: true } } },
  }).catch(() => []);
}

async function getLostDeals(broker?: string) {
  return prisma.deal.findMany({
    where: { isLost: true, ...(broker ? { brokerName: broker } : {}) },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { activities: true } } },
  }).catch(() => []);
}

async function getCounters(broker?: string) {
  const where = broker ? { brokerName: broker } : {};
  return prisma.$transaction([
    prisma.deal.count({ where: { isLost: false, isClosed: false, ...where } }),
    prisma.deal.count({ where: { isClosed: true, ...where } }),
    prisma.deal.count({ where: { isLost: true, ...where } }),
  ]).catch(() => [0, 0, 0]);
}

async function getAllBrokers() {
  return prisma.deal
    .findMany({ distinct: ["brokerName"], select: { brokerName: true }, orderBy: { brokerName: "asc" } })
    .then((rows) => rows.map((r) => r.brokerName))
    .catch(() => [] as string[]);
}

function serializeDeal(d: Awaited<ReturnType<typeof getActiveDeals>>[number]) {
  const now = new Date();
  const nextAction = d.nextActionDate ? new Date(d.nextActionDate) : null;
  const days = getDaysOnStage(d.lastStageChangedAt);
  return {
    ...d,
    daysOnStage: days,
    isStuck: isStuck(d.lastStageChangedAt),
    isApproachingStuck: days >= APPROACHING_STUCK_DAYS && days < STUCK_DAYS_THRESHOLD,
    weightedGci: getWeightedGci(d.expectedGci, d.stage),
    isActionOverdue: nextAction ? nextAction < now : false,
    hasNoNextAction: !nextAction,
    lastStageChangedAt: d.lastStageChangedAt.toISOString(),
    expectedCloseDate: d.expectedCloseDate?.toISOString() ?? null,
    nextActionDate: nextAction?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; broker?: string; view?: string }>;
}) {
  const sessionUser = await getSessionUser();
  const userCanEdit = roleCanEdit(sessionUser?.role ?? "RESEARCH");
  const userSeeAll = seeAllBrokers(sessionUser?.role ?? "RESEARCH");

  const { tab: rawTab, broker: brokerParam, view } = await searchParams;
  const broker = userSeeAll ? brokerParam : (sessionUser?.brokerName ?? brokerParam);
  const kanban = view === "kanban";
  const tab: Tab =
    rawTab === "closed" ? "closed" : rawTab === "lost" ? "lost" : "active";

  const [counters, brokers] = await Promise.all([getCounters(broker), getAllBrokers()]);
  const [activeCount, closedCount, lostCount] = await counters;

  const TABS = [
    { id: "active", label: "Активные", count: activeCount },
    { id: "closed", label: "Закрытые", count: closedCount },
    { id: "lost", label: "Проигранные", count: lostCount },
  ] as const;

  if (tab === "closed") {
    const deals = await getClosedDeals(broker);
    return (
      <PageShell tab={tab} tabs={TABS} brokers={userSeeAll ? brokers : []} currentBroker={broker} kanban={false} userCanEdit={userCanEdit}>
        <PipelineTable deals={deals.map(serializeDeal)} view="closed" />
      </PageShell>
    );
  }

  if (tab === "lost") {
    const deals = await getLostDeals(broker);
    return (
      <PageShell tab={tab} tabs={TABS} brokers={userSeeAll ? brokers : []} currentBroker={broker} kanban={false} userCanEdit={userCanEdit}>
        <PipelineTable deals={deals.map(serializeDeal)} view="lost" />
      </PageShell>
    );
  }

  // Active tab — full dashboard
  const deals = await getActiveDeals(broker);

  const totalWeightedGci = deals.reduce(
    (sum, d) => sum + getWeightedGci(d.expectedGci, d.stage),
    0
  );
  const stuckCount = deals.filter((d) => isStuck(d.lastStageChangedAt)).length;
  const closedGciSum = await prisma.deal
    .aggregate({ where: { isClosed: true }, _sum: { actualGci: true, expectedGci: true } })
    .then((r) => r._sum.actualGci ?? r._sum.expectedGci ?? 0)
    .catch(() => 0);
  const avgGci =
    deals.length > 0
      ? Math.round(deals.reduce((s, d) => s + d.expectedGci, 0) / deals.length)
      : 0;

  const stageBreakdown = STAGES.map((s) => ({
    ...s,
    count: deals.filter((d) => d.stage === s.num).length,
    weighted: deals
      .filter((d) => d.stage === s.num)
      .reduce((sum, d) => sum + getWeightedGci(d.expectedGci, d.stage), 0),
  }));

  const kpiCards = [
    {
      value: formatGci(totalWeightedGci),
      label: "Взвешенный пайплайн",
      sub: "GCI × вероятность стадии",
      bg: "#f0fdf4", border: "#bbf7d0", iconColor: "#22c55e", valColor: "#166534",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
    },
    {
      value: formatGci(closedGciSum),
      label: "Закрыто GCI",
      sub: `${closedCount} сделок закрыто`,
      bg: "#eff6ff", border: "#bfdbfe", iconColor: "#3b82f6", valColor: "#1e40af",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      value: formatGci(avgGci),
      label: "Средний чек",
      sub: "по активным сделкам",
      bg: "#f8fafc", border: "#e2e8f0", iconColor: "#64748b", valColor: "#1e293b",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      value: stuckCount,
      label: "Зависших сделок",
      sub: `более ${STUCK_DAYS_THRESHOLD} дней на стадии`,
      bg: stuckCount > 0 ? "#fef2f2" : "#f0fdf4",
      border: stuckCount > 0 ? "#fecaca" : "#bbf7d0",
      iconColor: stuckCount > 0 ? "#ef4444" : "#22c55e",
      valColor: stuckCount > 0 ? "#991b1b" : "#166534",
      icon: stuckCount > 0 ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
  ];

  return (
    <PageShell tab={tab} tabs={TABS} brokers={userSeeAll ? brokers : []} currentBroker={broker} kanban={kanban} userCanEdit={userCanEdit}>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border p-5"
            style={{ background: card.bg, borderColor: card.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div style={{ color: card.iconColor }} className="mb-3">{card.icon}</div>
            <div className="text-2xl font-bold tracking-tight" style={{ color: card.valColor }}>{card.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Stage funnel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 overflow-x-auto" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex gap-1.5 min-w-max">
          {stageBreakdown.map((s) => {
            const sc = STAGE_COLORS[s.num] ?? STAGE_COLORS[1];
            const widthPct = deals.length > 0 ? (s.count / deals.length) * 100 : 0;
            return (
              <div key={s.num} className="flex-1 min-w-[96px] text-center">
                <div className={`rounded-xl px-2 py-2.5 ${sc.bg}`}>
                  <div className={`text-xl font-bold ${sc.text}`}>{s.count}</div>
                  {s.weighted > 0 && (
                    <div className={`text-xs ${sc.text} opacity-70 mt-0.5`}>{formatGci(s.weighted)}</div>
                  )}
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${sc.dot}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500 leading-tight">
                  <span className="font-medium">{s.num}.</span> {s.name}
                </div>
                <div className="text-xs text-gray-400">{Math.round(s.probability * 100)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {kanban ? (
        <KanbanBoard deals={deals.map(serializeDeal)} />
      ) : (
        <PipelineTable deals={deals.map(serializeDeal)} view="active" />
      )}
    </PageShell>
  );
}

function PageShell({
  tab,
  tabs,
  brokers,
  currentBroker,
  kanban,
  userCanEdit,
  children,
}: {
  tab: Tab;
  tabs: ReadonlyArray<{ id: string; label: string; count: number }>;
  brokers: string[];
  currentBroker: string | undefined;
  kanban: boolean;
  userCanEdit: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пайплайн сделок</h1>
          {currentBroker && (
            <p className="text-sm text-blue-600 mt-0.5">Брокер: {currentBroker}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tab === "active" && (
            <div className="flex border border-gray-200 rounded-xl overflow-hidden text-sm">
              <Link
                href={`/admin/pipeline${currentBroker ? `?broker=${encodeURIComponent(currentBroker)}` : ""}`}
                className={`inline-flex items-center gap-1.5 px-3 py-2 transition-colors ${!kanban ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                Таблица
              </Link>
              <Link
                href={`/admin/pipeline?view=kanban${currentBroker ? `&broker=${encodeURIComponent(currentBroker)}` : ""}`}
                className={`inline-flex items-center gap-1.5 px-3 py-2 transition-colors border-l border-gray-200 ${kanban ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Канбан
              </Link>
            </div>
          )}
          <Link
            href="/admin/pipeline/stats"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Аналитика
          </Link>
          <a
            href={`/api/admin/pipeline/export?view=${tab}`}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            CSV
          </a>
          {userCanEdit && (
            <Link
              href="/admin/pipeline/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Новая сделка
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => {
          const brokerParam = currentBroker ? `&broker=${encodeURIComponent(currentBroker)}` : "";
          const href =
            t.id === "active"
              ? `/admin/pipeline${currentBroker ? `?broker=${encodeURIComponent(currentBroker)}` : ""}`
              : `/admin/pipeline?tab=${t.id}${brokerParam}`;
          return (
            <Link
              key={t.id}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? "bg-gray-100 text-gray-600" : "bg-transparent text-gray-400"
                }`}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
      </div>

      <Suspense>
        <BrokerChips brokers={brokers} current={currentBroker} />
      </Suspense>

      {children}
    </div>
  );
}
