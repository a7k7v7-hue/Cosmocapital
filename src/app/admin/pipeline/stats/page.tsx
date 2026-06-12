import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DigestButton from "@/components/admin/pipeline/DigestButton";
import {
  SEGMENT_LABELS,
  DEAL_TYPE_LABELS,
  DEFAULT_GCI,
  STAGES,
  STAGE_COLORS,
  getWeightedGci,
  isStuck,
  formatGci,
} from "@/lib/pipeline";
import { getSessionUser } from "@/lib/session";
import { seeAllBrokers } from "@/lib/roles";

// ТЗ §8.1 — нормативы загрузки брокера
const NORMATIVES = {
  active: { min: 6, max: 20 },       // объединено по всем сегментам
  advanced: { min: 3, max: 8 },      // стадии 4–6
  stuck: { max: 0 },
};

async function getVelocityData(brokerFilter: Record<string, string>) {
  const closedDeals = await prisma.deal.findMany({
    where: { isClosed: true, ...brokerFilter },
    select: {
      createdAt: true,
      stageChanges: {
        orderBy: { changedAt: "asc" },
        select: { toStage: true, changedAt: true },
      },
    },
  }).catch(() => []);

  const stageDurations: Record<number, number[]> = {};
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (const deal of closedDeals) {
    const entries: [number, Date][] = [[1, deal.createdAt]];
    for (const sc of deal.stageChanges) {
      entries.push([sc.toStage, sc.changedAt]);
    }
    for (let i = 0; i < entries.length - 1; i++) {
      const [stage, enteredAt] = entries[i];
      const [, leftAt] = entries[i + 1];
      const days = (leftAt.getTime() - enteredAt.getTime()) / DAY_MS;
      if (days >= 0 && stage >= 1 && stage <= 6) {
        if (!stageDurations[stage]) stageDurations[stage] = [];
        stageDurations[stage].push(days);
      }
    }
  }

  return STAGES.slice(0, 6).map((s) => {
    const durations = stageDurations[s.num] ?? [];
    const avg =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;
    const sorted = [...durations].sort((a, b) => a - b);
    const median =
      sorted.length > 0 ? Math.round(sorted[Math.floor(sorted.length / 2)]) : null;
    return { stage: s, avg, median, count: durations.length };
  });
}

async function getMonthlyGci(brokerFilter: Record<string, string>) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const deals = await prisma.deal.findMany({
    where: { isClosed: true, updatedAt: { gte: sixMonthsAgo }, ...brokerFilter },
    select: { actualGci: true, expectedGci: true, updatedAt: true },
  }).catch(() => [] as { actualGci: number | null; expectedGci: number; updatedAt: Date }[]);

  const months: { label: string; key: string; gci: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" });
    months.push({ key, label, gci: 0 });
  }

  for (const deal of deals) {
    const d = deal.updatedAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const month = months.find((m) => m.key === key);
    if (month) month.gci += deal.actualGci ?? deal.expectedGci;
  }

  return months;
}

async function getAllDeals(brokerFilter: Record<string, string>) {
  const [active, closed, lost] = await Promise.all([
    prisma.deal.findMany({
      where: { isLost: false, isClosed: false, ...brokerFilter },
      include: { _count: { select: { activities: true } } },
    }).catch(() => []),
    prisma.deal.findMany({
      where: { isClosed: true, ...brokerFilter },
      select: {
        brokerName: true, segment: true, dealType: true,
        actualGci: true, expectedGci: true, createdAt: true, updatedAt: true,
      },
    }).catch(() => []),
    prisma.deal.findMany({
      where: { isLost: true, ...brokerFilter },
      select: { brokerName: true, segment: true, lossReason: true },
    }).catch(() => []),
  ]);
  return { active, closed, lost };
}

function pct(val: number, total: number) {
  return total === 0 ? 0 : Math.round((val / total) * 100);
}

