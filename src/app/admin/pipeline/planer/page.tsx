import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  STAGES,
  STAGE_COLORS,
  DEAL_TYPE_LABELS,
  SEGMENT_LABELS,
  getDaysOnStage,
  isStuck,
  formatGci,
  getWeightedGci,
} from "@/lib/pipeline";
import PlanerActionSection from "@/components/admin/pipeline/PlanerActionSection";
import DailyDigestButton from "@/components/admin/pipeline/DailyDigestButton";
import { getSessionUser } from "@/lib/session";
import { seeAllBrokers, canEdit as roleCanEdit } from "@/lib/roles";

function formatDate(d: Date | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function daysDiff(d: Date | null | undefined) {
  if (!d) return null;
  return Math.floor((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export const dynamic = "force-dynamic";

export default async function PlanerPage() {
  const sessionUser = await getSessionUser();
  const userCanEdit = roleCanEdit(sessionUser?.role ?? "RESEARCH");
  const isHead = sessionUser?.role === "HEAD";
  const brokerFilter = !seeAllBrokers(sessionUser?.role ?? "RESEARCH") && sessionUser?.brokerName
    ? { brokerName: sessionUser.brokerName }
    : {};

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [all, reEngagements] = await Promise.all([
    prisma.deal.findMany({
      where: { isLost: false, isClosed: false, ...brokerFilter },
      orderBy: { lastStageChangedAt: "asc" },
    }),
    prisma.deal.findMany({
      where: {
        isLost: true,
        reEngagementDate: { gte: now, lte: in30 },
        ...brokerFilter,
      },
      orderBy: { reEngagementDate: "asc" },
    }),
  ]);

  const stuckDeals = all.filter((d) => isStuck(d.lastStageChangedAt));

  const overdueDeals = all.filter((d) => {
    if (!d.nextActionDate) return false;
    return new Date(d.nextActionDate) < now;
  });

  const noNextAction = all.filter((d) => !d.nextActionDate && !isStuck(d.lastStageChangedAt));

  const upcomingCloses = all
    .filter((d) => {
      if (!d.expectedCloseDate) return false;
      const dt = new Date(d.expectedCloseDate);
      return dt >= now && dt <= in30;
    })
    .sort(
      (a, b) =>
        new Date(a.expectedCloseDate!).getTime() -
        new Date(b.expectedCloseDate!).getTime()
    );

  // Upper funnel (stages 1-2) per broker
  const upperFunnel = all.filter((d) => d.stage <= 2);
  const brokerMap: Record<
    string,
    { name: string; counts: Record<number, number>; totalActive: number }
  > = {};
  for (const d of all) {
    if (!brokerMap[d.brokerName]) {
      brokerMap[d.brokerName] = { name: d.brokerName, counts: {}, totalActive: 0 };
    }
    brokerMap[d.brokerName].totalActive++;
    brokerMap[d.brokerName].counts[d.stage] =
      (brokerMap[d.brokerName].counts[d.stage] ?? 0) + 1;
  }
  const brokers = Object.values(brokerMap).sort((a, b) => b.totalActive - a.totalActive);

  const totalActive = all.length;
  const totalWeighted = all.reduce(
    (s, d) => s + getWeightedGci(d.expectedGci, d.stage),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Планёрка</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {now.toLocaleDateString("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {" · "}
            {totalActive} активных · взвеш. GCI {formatGci(totalWeighted)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isHead && <DailyDigestButton />}
          <Link
            href="/admin/pipeline"
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            ← Пайплайн
          </Link>
        </div>
      </div>

      {/* Section 1: Stuck */}
      <Section
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        title={`Зависшие сделки (30+ дней)`}
        count={stuckDeals.length}
        countColor="text-red-600"
        empty="Зависших сделок нет — отлично!"
      >
        {stuckDeals.map((d) => {
          const days = getDaysOnStage(d.lastStageChangedAt);
          const sc = STAGE_COLORS[d.stage] ?? STAGE_COLORS[1];
          return (
            <DealRow key={d.id} deal={d} sc={sc}>
              <span className="text-red-600 font-semibold text-xs whitespace-nowrap">
                {days}д на стадии
              </span>
            </DealRow>
          );
        })}
      </Section>

      {/* Section 2: Overdue — inline action */}
      <PlanerActionSection
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        title="Просроченные шаги"
        countColor="text-red-500"
        emptyText="Просроченных шагов нет"
        canEdit={userCanEdit}
        deals={overdueDeals.map((d) => ({
          id: d.id,
          clientName: d.clientName,
          brokerName: d.brokerName,
          stage: d.stage,
          dealType: d.dealType,
          segment: d.segment,
          expectedGci: d.expectedGci,
          nextActionDate: d.nextActionDate?.toISOString() ?? null,
          nextActionDesc: d.nextActionDesc,
          daysOverdue: Math.abs(daysDiff(d.nextActionDate)!),
        }))}
      />

      {/* Section 3: No next action — inline action */}
      {noNextAction.length > 0 && (
        <PlanerActionSection
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          title="Нет запланированного шага"
          countColor="text-amber-600"
          emptyText=""
          canEdit={userCanEdit}
          deals={noNextAction.map((d) => ({
            id: d.id,
            clientName: d.clientName,
            brokerName: d.brokerName,
            stage: d.stage,
            dealType: d.dealType,
            segment: d.segment,
            expectedGci: d.expectedGci,
            nextActionDate: null,
            nextActionDesc: null,
          }))}
        />
      )}

      {/* Section 4: Upcoming closes */}
      <Section
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
        title="Закрытие в ближайшие 30 дней"
        count={upcomingCloses.length}
        countColor="text-green-600"
        empty="Закрытий в горизонте 30 дней нет"
      >
        {upcomingCloses.map((d) => {
          const diff = daysDiff(d.expectedCloseDate);
          const sc = STAGE_COLORS[d.stage] ?? STAGE_COLORS[1];
          return (
            <DealRow key={d.id} deal={d} sc={sc}>
              <div className="text-right">
                <div className="text-green-600 font-semibold text-xs">
                  через {diff}д · {formatDate(d.expectedCloseDate)}
                </div>
                <div className="text-gray-400 text-xs">{formatGci(d.expectedGci)}</div>
              </div>
            </DealRow>
          );
        })}
      </Section>

      {/* Section 5: Re-engagements */}
      {reEngagements.length > 0 && (
        <Section
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>}
          title="Повторный контакт в ближайшие 30 дней"
          count={reEngagements.length}
          countColor="text-purple-600"
          empty=""
        >
          {reEngagements.map((d) => {
            const diff = daysDiff(d.reEngagementDate)!;
            const sc = STAGE_COLORS[1];
            return (
              <DealRow key={d.id} deal={d} sc={sc}>
                <div className="text-right">
                  <div className="text-purple-600 font-semibold text-xs">
                    через {diff}д · {formatDate(d.reEngagementDate)}
                  </div>
                  <div className="text-red-400 text-xs">проигранная</div>
                </div>
              </DealRow>
            );
          })}
        </Section>
      )}

      {/* Section 6: Broker upper funnel */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h2 className="font-semibold text-gray-900 text-sm">
            Воронка по брокерам
          </h2>
          <span className="text-xs text-gray-400 ml-1">
            {upperFunnel.length} сделок в верхней воронке (ст. 1-2)
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {brokers.length === 0 ? (
            <div className="px-5 py-4 text-sm text-gray-400">Нет данных</div>
          ) : (
            brokers.map((b) => (
              <div
                key={b.name}
                className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50"
              >
                <div className="w-32 shrink-0 font-medium text-sm text-gray-800 truncate">
                  {b.name}
                </div>
                <div className="flex gap-1.5 flex-1">
                  {STAGES.map((s) => {
                    const cnt = b.counts[s.num] ?? 0;
                    const sc = STAGE_COLORS[s.num];
                    return cnt > 0 ? (
                      <div
                        key={s.num}
                        title={`${s.name}: ${cnt}`}
                        className={`${sc.bg} ${sc.text} text-xs font-medium px-2 py-0.5 rounded-full`}
                      >
                        {s.num}: {cnt}
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {b.totalActive} всего
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Checklist footer */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
        <div className="text-sm font-semibold text-blue-800 mb-2">
          Повестка планёрки
        </div>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Разобрать зависшие сделки — причины, решения</li>
          <li>Закрыть просроченные шаги — назначить ответственных</li>
          <li>Проверить воронку каждого брокера — верхний уровень не пустеет?</li>
          <li>Подтвердить статус сделок с закрытием в 30 дней</li>
          <li>Договориться о следующих шагах по каждой открытой сделке</li>
        </ol>
      </div>
    </div>
  );
}

// ---------- helpers ----------

function Section({
  icon,
  title,
  count,
  countColor,
  empty,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  countColor: string;
  empty: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span>{icon}</span>
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        <span className={`text-xs font-semibold ml-1 ${countColor}`}>
          {count > 0 ? count : ""}
        </span>
      </div>
      {count === 0 ? (
        <div className="px-5 py-4 text-sm text-gray-400">{empty}</div>
      ) : (
        <div className="divide-y divide-gray-50">{children}</div>
      )}
    </div>
  );
}

type DealLike = {
  id: string;
  clientName: string;
  brokerName: string;
  stage: number;
  dealType: string;
  segment: string;
  expectedGci: number;
  lastStageChangedAt: Date;
  nextActionDate: Date | null;
};

function DealRow({
  deal: d,
  sc,
  children,
}: {
  deal: DealLike;
  sc: { bg: string; text: string; dot: string };
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={`/admin/pipeline/${d.id}`}
      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/70 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900 truncate">
            {d.clientName}
          </span>
          <span className="text-xs text-gray-400 shrink-0">{d.brokerName}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {STAGES[d.stage - 1]?.name}
          </span>
          <span className="text-xs text-gray-400">
            {DEAL_TYPE_LABELS[d.dealType] ?? d.dealType}
          </span>
          <span className="text-xs text-gray-400">
            {SEGMENT_LABELS[d.segment] ?? d.segment}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">{children}</div>
      <span className="text-gray-300 group-hover:text-gray-400 text-sm shrink-0">→</span>
    </Link>
  );
}