function NormBadge({ value, min, max }: { value: number; min?: number; max?: number }) {
  const ok =
    (min === undefined || value >= min) && (max === undefined || value <= max);
  return (
    <span
      className={`ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
        ok ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {ok
        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      }
    </span>
  );
}

export default async function StatsPage() {
  const sessionUser = await getSessionUser();
  const isHead = sessionUser?.role === "HEAD";
  const brokerFilter: Record<string, string> =
    !seeAllBrokers(sessionUser?.role ?? "RESEARCH") && sessionUser?.brokerName
      ? { brokerName: sessionUser.brokerName }
      : {};

  const [{ active, closed, lost }, velocity, monthlyGci] = await Promise.all([
    getAllDeals(brokerFilter),
    getVelocityData(brokerFilter),
    getMonthlyGci(brokerFilter),
  ]);

  // — Team totals —
  const totalWeighted = active.reduce(
    (s, d) => s + getWeightedGci(d.expectedGci, d.stage), 0
  );
  const totalClosedGci = closed.reduce(
    (s, d) => s + (d.actualGci ?? d.expectedGci), 0
  );
  const totalStuck = active.filter((d) => isStuck(d.lastStageChangedAt)).length;
  const teamWinRate = pct(closed.length, closed.length + lost.length);

  // — Per-broker aggregation —
  const brokerNames = Array.from(
    new Set([...active, ...closed, ...lost].map((d) => d.brokerName))
  ).sort();

  const brokerStats = brokerNames.map((broker) => {
    const aDeals = active.filter((d) => d.brokerName === broker);
    const cDeals = closed.filter((d) => d.brokerName === broker);
    const lDeals = lost.filter((d) => d.brokerName === broker);

    const advancedDeals = aDeals.filter((d) => d.stage >= 4 && d.stage <= 6);
    const stuckDeals = aDeals.filter((d) => isStuck(d.lastStageChangedAt));
    const weighted = aDeals.reduce(
      (s, d) => s + getWeightedGci(d.expectedGci, d.stage), 0
    );
    const avgGci =
      aDeals.length > 0
        ? Math.round(aDeals.reduce((s, d) => s + d.expectedGci, 0) / aDeals.length)
        : 0;
    const closedGci = cDeals.reduce((s, d) => s + (d.actualGci ?? d.expectedGci), 0);
    const winRate = pct(cDeals.length, cDeals.length + lDeals.length);

    const stageBreakdown = STAGES.map((s) => ({
      num: s.num,
      name: s.name,
      count: aDeals.filter((d) => d.stage === s.num).length,
    }));

    const segmentBreakdown = Object.keys(SEGMENT_LABELS).map((seg) => ({
      segment: seg,
      count: aDeals.filter((d) => d.segment === seg).length,
    })).filter((s) => s.count > 0);

    return {
      broker,
      activeCount: aDeals.length,
      advancedCount: advancedDeals.length,
      stuckCount: stuckDeals.length,
      closedCount: cDeals.length,
      lostCount: lDeals.length,
      weighted,
      avgGci,
      closedGci,
      winRate,
      stageBreakdown,
      segmentBreakdown,
      noNextAction: aDeals.filter((d) => !d.nextActionDate).length,
      overdueActions: aDeals.filter(
        (d) => d.nextActionDate && new Date(d.nextActionDate) < new Date()
      ).length,
    };
  });

  // — Deal-type mix (ТЗ: 70% BB/земля, 30% LI) —
  const bbDeals = active.filter(
    (d) => d.segment === "BIG_BOX" || d.segment === "LAND"
  ).length;
  const liDeals = active.filter((d) => d.segment === "LIGHT_INDUSTRIAL").length;
  const highTicketDeals = active.filter(
    (d) => d.dealType === "BB_SALE_LAND" || d.dealType === "BTS_SLB_MANDATE"
  ).length;

  // — Target GCI vs actual per deal type —
  const dealTypeStats = Object.entries(DEFAULT_GCI).map(([type, target]) => {
    const activeCnt = active.filter((d) => d.dealType === type).length;
    const closedOfType = closed.filter((d) => d.dealType === type);
    const avgActual =
      closedOfType.length > 0
        ? Math.round(closedOfType.reduce((s, d) => s + (d.actualGci ?? d.expectedGci), 0) / closedOfType.length)
        : null;
    const activeAvg =
      activeCnt > 0
        ? Math.round(
            active.filter((d) => d.dealType === type).reduce((s, d) => s + d.expectedGci, 0) / activeCnt
          )
        : null;
    return { type, target, activeCnt, closedCnt: closedOfType.length, avgActual, activeAvg };
  });

  // — Stage distribution across team —
  const stageDistribution = STAGES.map((s) => ({
    ...s,
    count: active.filter((d) => d.stage === s.num).length,
    weighted: active
      .filter((d) => d.stage === s.num)
      .reduce((sum, d) => sum + getWeightedGci(d.expectedGci, d.stage), 0),
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/pipeline"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Пайплайн
            </Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-xl font-bold text-gray-900">Аналитика и KPI</h1>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Показатели по брокерам · ТЗ §8
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isHead && <DigestButton />}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/admin/pipeline/export?view=active"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            CSV
          </a>
        </div>
      </div>

      {/* Team KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          {
            label: "Активных сделок", value: active.length, sub: `${formatGci(totalWeighted)} взвеш.`,
            bg: "#eff6ff", border: "#bfdbfe", valColor: "#1e40af",
          },
          {
            label: "Закрыто сделок", value: closed.length, sub: formatGci(totalClosedGci),
            bg: "#f0fdf4", border: "#bbf7d0", valColor: "#166534",
          },
          {
            label: "Зависших", value: totalStuck, sub: "более 30 дней",
            bg: totalStuck > 0 ? "#fef2f2" : "#f8fafc",
            border: totalStuck > 0 ? "#fecaca" : "#e2e8f0",
            valColor: totalStuck > 0 ? "#991b1b" : "#1e293b",
          },
          {
            label: "Высокочековых", value: highTicketDeals, sub: "BB прод./земля + BTS/SLB",
            bg: "#faf5ff", border: "#e9d5ff", valColor: "#6b21a8",
          },
          {
            label: "Win rate команды", value: `${teamWinRate}%`, sub: `${closed.length} закр. / ${lost.length} проигр.`,
            bg: teamWinRate >= 50 ? "#f0fdf4" : "#fff7ed",
            border: teamWinRate >= 50 ? "#bbf7d0" : "#fed7aa",
            valColor: teamWinRate >= 50 ? "#166534" : "#9a3412",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border p-4"
            style={{ background: c.bg, borderColor: c.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="text-2xl font-bold" style={{ color: c.valColor }}>
              {c.value}
            </div>
            <div className="text-xs font-medium text-gray-700 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Deal-type mix (ТЗ цель: 70% BB/земля) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Микс сделок</h2>
          <span className="text-xs text-gray-400">Цель по ТЗ: 70% Big Box / земля</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(SEGMENT_LABELS).map(([seg, label]) => {
            const cnt = active.filter((d) => d.segment === seg).length;
            const share = pct(cnt, active.length);
            return (
              <div key={seg} className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${share}%` }}
                  />
                </div>
                <span className="text-sm text-gray-700">
                  {label} <strong>{cnt}</strong>
                  <span className="text-gray-400 ml-1">({share}%)</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Big Box + Земля:{" "}
          <strong className={pct(bbDeals, active.length) >= 70 ? "text-green-600" : "text-amber-600"}>
            {pct(bbDeals, active.length)}%
          </strong>{" "}
          · Light Industrial:{" "}
          <strong>{pct(liDeals, active.length)}%</strong>
        </div>
      </div>

      {/* Target GCI per deal type */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">GCI по типам сделок</h2>
          <p className="text-xs text-gray-400 mt-0.5">Нормативные значения GCI (ТЗ) vs средний фактический GCI закрытых сделок</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Тип сделки</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Норматив GCI</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Ср. факт (закр.)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Ср. ожид. (актив.)</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Активных</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Закрыто</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dealTypeStats.map((dt) => {
                const factVsTarget = dt.avgActual ? dt.avgActual / dt.target : null;
                return (
                  <tr key={dt.type} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{DEAL_TYPE_LABELS[dt.type] ?? dt.type}</td>
                    <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">{formatGci(dt.target)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {dt.avgActual ? (
                        <span className={`font-medium ${factVsTarget! >= 1 ? "text-green-600" : factVsTarget! >= 0.8 ? "text-amber-600" : "text-red-600"}`}>
                          {formatGci(dt.avgActual)}
                          <span className="text-xs ml-1 font-normal">({Math.round(factVsTarget! * 100)}%)</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                      {dt.activeAvg ? formatGci(dt.activeAvg) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{dt.activeCnt || <span className="text-gray-300">0</span>}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{dt.closedCnt || <span className="text-gray-300">0</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage distribution */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 overflow-x-auto">
        <h2 className="font-semibold text-gray-900 mb-4">Воронка по стадиям</h2>
        <div className="flex gap-2 min-w-max">
          {stageDistribution.map((s) => {
            const sc = STAGE_COLORS[s.num];
            return (
              <div key={s.num} className="text-center min-w-[100px]">
                <div className={`rounded-xl p-3 mb-1 ${sc.bg}`}>
                  <div className={`text-xl font-bold ${sc.text}`}>{s.count}</div>
                  <div className={`text-xs ${sc.text} opacity-80`}>
                    {s.weighted > 0 ? formatGci(s.weighted) : "—"}
                  </div>
                </div>
                <div className="text-xs text-gray-500">{s.num}. {s.name}</div>
                <div className="text-xs text-gray-400">{Math.round(s.probability * 100)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-broker table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">По брокерам</h2>
          <span className="text-xs text-gray-400">
            Нормативы по ТЗ §8.1: активных 6–20, продвинутых (ст.4–6) 3–8
          </span>
        </div>
        {brokerStats.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Нет данных</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Брокер</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Активных</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Ст. 4–6</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Зависших</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Просрочено</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Взвеш. GCI</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Средний чек</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Закрыто</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Win rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {brokerStats.map((b) => (
                  <tr key={b.broker} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{b.broker}</div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {b.segmentBreakdown.map((s) => (
                          <span
                            key={s.segment}
                            className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                          >
                            {SEGMENT_LABELS[s.segment]}: {s.count}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-gray-900">{b.activeCount}</span>
                      <NormBadge
                        value={b.activeCount}
                        min={NORMATIVES.active.min}
                        max={NORMATIVES.active.max}
                      />
                      <div className="text-xs text-gray-400 mt-0.5">
                        {NORMATIVES.active.min}–{NORMATIVES.active.max} норм.
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-gray-900">{b.advancedCount}</span>
                      <NormBadge
                        value={b.advancedCount}
                        min={NORMATIVES.advanced.min}
                        max={NORMATIVES.advanced.max}
                      />
                      <div className="text-xs text-gray-400 mt-0.5">
                        {NORMATIVES.advanced.min}–{NORMATIVES.advanced.max} норм.
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {b.stuckCount > 0 ? (
                        <span className="font-semibold text-red-600">{b.stuckCount}</span>
                      ) : (
                        <span className="text-green-500 font-semibold">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {b.overdueActions > 0 ? (
                        <span className="font-semibold text-amber-600">{b.overdueActions}</span>
                      ) : (
                        <span className="text-gray-400">{b.noNextAction > 0 ? `—${b.noNextAction}` : "0"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700 whitespace-nowrap">
                      {formatGci(b.weighted)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">
                      {b.avgGci > 0 ? formatGci(b.avgGci) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {b.closedCount > 0 ? (
                        <div>
                          <div className="font-semibold text-green-700">{b.closedCount}</div>
                          <div className="text-xs text-gray-400">{formatGci(b.closedGci)}</div>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {b.closedCount + b.lostCount > 0 ? (
                        <div>
                          <div
                            className={`font-semibold ${
                              b.winRate >= 50 ? "text-green-600" : "text-amber-600"
                            }`}
                          >
                            {b.winRate}%
                          </div>
                          <div className="text-xs text-gray-400">
                            {b.closedCount}W / {b.lostCount}L
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loss reason breakdown */}
      {lost.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">Причины проигрышей</h2>
          <LossReasonChart deals={lost} />
        </div>
      )}

      {/* Monthly GCI trend */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Тренд GCI по месяцам</h2>
            <p className="text-xs text-gray-400 mt-0.5">Фактический GCI закрытых сделок за последние 6 месяцев</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatGci(monthlyGci.reduce((s, m) => s + m.gci, 0))}
            </div>
            <div className="text-xs text-gray-400">итого за период</div>
          </div>
        </div>
        {monthlyGci.every((m) => m.gci === 0) ? (
          <p className="text-sm text-gray-400">Нет закрытых сделок за последние 6 месяцев</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {(() => {
              const maxGci = Math.max(...monthlyGci.map((m) => m.gci), 1);
              return monthlyGci.map((m) => {
                const heightPct = m.gci > 0 ? Math.max(6, (m.gci / maxGci) * 100) : 0;
                const isBest = m.gci === maxGci && m.gci > 0;
                return (
                  <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                      {m.gci > 0 ? formatGci(m.gci) : "—"}
                    </div>
                    <div className="w-full flex items-end" style={{ height: "72px" }}>
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isBest ? "bg-blue-500" : "bg-blue-200"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{m.label}</div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Pipeline velocity */}
      {closed.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Скорость пайплайна</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Среднее время на каждой стадии по {closed.length} закрытым сделкам
              </p>
            </div>
          </div>
          {velocity.every((v) => v.count === 0) ? (
            <p className="text-sm text-gray-400">
              Недостаточно данных — нет закрытых сделок с историей стадий
            </p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const maxAvg = Math.max(...velocity.map((v) => v.avg ?? 0), 1);
                const bottleneck = velocity.reduce((best, v) =>
                  (v.avg ?? 0) > (best.avg ?? 0) ? v : best
                );
                return velocity.map((v) => {
                  const sc = STAGE_COLORS[v.stage.num];
                  const width = v.avg ? Math.max(4, (v.avg / maxAvg) * 100) : 0;
                  const isBottleneck = v.stage.num === bottleneck.stage.num && (v.avg ?? 0) > 0;
                  return (
                    <div key={v.stage.num} className="flex items-center gap-3">
                      <div className="w-36 shrink-0 text-xs text-gray-600 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                        {v.stage.num}. {v.stage.name}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        {v.avg !== null ? (
                          <>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${isBottleneck ? "bg-red-400" : sc.dot.replace("bg-", "bg-")}`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold w-16 text-right shrink-0 ${isBottleneck ? "text-red-600" : "text-gray-700"}`}>
                              {v.avg}д ср.
                            </span>
                            <span className="text-xs text-gray-400 w-16 text-right shrink-0">
                              {v.median}д мед.
                            </span>
                            {isBottleneck && (
                              <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">
                                узкое место
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-300">нет данных</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right shrink-0">
                        {v.count > 0 ? `${v.count} сд.` : ""}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LossReasonChart({
  deals,
}: {
  deals: { lossReason: string | null }[];
}) {
  const REASON_LABELS: Record<string, string> = {
    CHOSE_ANOTHER_WITHOUT_US: "Другой объект без нас",
    WENT_TO_COMPETITOR: "Ушёл к конкуренту",
    POSTPONED_DECISION: "Отложил решение",
    BUDGET_NOT_CONFIRMED: "Бюджет не подтверждён",
    OWNER_REMOVED_OBJECT: "Собственник снял объект",
    OTHER: "Иное",
  };

  const counts = deals.reduce<Record<string, number>>((acc, d) => {
    const key = d.lossReason ?? "OTHER";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = deals.length;

  return (
    <div className="space-y-3">
      {sorted.map(([reason, count]) => (
        <div key={reason} className="flex items-center gap-3">
          <div className="w-40 text-xs text-gray-600 truncate flex-shrink-0">
            {REASON_LABELS[reason] ?? reason}
          </div>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-400 rounded-full"
              style={{ width: `${pct(count, total)}%` }}
            />
          </div>
          <div className="text-xs font-medium text-gray-700 w-8 text-right">{count}</div>
          <div className="text-xs text-gray-400 w-8">{pct(count, total)}%</div>
        </div>
      ))}
    </div>
  );
}
